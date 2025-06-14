import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder, UnknownAction } from '@reduxjs/toolkit';
import {
  InventreeItem,
  WLEDConfig,
  EnhancedStockItemEventData,
  ParameterDetail,
  InventreeParameterFetchConfig,
  ConditionalLogicItem,
  LogicPair,
  InventreeCardConfig,
} from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
import { WLEDService } from '../../services/wled-service';
import { createSelector } from 'reselect';
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';
import { inventreeApi } from '../apis/inventreeApi';
import { fetchPartsByPks } from '../thunks/systemThunks';
import { evaluateAndApplyEffectsThunk } from '../thunks/conditionalLogicThunks';

const logger = Logger.getInstance();

export interface PartsState {
  partsById: Record<number, InventreeItem>;
  partsByEntity: Record<string, number[]>;
  loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  loading: boolean;
  error: string | null;
  locatingPartId: number | null;
  adjustingStockPartId: number | null;
  adjustmentError: string | null;
}

const initialState: PartsState = {
  partsById: {},
  partsByEntity: {},
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
    logger.info('partsSlice', `Fetching details for part ${partId}...`);
    try {
      const { api } = (getState() as RootState);
      if (!api.url || !api.apiKey) {
        logger.warn('partsSlice', 'Direct API URL or API Key not configured. Cannot fetch part details.');
        return rejectWithValue('Direct API not configured.');
      }
      const partData = await inventreeApiService.getPart(partId);
      if (!partData) {
        logger.warn('partsSlice', `No data returned for part ${partId} from API.`);
        return rejectWithValue(`Part ${partId} not found or API error.`);
      }
      logger.log('partsSlice', `Successfully fetched part details for ${partId}`, partData);
      return partData;
    } catch (error: any) {
      logger.error('partsSlice', `Error fetching part details for ${partId}:`, error);
      return rejectWithValue(error.message || `Failed to fetch part ${partId}`);
    }
  }
);

// Async thunk for locating a part (e.g., with WLED)
export const locatePartById = createAsyncThunk<
  void,
  { partId: number; hass: HomeAssistant },
  { state: RootState, rejectValue: string }
>(
  'parts/locatePartById',
  async ({ partId, hass }, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const part = state.parts.partsById[partId];
    const wledConfigFromState = state.config.config?.services?.wled;

    if (!part) {
      logger.warn('partsSlice', `Part with ID ${partId} not found for location.`);
      return rejectWithValue(`Part with ID ${partId} not found.`);
    }
    if (!wledConfigFromState || !wledConfigFromState.enabled || !wledConfigFromState.entity_id || !wledConfigFromState.parameter_name) {
      logger.warn('partsSlice', `WLED service not configured or enabled for part ${partId}.`);
      return rejectWithValue('WLED service not configured or enabled.');
    }

    const wledService = new WLEDService(hass);
    const locationParameter = part.parameters?.find((p: ParameterDetail) => p.template_detail?.name === wledConfigFromState.parameter_name);

    if (!locationParameter || !locationParameter.data) {
      logger.warn('partsSlice', `Location parameter '${wledConfigFromState.parameter_name}' not found or empty for part ${partId}.`);
      return rejectWithValue(`Location parameter not found for part ${partId}.`);
    }

    try {
      await wledService.locatePart(part, wledConfigFromState);
      logger.log('partsSlice', `Successfully triggered WLED location for part ${partId} at segment ${locationParameter.data}.`);
      setTimeout(() => {
        dispatch(partsSlice.actions.setLocatingPartId(null));
      }, 5000);
    } catch (error: any) {
      logger.error('partsSlice', `Error locating part ${partId} via WLED:`, error);
      return rejectWithValue(error.message || `Failed to locate part ${partId}.`);
    }
  }
);

// Async thunk for adjusting part stock
export const adjustPartStock = createAsyncThunk<
  { partId: number, newTotalStock: number | undefined },
  { partId: number, amount: number, locationId?: number, notes?: string, hass?: HomeAssistant },
  { state: RootState, rejectValue: string }
