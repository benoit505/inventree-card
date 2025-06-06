import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder, UnknownAction, ThunkDispatch } from '@reduxjs/toolkit';
import { InventreeItem, WLEDConfig, EnhancedStockItemEventData, ParameterDetail } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
import { WLEDService } from '../../services/wled-service';
import { createSelector } from 'reselect';
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';

const logger = Logger.getInstance();

export interface PartsState {
  partsById: Record<number, InventreeItem>;
  partsByEntity: Record<string, number[]>;
  loading: boolean;
  error: string | null;
  locatingPartId: number | null;
  adjustingStockPartId: number | null;
  adjustmentError: string | null;
}

const initialState: PartsState = {
  partsById: {},
  partsByEntity: {},
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
    const wledConfigFromState = state.config.resolvedConfig?.services?.wled;

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
      console.log('[partsSlice] setParts PAYLOAD:', JSON.stringify(action.payload, null, 2));
      
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
    addParts(state: PartsState, action: PayloadAction<InventreeItem[]>) {
      const newParts = action.payload;
      newParts.forEach(part => {
        if (!part.pk) {
          logger.warn('partsSlice', 'Attempted to add a part without a PK.', { partData: part });
          return;
        }
        state.partsById[part.pk] = {
          ...state.partsById[part.pk],
          ...part,
          source: state.partsById[part.pk]?.source || 'api:direct_pk',
        };
        logger.log('partsSlice', `Added/Updated part ${part.pk} from direct PK fetch.`, { level: 'debug' });
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
        logger.warn('partsSlice', `Received WebSocket stock update for unknown part ${partId}. Triggering fetch.`);
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
      })
      .addCase(adjustPartStock.pending, (state: PartsState, action) => {
        const { partId, amount } = action.meta.arg;
        state.adjustingStockPartId = partId;
        state.adjustmentError = null;
        const partToUpdate = state.partsById[partId];
        if (partToUpdate) {
           const originalStock = partToUpdate.in_stock;
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
        }
        state.adjustmentError = null;
      })
      .addCase(adjustPartStock.rejected, (state: PartsState, action) => {
        const rejectedPartId = action.meta.arg.partId;
        const originalArgs = action.meta.arg;

        state.adjustmentError = action.payload as string || action.error.message || 'Failed to adjust stock';
        logger.error('partsSlice', `Stock adjustment failed for part ${rejectedPartId}: ${state.adjustmentError}`);
        
        const partToRevert = state.partsById[rejectedPartId];
        if (partToRevert && typeof originalArgs.amount === 'number') {
             partToRevert.in_stock = (partToRevert.in_stock ?? 0) - originalArgs.amount; 
             logger.warn('partsSlice', `Reverted optimistic stock update for part ${rejectedPartId}. New reverted stock: ${partToRevert.in_stock}`);
        }
         if (state.adjustingStockPartId === rejectedPartId) {
           state.adjustingStockPartId = null;
         }
      })
      .addCase(fetchPartDetails.pending, (state: PartsState, action) => {
        const partId = action.meta.arg;
        logger.info('partsSlice', `Fetching details for part ${partId} (pending)...`);
        state.loading = true;
      })
      .addCase(fetchPartDetails.fulfilled, (state: PartsState, action: PayloadAction<InventreeItem>) => {
        const fetchedPart = action.payload;
        logger.info('partsSlice', `Successfully fetched details for part ${fetchedPart.pk}. Updating state.`);
        state.partsById[fetchedPart.pk] = {
          ...state.partsById[fetchedPart.pk],
          ...fetchedPart,
        };
        state.loading = false;
      })
      .addCase(fetchPartDetails.rejected, (state: PartsState, action) => {
        const partId = action.meta.arg;
        logger.error('partsSlice', `Failed to fetch details for part ${partId}: ${action.payload || action.error.message}`);
        state.loading = false;
        state.error = action.payload as string || action.error.message || `Failed to fetch details for part ${partId}`;
      });
  },
});

export const {
  setParts,
  addParts,
  updatePart,
  updatePartStock,
  clearParts,
  registerEntity,
  partStockUpdateFromWebSocket,
  setLocatingPartId
} = partsSlice.actions;

export default partsSlice.reducer;

// --- Selectors ---

export const selectPartsByEntityMapping = (state: RootState): Record<string, number[]> => state.parts.partsByEntity;
export const selectPartsById = (state: RootState): Record<number, InventreeItem> => state.parts.partsById;

