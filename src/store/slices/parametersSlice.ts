import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { ParameterAction, ParameterCondition, InventreeCardConfig, InventreeItem, ParameterDetail, ParameterConfig, ParameterOperator, ParameterActionType } from '../../types';
import { RootState } from '../index';
import { fetchParametersForPart, updateParameterValue, fetchParametersForReferencedParts } from '../thunks/parameterThunks';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

// Interface for a single processed condition
export interface ProcessedCondition {
  id: string; // A unique ID for this condition (e.g., derived from the raw string or a simple index)
  rawConditionString: string; // The original condition string from config
  sourceParameterString: string; // The 'parameter' field from the original ParameterCondition object
  partId: number; // e.g., 145. Now guaranteed to be a number due to previous thunk changes.
  parameterName: string; // e.g., "microwavables"
  operator: ParameterOperator;
  valueToCompare: any;  // e.g., true (boolean), "active" (string), 10 (number)
  action: ParameterActionType;
  actionValue: string;
  targetPartIds?: number[] | string; // UPDATED: Mirrored from ParameterCondition, can be array or wildcard string
}

// NEW: Interface for the effects applied by conditions
export interface ConditionalPartEffect {
  isVisible?: boolean;
  highlight?: string; // e.g., color code
  textColor?: string; // e.g., color code
  border?: string; // e.g., CSS border string like "2px solid red"
  // Add other effect types as needed based on ParameterActionType
  icon?: string; // mdi icon name
  badge?: string; // text for a badge
  // sort, priority, show_section might be handled differently or also influence this object
}

interface ParametersState {
  conditions: Record<string, ParameterCondition[]>; // Raw conditions from config, keyed by entityId (legacy)
  definedConditions: ParameterCondition[]; // Stores active ParameterCondition objects from the config
  processedConditions: ProcessedCondition[]; // Stores parsed and structured conditions
  conditionalPartEffects: Record<number, ConditionalPartEffect>; // NEW: Stores effects for each partId
  actions: Record<string, ParameterAction[]>;
  parameterValues: Record<number, Record<string, ParameterDetail>>;
  parameterLoadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  parameterError: Record<number, string | null>;
  config: InventreeCardConfig | null;
  strictWebSocketMode: boolean;
  recentlyChanged: string[];
  cache: {
    conditionResults: Record<string, boolean>;
    lastCleared: number;
  };
  parametersByPartId: Record<number, ParameterDetail[]>;
}

const initialState: ParametersState = {
  conditions: {},
  definedConditions: [],
  processedConditions: [],
  conditionalPartEffects: {}, // NEW: Initialize as empty object
  actions: {},
  parameterValues: {},
  parameterLoadingStatus: {},
  parameterError: {},
  config: null,
  strictWebSocketMode: false,
  recentlyChanged: [],
  cache: {
    conditionResults: {},
    lastCleared: Date.now()
  },
  parametersByPartId: {}
};

