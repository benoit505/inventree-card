import { createSlice } from '@reduxjs/toolkit';
import { fetchParametersForPart, updateParameterValue, fetchParametersForReferencedParts } from '../thunks/parameterThunks';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const initialState = {
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
        setConditions(state, action) {
            const { entityId, conditions } = action.payload;
            state.conditions[entityId] = conditions;
        },
        setDefinedConditions(state, action) {
            state.definedConditions = action.payload;
            logger.log('parametersSlice', 'Defined conditions have been set.', { count: action.payload.length, level: 'debug' });
        },
        setProcessedConditions(state, action) {
            state.processedConditions = action.payload;
            logger.log('parametersSlice', 'Processed conditions have been set.', { count: action.payload.length, level: 'debug' });
        },
        setConditionalPartEffectsBatch(state, action) {
            // Replace the entire effects object. The thunk will calculate the complete new state.
            state.conditionalPartEffects = action.payload;
            logger.log('parametersSlice', 'Conditional part effects batch updated.', { count: Object.keys(action.payload).length, level: 'debug' });
        },
        clearConditionalPartEffects(state) {
            state.conditionalPartEffects = {};
            logger.log('parametersSlice', 'Conditional part effects cleared.', { level: 'debug' });
        },
        setActions(state, action) {
            const { entityId, actions } = action.payload;
            state.actions[entityId] = actions;
        },
        setConfig(state, action) {
            state.config = action.payload;
        },
        setStrictWebSocketMode(state, action) {
            state.strictWebSocketMode = action.payload;
        },
        clearConditionCache(state) {
            state.cache.conditionResults = {};
            state.cache.lastCleared = Date.now();
            logger.log('parametersSlice', 'Condition cache cleared.', { level: 'debug' });
        },
        clearCache(state) {
            state.cache.conditionResults = {};
            state.cache.lastCleared = Date.now();
            state.parameterValues = {};
            state.parameterLoadingStatus = {};
            state.parameterError = {};
            state.recentlyChanged = [];
            logger.info('parametersSlice', 'Full parameter cache cleared (values, status, errors, conditions, recent).');
        },
        checkCondition(state, action) {
            // This action doesn't actually modify state, it's used for tracking only
        },
        updateValue(state, action) {
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
            }
            else {
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
        webSocketUpdateReceived(state, action) {
            var _a, _b, _c, _d;
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
            const beforeValue = (_b = (_a = state.parameterValues[partId]) === null || _a === void 0 ? void 0 : _a[parameterName]) === null || _b === void 0 ? void 0 : _b.data;
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
            }
            else {
                state.parameterValues[partId][parameterName].data = String(value);
                logger.log('parametersSlice', `Updated existing parameter ${parameterName} for part ${partId} via WebSocket. New data: ${String(value)}`, { level: 'debug' });
            }
            const afterValue = (_d = (_c = state.parameterValues[partId]) === null || _c === void 0 ? void 0 : _c[parameterName]) === null || _d === void 0 ? void 0 : _d.data;
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
        markChanged(state, action) {
            const { parameterId } = action.payload;
            if (!state.recentlyChanged.includes(parameterId)) {
                state.recentlyChanged.push(parameterId);
                if (state.recentlyChanged.length > 100) {
                    state.recentlyChanged = state.recentlyChanged.slice(-100);
                }
            }
        },
        addParametersForPart(state, action) {
            const { partId, parameters } = action.payload;
            if (!state.parametersByPartId[partId]) {
                state.parametersByPartId[partId] = [];
            }
            state.parametersByPartId[partId] = [...state.parametersByPartId[partId], ...parameters];
        },
        updateParameterForPart(state, action) {
            const { partId, parameterName, value } = action.payload;
            const partParams = state.parametersByPartId[partId];
            if (partParams) {
                const paramIndex = partParams.findIndex(p => { var _a; return ((_a = p.template_detail) === null || _a === void 0 ? void 0 : _a.name) === parameterName; });
                if (paramIndex !== -1) {
                    partParams[paramIndex] = Object.assign(Object.assign({}, partParams[paramIndex]), { data: value });
                    logger.log('ParameterSlice', `Updated parameter '${parameterName}' for part ${partId} to value: ${value}`, { level: 'debug' });
                }
                else {
                    logger.warn('ParameterSlice', `Parameter '${parameterName}' not found for part ${partId} during update.`);
                }
            }
            else {
                logger.warn('ParameterSlice', `Part ${partId} not found in parametersByPartId during update.`);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchParametersForPart.pending, (state, action) => {
            const partId = action.meta.arg;
            state.parameterLoadingStatus[partId] = 'loading';
            state.parameterError[partId] = null;
            logger.log('parametersSlice', `Fetching parameters for part ${partId}...`, { level: 'debug' });
        })
            .addCase(fetchParametersForPart.fulfilled, (state, action) => {
            const { partId, parameters } = action.payload;
            state.parameterLoadingStatus[partId] = 'succeeded';
            state.parameterError[partId] = null;
            if (!state.parameterValues[partId]) {
                state.parameterValues[partId] = {};
            }
            if (parameters.length > 0) {
                parameters.forEach(param => {
                    var _a;
                    const paramName = (_a = param.template_detail) === null || _a === void 0 ? void 0 : _a.name;
                    if (paramName) {
                        state.parameterValues[partId][paramName] = param;
                    }
                    else {
                        logger.warn('parametersSlice', `Fetched parameter for part ${partId} is missing template_detail.name`, param);
                    }
                });
                logger.log('parametersSlice', `Successfully fetched ${parameters.length} parameters for part ${partId}.`, { level: 'debug' });
            }
            else {
                logger.log('parametersSlice', `Fetched parameters for part ${partId}, but received an empty array. Marking as succeeded.`, { level: 'debug' });
            }
        })
            .addCase(fetchParametersForPart.rejected, (state, action) => {
            var _a;
            const partId = action.meta.arg;
            state.parameterLoadingStatus[partId] = 'failed';
            state.parameterError[partId] = (_a = action.payload) !== null && _a !== void 0 ? _a : 'Failed to fetch parameters';
            logger.error('parametersSlice', `Failed to fetch parameters for part ${partId}: ${state.parameterError[partId]}`);
        })
            .addCase(fetchParametersForReferencedParts.pending, (state, action) => {
            logger.log('parametersSlice', 'Handling fetchParametersForReferencedParts.pending', { level: 'debug', subsystem: 'thunkStatus' });
            const partIdsFromThunkArg = action.meta.arg; // Explicitly type here
            logger.log('parametersSlice', `- Pending for partIds from thunk argument: ${partIdsFromThunkArg.join(', ')}`, { level: 'debug', subsystem: 'thunkStatus', data: partIdsFromThunkArg });
            partIdsFromThunkArg.forEach((partId) => {
                var _a;
                // Only set to 'loading' if currently 'idle' or 'failed'
                // This prevents this pending action from immediately blocking its own thunk
                // if the thunk's internal filter also checks for 'loading'.
                const currentStatusInState = (_a = state.parameterLoadingStatus[partId]) !== null && _a !== void 0 ? _a : 'idle';
                if (currentStatusInState === 'idle' || currentStatusInState === 'failed') {
                    state.parameterLoadingStatus[partId] = 'loading';
                    state.parameterError[partId] = null;
                    logger.log('parametersSlice', `Set part ${partId} to loading (was ${currentStatusInState})`, { level: 'silly' });
                }
                else {
                    logger.log('parametersSlice', `Part ${partId} already ${currentStatusInState}, not changing to loading in pending reducer.`, { level: 'silly' });
                }
            });
        })
            .addCase(fetchParametersForReferencedParts.fulfilled, (state, action) => {
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
                }
                else {
                    state.parameterLoadingStatus[partId] = 'succeeded';
                    state.parameterError[partId] = null;
                    if (!state.parameterValues[partId]) {
                        state.parameterValues[partId] = {};
                    }
                    const paramsForPartMap = {};
                    if (result.data.length > 0) {
                        result.data.forEach(param => {
                            var _a;
                            const paramName = (_a = param.template_detail) === null || _a === void 0 ? void 0 : _a.name;
                            if (paramName) {
                                paramsForPartMap[paramName] = param;
                            }
                            else {
                                logger.warn('parametersSlice', `Fetched parameter for part ${partId} is missing template_detail.name`, { paramData: param });
                            }
                        });
                    }
                    state.parameterValues[partId] = paramsForPartMap;
                    logger.log('parametersSlice', `Updated parameters for part ${partId}. Count: ${result.data.length}.`, { level: 'debug' });
                }
            });
        })
            .addCase(fetchParametersForReferencedParts.rejected, (state, action) => {
            logger.error('parametersSlice', `Handling fetchParametersForReferencedParts.rejected: ${action.payload || action.error.message}`, { subsystem: 'thunkStatus', error: action.payload || action.error });
            const partIdsAttempted = action.meta.arg;
            if (partIdsAttempted && Array.isArray(partIdsAttempted)) {
                partIdsAttempted.forEach(partId => {
                    if (state.parameterLoadingStatus[partId] === 'loading') {
                        state.parameterLoadingStatus[partId] = 'failed';
                        state.parameterError[partId] = action.payload || action.error.message || 'Thunk rejected';
                    }
                });
            }
        })
            .addCase(updateParameterValue.pending, (state, action) => {
            const { partId, paramName } = action.meta.arg;
            logger.log('parametersSlice', `Updating parameter ${paramName} for part ${partId}...`, { level: 'debug' });
        })
            .addCase(updateParameterValue.fulfilled, (state, action) => {
            const { partId, paramName, value } = action.payload;
            const key = `${partId}:${paramName}`;
            if (state.parameterValues[partId] && state.parameterValues[partId][paramName]) {
                state.parameterValues[partId][paramName].data = value;
                logger.log('parametersSlice', `Successfully updated parameter ${key} to '${value}' via API.`, { level: 'debug' });
            }
            else {
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
            .addCase(updateParameterValue.rejected, (state, action) => {
            const { partId, paramName } = action.meta.arg;
            const key = `${partId}:${paramName}`;
            logger.error('parametersSlice', `Failed to update parameter ${key} via API: ${action.payload}`);
        });
    }
});
export const { setConditions, setDefinedConditions, setProcessedConditions, setConditionalPartEffectsBatch, clearConditionalPartEffects, setActions, setConfig, setStrictWebSocketMode, clearConditionCache, clearCache, checkCondition, updateValue, webSocketUpdateReceived, markChanged, addParametersForPart, updateParameterForPart } = parametersSlice.actions;
export const selectConditions = (state, entityId) => state.parameters.conditions[entityId] || [];
export const selectActions = (state, entityId) => state.parameters.actions[entityId] || [];
export const selectParameterLoadingStatus = (state, partId) => {
    var _a;
    return (_a = state.parameters.parameterLoadingStatus[partId]) !== null && _a !== void 0 ? _a : 'idle';
};
export const selectPartParameterError = (state, partId) => {
    var _a;
    return (_a = state.parameters.parameterError[partId]) !== null && _a !== void 0 ? _a : null;
};
export const selectParametersLoadingStatus = (state, partIds) => {
    const statuses = {};
    partIds.forEach(id => {
        var _a;
        statuses[id] = (_a = state.parameters.parameterLoadingStatus[id]) !== null && _a !== void 0 ? _a : 'idle';
    });
    return statuses;
};
export const selectStrictWebSocketMode = (state) => state.parameters.strictWebSocketMode;
export const selectParameterConfig = (state) => state.parameters.config;
export const selectRecentlyChangedParameters = (state) => state.parameters.recentlyChanged;
export const selectParametersForPart = (state, partId) => state.parameters.parametersByPartId[partId];
export const selectParameterValue = (state, partId, paramName) => {
    var _a, _b;
    const partParams = state.parameters.parameterValues[partId];
    return (_b = (_a = partParams === null || partParams === void 0 ? void 0 : partParams[paramName]) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : null;
};
export const selectDefinedConditions = (state) => state.parameters.definedConditions;
export const selectProcessedConditions = (state) => state.parameters.processedConditions;
export const selectConditionalPartEffects = (state) => state.parameters.conditionalPartEffects;
export const selectConditionalEffectForPart = (state, partId) => state.parameters.conditionalPartEffects[partId];
export default parametersSlice.reducer;
//# sourceMappingURL=parametersSlice.js.map