import { createSlice, createAsyncThunk, PayloadAction, UnknownAction } from '@reduxjs/toolkit';
import { InventreeItem, WLEDConfig, EnhancedStockItemEventData, ParameterDetail, InventreeParameterFetchConfig, RuleGroupType } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
import { WLEDService } from '../../services/wled-service';
import { createSelector } from 'reselect';
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';
import { inventreeApi } from '../apis/inventreeApi';

const logger = Logger.getInstance();

export interface InstancePartsState {
  partsById: Record<number, InventreeItem>;
}

export interface PartsState {
  partsByInstance: Record<string, InstancePartsState>;
  loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  loading: boolean;
  error: string | null;
  locatingPartId: number | null;
  adjustingStockPartId: number | null;
  adjustmentError: string | null;
}

const initialState: PartsState = {
  partsByInstance: {},
  loadingStatus: {},
  loading: false,
  error: null,
  locatingPartId: null,
  adjustingStockPartId: null,
  adjustmentError: null,
};

// Async thunk for fetching a single part's details
export const fetchPartDetails = createAsyncThunk<
  InventreeItem,
  number,
  { state: RootState, rejectValue: string }
>(
  'parts/fetchPartDetails',
  async (partId, { rejectWithValue, getState }) => {
    try {
      const { api } = (getState() as RootState);
      if (!api.url || !api.apiKey) {
        return rejectWithValue('Direct API not configured.');
      }
      const partData = await inventreeApiService.getPart(partId);
      if (!partData) {
        return rejectWithValue(`Part ${partId} not found or API error.`);
      }
      return partData;
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to fetch part ${partId}`);
    }
  }
);

// Async thunk for locating a part (e.g., with WLED)
export const locatePartById = createAsyncThunk<void, { partId: number; hass: HomeAssistant }, { state: RootState, rejectValue: string }>(
  'parts/locatePartById',
  async ({ partId, hass }, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    let part: InventreeItem | undefined;
    for (const instanceId in state.parts.partsByInstance) {
      if (state.parts.partsByInstance[instanceId].partsById[partId]) {
        part = state.parts.partsByInstance[instanceId].partsById[partId];
        break;
      }
    }
    const allConfigs = Object.values(state.config.configsByInstance);
    const wledHoldingConfig = allConfigs.find(c => c.config?.services?.wled?.enabled);
    const wledConfigFromState = wledHoldingConfig?.config?.services?.wled;

    if (!part) return rejectWithValue(`Part with ID ${partId} not found.`);
    if (!wledConfigFromState) return rejectWithValue('WLED service not configured or enabled.');

    const wledService = new WLEDService(hass);
    const locationParameter = part.parameters?.find((p: ParameterDetail) => p.template_detail?.name === wledConfigFromState.parameter_name);
    if (!locationParameter?.data) return rejectWithValue(`Location parameter not found for part ${partId}.`);

    try {
      await wledService.locatePart(part, wledConfigFromState);
      setTimeout(() => dispatch(partsSlice.actions.setLocatingPartId(null)), 5000);
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to locate part ${partId}.`);
    }
  }
);

