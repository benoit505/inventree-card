import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';
import { ViewType, ParameterCondition, ParameterAction, PerformanceConfig, HierarchicalDebugConfig } from '../../types'; // Assuming these types exist or will be consolidated

const logger = Logger.getInstance();

// Sub-state interfaces based on the roadmap

// 3.1 Data Sources
interface DataSourceApiConfig {
  enabled: boolean;
  url: string | null;
  apiKey: string | null;
  websocketUrl: string | null;
}

interface DataSourceBindingTarget {
  contextName: string;
}

interface DataSourceBinding {
  entityId: string;
  type: 'state' | 'attribute';
  attributeName?: string;
  target: DataSourceBindingTarget;
}

interface DataSourceRefreshConfig {
  pollingInterval: number; // seconds
  websocketEnabled: boolean;
  cacheLifetime: number; // seconds for API-sourced data
}

interface InventreeParameterFetchConfig {
  targetPartIds: number[] | 'all_loaded';
  parameterNames: string[] | '*';
  fetchOnlyIfUsed?: boolean;
}

interface DataSourcesState {
  primary: {
    entityId: string | null;
  };
  additional: {
    entities: string[];
    directPartIds: number[];
    categories: number[];
  };
  inventreeParametersToFetch: InventreeParameterFetchConfig[];
  api: DataSourceApiConfig;
  bindings: Record<string, DataSourceBinding>; // Keyed by a unique binding ID
  refresh: DataSourceRefreshConfig;
}

// 3.2 Object Transformations
interface ObjectFilterRule {
  name: string;
  expressionId: string;
  enabled?: boolean;
}

interface DerivedPropertyRule {
  propertyName: string;
  expressionId: string;
  enabled?: boolean;
}

interface SortingRule {
  propertyName: string;
  direction: 'asc' | 'desc';
  enabled?: boolean;
}

interface GroupingRule {
  groupByProperty: string | null; // Changed to allow null for no grouping
  enabled?: boolean;
  // ... more options for grouping in future
}

interface ObjectTransformationsState {
  filters: ObjectFilterRule[];
  derivedProperties: DerivedPropertyRule[];
  sorting: SortingRule[];
  grouping: GroupingRule;
  resolveVariants?: boolean; // TBD or implicit
}

// 3.3 Expression Engine
interface ExpressionSource {
  type: 'parameter' | 'part_attribute' | 'entity_binding';
  id: string; // Parameter name, attribute name, or binding contextName
  property?: string; // Optional sub-property accessor
}

interface ExpressionDefinition {
  id: string; // The unique expressionId (key of the record)
  name: string; // User-friendly name
  type: 'comparison' | 'logical_and' | 'logical_or' | 'logical_not';
  source?: ExpressionSource; // For comparison type
  operator?: string; // For comparison type (e.g., '==', '>', 'contains')
  value?: any; // For comparison type
  operands?: string[]; // Array of other expressionIds for AND/OR
  operand?: string; // Single expressionId for NOT
}

type ExpressionsState = Record<string, ExpressionDefinition>; // Key is expressionId

// 3.4 Presentation
// Assuming VisualEffect is defined in types.d.ts (as it's used by visualEffectsSlice)
// If not, it would need to be defined here or imported.
// For now, let's assume it's:
interface VisualEffect {
  isVisible?: boolean;
  highlight?: string;
  textColor?: string;
  border?: string;
  opacity?: number;
  icon?: string;
  badge?: string;
  customClasses?: string[];
  // isExpanded?: boolean; // From visualEffectsSlice, might be relevant
}


interface ConditionalRule {
  id: string; // Unique ruleId (key of the record)
  name: string;
  expressionId: string;
  priority?: number;
  effects: Partial<VisualEffect>;
  targetElements?: string[]; // Advanced: for targeting sub-elements
}

interface PresentationState {
  viewType: ViewType | string; // Allow string for custom view types
  layout: Record<string, any>; // ViewType-specific nested settings, e.g., layout.grid: { columns: 3 }
  display: Record<string, boolean>; // e.g., display.showImage: true
  styling: Record<string, string>; // e.g., styling.backgroundColor: "var(--ha-card-background)"
  conditionalRules: Record<string, ConditionalRule>; // Key is ruleId
}

