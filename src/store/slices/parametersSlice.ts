import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterCondition } from '../../types';
import { RootState } from '../index';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('parametersSlice');
ConditionalLoggerEngine.getInstance().registerCategory('parametersSlice', { enabled: false, level: 'info' });

export interface ParametersState {
  // DEPRECATED: All parameter data, loading, and error states are now handled by the inventreeApi RTK Query slice.
  // This slice is now only for WebSocket integration and transient state if needed.
  
  config: InventreeCardConfig | null;
  recentlyChanged: string[]; // Tracks which parameters have changed recently, e.g., from websocket
  cache: {
    lastCleared: number;
  };
}

const initialState: ParametersState = {
  config: null,
  recentlyChanged: [],
  cache: {
    lastCleared: Date.now()
  },
};

const parametersSlice = createSlice({
  name: 'parameters',
  initialState,
  reducers: {
    setConfig(state: ParametersState, action: PayloadAction<InventreeCardConfig>) {
      state.config = action.payload;
    },
    clearCache(state: ParametersState) {
      state.cache.lastCleared = Date.now();
      state.recentlyChanged = [];
      logger.info('clearCache', 'Full parameter cache cleared (conditions, recent).');
    },
    // This reducer will be simplified later to integrate with RTK Query cache
    webSocketUpdateReceived(state: ParametersState, action: PayloadAction<{ partId: number; parameterName: string; value: any; source?: string }>) {
      const { partId, parameterName, value, source } = action.payload;
      logger.info('webSocketUpdateReceived', 'Reducer processing update', {
        partId,
        parameterName,
        receivedValue: value,
        source
      });

      const key = `${partId}:${parameterName}`;
      if (!state.recentlyChanged.includes(key)) {
        state.recentlyChanged.push(key);
        if (state.recentlyChanged.length > 100) {
          state.recentlyChanged.shift();
        }
      }
    },
    markChanged(state: ParametersState, action: PayloadAction<{ parameterId: string }>) {
      const { parameterId } = action.payload;
      if (!state.recentlyChanged.includes(parameterId)) {
        state.recentlyChanged.push(parameterId);
        if (state.recentlyChanged.length > 100) {
          state.recentlyChanged.shift();
        }
      }
    },
  },
});

export const { 
  setConfig,
  clearCache,
  webSocketUpdateReceived,
  markChanged,
} = parametersSlice.actions;

// DEPRECATED SELECTORS - These will be removed and replaced with selectors that pull from the RTK Query cache.
export const selectParameterLoadingStatus = (state: RootState, partId: number) => 'idle'; // Dummy value
export const selectPartParameterError = (state: RootState, partId: number) => null; // Dummy value
export const selectParametersLoadingStatus = (state: RootState, partIds: number[]) => ({}); // Dummy value
export const selectParameterValue = (state: RootState, partId: number, paramName: string) => null; // Dummy value

export const selectParameterConfig = (state: RootState) => state.parameters.config;
export const selectRecentlyChangedParameters = (state: RootState) => state.parameters.recentlyChanged;

export default parametersSlice.reducer;

export { parametersSlice }; 