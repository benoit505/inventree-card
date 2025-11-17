import { createSlice, PayloadAction, Action, createEntityAdapter } from '@reduxjs/toolkit';
import { InventreeItem, EnhancedStockItemEventData, RuleGroupType, ConditionalLogicItem, LogicPair, EffectDefinition, ParameterDetail } from '../../types';
import { RootState } from '../index';
import { createSelector } from 'reselect';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { inventreeApi } from '../apis/inventreeApi';
import { processHassEntities } from '../thunks/systemThunks';

ConditionalLoggerEngine.getInstance().registerCategory('partsSlice', { enabled: false, level: 'info' });

// Create entity adapter for normalized parts storage with O(1) lookups
// Note: InventreeItem uses 'pk' as the unique identifier, not 'id'
// We use EntityState<InventreeItem> to bypass the id constraint since we use selectId
const partsAdapter = createEntityAdapter<InventreeItem, number>({
  selectId: (part) => part.pk,
  sortComparer: false, // No automatic sorting - preserve insertion order
});

// Use EntityAdapter's state shape: { ids: number[], entities: Record<number, InventreeItem> }
export interface InstancePartsState extends ReturnType<typeof partsAdapter.getInitialState> {
  locatingPartId: number | null;
  adjustingStockPartId: number | null;
  adjustmentError: string | null;
  // 🚌 "Bus" for batched stock adjustments with eventual consistency
  pendingStockChanges: Record<number, {
    originalStock: number;     // Stock value when user first clicked
    expectedStock: number;      // What we expect after all pending changes
    pendingDelta: number;       // Net delta to send to API
    lastChangeTimestamp: number; // For debouncing
  }>;
  // 🔒 WebSocket update timestamps (to block stale HASS sensor data)
  websocketUpdateTimestamps: Record<number, number>; // partId → timestamp of last WebSocket update
}

export interface PartsState {
  partsByInstance: Record<string, InstancePartsState>;
  loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  loading: boolean;
  error: string | null;
}