export const selectAllPartIds = createSelector(
    [selectPartsById],
    (partsById): number[] => Object.keys(partsById).map(Number)
);

export const selectAllParts = createSelector(
    [selectPartsById],
    (partsById): InventreeItem[] => Object.values(partsById)
);

export const selectPartsForEntities = createSelector(
  [selectPartsByEntityMapping, selectPartsById, (_: RootState, entityIds: string[]) => entityIds],
  (partsByEntity, partsById, entityIds): InventreeItem[] => {
    const relevantPartIds = new Set<number>();
    entityIds.forEach(entityId => {
      const partIds = partsByEntity[entityId];
      if (partIds) {
        partIds.forEach((id: number) => relevantPartIds.add(id));
      }
    });

    const result: InventreeItem[] = [];
    relevantPartIds.forEach(partId => {
      const part = partsById[partId];
      if (part) {
        result.push(part);
      }
    });
    return result;
  }
);

export const selectPartsByEntityId = createSelector(
  [selectPartsById, selectPartsByEntityMapping, (_: RootState, entityId: string) => entityId],
  (partsById, partsByEntity, entityId): InventreeItem[] => {
    const partIds = partsByEntity[entityId] ?? [];
    return partIds.map((id: number) => partsById[id]).filter((part?: InventreeItem): part is InventreeItem => !!part);
  }
);

export const selectPartById = createSelector(
  [(state: RootState) => state.parts.partsById, (_: RootState, partId: number | null | undefined) => partId],
  (partsById, partId) => (partId !== null && partId !== undefined ? partsById[partId] : undefined)
);

export const selectPartsLoading = (state: RootState): boolean => state.parts.loading;
export const selectPartsError = (state: RootState): string | null => state.parts.error;

export const selectLocatingPartId = (state: RootState): number | null => state.parts.locatingPartId;
export const selectAdjustingStockPartId = (state: RootState): number | null => state.parts.adjustingStockPartId;
export const selectAdjustmentError = (state: RootState): string | null => state.parts.adjustmentError;

export const selectFilteredParts = createSelector(
    [selectAllParts],
    (parts: InventreeItem[]): InventreeItem[] => {
        return parts;
    }
);

export const selectPartsByEntity = createSelector(
  [
    (state: RootState) => state.parts.partsById,
    (state: RootState) => state.parts.partsByEntity,
    (_: RootState, entityId: string | null | undefined) => entityId,
  ],
  (partsById, partsByEntity, entityId: string | null | undefined): InventreeItem[] => {
    if (!entityId) {
      return [];
    }
    const currentPartIds = partsByEntity[entityId];
    if (!currentPartIds) {
        return [];
    }
    return currentPartIds.map((id: number) => partsById[id]).filter((part?: InventreeItem): part is InventreeItem => part !== undefined);
  }
);

export const selectCombinedParts = createSelector(
  [
    (state: RootState) => state.parts.partsById,
    (state: RootState) => state.parts.partsByEntity,
    (
      _: RootState,
      primaryEntityId: string | null | undefined,
      additionalEntityIds: string[] = []
    ) => ({
      primaryEntityId,
      additionalEntityIds,
    }),
  ],
  (partsById, partsByEntity, { primaryEntityId, additionalEntityIds }): InventreeItem[] => {
    const combinedPartIds = new Set<number>();

    if (primaryEntityId) {
        const primaryPartIds = partsByEntity[primaryEntityId];
        if (primaryPartIds) {
            primaryPartIds.forEach((id: number) => combinedPartIds.add(id));
        }
    }

    additionalEntityIds.forEach((entityId: string) => {
      const additionalPartIds = partsByEntity[entityId];
      if (additionalPartIds) {
        additionalPartIds.forEach((id: number) => combinedPartIds.add(id));
      }
    });

    return Array.from(combinedPartIds).map((id: number) => partsById[id]).filter((part?: InventreeItem): part is InventreeItem => part !== undefined);
  }
);

// New selector to get parts by an array of PKs
export const selectPartsByPks = createSelector(
  [selectPartsById, (_state: RootState, pks: number[]) => pks],
  (partsById, pks) => {
    if (!pks || pks.length === 0) return [];
    return pks.map(pk => partsById[pk]).filter(part => part !== undefined);
  }
); 