import { createSlice, PayloadAction, Action } from '@reduxjs/toolkit';
import { InventreeItem, EnhancedStockItemEventData, RuleGroupType, ConditionalLogicItem, LogicPair, EffectDefinition } from '../../types';
import { RootState } from '../index';
import { createSelector } from 'reselect';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { inventreeApi } from '../apis/inventreeApi';
import { processHassEntities } from '../thunks/systemThunks';

ConditionalLoggerEngine.getInstance().registerCategory('partsSlice', { enabled: false, level: 'info' });

export interface InstancePartsState {
  partsById: Record<number, InventreeItem>;
  locatingPartId: number | null;
  adjustingStockPartId: number | null;
  adjustmentError: string | null;
}

export interface PartsState {
  partsByInstance: Record<string, InstancePartsState>;
  loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  loading: boolean;
  error: string | null;
}

const initialInstancePartsState: InstancePartsState = {
    partsById: {},
    locatingPartId: null,
    adjustingStockPartId: null,
    adjustmentError: null,
};

const initialState: PartsState = {
  partsByInstance: {},
  loadingStatus: {},
  loading: false,
  error: null,
};

// Helper to get or create the state for a specific instance
const getOrCreateInstanceState = (state: PartsState, cardInstanceId: string): InstancePartsState => {
  if (!state.partsByInstance[cardInstanceId]) {
    state.partsByInstance[cardInstanceId] = JSON.parse(JSON.stringify(initialInstancePartsState));
  }
  return state.partsByInstance[cardInstanceId];
};

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setParts(state, action: PayloadAction<{ parts: InventreeItem[], cardInstanceId: string }>) {
      const { parts, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
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
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      instanceState.partsById[part.pk] = { ...instanceState.partsById[part.pk], ...part };
    },
    updatePartStock(state: PartsState, action: PayloadAction<{ partId: number, newStock: number, cardInstanceId: string }>) {
        const { partId, newStock, cardInstanceId } = action.payload;
        const instanceState = getOrCreateInstanceState(state, cardInstanceId);
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
    setLocatingPartId(state, action: PayloadAction<{ partId: number | null, cardInstanceId: string }>) {
      const { partId, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      instanceState.locatingPartId = partId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processHassEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processHassEntities.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(processHassEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to process HASS entities';
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

const selectPartsState = (state: RootState) => state.parts;

const selectInstancePartsState = createSelector(
  [
    (state: RootState) => state.parts.partsByInstance,
    (_state: RootState, cardInstanceId: string) => cardInstanceId
  ],
  (partsByInstance, cardInstanceId) => partsByInstance[cardInstanceId] ?? initialInstancePartsState
);

const selectDataSourcesFromConfig = createSelector(
  [
    (state: RootState, cardInstanceId: string) => state.config.configsByInstance[cardInstanceId]?.config
  ],
  (config) => {
    if (!config) {
      return {
        inventree_parts: undefined,
        part_id: undefined,
        entities: undefined
      };
    }
    return {
      inventree_parts: config.data_sources?.inventree_parts,
      part_id: config.part_id,
      entities: config.entities
    };
  }
);

export const selectAllReferencedPartPksFromConfig = createSelector(
  [
    selectDataSourcesFromConfig,
    (state: RootState, cardInstanceId: string) => state.conditionalLogic.definedLogicsByInstance[cardInstanceId],
    (state: RootState, cardInstanceId: string) => cardInstanceId,
  ],
  (dataSources, definedLogicItems, cardInstanceId) => {
    if (!cardInstanceId) {
      return [];
    }

    const pks = new Set<number>();

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
      definedLogicItems.forEach((logicItem: ConditionalLogicItem) => {
        logicItem.logicPairs?.forEach((pair: LogicPair) => {
          if (pair.conditionRules) extractPksFromGroup(pair.conditionRules);
          pair.effects?.forEach((effect: EffectDefinition) => {
            if ('targetPartPks' in effect && effect.targetPartPks) {
              if (typeof effect.targetPartPks === 'number') {
                pks.add(effect.targetPartPks);
              } else if (Array.isArray(effect.targetPartPks)) {
                effect.targetPartPks.forEach((pk: number) => { if(typeof pk === 'number') pks.add(pk); });
              }
            }
          });
        });
      });
    }

    // data_sources: inventree_parts
    const directPartIds = dataSources?.inventree_parts;
    if (Array.isArray(directPartIds)) {
        directPartIds.forEach(pk => {
            if (typeof pk === 'number') pks.add(pk);
        });
    }

    // part_id
    if (dataSources?.part_id) {
        if (typeof dataSources.part_id === 'number') pks.add(dataSources.part_id);
    }
    
    // entities
    if (dataSources?.entities) {
        dataSources.entities.forEach((entity: { part_id?: number }) => {
            if (entity.part_id) pks.add(entity.part_id);
        });
    }

    const result = Array.from(pks);
    console.log('%c[partsSlice] selectAllReferencedPartPksFromConfig', 'color: #F39C12; font-weight: bold;', { cardInstanceId, result });
    return result;
  }
);

const selectApiParts = createSelector(
  [
    (state: RootState) => state.inventreeApi.queries,
    (_state: RootState, cardInstanceId: string) => cardInstanceId,
  ],
  (queries, cardInstanceId): Record<number, InventreeItem> => {
    const apiParts: Record<number, InventreeItem> = {};
    if (!cardInstanceId) return apiParts;

    for (const queryKey in queries) {
      const query = queries[queryKey];
      
      // Define a type for our specific query to help TypeScript
      type GetPartQuery = typeof query & {
        endpointName: 'getPart';
        status: 'fulfilled';
        originalArgs: { pk: number, cardInstanceId: string };
        data: InventreeItem;
      };

      // Check if the query is for getPart, is fulfilled, has data, and belongs to the correct instance
      if (
        query?.endpointName === 'getPart' &&
        query.status === 'fulfilled' &&
        query.data &&
        (query as any).originalArgs?.cardInstanceId === cardInstanceId
      ) {
        const part = (query as any).data as InventreeItem;
        apiParts[part.pk] = { ...part, source: 'api' };
      }
    }
    console.log('%c[partsSlice] selectApiParts', 'color: #2ECC71; font-weight: bold;', { cardInstanceId, apiParts });
    return apiParts;
  }
);

export const selectCombinedParts = createSelector(
  [
    selectInstancePartsState,
    (state: RootState, cardInstanceId: string) => selectApiParts(state, cardInstanceId),
    (_state: RootState, cardInstanceId: string) => cardInstanceId,
  ],
  (instanceState, apiParts, cardInstanceId): InventreeItem[] => {
    const combined = { ...instanceState.partsById };

    for (const partId in apiParts) {
      const pk = parseInt(partId, 10);
      combined[pk] = { ...(combined[pk] || {}), ...apiParts[pk] };
    }
    
    const result: InventreeItem[] = Object.values(combined);
    console.log('%c[partsSlice] selectCombinedParts', 'color: #3498DB; font-weight: bold;', { cardInstanceId, result });
    return result;
  }
);

export const selectIsReadyForEvaluation = createSelector(
    [
        (state: RootState) => state.parts.loading,
        (state: RootState) => state.inventreeApi.queries,
    ],
    (partsLoading, queries) => {
        if (partsLoading) return false;

        // Find if there is at least one 'getPart' query that is fulfilled
        const atLeastOnePartLoaded = Object.values(queries).some(
            (query: any) => query?.endpointName === 'getPart' && query?.status === 'fulfilled'
        );

        return atLeastOnePartLoaded;
    }
);

export const selectArePartsLoading = (state: RootState): boolean => state.parts.loading;

export const selectPartsError = (state: RootState): string | null => state.parts.error;

export const selectLocatingPartId = createSelector(
  [selectInstancePartsState],
  (instanceState) => instanceState.locatingPartId
);

export const selectAdjustingStockPartId = createSelector(
  [selectInstancePartsState],
  (instanceState) => instanceState.adjustingStockPartId
);

export const selectAdjustmentError = createSelector(
  [selectInstancePartsState],
  (instanceState) => instanceState.adjustmentError
);

export const selectAllParts = createSelector(
    [(state: RootState) => state.parts.partsByInstance],
    (partsByInstance) => {
        return Object.values(partsByInstance).flatMap((instanceState: InstancePartsState) => Object.values(instanceState.partsById));
    }
);

export const selectPartById = createSelector(
  [
    selectCombinedParts,
    // The second argument here is just to pass the partId through to the result function
    (_state: RootState, _cardInstanceId: string, partId: number) => partId,
  ],
  (combinedParts, partId) => {
    return combinedParts.find(p => p.pk === partId);
  }
);

export default partsSlice.reducer;

export { partsSlice }; 