const initialInstancePartsState: InstancePartsState = partsAdapter.getInitialState({
    locatingPartId: null,
    adjustingStockPartId: null,
    adjustmentError: null,
    pendingStockChanges: {},
    websocketUpdateTimestamps: {},
});

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
    addApiPart(state, action: PayloadAction<{ part: InventreeItem, cardInstanceId: string }>) {
      const { part, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      
      // Get existing data, which might be a placeholder from a parameter fetch
      const existingPart = instanceState.entities[part.pk] || {};
      
      // The new 'part' data is the source of truth.
      // We merge it with existing data to preserve any pre-fetched parameters.
      const mergedPart = {
        ...existingPart,
        ...part, // This ensures all fields from the full part object overwrite the placeholder
        source: 'api' as const,
      };
      
      // Use adapter's upsertOne for O(1) add/update
      partsAdapter.upsertOne(instanceState, mergedPart);
    },
    setPartParameters(state, action: PayloadAction<{ partId: number, parameters: ParameterDetail[], cardInstanceId: string }>) {
      const { partId, parameters, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      
      // If the part doesn't exist, create a placeholder.
      if (!instanceState.entities[partId]) {
        const placeholder = { 
          pk: partId, 
          name: `Part ${partId}` // This placeholder name will be overwritten by addApiPart
        } as InventreeItem;
        partsAdapter.addOne(instanceState, placeholder);
      }
      
      // Update the part with parameters using adapter's updateOne for O(1) update
      partsAdapter.updateOne(instanceState, {
        id: partId,
        changes: { parameters }
      });
    },
    updateParameterForPart(state, action: PayloadAction<{ partId: number, parameterPk: number, newValue: any, cardInstanceId: string }>) {
      const { partId, parameterPk, newValue, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      const part = instanceState.entities[partId];

      // 🚀 TEMP DEBUG LOG
      const paramBefore = part?.parameters?.find(p => p.pk === parameterPk)?.data;

      if (part && part.parameters) {
        const paramIndex = part.parameters.findIndex(p => p.pk === parameterPk);
        if (paramIndex !== -1) {
          // Create updated parameters array (immutable update)
          const updatedParameters = [...part.parameters];
          updatedParameters[paramIndex] = {
            ...updatedParameters[paramIndex],
            data: newValue
          };
          
          // Use adapter's updateOne for O(1) update
          partsAdapter.updateOne(instanceState, {
            id: partId,
            changes: { parameters: updatedParameters }
          });
          
          // 🚀 TEMP DEBUG LOG
          const paramAfter = newValue;
          console.log('%c[partsSlice] Reducer Executed:', 'color: #2ECC71; font-weight: bold;', {
            cardInstanceId,
            partId,
            parameterPk,
            newValue,
            valueBefore: paramBefore,
            valueAfter: paramAfter
          });
        }
      }
    },
    setParts(state, action: PayloadAction<{ parts: InventreeItem[], cardInstanceId: string }>) {
      const { parts, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      
      // 🔒 PROTECTION: Don't let slow HASS sensor data overwrite recent WebSocket updates
      const WEBSOCKET_PRIORITY_WINDOW = 120000; // 2 minutes (HASS sensors update ~1 minute, give buffer)
      const now = Date.now();
      
      // HASS data should be merged, not replaced, to avoid overwriting API-fetched parts.
      const mergedParts = parts.map(part => {
        const existingPart = instanceState.entities[part.pk] || {};
        
        // Check if this part has a recent WebSocket update
        const lastWebSocketUpdate = instanceState.websocketUpdateTimestamps[part.pk];
        const timeSinceWebSocket = lastWebSocketUpdate ? (now - lastWebSocketUpdate) : Infinity;
        
        // If WebSocket updated recently, preserve WebSocket stock value, but merge other fields
        if (timeSinceWebSocket < WEBSOCKET_PRIORITY_WINDOW) {
          console.log(`🛡️  PROTECTED: Part ${part.pk} - WebSocket update ${Math.round(timeSinceWebSocket / 1000)}s ago. Keeping WebSocket stock (${existingPart.in_stock}), ignoring HASS sensor value (${part.in_stock})`);
          return {
            ...existingPart,
            ...part,
            // Keep WebSocket values for stock fields
            in_stock: existingPart.in_stock,
            total_in_stock: existingPart.total_in_stock,
            unallocated_stock: existingPart.unallocated_stock,
            source: 'hass' as const
          };
        }
        
        // No recent WebSocket update, use HASS data
        return { 
          ...existingPart, 
          ...part, 
          source: 'hass' as const
        };
      });
      
      // Use adapter's upsertMany for O(n) batch upsert (more efficient than n individual upserts)
      partsAdapter.upsertMany(instanceState, mergedParts);
    },
    removeInstance(state, action: PayloadAction<{ cardInstanceId: string }>) {
      delete state.partsByInstance[action.payload.cardInstanceId];
    },
    updatePart(state: PartsState, action: PayloadAction<{ part: InventreeItem, cardInstanceId: string }>) {
      const { part, cardInstanceId } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      const existingPart = instanceState.entities[part.pk] || {};
      const mergedPart = { ...existingPart, ...part };
      
      // Use adapter's upsertOne for O(1) update
      partsAdapter.upsertOne(instanceState, mergedPart);
    },
    // 🚌 User clicked +/- button: Track pending change and update UI optimistically
    addPendingStockChange(state: PartsState, action: PayloadAction<{ partId: number, delta: number, cardInstanceId: string }>) {
        const { partId, delta, cardInstanceId } = action.payload;
        const instanceState = getOrCreateInstanceState(state, cardInstanceId);
        const part = instanceState.entities[partId];
        if (!part) return;
        
        const existing = instanceState.pendingStockChanges[partId];
        
        if (!existing) {
          // First change: Record original stock
          instanceState.pendingStockChanges[partId] = {
            originalStock: part.in_stock || 0,
            expectedStock: (part.in_stock || 0) + delta,
            pendingDelta: delta,
            lastChangeTimestamp: Date.now(),
          };
        } else {
          // Additional change: Accumulate delta
          existing.pendingDelta += delta;
          existing.expectedStock = existing.originalStock + existing.pendingDelta;
          existing.lastChangeTimestamp = Date.now();
        }
        
        // Update UI optimistically to expected value
        partsAdapter.updateOne(instanceState, {
          id: partId,
          changes: { in_stock: instanceState.pendingStockChanges[partId].expectedStock }
        });
    },
    // 🚀 API call succeeded: Mark as "in flight"
    clearPendingStockChange(state: PartsState, action: PayloadAction<{ partId: number, cardInstanceId: string }>) {
        const { partId, cardInstanceId } = action.payload;
        const instanceState = getOrCreateInstanceState(state, cardInstanceId);
        delete instanceState.pendingStockChanges[partId];
    },
    updatePartStock(state: PartsState, action: PayloadAction<{ partId: number, newStock: number, cardInstanceId: string }>) {
        const { partId, newStock, cardInstanceId } = action.payload;
        const instanceState = getOrCreateInstanceState(state, cardInstanceId);
        if (instanceState?.entities[partId]) {
            // Use adapter's updateOne for O(1) update
            partsAdapter.updateOne(instanceState, {
              id: partId,
              changes: { in_stock: newStock }
            });
        }
    },
    partStockUpdateFromWebSocket(state, action: PayloadAction<Partial<EnhancedStockItemEventData> & { partId: number }>) {
      const { partId, quantity } = action.payload;
      const incomingStock = parseFloat(quantity as any);
      
      for (const instanceId in state.partsByInstance) {
        const instanceState = state.partsByInstance[instanceId];
        const part = instanceState.entities[partId];
        if (!part || quantity === undefined) continue;
        
        // 🔒 Mark this part as having a recent WebSocket update (blocks HASS sensor overwrites)
        instanceState.websocketUpdateTimestamps[partId] = Date.now();
        
        // 🔍 VERIFICATION: Check if we have pending changes for this part
        const pending = instanceState.pendingStockChanges[partId];
        
        if (pending) {
          // We're expecting a specific value!
          const tolerance = 0.01; // Allow for floating point errors
          const matches = Math.abs(incomingStock - pending.expectedStock) < tolerance;
          
          if (matches) {
            // ✅ Circle closed! WebSocket confirms our optimistic update
            console.log(`🎉 CIRCLE CLOSED! Part ${partId}:`);
            console.log(`   Original stock: ${pending.originalStock}`);
            console.log(`   User delta: ${pending.pendingDelta > 0 ? '+' : ''}${pending.pendingDelta}`);
            console.log(`   Expected: ${pending.expectedStock}`);
            console.log(`   WebSocket actual: ${incomingStock}`);
            console.log(`   ✅ MATCH! The bus delivered perfectly!`);
            console.log(`   ⏱️  Verification time: ${Date.now() - pending.lastChangeTimestamp}ms`);
            delete instanceState.pendingStockChanges[partId];
          } else {
            // ⚠️ Mismatch! WebSocket says something different
            const timeSinceChange = Date.now() - pending.lastChangeTimestamp;
            console.warn(`⚠️ CIRCLE BROKEN! Part ${partId}:`);
            console.warn(`   Expected: ${pending.expectedStock}`);
            console.warn(`   Actual: ${incomingStock}`);
            console.warn(`   Difference: ${Math.abs(incomingStock - pending.expectedStock)}`);
            console.warn(`   Time since change: ${timeSinceChange}ms`);
            
            // If mismatch happens quickly (< 2 seconds), keep our optimistic value and wait longer
            if (timeSinceChange < 2000) {
              console.warn(`   ⏳ Too soon! Keeping optimistic value, waiting for more WebSocket events...`);
              // Don't delete pending change yet - another WebSocket event might come
              return; // Don't update to WebSocket value yet
            } else {
              console.warn(`   ⏱️  Been waiting ${timeSinceChange}ms. Trusting WebSocket as source of truth.`);
              delete instanceState.pendingStockChanges[partId];
            }
          }
        }
        
        // Always update to WebSocket value (it's the source of truth)
        partsAdapter.updateOne(instanceState, {
          id: partId,
          changes: { in_stock: incomingStock }
        });
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
  addApiPart,
  setPartParameters,
  updateParameterForPart,
  setParts,
  removeInstance,
  updatePart,
  updatePartStock,
  addPendingStockChange,
  clearPendingStockChange,
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
      inventree_pks: config.data_sources?.inventree_pks,  // FIXED: Use correct field name from config
      inventree_parts: config.data_sources?.inventree_parts,  // Legacy fallback
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

    // FIXED: Check inventree_pks (current) first, then inventree_parts (legacy) for backwards compatibility  
    const directPartIds = dataSources?.inventree_pks || dataSources?.inventree_parts;
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

// Create instance-specific selectors using EntityAdapter
// These provide O(1) lookups instead of O(n) array operations!
const adapterSelectors = partsAdapter.getSelectors();

export const selectAllPartsForInstance = createSelector(
  [selectInstancePartsState],
  (instanceState) => adapterSelectors.selectAll(instanceState)
);

export const selectPartById = createSelector(
  [
    selectInstancePartsState,
    // The third argument is just to pass the partId through to the result function
    (_state: RootState, _cardInstanceId: string, partId: number) => partId,
  ],
  (instanceState, partId) => {
    // O(1) lookup directly from entities object! 🚀
    return adapterSelectors.selectById(instanceState, partId);
  }
);

export default partsSlice.reducer;

export { partsSlice }; 