// 3.5 Interactions
interface InteractionButtonVisibilityConditions {
  expressionIds: string[];
  logic: 'AND' | 'OR';
}

interface InteractionButton {
  id: string; // Unique buttonId (key of the record)
  label: string;
  icon?: string;
  actionType: 'call-service'; // Initially just HA service calls
  service?: string; // For 'call-service'
  serviceData?: Record<string, any>; // For 'call-service'
  confirmationRequired?: boolean;
  confirmationText?: string;
  visibilityConditions?: InteractionButtonVisibilityConditions;
}

interface InteractionsState {
  buttons: Record<string, InteractionButton>; // Key is buttonId
  // Future: onClick, onLongPress actions
}

// 3.6 System Settings
interface SystemDebugConfig {
    enabled: boolean;
    verbose: boolean;
    // Assuming HierarchicalDebugConfig is defined in types.d.ts
    // If not, it would look like:
    // hierarchical: Record<string, { enabled?: boolean; subsystems?: Record<string, boolean> }>;
    hierarchical?: HierarchicalDebugConfig;
}

interface SystemState {
  // Assuming PerformanceConfig is defined in types.d.ts
  performance: PerformanceConfig;
  debug: SystemDebugConfig;
  // Operational settings like cache clear, WS reconnect might be handled by UI triggering thunks/actions
  // rather than being stored in configSlice directly, unless there are persistent states for them.
}


// Main ConfigState
export interface ConfigState {
  dataSources: DataSourcesState;
  objectTransformations: ObjectTransformationsState;
  expressions: ExpressionsState;
  presentation: PresentationState;
  interactions: InteractionsState;
  system: SystemState;
  // Meta-data for the config itself
  configVersion?: string;
  lastSaved?: string; // ISO string
}

// Initial State
export const initialDataSourcesState: DataSourcesState = {
  primary: { entityId: null },
  additional: {
    entities: [],
    directPartIds: [],
    categories: [],
  },
  inventreeParametersToFetch: [],
  api: {
    enabled: false,
    url: null,
    apiKey: null,
    websocketUrl: null,
  },
  bindings: {},
  refresh: {
    pollingInterval: 300, // Default 5 minutes
    websocketEnabled: true,
    cacheLifetime: 60,    // Default 1 minute
  },
};

export const initialObjectTransformationsState: ObjectTransformationsState = {
  filters: [],
  derivedProperties: [],
  sorting: [],
  grouping: { groupByProperty: null, enabled: false },
  resolveVariants: false,
};

export const initialExpressionsState: ExpressionsState = {};

export const initialPresentationState: PresentationState = {
  viewType: 'detail', // Default view type
  layout: {}, // e.g. { grid: { columns: 3 } } based on viewType
  display: { // Default visibility for common elements
    showImage: true,
    showName: true,
    showStock: true,
    showDescription: false,
    showCategory: false,
    showIPN: false,
    showLocation: false,
    showButtonsArea: true, // General toggle for buttons region
    showParametersSection: true, // For the collapsible parameters section in detail views
  },
  styling: {
    // Default card-wide styles can go here if needed
    // e.g., backgroundColor: 'var(--ha-card-background)'
  },
  conditionalRules: {},
};

export const initialInteractionsState: InteractionsState = {
  buttons: {},
};

export const initialSystemState: SystemState = {
  performance: { // Default performance settings
    rendering: {
        debounceTime: 50,
        idleRenderInterval: 5000,
        maxRenderFrequency: 10,
    },
    websocket: {
        reconnectInterval: 5000,
        messageDebounce: 50,
    },
    api: {
        throttle: 0.2, // seconds
        cacheLifetime: 60, // seconds
        batchSize: 20,
        failedRequestRetryDelaySeconds: 30,
    },
    parameters: {
        updateFrequency: 1000,
        conditionEvalFrequency: 1000,
    },
  },
  debug: {
    enabled: false,
    verbose: false,
    hierarchical: {},
  },
};