// Async thunk for adjusting part stock
export const adjustPartStock = createAsyncThunk<{ partId: number, newTotalStock: number | undefined }, { partId: number, amount: number, locationId?: number, notes?: string }, { state: RootState, rejectValue: string }>(
  'parts/adjustPartStock',
  async ({ partId, amount, locationId, notes }, { rejectWithValue }) => {
    try {
      const result = await inventreeApiService.adjustStock(partId, amount, locationId, notes);
      if (!result) return rejectWithValue('API call failed');
      return { partId: result.pk, newTotalStock: result.newTotalStock };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to adjust stock.');
    }
  }
);

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setParts(state, action: PayloadAction<{ parts: InventreeItem[], cardInstanceId: string }>) {
      const { parts, cardInstanceId } = action.payload;
      if (!state.partsByInstance[cardInstanceId]) {
        state.partsByInstance[cardInstanceId] = { partsById: {} };
      }
      const instanceState = state.partsByInstance[cardInstanceId];
      // HASS data provides a baseline. It completely replaces the existing HASS data for the instance.
      instanceState.partsById = {};
      parts.forEach(part => {
        instanceState.partsById[part.pk] = { ...part, source: 'hass' };
      });
    },
    removeInstance(state, action: PayloadAction<{ cardInstanceId: string }>) {
      delete state.partsByInstance[action.payload.cardInstanceId];
    },
    updatePart(state: PartsState, action: PayloadAction<{ part: InventreeItem, cardInstanceId: string }>) {
      const { part, cardInstanceId } = action.payload;
      const instanceState = state.partsByInstance[cardInstanceId];
      if (instanceState) {
        instanceState.partsById[part.pk] = { ...instanceState.partsById[part.pk], ...part };
      }
    },
    updatePartStock(state: PartsState, action: PayloadAction<{ partId: number, newStock: number, cardInstanceId: string }>) {
        const { partId, newStock, cardInstanceId } = action.payload;
        const instanceState = state.partsByInstance[cardInstanceId];
        if (instanceState?.partsById[partId]) {
            instanceState.partsById[partId].in_stock = newStock;
        }
    },
    partStockUpdateFromWebSocket(state, action: PayloadAction<Partial<EnhancedStockItemEventData> & { partId: number }>) {
      const { partId, quantity } = action.payload;
      for (const instanceId in state.partsByInstance) {
        const part = state.partsByInstance[instanceId].partsById[partId];
        if (part && quantity !== undefined) {
          part.in_stock = parseFloat(quantity as any);
        }
      }
    },
    setLocatingPartId(state, action: PayloadAction<number | null>) {
      state.locatingPartId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(locatePartById.pending, (state, action) => { state.locatingPartId = action.meta.arg.partId; })
      .addCase(locatePartById.rejected, (state) => { state.locatingPartId = null; })
      .addCase(adjustPartStock.pending, (state, action) => {
        state.adjustingStockPartId = action.meta.arg.partId;
        state.adjustmentError = null;
      })
      .addCase(adjustPartStock.fulfilled, (state, action) => {
        const { partId, newTotalStock } = action.payload;
        for (const instanceId in state.partsByInstance) {
          const part = state.partsByInstance[instanceId].partsById[partId];
          if (part) part.in_stock = newTotalStock;
        }
        state.adjustingStockPartId = null;
      })
      .addCase(adjustPartStock.rejected, (state, action) => {
        state.adjustingStockPartId = null;
        state.adjustmentError = action.payload ?? 'Stock adjustment failed.';
      })
      .addCase(fetchPartDetails.pending, (state, action) => {
        state.loadingStatus[action.meta.arg] = 'loading';
      })
      .addCase(fetchPartDetails.fulfilled, (state, action) => {
        const part = action.payload;
        state.loadingStatus[part.pk] = 'succeeded';
        // This is a global fetch, so update all instances that might have this part.
        for (const instanceId in state.partsByInstance) {
            if (state.partsByInstance[instanceId].partsById[part.pk]) {
                state.partsByInstance[instanceId].partsById[part.pk] = part;
            }
        }
      })
      .addCase(fetchPartDetails.rejected, (state, action) => {
        state.loadingStatus[action.meta.arg] = 'failed';
      });
  },
});

export const {
  setParts,
  removeInstance,
  updatePart,
  updatePartStock,
  partStockUpdateFromWebSocket,
  setLocatingPartId,
} = partsSlice.actions;

// =================================================================================
//                                  SELECTORS
// =================================================================================

const selectPartsByInstanceState = (state: RootState) => state.parts.partsByInstance;

