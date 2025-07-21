import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { GlobalLogSettings, LoggerCategorySettings, LogEntry, LogQuery } from '../../types';
import { RootState } from '../index';

// This represents the state for a SINGLE card instance's logging/debugging tools
export interface InstanceLoggingState {
  settings: GlobalLogSettings;
  capturedLogs: LogEntry[];
}

// The global logging state now holds the state for all instances
export interface LoggingState {
  logsByInstance: {
    [cardInstanceId: string]: InstanceLoggingState;
  };
}

const initialInstanceLoggingState: InstanceLoggingState = {
  settings: {},
  capturedLogs: [],
};

const initialState: LoggingState = {
  logsByInstance: {},
};

// Helper to generate a simple unique ID
const generateId = () => `log-query-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Helper to get or create the state for a specific instance
const getOrCreateInstanceState = (state: LoggingState, cardInstanceId: string): InstanceLoggingState => {
  if (!state.logsByInstance[cardInstanceId]) {
    // Use a deep copy to avoid sharing state between instances
    state.logsByInstance[cardInstanceId] = JSON.parse(JSON.stringify(initialInstanceLoggingState));
  }
  return state.logsByInstance[cardInstanceId];
};

const loggingSlice = createSlice({
  name: 'logging',
  initialState,
  reducers: {
    logFired: (state, action: PayloadAction<Omit<LogEntry, 'id' | 'timestamp'> & { cardInstanceId?: string }>) => {
      // This action is intentionally left empty. 
      // It serves as a hook for the loggingMiddleware to intercept log events.
      // The middleware will then decide whether to capture the log based on queries.
    },
    initializeEditorLogger: (state, action: PayloadAction<{ cardInstanceId: string }>) => {
      getOrCreateInstanceState(state, action.payload.cardInstanceId);
    },
    registerLogCategoriesBatchForInstance: (state, action: PayloadAction<{ cardInstanceId: string, categories: Record<string, LoggerCategorySettings> }>) => {
      const { cardInstanceId, categories } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      const newSettings = { ...instanceState.settings };
      let hasChanges = false;
      for (const category in categories) {
        if (!newSettings[category]) {
          newSettings[category] = categories[category];
          hasChanges = true;
        }
      }
      if (hasChanges) {
        instanceState.settings = newSettings;
      }
    },
    updateLogSetting: (state, action: PayloadAction<{ cardInstanceId: string, category: string, settings: Partial<LoggerCategorySettings> }>) => {
      const { cardInstanceId, category, settings } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      if (instanceState.settings[category]) {
        instanceState.settings[category] = {
          ...instanceState.settings[category],
          ...settings,
        };
      }
    },
    setAllLogSettings: (state, action: PayloadAction<{ cardInstanceId: string, settings: GlobalLogSettings }>) => {
      const { cardInstanceId, settings } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      instanceState.settings = settings;
    },
    captureLog: (state, action: PayloadAction<{ cardInstanceId: string, log: LogEntry }>) => {
      console.log('%c[loggingSlice] captureLog', 'color: #9B59B6; font-weight: bold;', action.payload.log.message);
      const { cardInstanceId, log } = action.payload;
      const instanceState = getOrCreateInstanceState(state, cardInstanceId);
      instanceState.capturedLogs.push(log);
      // Optional: Limit the number of captured logs to prevent memory issues
      if (instanceState.capturedLogs.length > 200) {
        instanceState.capturedLogs.shift();
      }
      console.log('[loggingSlice] State after captureLog:', JSON.parse(JSON.stringify(instanceState)));
    },
    clearCapturedLogs: (state, action: PayloadAction<{ cardInstanceId: string }>) => {
      const instanceState = getOrCreateInstanceState(state, action.payload.cardInstanceId);
      instanceState.capturedLogs = [];
    },
    clearCapturedLogsForIds: (state, action: PayloadAction<{ cardInstanceIds: string[] }>) => {
      action.payload.cardInstanceIds.forEach(id => {
        if (state.logsByInstance[id]) {
          state.logsByInstance[id].capturedLogs = [];
        }
      });
    },
    removeInstance: (state, action: PayloadAction<{ cardInstanceId: string }>) => {
      delete state.logsByInstance[action.payload.cardInstanceId];
    },
  },
});

export const { 
  logFired,
  initializeEditorLogger,
  registerLogCategoriesBatchForInstance,
  updateLogSetting, 
  setAllLogSettings,
  captureLog,
  clearCapturedLogs,
  clearCapturedLogsForIds,
  removeInstance,
} = loggingSlice.actions;

// --- SELECTORS ---

const selectLogsByInstance = (state: RootState) => state.logging.logsByInstance;

const selectInstanceLoggingState = createSelector(
  [selectLogsByInstance, (_state: RootState, cardInstanceId: string) => cardInstanceId],
  (logsByInstance, cardInstanceId) => logsByInstance[cardInstanceId] ?? initialInstanceLoggingState
);

export const selectLogSettingsForInstance = createSelector(
  [selectInstanceLoggingState],
  (instanceState) => instanceState.settings
);

export const selectCapturedLogsForInstance = createSelector(
  [selectInstanceLoggingState],
  (instanceState) => instanceState.capturedLogs
);

export default loggingSlice.reducer; 