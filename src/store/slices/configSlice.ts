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
    ActionDefinition,
    LayoutConfig
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
  globalConfig?: { // Make globalConfig optional
    direct_api?: DirectApiConfig;
  };
}

const initialState: ConfigState = {
  configsByInstance: {},
  globalConfig: {}, // Initialize globalConfig
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

      // Also update the global config with the direct_api settings from this instance.
      // This assumes that all cards on a dashboard will share the same API endpoint.
      if (config.direct_api) {
        state.globalConfig = {
          ...state.globalConfig,
          direct_api: config.direct_api,
        };
        console.log('%c[setConfigAction] Updated globalConfig with API settings', 'color: #3498DB; font-weight: bold;', {
          cardInstanceId,
          apiUrl: config.direct_api.url,
          hasApiKey: !!config.direct_api.api_key,
          apiKeyPrefix: config.direct_api.api_key?.substring(0, 20) + '...',
          globalConfig: state.globalConfig
        });
      }
      logger.debug('setConfigAction', `Configuration set for instance ${cardInstanceId}`, { newConfig: config });
    },
    removeConfigAction: (state, action: PayloadAction<{ cardInstanceId: string }>) => {
      const { cardInstanceId } = action.payload;
      delete state.configsByInstance[cardInstanceId];
      logger.debug('removeConfigAction', `Configuration removed for instance ${cardInstanceId}`);
    },
    updateLayout(state, action: PayloadAction<{ cardInstanceId: string, layout: Partial<LayoutConfig> }>) {
      const { cardInstanceId, layout } = action.payload;
      const instance = state.configsByInstance[cardInstanceId];
      if (instance?.config?.layout) {
        instance.config.layout = { ...instance.config.layout, ...layout };
      }
    },
  },
});

export const { setConfigAction, removeConfigAction, updateLayout } = configSlice.actions;

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