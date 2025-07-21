import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { 
    InventreeCardConfig, 
    PerformanceConfig, 
    DirectApiConfig, 
    DataSourceConfig, 
    DisplayConfig,
    InventreeParameterFetchConfig, 
    ViewType,
    ConditionRuleDefinition,
    CustomAction,
    ConditionalLogicItem,
    HierarchicalDebugConfig, 
    SubsystemDebugConfig,
    ActionDefinition
} from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { createSelector } from 'reselect';

const logger = ConditionalLoggerEngine.getInstance().getLogger('configSlice');
ConditionalLoggerEngine.getInstance().registerCategory('configSlice', { enabled: false, level: 'info' });

export interface InstanceConfigState {
  config: InventreeCardConfig;
  cardInstanceId: string;
  configInitialized: boolean;
  _configLastUpdated: number;
}

export interface ConfigState {
  configsByInstance: Record<string, {
    config: InventreeCardConfig;
    configInitialized: boolean;
  }>;
}

const initialState: ConfigState = {
  configsByInstance: {},
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfigAction: (state, action: PayloadAction<{ cardInstanceId: string, config: InventreeCardConfig }>) => {
      const { cardInstanceId, config } = action.payload;
      
      // Replace the configuration entirely. The incoming config is the source of truth.
      // A merge operation can cause old, removed-from-yaml keys to persist.
      state.configsByInstance[cardInstanceId] = {
        config: config,
        configInitialized: true,
      };
      logger.debug('setConfigAction', `Configuration set for instance ${cardInstanceId}`, { newConfig: config });
    },
    removeConfigAction: (state, action: PayloadAction<{ cardInstanceId: string }>) => {
      const { cardInstanceId } = action.payload;
      delete state.configsByInstance[cardInstanceId];
      logger.debug('removeConfigAction', `Configuration removed for instance ${cardInstanceId}`);
    },
  },
});

export const { setConfigAction, removeConfigAction } = configSlice.actions;

// Selectors
const selectConfigsByInstance = (state: { config: ConfigState }) => state.config.configsByInstance;

export const selectConfigByInstanceId = createSelector(
  [selectConfigsByInstance, (state, cardInstanceId: string) => cardInstanceId],
  (configs, cardInstanceId) => configs[cardInstanceId]?.config
);

export const selectActions = createSelector(
  [selectConfigByInstanceId],
  (config) => config?.actions || []
);

export const selectConditionalLogic = createSelector(
  [selectConfigByInstanceId],
  (config) => config?.conditional_logic?.definedLogics || []
);

export const selectDisplayConfig = createSelector(
  [selectConfigByInstanceId],
  (config) => config?.display || {}
);

export const selectDirectApiEnabled = createSelector(
  [selectConfigByInstanceId],
  (config) => config?.direct_api?.enabled ?? false
);

export const selectLayoutOptions = createSelector(
  [selectConfigByInstanceId],
  (config) => config?.layout
);

export default configSlice.reducer; 