>(
  'parts/adjustPartStock',
  async ({ partId, amount, locationId, notes }, { rejectWithValue }) => { 
    logger.info('partsSlice', `Adjusting stock for part ${partId} by ${amount}. Location: ${locationId}, Notes: \"${notes}\"`);
    
    try {
      const adjustmentResult = await inventreeApiService.adjustStock(partId, amount, locationId, notes);

      if (!adjustmentResult || typeof adjustmentResult.newTotalStock !== 'number') {
        logger.error('partsSlice', `Stock adjustment for part ${partId} failed or did not return expected result format.`, adjustmentResult);
        const reason = !adjustmentResult ? 'API call failed' : 'API response missing newTotalStock';
        return rejectWithValue(`Stock adjustment failed: ${reason}.`);
      }

      logger.log('partsSlice', `Stock for part ${partId} adjusted successfully via API. New total stock: ${adjustmentResult.newTotalStock}.`);
      
      return { partId: adjustmentResult.pk, newTotalStock: adjustmentResult.newTotalStock }; 
    } catch (error: any) {
      logger.error('partsSlice', `Error calling inventreeApiService.adjustStock for part ${partId}:`, error);
      return rejectWithValue(error.message || `Failed to adjust stock for part ${partId}.`);
    }
  }
);

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setParts(state: PartsState, action: PayloadAction<{ entityId: string, parts: InventreeItem[] }>) {
      const { entityId, parts } = action.payload;
      const partIds: number[] = [];
      parts.forEach(part => {
        state.partsById[part.pk] = {
          ...state.partsById[part.pk],
          ...part,
        };
        partIds.push(part.pk);
      });
      state.partsByEntity[entityId] = partIds;
      logger.log('partsSlice', `Set ${parts.length} parts for entity '${entityId}'. Part IDs: [${partIds.join(', ')}]`, { level: 'debug' });
    },
    removePartsForEntity(state: PartsState, action: PayloadAction<{ entityId: string }>) {
      const { entityId } = action.payload;
      const partIdsToRemove = state.partsByEntity[entityId];

      if (!partIdsToRemove) {
        logger.warn('partsSlice:removePartsForEntity', `Attempted to remove non-existent entity: ${entityId}`);
        return;
      }

      delete state.partsByEntity[entityId];
      logger.log('partsSlice:removePartsForEntity', `Removed entity ${entityId} from partsByEntity.`);

      // Garbage Collection
      const allRemainingPartIds = new Set<number>(Object.values(state.partsByEntity).flat());
      
      partIdsToRemove.forEach(partId => {
        if (!allRemainingPartIds.has(partId)) {
          delete state.partsById[partId];
          logger.log('partsSlice:removePartsForEntity', `Garbage collected part ${partId} from partsById as it is no longer referenced.`);
        }
      });
    },
    updatePart(state: PartsState, action: PayloadAction<InventreeItem>) {
      const part = action.payload;
      if (state.partsById[part.pk]) {
        state.partsById[part.pk] = {
          ...state.partsById[part.pk],
          ...part,
        };
        logger.log('partsSlice', `Updated part ${part.pk} in partsById.`, { level: 'debug' });
      } else {
        state.partsById[part.pk] = part;
        logger.log('partsSlice', `Added new part ${part.pk} to partsById.`, { level: 'debug' });
      }
    },
    updatePartStock(state: PartsState, action: PayloadAction<{ partId: number, newStock: number }>) {
        const { partId, newStock } = action.payload;
        const partToUpdate = state.partsById[partId];
        if (partToUpdate) {
            partToUpdate.in_stock = newStock;
            logger.log('partsSlice', `Updated stock for part ${partId} to ${newStock} in partsById.`, { level: 'debug' });
        } else {
             logger.warn('partsSlice', `Attempted to update stock for non-existent partId: ${partId}`);
        }
    },
    clearParts(state: PartsState, action: PayloadAction<string>) {
      const entityId = action.payload;
       logger.log('partsSlice', `Clearing parts mapping for entity '${entityId}'.`, { level: 'debug' });
      delete state.partsByEntity[entityId];
    },
    registerEntity(state: PartsState, action: PayloadAction<string>) {
      const entityId = action.payload;
      if (!(entityId in state.partsByEntity)) {
        state.partsByEntity[entityId] = [];
         logger.log('partsSlice', `Registered entity '${entityId}' in partsByEntity.`, { level: 'debug' });
      }
    },
    partStockUpdateFromWebSocket(state: PartsState, action: PayloadAction<Partial<EnhancedStockItemEventData> & { partId: number }>) {
      const { partId, quantity, ...otherStockData } = action.payload;
      const part = state.partsById[partId];
      if (part) {
        logger.log('partsSlice', `Processing WebSocket stock update for part ${partId}. Current stock: ${part.in_stock}, New quantity from WS: ${quantity}`);
        if (quantity !== undefined) {
          part.in_stock = parseFloat(quantity as any);
        }
        logger.log('partsSlice', `Part ${partId} stock updated to ${part.in_stock} via WebSocket.`, { level: 'debug', otherStockData });
      } else {
        logger.warn('partsSlice', `Received WebSocket stock update for unknown part ${partId}. Part not in state.`);
      }
    },
    setLocatingPartId(state: PartsState, action: PayloadAction<number | null>) {
      state.locatingPartId = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<PartsState>) => {
    builder
      .addCase(locatePartById.pending, (state: PartsState, action) => {
        state.locatingPartId = action.meta.arg.partId;
      })
      .addCase(locatePartById.rejected, (state: PartsState, action) => {
        if (state.locatingPartId === action.meta.arg.partId) {
          state.locatingPartId = null;
        }
      })
      .addCase(locatePartById.fulfilled, (state: PartsState, action) => {
        // No specific state change on fulfillment, timeout is handled in thunk
      })
      .addCase(adjustPartStock.pending, (state: PartsState, action) => {
        const { partId, amount } = action.meta.arg;
        state.adjustingStockPartId = partId;
        state.adjustmentError = null;
        const partToUpdate = state.partsById[partId];
        if (partToUpdate) {
           const originalStock = partToUpdate.in_stock;
           // Ensure in_stock is a number before adding
           partToUpdate.in_stock = (partToUpdate.in_stock ?? 0) + amount;
            logger.log('partsSlice', `Optimistically updated stock for part ${partId} from ${originalStock} to ${partToUpdate.in_stock}`, { level: 'debug' });
        } else {
             logger.warn('partsSlice', `Cannot optimistically update stock for partId ${partId}: Part not found.`);
        }
      })
      .addCase(adjustPartStock.fulfilled, (state: PartsState, action) => {
        const { partId, newTotalStock } = action.payload;
        const part = state.partsById[partId];
        if (part) {
          part.in_stock = newTotalStock;
        }
        if (state.adjustingStockPartId === partId) {
          state.adjustingStockPartId = null;
          state.adjustmentError = null;
        }
      })
      .addCase(adjustPartStock.rejected, (state: PartsState, action) => {
        const { partId, amount } = action.meta.arg; // Revert optimistic update
        const partToRevert = state.partsById[partId];
        if (partToRevert) {
          partToRevert.in_stock = (partToRevert.in_stock ?? 0) - amount; // Revert the change
        }
        if (state.adjustingStockPartId === partId) {
          state.adjustingStockPartId = null;
          state.adjustmentError = action.payload ?? 'Stock adjustment failed.';
        }
      })
      .addCase(fetchPartDetails.pending, (state, action) => {
        state.loadingStatus[action.meta.arg] = 'loading';
      })
      .addCase(fetchPartDetails.fulfilled, (state, action) => {
        const part = action.payload;
        state.loadingStatus[part.pk] = 'succeeded';
        state.partsById[part.pk] = part;
      })
      .addCase(fetchPartDetails.rejected, (state, action) => {
        state.loadingStatus[action.meta.arg] = 'failed';
      })
      /*
      .addCase(fetchPartsByPks.fulfilled, (state, action) => {
        action.payload.forEach(part => {
          state.partsById[part.pk] = part;
          state.loadingStatus[part.pk] = 'succeeded';
        });
      })
      */
      .addCase(fetchPartsByPks.rejected, (state, action) => {
        // Handle rejected case if needed
      })
      // Placeholder for a generic part fetcher if needed later
      .addMatcher(
        (action: UnknownAction) => action.type.startsWith('parts/fetch') && action.type.endsWith('/pending'),
        (state: PartsState) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action: UnknownAction) => action.type.startsWith('parts/fetch') && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state: PartsState) => {
          state.loading = false;
        }
      );
  }
});