export const selectAllReferencedPartPksFromConfig = createSelector(
  [
    (state: RootState, cardInstanceId: string) => state.config.configsByInstance[cardInstanceId],
    (state: RootState, cardInstanceId: string) => state.conditionalLogic.definedLogicsByInstance[cardInstanceId],
  ],
  (instanceConfig, definedLogicItems) => {
    logger.log(`Selector:selectAllReferencedPartPksFromConfig`, `Instance ${instanceConfig?.cardInstanceId} received config.`, { config: instanceConfig?.config, level: 'debug' });
    if (!instanceConfig?.config) return [];
    
    const pks = new Set<number>();
    const localConfig = instanceConfig.config;

    if (definedLogicItems) {
      const extractPksFromGroup = (group: RuleGroupType) => {
        if (!group || !group.rules) return;
        group.rules.forEach((ruleOrGroup) => {
          if ('combinator' in ruleOrGroup) {
            extractPksFromGroup(ruleOrGroup as RuleGroupType);
          } else {
            const field = ruleOrGroup.field;
            if (typeof field === 'string') {
              const match = field.match(/^part_(\d+)_/);
              if (match && match[1]) pks.add(parseInt(match[1], 10));
            }
          }
        });
      };
      definedLogicItems.forEach((logicItem) => {
        logicItem.logicPairs?.forEach((pair) => {
          if (pair.conditionRules) extractPksFromGroup(pair.conditionRules);
          pair.effects?.forEach((effect) => {
            if (typeof effect.targetPartPks === 'number') pks.add(effect.targetPartPks);
            else if (Array.isArray(effect.targetPartPks)) effect.targetPartPks.forEach((pk: number) => { if(typeof pk === 'number') pks.add(pk); });
          });
        });
      });
    }

    if (localConfig.data_sources?.inventree_pks) {
      localConfig.data_sources.inventree_pks.forEach((pk: number) => { if(typeof pk === 'number') pks.add(pk); });
    }

    if (localConfig.data_sources?.inventree_parameters_to_fetch) {
      localConfig.data_sources.inventree_parameters_to_fetch.forEach((fetchConfig: InventreeParameterFetchConfig) => {
        if (Array.isArray(fetchConfig.targetPartIds)) fetchConfig.targetPartIds.forEach((pk: number) => { if(typeof pk === 'number') pks.add(pk); });
      });
    }

    if ((localConfig.view_type === 'detail' || localConfig.view_type === 'variants') && typeof localConfig.part_id === 'number') {
      pks.add(localConfig.part_id);
    }
    
    return Array.from(pks);
  }
);

const selectHassPartsForInstance = createSelector(
  [
    selectPartsByInstanceState,
    (state: RootState, cardInstanceId: string) => cardInstanceId
  ],
  (partsByInstance, cardInstanceId) => {
    const instanceState = partsByInstance[cardInstanceId];
    return instanceState ? Object.values(instanceState.partsById) : [];
  }
);

const selectApiPartsForInstance = createSelector(
  [
    (state: RootState) => state,
    selectAllReferencedPartPksFromConfig
  ],
  (state, pks) => {
    const parts: InventreeItem[] = [];
    for (const pk of pks) {
      const result = inventreeApi.endpoints.getPart.select(pk)(state);
      if (result.isSuccess && result.data) {
        parts.push({ ...result.data, source: 'api' } as InventreeItem);
      }
    }
    return parts;
  }
);

export const selectCombinedParts = createSelector(
  [
    selectHassPartsForInstance,
    selectApiPartsForInstance
  ],
  (partsFromHass, partsFromApi) => {
    const uniquePartsMap = new Map<number, InventreeItem>();

    partsFromHass.forEach((part) => {
      uniquePartsMap.set(part.pk, part);
    });

    partsFromApi.forEach((part) => {
      uniquePartsMap.set(part.pk, { ...uniquePartsMap.get(part.pk), ...part });
    });

    return Array.from(uniquePartsMap.values());
  }
);

export const selectPartById = createSelector(
  [
    selectCombinedParts,
    (state: RootState, cardInstanceId: string, partId: number) => partId
  ],
  (combinedParts, partId) => {
    return combinedParts.find(p => p.pk === partId);
  }
);

export const selectPartsLoading = (state: RootState): boolean => state.parts.loading;
export const selectPartsError = (state: RootState): string | null => state.parts.error;
export const selectLocatingPartId = (state: RootState): number | null => state.parts.locatingPartId;
export const selectAdjustingStockPartId = (state: RootState): number | null => state.parts.adjustingStockPartId;
export const selectAdjustmentError = (state: RootState): string | null => state.parts.adjustmentError;

export const selectIsReadyForEvaluation = createSelector(
  [
    selectAllReferencedPartPksFromConfig,
    (state: RootState, _cardInstanceId: string) => state.inventreeApi.queries,
  ],
  (pksToPrefetch, queries) => {
    if (pksToPrefetch.length === 0) return true;
    return pksToPrefetch.every(pk => {
      const queryState = queries[`getPart(${pk})`];
      return queryState?.status === 'fulfilled';
    });
  }
);

export default partsSlice.reducer; 