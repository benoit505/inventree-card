import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
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

interface ConfigState extends InventreeCardConfig {
  _configLastUpdated?: number;
}

// Initial state for the slice, now directly using DEFAULT_CONFIG
const initialState: ConfigState = {
  ...(DEFAULT_CONFIG as InventreeCardConfig), // Ensure DEFAULT_CONFIG is fully cast to InventreeCardConfig
  // Explicitly ensure all InventreeCardConfig properties are present even if DEFAULT_CONFIG is Partial
  type: DEFAULT_CONFIG.type || 'custom:inventree-card', // Assuming a default type
  name: DEFAULT_CONFIG.name || 'InvenTree Card',
  view_type: DEFAULT_CONFIG.view_type || 'detail',
  data_sources: DEFAULT_CONFIG.data_sources || { inventree_hass_sensors: [], ha_entities: [], inventree_pks: [], inventree_parameters: [], inventreeParametersToFetch: [] },
  layout_options: DEFAULT_CONFIG.layout_options || { columns: 3, grid_spacing: 8, item_height: 170 },
  display: DEFAULT_CONFIG.display || { show_header: true, show_image: true, show_name: true, show_stock: true, show_buttons: true, show_parameters: true },
  direct_api: DEFAULT_CONFIG.direct_api || { enabled: false, url: '', api_key: '' },
  parameters: DEFAULT_CONFIG.parameters || { enabled: true, show_section: true },
  conditional_logic: DEFAULT_CONFIG.conditional_logic || { definedLogics: [] },
  style: DEFAULT_CONFIG.style || { background: 'var(--ha-card-background, var(--card-background-color, white))' },
  interactions: DEFAULT_CONFIG.interactions || { buttons: [] },
  performance: DEFAULT_CONFIG.performance || { rendering: {}, api: {}, websocket: {}, parameters: {} },
  debug: DEFAULT_CONFIG.debug || false,
  debug_verbose: DEFAULT_CONFIG.debug_verbose || false,
  show_debug: DEFAULT_CONFIG.show_debug || false,
  // Initialize other InventreeCardConfig fields if they have defaults or are mandatory
  _configLastUpdated: undefined,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfigAction(state: ConfigState, action: PayloadAction<InventreeCardConfig>) {
      const newConfigPayload = action.payload;
      const mergedConfig = mergeDeep(current(state), newConfigPayload);
      Object.assign(state, mergedConfig);
      state._configLastUpdated = Date.now();
    },
  },
});

export const { setConfigAction } = configSlice.actions;

export const selectFullConfig = (state: RootState): ConfigState => state.config;

export const selectPresentationConfig = (state: RootState): InventreeCardConfig['presentation'] => {
  return state.config.presentation || { viewType: 'detail', display: {}, layout: {}, styling: {}, conditionalRules: {} };
};

export const selectApiConfigFromCardConfig = (state: RootState): DirectApiConfig | undefined => {
  return state.config.direct_api;
};

export const selectInteractionsConfig = (state: RootState): InventreeCardConfig['interactions'] => {
  const interactions = state.config.interactions;
  if (interactions && Array.isArray(interactions.buttons)) {
    return interactions;
  }
  return { buttons: [] }; 
};

export const selectConditionalLogicRules = (state: RootState): ConditionRuleDefinition[] => {
  // ADD TEMP LOG
  console.log('[TEMP LOG - configSlice.ts:115]', 'selectConditionalLogicRules called. Accessing state.config.conditional_logic.rules. Current value:', JSON.parse(JSON.stringify(state.config.conditional_logic?.rules || [])));
  return state.config.conditional_logic?.rules || [];
};

export const selectConditionalDefinedLogics = (state: RootState): ConditionalLogicItem[] => {
    return state.config.conditional_logic?.definedLogics || [];
};

export const selectInventreeParametersToFetch = (state: RootState): InventreeParameterFetchConfig[] => {
    // console.log('[TEMP LOG - configSlice.ts:109] selectInventreeParametersToFetch called. Accessing state.config.data_sources.inventreeParametersToFetch. Current value:', JSON.parse(JSON.stringify(state.config.data_sources?.inventreeParametersToFetch || [])));
    return state.config.data_sources?.inventreeParametersToFetch || [];
};

export const selectDisplaySetting = <K extends keyof DisplayConfig>(
  state: RootState,
  key: K
): DisplayConfig[K] | undefined => {
  return state.config.presentation?.display?.[key];
};

export const selectLayoutOptions = (state: RootState) => {
    return state.config.presentation?.layout || {};
};

export const selectCardStyling = (state: RootState) => {
    return state.config.presentation?.styling || {};
};

export const selectPerformanceSettings = (state: RootState): PerformanceConfig | undefined => {
  return state.config.system?.performance;
};

export const selectDebugSettings = (state: RootState): InventreeCardConfig['system']['debug'] => {
  return state.config.system?.debug || { enabled: false, verbose: false, hierarchical: {} };
};

export const selectAllDataSources = (state: RootState): DataSourceConfig | undefined => {
    return state.config.data_sources;
};

export const selectPrimaryEntityId = (state: RootState): string | undefined | null => {
    return state.config.entity;
};

export const selectDirectApiEnabled = (state: RootState): boolean => {
    return state.config.direct_api?.enabled || false;
};

export const selectConfig = (state: RootState): InventreeCardConfig => {
    // console.log('[TEMP LOG - configSlice.ts:102] selectConfig selector. Full config state:', JSON.parse(JSON.stringify(state.config || {})));
    return state.config as InventreeCardConfig; // Cast because initialState is Partial but runtime state is full
};

export default configSlice.reducer; 