export const {
  setParts,
  removePartsForEntity,
  updatePart,
  updatePartStock,
  clearParts,
  registerEntity,
  partStockUpdateFromWebSocket,
  setLocatingPartId,
} = partsSlice.actions;

// =================================================================================
// SELECTORS
// This section is being replaced entirely to fix file corruption and implement
// the correct memoized selectors.
// =================================================================================

// --- Basic State Accessors ---

export const selectPartsLoading = (state: RootState): boolean => state.parts.loading;
export const selectPartsError = (state: RootState): string | null => state.parts.error;
export const selectLocatingPartId = (state: RootState): number | null => state.parts.locatingPartId;
export const selectAdjustingStockPartId = (state: RootState): number | null => state.parts.adjustingStockPartId;
export const selectAdjustmentError = (state: RootState): string | null => state.parts.adjustmentError;
export const selectPartLoadingStatus = (state: RootState, partId: number): 'idle' | 'loading' | 'succeeded' | 'failed' => {
  return state.parts.loadingStatus[partId] || 'idle';
};

// --- Input Selectors for Memoization ---

const selectPartsByIdFromSlice = (state: RootState) => state.parts.partsById;
const selectPartsByEntity = (state: RootState) => state.parts.partsByEntity;
const selectConfig = (state: RootState) => state.config.config;
const selectDefinedLogicItems = (state: RootState) => state.conditionalLogic.definedLogicItems;
const selectApiQueries = (state: RootState) => state.inventreeApi.queries;

