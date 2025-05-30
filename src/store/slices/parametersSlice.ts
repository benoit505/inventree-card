import { createSlice, PayloadAction, ActionReducerMapBuilder, current } from '@reduxjs/toolkit';
import { ParameterAction, InventreeCardConfig, InventreeItem, ParameterDetail, ParameterConfig, ParameterOperator, ParameterActionType, ParameterCondition } from '../../types';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface ParametersState {
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
});

export const { 
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

export default parametersSlice.reducer; 