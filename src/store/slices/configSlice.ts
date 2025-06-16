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
    VisualModifiers, 
    SubsystemDebugConfig
} from '../../types';
import { DEFAULT_CONFIG } from '../../core/settings';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

// Helper function to deeply merge objects (simple version)
// NOTE: This is a simple deep merge. For more complex scenarios, a library like lodash.merge might be better.
// It handles basic cases but might not cover all edge cases (e.g., arrays, specific object instances).
const mergeDeep = (target: any, source: any): any => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

const isObject = (item: any): boolean => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

export interface InstanceConfigState {
  config: InventreeCardConfig;
  cardInstanceId: string;
  configInitialized: boolean;
  _configLastUpdated: number;
}

export interface ConfigState {
  configsByInstance: Record<string, InstanceConfigState>;
}

const initialState: ConfigState = {
  configsByInstance: {},
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfigAction(state: ConfigState, action: PayloadAction<{ cardInstanceId: string; config: InventreeCardConfig }>) {
      const { cardInstanceId, config } = action.payload;
      const currentConfig = state.configsByInstance[cardInstanceId]?.config || DEFAULT_CONFIG;
      const mergedConfig = mergeDeep(currentConfig, config);
      
      state.configsByInstance[cardInstanceId] = {
          config: mergedConfig,
          cardInstanceId: cardInstanceId,
          configInitialized: true,
          _configLastUpdated: Date.now(),
      };

      logger.log('configSlice', `Set config for instance ${cardInstanceId}`, { instanceId: cardInstanceId });
    },
    removeConfigAction(state: ConfigState, action: PayloadAction<{ cardInstanceId: string }>) {
        delete state.configsByInstance[action.payload.cardInstanceId];
        logger.log('configSlice', `Removed config for instance ${action.payload.cardInstanceId}`);
    }
  },
});

export const { setConfigAction, removeConfigAction } = configSlice.actions;

// --- Instance-Aware Selectors ---

export const selectConfigForInstance = (state: RootState, cardInstanceId: string): InventreeCardConfig | undefined => {
  return state.config.configsByInstance[cardInstanceId]?.config;
};

export const selectApiConfigFromCardConfig = (state: RootState, cardInstanceId: string): DirectApiConfig | undefined => {
  return selectConfigForInstance(state, cardInstanceId)?.direct_api;
};

export const selectInteractionsConfig = (state: RootState, cardInstanceId: string): InventreeCardConfig['interactions'] => {
  const interactions = selectConfigForInstance(state, cardInstanceId)?.interactions;
  return interactions || { buttons: [] }; 
};

export const selectConditionalLogicRules = (state: RootState, cardInstanceId: string): ConditionRuleDefinition[] => {
  return selectConfigForInstance(state, cardInstanceId)?.conditional_logic?.rules || [];
};

export const selectConditionalDefinedLogics = (state: RootState, cardInstanceId: string): ConditionalLogicItem[] => {
    return selectConfigForInstance(state, cardInstanceId)?.conditional_logic?.definedLogics || [];
};

export const selectInventreeParametersToFetch = (state: RootState, cardInstanceId: string): InventreeParameterFetchConfig[] => {
    return selectConfigForInstance(state, cardInstanceId)?.data_sources?.inventreeParametersToFetch || [];
};

export const selectDisplaySetting = <K extends keyof DisplayConfig>(
  state: RootState,
  cardInstanceId: string,
  key: K
): DisplayConfig[K] | undefined => {
  return selectConfigForInstance(state, cardInstanceId)?.display?.[key];
};

export const selectLayoutOptions = (state: RootState, cardInstanceId: string) => {
    return selectConfigForInstance(state, cardInstanceId)?.layout_options || {};
};

export const selectCardStyling = (state: RootState, cardInstanceId: string) => {
    return selectConfigForInstance(state, cardInstanceId)?.style || {};
};

export const selectPerformanceSettings = (state: RootState, cardInstanceId: string): PerformanceConfig | undefined => {
  return selectConfigForInstance(state, cardInstanceId)?.performance;
};

export const selectDebugSettings = (state: RootState, cardInstanceId: string): InventreeCardConfig['debug'] => {
  return selectConfigForInstance(state, cardInstanceId)?.debug || false;
};

export const selectAllDataSources = (state: RootState, cardInstanceId: string): DataSourceConfig | undefined => {
    return selectConfigForInstance(state, cardInstanceId)?.data_sources;
};

export const selectPrimaryEntityId = (state: RootState, cardInstanceId: string): string | undefined | null => {
    return selectConfigForInstance(state, cardInstanceId)?.entity;
};

export const selectDirectApiEnabled = (state: RootState, cardInstanceId: string): boolean => {
    return selectConfigForInstance(state, cardInstanceId)?.direct_api?.enabled || false;
};

export default configSlice.reducer; 