// --- Complex Input Selectors ---

const selectPartsFromApi = createSelector(
  [selectApiQueries],
  (queries) => {
    const allParts: Record<number, InventreeItem> = {};
    for (const key in queries) {
      if (key.startsWith('getPart(') && queries[key]?.status === 'fulfilled') {
        const part = queries[key]?.data as InventreeItem;
        if (part && part.pk) {
          // Merge this part with any existing data to ensure we keep the latest info
          allParts[part.pk] = { ...(allParts[part.pk] || {}), ...part };
        }
      }
      // Also check for parameter data from its own endpoint
      if (key.startsWith('getPartParameters(') && queries[key]?.status === 'fulfilled') {
        const params = queries[key]?.data as ParameterDetail[];
        // Find the partId from the first parameter
        if (params && params.length > 0) {
          const partId = params[0].part;
          if (partId) {
            // Ensure the part exists before trying to add parameters to it
            if (!allParts[partId]) {
              allParts[partId] = { pk: partId } as InventreeItem; // Stub it if not present
            }
            allParts[partId].parameters = params;
          }
        }
      }
    }
    return allParts;
  }
);

// --- Memoized Combiner Selectors ---

export const selectCombinedParts = createSelector(
  [selectPartsByIdFromSlice, selectPartsFromApi],
  (partsFromSlice, partsFromApi) => {
    // Deep merge, with API data taking precedence over potentially stale slice data.
    const combined: Record<number, InventreeItem> = { ...partsFromSlice };
    for (const pk in partsFromApi) {
      combined[Number(pk)] = { ...(combined[Number(pk)] || {}), ...partsFromApi[Number(pk)] };
    }
    return Object.values(combined);
  }
);

export const selectRegisteredEntities = createSelector(
  [selectPartsByEntity],
  (partsByEntity) => Object.keys(partsByEntity)
);

export const selectAllReferencedPartPksFromConfig = createSelector(
  [
    (_state: RootState, config: InventreeCardConfig | undefined) => config,
    selectDefinedLogicItems
  ],
  (config, definedLogicItems) => {
    if (!config) return [];
    
    const pks = new Set<number>();

    // 1. From inventree_pks
    config.data_sources?.inventree_pks?.forEach((pk: number) => pks.add(pk));

    // 2. From part_id
    if (config.part_id) {
      pks.add(config.part_id);
    }

    // 3. From conditional logic
    if (definedLogicItems) {
      const extractPksFromGroup = (group: any) => {
        group.rules?.forEach((ruleOrGroup: any) => {
          if ('combinator' in ruleOrGroup) {
            extractPksFromGroup(ruleOrGroup);
          } else {
            const field = ruleOrGroup.field;
            if (typeof field === 'string') {
              const match = field.match(/^part_(\d+)_/);
              if (match && match[1]) {
                pks.add(parseInt(match[1], 10));
              }
            }
          }
        });
      };
      definedLogicItems.forEach((logicItem: any) => {
        logicItem.logic_pairs?.forEach((pair: any) => {
          if (pair.condition) {
            extractPksFromGroup(pair.condition);
          }
        });
      });
    }

    // 4. From parameter fetch list
    config.data_sources?.inventree_parameters_to_fetch?.forEach((fetchConfig: InventreeParameterFetchConfig) => {
      if (Array.isArray(fetchConfig.targetPartIds)) {
        fetchConfig.targetPartIds.forEach((pk: number) => pks.add(pk));
      }
    });

    // 5. From detail/variant view
    if ((config.view_type === 'detail' || config.view_type === 'variants') && typeof config.part_id === 'number') {
      pks.add(config.part_id);
    }
    
    return Array.from(pks);
  }
);

// --- Part-specific Selectors ---

export const selectPartByPk = createSelector(
  [selectCombinedParts, (_state: RootState, pk: number) => pk],
  (parts, pk) => parts.find(part => part.pk === pk)
);

export const selectIsReadyForEvaluation = createSelector(
  [
    (state: RootState) => state.inventreeApi.queries,
    selectAllReferencedPartPksFromConfig,
  ],
  (queries, pksToPrefetch) => {
    if (pksToPrefetch.length === 0) {
      return true; // No API parts needed, so we are ready.
    }

    // Check if every required part has a 'fulfilled' status in the RTK Query cache.
    return pksToPrefetch.every(pk => {
      const queryState = queries[`getPart(${pk})`];
      return queryState?.status === 'fulfilled';
    });
  }
);

export default partsSlice.reducer; 