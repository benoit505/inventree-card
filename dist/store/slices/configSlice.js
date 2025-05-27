import { createSlice } from '@reduxjs/toolkit';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
// Initial State
export const initialDataSourcesState = {
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
        cacheLifetime: 60, // Default 1 minute
    },
};
export const initialObjectTransformationsState = {
    filters: [],
    derivedProperties: [],
    sorting: [],
    grouping: { groupByProperty: null, enabled: false },
    resolveVariants: false,
};
export const initialExpressionsState = {};
export const initialPresentationState = {
    viewType: 'detail', // Default view type
    layout: {}, // e.g. { grid: { columns: 3 } } based on viewType
    display: {
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
export const initialInteractionsState = {
    buttons: {},
};
export const initialSystemState = {
    performance: {
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
export const initialState = {
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
        setFullConfig(state, action) {
            // Deep merge could be considered, but for full overwrite:
            // return action.payload; // This replaces the state.
            // For a safer merge that preserves sections if not in payload:
            Object.assign(state, action.payload);
            state.lastSaved = new Date().toISOString();
            logger.log('configSlice', 'Full configuration set and updated lastSaved.', { newConfig: action.payload });
        },
        // Example of a reducer to update a specific section
        setDataSourcesConfig(state, action) {
            state.dataSources = Object.assign(Object.assign({}, state.dataSources), action.payload);
            state.lastSaved = new Date().toISOString();
            logger.log('configSlice', 'DataSources configuration updated.', { updates: action.payload });
        },
        setObjectTransformationsConfig(state, action) {
            state.objectTransformations = Object.assign(Object.assign({}, state.objectTransformations), action.payload);
            state.lastSaved = new Date().toISOString();
        },
        setExpressionsConfig(state, action) {
            state.expressions = action.payload;
            state.lastSaved = new Date().toISOString();
        },
        setPresentationConfig(state, action) {
            state.presentation = Object.assign(Object.assign({}, state.presentation), action.payload);
            state.lastSaved = new Date().toISOString();
        },
        setInteractionsConfig(state, action) {
            state.interactions = Object.assign(Object.assign({}, state.interactions), action.payload);
            state.lastSaved = new Date().toISOString();
        },
        setSystemConfig(state, action) {
            // Deep merge for performance and debug settings might be needed
            if (action.payload.performance) {
                state.system.performance = Object.assign(Object.assign({}, state.system.performance), action.payload.performance);
            }
            if (action.payload.debug) {
                state.system.debug = Object.assign(Object.assign({}, state.system.debug), action.payload.debug);
            }
            state.lastSaved = new Date().toISOString();
        },
        // Reducer to update only the API config part of DataSources
        setApiConfig(state, action) {
            state.dataSources.api = Object.assign(Object.assign({}, state.dataSources.api), action.payload);
            state.lastSaved = new Date().toISOString();
            logger.log('configSlice', 'API configuration within DataSources updated.', { updates: action.payload });
        },
        // Add more specific reducers as needed for fine-grained updates
        // e.g., addBinding, removeBinding, updateExpression, addConditionalRule etc.
    },
});
export const { setFullConfig, setDataSourcesConfig, setObjectTransformationsConfig, setExpressionsConfig, setPresentationConfig, setInteractionsConfig, setSystemConfig, setApiConfig, } = configSlice.actions;
// Selectors
export const selectFullConfig = (state) => state.config;
export const selectDataSourcesConfig = (state) => state.config.dataSources;
export const selectApiFromDataSources = (state) => state.config.dataSources.api;
export const selectObjectTransformationsConfig = (state) => state.config.objectTransformations;
export const selectExpressions = (state) => state.config.expressions;
export const selectPresentationConfig = (state) => state.config.presentation;
export const selectInteractionsConfig = (state) => state.config.interactions;
export const selectSystemConfig = (state) => state.config.system;
export const selectPerformanceConfig = (state) => state.config.system.performance;
export const selectDebugConfig = (state) => state.config.system.debug;
export default configSlice.reducer;
//# sourceMappingURL=configSlice.js.map