export const initialState: ConfigState = {
  dataSources: initialDataSourcesState,
  objectTransformations: initialObjectTransformationsState,
  expressions: initialExpressionsState,
  presentation: initialPresentationState,
  interactions: initialInteractionsState,
  system: initialSystemState,
  configVersion: '1.0.0', // Initial version
  lastSaved: undefined,
};

// Slice definition
const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    // Action to set the entire configuration, e.g., when loading from HA storage
    setFullConfig(state: ConfigState, action: PayloadAction<ConfigState>) {
      // Deep merge could be considered, but for full overwrite:
      // return action.payload; // This replaces the state.
      // For a safer merge that preserves sections if not in payload:
      Object.assign(state, action.payload);
      state.lastSaved = new Date().toISOString();
      logger.log('configSlice', 'Full configuration set and updated lastSaved.', { newConfig: action.payload });
    },
    // Example of a reducer to update a specific section
    setDataSourcesConfig(state: ConfigState, action: PayloadAction<Partial<DataSourcesState>>) {
      state.dataSources = { ...state.dataSources, ...action.payload };
      state.lastSaved = new Date().toISOString();
      logger.log('configSlice', 'DataSources configuration updated.', { updates: action.payload });
    },
    setObjectTransformationsConfig(state: ConfigState, action: PayloadAction<Partial<ObjectTransformationsState>>) {
      state.objectTransformations = { ...state.objectTransformations, ...action.payload };
      state.lastSaved = new Date().toISOString();
    },
    setExpressionsConfig(state: ConfigState, action: PayloadAction<ExpressionsState>) { // Expressions usually replaced entirely
      state.expressions = action.payload;
      state.lastSaved = new Date().toISOString();
    },
    setPresentationConfig(state: ConfigState, action: PayloadAction<Partial<PresentationState>>) {
      state.presentation = { ...state.presentation, ...action.payload };
      state.lastSaved = new Date().toISOString();
    },
    setInteractionsConfig(state: ConfigState, action: PayloadAction<Partial<InteractionsState>>) {
      state.interactions = { ...state.interactions, ...action.payload };
      state.lastSaved = new Date().toISOString();
    },
    setSystemConfig(state: ConfigState, action: PayloadAction<Partial<SystemState>>) {
      // Deep merge for performance and debug settings might be needed
      if (action.payload.performance) {
        state.system.performance = { ...state.system.performance, ...action.payload.performance };
      }
      if (action.payload.debug) {
        state.system.debug = { ...state.system.debug, ...action.payload.debug };
      }
      state.lastSaved = new Date().toISOString();
    },
    // Reducer to update only the API config part of DataSources
    setApiConfig(state: ConfigState, action: PayloadAction<Partial<DataSourceApiConfig>>) {
        state.dataSources.api = { ...state.dataSources.api, ...action.payload };
        state.lastSaved = new Date().toISOString();
        logger.log('configSlice', 'API configuration within DataSources updated.', { updates: action.payload });
    },
    // Add more specific reducers as needed for fine-grained updates
    // e.g., addBinding, removeBinding, updateExpression, addConditionalRule etc.
  },
});

export const {
  setFullConfig,
  setDataSourcesConfig,
  setObjectTransformationsConfig,
  setExpressionsConfig,
  setPresentationConfig,
  setInteractionsConfig,
  setSystemConfig,
  setApiConfig,
} = configSlice.actions;

// Selectors
export const selectFullConfig = (state: RootState): ConfigState => state.config;
export const selectDataSourcesConfig = (state: RootState): DataSourcesState => state.config.dataSources;
export const selectApiFromDataSources = (state: RootState): DataSourceApiConfig => state.config.dataSources.api;
export const selectObjectTransformationsConfig = (state: RootState): ObjectTransformationsState => state.config.objectTransformations;
export const selectExpressions = (state: RootState): ExpressionsState => state.config.expressions;
export const selectPresentationConfig = (state: RootState): PresentationState => state.config.presentation;
export const selectInteractionsConfig = (state: RootState): InteractionsState => state.config.interactions;
export const selectSystemConfig = (state: RootState): SystemState => state.config.system;
export const selectPerformanceConfig = (state: RootState): PerformanceConfig => state.config.system.performance;
export const selectDebugConfig = (state: RootState): SystemDebugConfig => state.config.system.debug;

export default configSlice.reducer; 