const parametersSlice = createSlice({
  name: 'parameters',
  initialState,
  reducers: {
    setConditions(state: ParametersState, action: PayloadAction<{ entityId: string, conditions: ParameterCondition[] }>) {
      const { entityId, conditions } = action.payload;
      state.conditions[entityId] = conditions;
    },
    setDefinedConditions(state: ParametersState, action: PayloadAction<ParameterCondition[]>) {
      state.definedConditions = action.payload;
      logger.log('parametersSlice', 'Defined conditions have been set.', { count: action.payload.length, level: 'debug' });
    },
    setProcessedConditions(state: ParametersState, action: PayloadAction<ProcessedCondition[]>) {
      state.processedConditions = action.payload;
      logger.log('parametersSlice', 'Processed conditions have been set.', { count: action.payload.length, level: 'debug' });
    },
    setConditionalPartEffectsBatch(state: ParametersState, action: PayloadAction<Record<number, ConditionalPartEffect>>) {
      // Replace the entire effects object. The thunk will calculate the complete new state.
      state.conditionalPartEffects = action.payload;
      logger.log('parametersSlice', 'Conditional part effects batch updated.', { count: Object.keys(action.payload).length, level: 'debug' });
    },
    clearConditionalPartEffects(state: ParametersState) {
      state.conditionalPartEffects = {};
      logger.log('parametersSlice', 'Conditional part effects cleared.', { level: 'debug' });
    },
    setActions(state: ParametersState, action: PayloadAction<{ entityId: string, actions: ParameterAction[] }>) {
      const { entityId, actions } = action.payload;
      state.actions[entityId] = actions;
    },
    setConfig(state: ParametersState, action: PayloadAction<InventreeCardConfig>) {
      state.config = action.payload;
    },
    setStrictWebSocketMode(state: ParametersState, action: PayloadAction<boolean>) {
      state.strictWebSocketMode = action.payload;
    },
    clearConditionCache(state: ParametersState) {
      state.cache.conditionResults = {};
      state.cache.lastCleared = Date.now();
      logger.log('parametersSlice', 'Condition cache cleared.', { level: 'debug' });
    },
    clearCache(state: ParametersState) {
      state.cache.conditionResults = {};
      state.cache.lastCleared = Date.now();
      state.parameterValues = {};
      state.parameterLoadingStatus = {};
      state.parameterError = {};
      state.recentlyChanged = [];
      logger.info('parametersSlice', 'Full parameter cache cleared (values, status, errors, conditions, recent).');
    },
    checkCondition(state: ParametersState, action: PayloadAction<{ part: InventreeItem, condition: ParameterCondition }>) {
      // This action doesn't actually modify state, it's used for tracking only
    },
    updateValue(state: ParametersState, action: PayloadAction<{ partId: number, paramName: string, value: string, source?: string }>) {
      const { partId, paramName, value, source } = action.payload;
      
      if (!state.parameterValues[partId]) {
        state.parameterValues[partId] = {};
        logger.log('parametersSlice', `Created parameter entry for part ${partId} during updateValue.`, { level: 'debug' });
      }
      
      if (!state.parameterValues[partId][paramName]) {
        state.parameterValues[partId][paramName] = {
           pk: 0,
           part: partId,
           template: 0,
           template_detail: { 
              pk: 0,
              name: paramName, 
              units: '',
              description: '',
              checkbox: false,
              choices: '',
              selectionlist: null
           },
           data: value,
           data_numeric: null,
        };
        logger.log('parametersSlice', `Created parameter entry for ${paramName} on part ${partId} during updateValue.`, { level: 'debug' });
      } else {
         state.parameterValues[partId][paramName].data = value;
      }

      // Ensure loading status is updated if this is the first time we get a value
      // However, for WebSocket updates, it's usually better to assume it's 'succeeded' if data arrives
      if (state.parameterLoadingStatus[partId] !== 'succeeded') {
        state.parameterLoadingStatus[partId] = 'succeeded';
        state.parameterError[partId] = null;
      }

      const key = `${partId}:${paramName}`;
      if (!state.recentlyChanged.includes(key)) {
        state.recentlyChanged.push(key);
        if (state.recentlyChanged.length > 100) {
          state.recentlyChanged = state.recentlyChanged.slice(-100);
        }
      }
       logger.log('parametersSlice', `Updated value for ${key} to '${value}' (Source: ${source || 'Unknown'}). Status set to succeeded.`, { level: 'debug' });
    },
    webSocketUpdateReceived(state: ParametersState, action: PayloadAction<{ partId: number; parameterName: string; value: any; source?: string }>) {
      const { partId, parameterName, value, source } = action.payload;
      logger.log('parametersSlice', `[Reducer START] webSocketUpdateReceived`, {
        level: 'info',
        partId,
        parameterName,
        receivedValue: value,
        valueType: typeof value,
        source
      });

      if (!state.parameterValues[partId]) {
        state.parameterValues[partId] = {};
        logger.log('parametersSlice', `Created parameter structure for part ${partId} during WebSocket update.`, { level: 'debug' });
      }

      const beforeValue = state.parameterValues[partId]?.[parameterName]?.data;
      logger.log('parametersSlice', `Value before update for ${partId}:${parameterName}: ${beforeValue}`, { level: 'debug' });

      if (!state.parameterValues[partId][parameterName]) {
        state.parameterValues[partId][parameterName] = {
          pk: 0, 
          part: partId,
          template: 0, 
          template_detail: {
            pk: 0, 
            name: parameterName,
            units: '',
            description: '',
            checkbox: typeof value === 'boolean',
            choices: '',
            selectionlist: null
          },
          data: String(value), 
          data_numeric: typeof value === 'number' ? value : null,
        };
        logger.log('parametersSlice', `Created new parameter entry for ${parameterName} on part ${partId} via WebSocket. New data: ${String(value)}`, { level: 'debug' });
      } else {
        state.parameterValues[partId][parameterName].data = String(value);
        logger.log('parametersSlice', `Updated existing parameter ${parameterName} for part ${partId} via WebSocket. New data: ${String(value)}`, { level: 'debug' });
      }

      const afterValue = state.parameterValues[partId]?.[parameterName]?.data;
      logger.log('parametersSlice', `Value AFTER update for ${partId}:${parameterName}: ${afterValue}`, { level: 'debug' });

      state.parameterLoadingStatus[partId] = 'succeeded';
      state.parameterError[partId] = null;

      const key = `${partId}:${parameterName}`;
      if (!state.recentlyChanged.includes(key)) {
        state.recentlyChanged.push(key);
        if (state.recentlyChanged.length > 100) {
          state.recentlyChanged = state.recentlyChanged.slice(-100);
        }
      }
      logger.log('parametersSlice', `[Reducer END] Value for ${key} processed via WebSocket. Status set to succeeded. Final data in store: ${afterValue}`, { level: 'info' });
    },
    markChanged(state: ParametersState, action: PayloadAction<{ parameterId: string }>) {
      const { parameterId } = action.payload;
      if (!state.recentlyChanged.includes(parameterId)) {
        state.recentlyChanged.push(parameterId);
        if (state.recentlyChanged.length > 100) {
          state.recentlyChanged = state.recentlyChanged.slice(-100);
        }
      }
    },
    addParametersForPart(state: ParametersState, action: PayloadAction<{ partId: number; parameters: ParameterDetail[] }>) {
      const { partId, parameters } = action.payload;
      if (!state.parametersByPartId[partId]) {
        state.parametersByPartId[partId] = [];
      }
      state.parametersByPartId[partId] = [...state.parametersByPartId[partId], ...parameters];
    },
    updateParameterForPart(state: ParametersState, action: PayloadAction<{ partId: number; parameterName: string; value: any }>) {
      const { partId, parameterName, value } = action.payload;
      const partParams = state.parametersByPartId[partId];
      if (partParams) {
        const paramIndex = partParams.findIndex(p => p.template_detail?.name === parameterName);
        if (paramIndex !== -1) {
          partParams[paramIndex] = { ...partParams[paramIndex], data: value }; 
          logger.log('ParameterSlice', `Updated parameter '${parameterName}' for part ${partId} to value: ${value}`, {level: 'debug'});
        } else {
          logger.warn('ParameterSlice', `Parameter '${parameterName}' not found for part ${partId} during update.`);
        }
      } else {
        logger.warn('ParameterSlice', `Part ${partId} not found in parametersByPartId during update.`);
      }
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ParametersState>) => {
    builder
      .addCase(fetchParametersForPart.pending, (state: ParametersState, action) => {
        const partId = action.meta.arg;
        state.parameterLoadingStatus[partId] = 'loading';
        state.parameterError[partId] = null;
        logger.log('parametersSlice', `Fetching parameters for part ${partId}...`, { level: 'debug' });
      })
      .addCase(fetchParametersForPart.fulfilled, (state: ParametersState, action: PayloadAction<{ partId: number, parameters: ParameterDetail[] }>) => {
        const { partId, parameters } = action.payload;
        
        state.parameterLoadingStatus[partId] = 'succeeded';
        state.parameterError[partId] = null;
        
        if (!state.parameterValues[partId]) {
          state.parameterValues[partId] = {};
        }

        if (parameters.length > 0) {
          parameters.forEach(param => {
            const paramName = param.template_detail?.name;
            if (paramName) {
                state.parameterValues[partId][paramName] = param;
            } else {
                 logger.warn('parametersSlice', `Fetched parameter for part ${partId} is missing template_detail.name`, param);
            }
          });
           logger.log('parametersSlice', `Successfully fetched ${parameters.length} parameters for part ${partId}.`, { level: 'debug' });
        } else {
           logger.log('parametersSlice', `Fetched parameters for part ${partId}, but received an empty array. Marking as succeeded.`, { level: 'debug' });
        }
      })
      .addCase(fetchParametersForPart.rejected, (state: ParametersState, action) => {
        const partId = action.meta.arg;
        state.parameterLoadingStatus[partId] = 'failed';
        state.parameterError[partId] = action.payload as string ?? 'Failed to fetch parameters';
        logger.error('parametersSlice', `Failed to fetch parameters for part ${partId}: ${state.parameterError[partId]}`);
      })
      .addCase(fetchParametersForReferencedParts.pending, (state: ParametersState, action) => {
        logger.log('parametersSlice', 'Handling fetchParametersForReferencedParts.pending', { level: 'debug', subsystem: 'thunkStatus'});
        const partIdsFromThunkArg = action.meta.arg as number[]; // Explicitly type here
        logger.log('parametersSlice', `- Pending for partIds from thunk argument: ${partIdsFromThunkArg.join(', ')}`, { level: 'debug', subsystem: 'thunkStatus', data: partIdsFromThunkArg });
        
        partIdsFromThunkArg.forEach((partId: number) => { 
          // Only set to 'loading' if currently 'idle' or 'failed'
          // This prevents this pending action from immediately blocking its own thunk
          // if the thunk's internal filter also checks for 'loading'.
          const currentStatusInState = state.parameterLoadingStatus[partId] ?? 'idle';
          if (currentStatusInState === 'idle' || currentStatusInState === 'failed') {
            state.parameterLoadingStatus[partId] = 'loading';
            state.parameterError[partId] = null;
            logger.log('parametersSlice', `Set part ${partId} to loading (was ${currentStatusInState})`, {level: 'silly'});
          } else {
            logger.log('parametersSlice', `Part ${partId} already ${currentStatusInState}, not changing to loading in pending reducer.`, {level: 'silly'});
          }
        });
      })
      .addCase(fetchParametersForReferencedParts.fulfilled, (state: ParametersState, action: PayloadAction<Record<number, { data: ParameterDetail[]; error?: string }>>) => {
        const parametersByPartId = action.payload;
        logger.log('parametersSlice', 'Handling fetchParametersForReferencedParts.fulfilled', { level: 'debug', subsystem: 'thunkStatus', data: parametersByPartId });
        
        Object.entries(parametersByPartId).forEach(([partIdStr, result]) => {
          const partId = parseInt(partIdStr, 10);
          if (result.error) {
            state.parameterLoadingStatus[partId] = 'failed';
            state.parameterError[partId] = result.error;
            if (!state.parameterValues[partId]) {
              state.parameterValues[partId] = {}; 
            }
            logger.warn('parametersSlice', `fetchParametersForReferencedParts fulfilled but part ${partId} failed: ${result.error}`);
          } else {
            state.parameterLoadingStatus[partId] = 'succeeded';
            state.parameterError[partId] = null;
            
            if (!state.parameterValues[partId]) {
              state.parameterValues[partId] = {};
            }

            const paramsForPartMap: Record<string, ParameterDetail> = {};
            if (result.data.length > 0) {
              result.data.forEach(param => {
                const paramName = param.template_detail?.name;
                if (paramName) {
                    paramsForPartMap[paramName] = param;
                } else {
                     logger.warn('parametersSlice', `Fetched parameter for part ${partId} is missing template_detail.name`, { paramData: param });
                }
              });
            }
            state.parameterValues[partId] = paramsForPartMap;
            logger.log('parametersSlice', `Updated parameters for part ${partId}. Count: ${result.data.length}.`, { level: 'debug' });
          }
        });
      })
      .addCase(fetchParametersForReferencedParts.rejected, (state: ParametersState, action) => {
        logger.error('parametersSlice', `Handling fetchParametersForReferencedParts.rejected: ${action.payload || action.error.message}`, { subsystem: 'thunkStatus', error: action.payload || action.error });
        const partIdsAttempted = action.meta.arg;
        if (partIdsAttempted && Array.isArray(partIdsAttempted)) {
          partIdsAttempted.forEach(partId => {
            if (state.parameterLoadingStatus[partId] === 'loading') {
              state.parameterLoadingStatus[partId] = 'failed';
              state.parameterError[partId] = action.payload as string || action.error.message || 'Thunk rejected';
            }
          });
        }
      })
      .addCase(updateParameterValue.pending, (state: ParametersState, action) => {
        const { partId, paramName } = action.meta.arg;
         logger.log('parametersSlice', `Updating parameter ${paramName} for part ${partId}...`, { level: 'debug' });
      })
      .addCase(updateParameterValue.fulfilled, (state: ParametersState, action: PayloadAction<{ partId: number; paramName: string; value: string }>) => {
        const { partId, paramName, value } = action.payload;
        const key = `${partId}:${paramName}`;
        
        if (state.parameterValues[partId] && state.parameterValues[partId][paramName]) {
          state.parameterValues[partId][paramName].data = value;
           logger.log('parametersSlice', `Successfully updated parameter ${key} to '${value}' via API.`, { level: 'debug' });
        } else {
           logger.warn('parametersSlice', `Parameter ${key} not found in state during updateParameterValue.fulfilled. Value set by API might not be reflected unless fetched.`);
        }
        
        state.parameterLoadingStatus[partId] = 'succeeded';
        state.parameterError[partId] = null;

        if (!state.recentlyChanged.includes(key)) {
          state.recentlyChanged.push(key);
           if (state.recentlyChanged.length > 100) {
            state.recentlyChanged = state.recentlyChanged.slice(-100);
          }
        }
      })
      .addCase(updateParameterValue.rejected, (state: ParametersState, action) => {
        const { partId, paramName } = action.meta.arg;
        const key = `${partId}:${paramName}`;
        logger.error('parametersSlice', `Failed to update parameter ${key} via API: ${action.payload}`);
      });
  }
});

export const { 
  setConditions, 
  setDefinedConditions,
  setProcessedConditions,
  setConditionalPartEffectsBatch,
  clearConditionalPartEffects,
  setActions, 
  setConfig,
  setStrictWebSocketMode,
  clearConditionCache,
  clearCache,
  checkCondition,
  updateValue,
  webSocketUpdateReceived,
  markChanged,
  addParametersForPart,
  updateParameterForPart
} = parametersSlice.actions;

export const selectConditions = (state: RootState, entityId: string) => state.parameters.conditions[entityId] || [];
export const selectActions = (state: RootState, entityId: string) => state.parameters.actions[entityId] || [];

export const selectParameterLoadingStatus = (state: RootState, partId: number): 'idle' | 'loading' | 'succeeded' | 'failed' => {
  return state.parameters.parameterLoadingStatus[partId] ?? 'idle';
};

export const selectPartParameterError = (state: RootState, partId: number): string | null => {
  return state.parameters.parameterError[partId] ?? null;
};

export const selectParametersLoadingStatus = (state: RootState, partIds: number[]): Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'> => {
  const statuses: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'> = {};
  partIds.forEach(id => {
    statuses[id] = state.parameters.parameterLoadingStatus[id] ?? 'idle';
  });
  return statuses;
};

export const selectStrictWebSocketMode = (state: RootState) => state.parameters.strictWebSocketMode;
export const selectParameterConfig = (state: RootState) => state.parameters.config;
export const selectRecentlyChangedParameters = (state: RootState) => state.parameters.recentlyChanged;
export const selectParametersForPart = (state: RootState, partId: number): ParameterDetail[] | undefined => state.parameters.parametersByPartId[partId];
export const selectParameterValue = (state: RootState, partId: number, paramName: string): string | null => {
    const partParams = state.parameters.parameterValues[partId];
    return partParams?.[paramName]?.data ?? null;
};

export const selectDefinedConditions = (state: RootState): ParameterCondition[] => state.parameters.definedConditions;
export const selectProcessedConditions = (state: RootState): ProcessedCondition[] => state.parameters.processedConditions;
export const selectConditionalPartEffects = (state: RootState): Record<number, ConditionalPartEffect> => state.parameters.conditionalPartEffects;
export const selectConditionalEffectForPart = (state: RootState, partId: number): ConditionalPartEffect | undefined => state.parameters.conditionalPartEffects[partId];

export default parametersSlice.reducer; 