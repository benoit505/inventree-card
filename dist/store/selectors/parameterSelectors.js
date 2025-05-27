// Placeholder for Parameter Selectors
// Selectors are used to derive computed data from the Redux state.
/*
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { ParameterData, VisualModifiers, ParameterCondition, ParameterOperator, ParameterAction } from '../../core/types';
import { selectParametersForPart } from '../slices/parametersSlice';
// Import other necessary selectors (e.g., for part data, config)

// Example utility function (can be moved elsewhere)
const compareValues = (value: string | null, expectedValue: string, operator: ParameterOperator): boolean => {
  // ... logic from ParameterService.compareValues ...
  return false;
};

// Example Selector Structure
export const selectVisualModifiers = createSelector(
  [
    (state: RootState, partId: number) => selectParametersForPart(state, partId),
    (state: RootState, partId: number) => state.parts.items[partId], // Hypothetical part selector
    (state: RootState) => state.parameters.config?.parameters?.conditions // Get conditions from config
    // Add other state slices needed for condition evaluation
  ],
  (parameters, partData, conditions): VisualModifiers => {
    if (!partData || !conditions || !parameters) {
      return {};
    }

    const modifiers: VisualModifiers = {};
    // Replicate logic from ParameterService.processConditions here
    // using 'parameters' and 'partData' and 'conditions'
    // Call utility functions like compareValues as needed

    // Example condition check:
    // for (const condition of conditions) {
    //   const paramName = condition.parameter;
    //   const paramValue = parameters[paramName]?.data ?? null;
    //   if (compareValues(paramValue, condition.value ?? '', condition.operator)) {
    //     // Apply action from condition.action / condition.action_value to modifiers
    //   }
    // }

    return modifiers;
  }
);
*/
// Selectors for Parameter Slice
import { createSelector } from 'reselect';
import { Logger } from '../../utils/logger'; // Import Logger
const logger = Logger.getInstance();
// Export this helper function
export const compareValues = (actualValue, expectedValue, operator) => {
    const expected = String(expectedValue);
    const actual = String(actualValue);
    switch (operator) {
        case 'equals':
        case 'eq':
            return actual === expected;
        case 'not_equals':
            return actual !== expected;
        case 'contains':
            return actual.toLowerCase().includes(expected.toLowerCase());
        case 'greater_than':
        case 'gt': {
            const numActual = parseFloat(actual);
            const numExpected = parseFloat(expected);
            return !isNaN(numActual) && !isNaN(numExpected) && numActual > numExpected;
        }
        case 'less_than':
        case 'lt': {
            const numActual = parseFloat(actual);
            const numExpected = parseFloat(expected);
            return !isNaN(numActual) && !isNaN(numExpected) && numActual < numExpected;
        }
        case 'exists':
            return actualValue !== undefined && actualValue !== null && actualValue !== '';
        case 'is_empty':
            return actualValue === undefined || actualValue === null || actualValue === '';
        default:
            console.warn(`[parameterSelectors] Unknown compare operator: ${operator}`);
            return false;
    }
};
// Keep applyAction local or export if needed elsewhere
const applyAction = (modifiers, action, value) => {
    switch (action) {
        case 'highlight':
            modifiers.highlight = value;
            break;
        case 'text_color':
            modifiers.textColor = value;
            break;
        case 'border':
            modifiers.border = value === 'hide' ? 'hide' : 'show';
            break;
        case 'icon':
            modifiers.icon = value; // e.g., "mdi:check-circle"
            break;
        case 'badge':
            modifiers.badge = value;
            break;
        case 'sort':
            modifiers.sort = value === 'top' ? 'top' : 'bottom';
            break;
        case 'filter':
            modifiers.filter = value === 'hide' ? 'hide' : 'show';
            break;
        case 'show_section': // Example for conditional section visibility
            modifiers.showSection = value === 'hide' ? 'hide' : 'show';
            break;
        case 'priority': // Example for setting priority
            modifiers.priority = value;
            break;
        default:
            console.warn(`[parameterSelectors] Unknown action type: ${action}`);
    }
};
// Export selectParameterConfig
export const selectParameterConfig = (state) => state.parameters.config;
/**
 * Export this helper function to resolve a parameter value, potentially from another part.
 */
export const resolveParameterValue = (currentPartId, parameterIdentifier, loadingStatusSnapshot, // Add snapshot parameter
parameterValuesSnapshot // Add values snapshot
) => {
    var _a, _b, _c, _d, _e;
    logger.log('resolveParameterValue', `Resolving: ${parameterIdentifier} for part ${currentPartId}`);
    // Log the snapshot received
    logger.log('resolveParameterValue', 'Checking snapshots received by resolver.', {
        loadingStatusSnapshotInResolver: loadingStatusSnapshot,
        targetPartId: (_a = parameterIdentifier.match(/^part:(\d+):/)) === null || _a === void 0 ? void 0 : _a[1]
    });
    if (!parameterValuesSnapshot) {
        logger.warn('resolveParameterValue', '-> Parameter values snapshot is undefined!');
        return undefined;
    }
    const crossPartMatch = parameterIdentifier.match(/^part:(\d+):(.+)$/);
    if (crossPartMatch) {
        const targetPartId = parseInt(crossPartMatch[1], 10);
        const targetParamName = crossPartMatch[2];
        logger.log('resolveParameterValue', `-> Cross-part reference detected. Target Part: ${targetPartId}, Param: ${targetParamName}`);
        // Use the loading status snapshot directly
        const targetStatus = loadingStatusSnapshot[targetPartId];
        logger.log('resolveParameterValue', `-> Target Part (${targetPartId}) Status (from snapshot): ${targetStatus}`);
        if (targetStatus !== 'succeeded') {
            logger.log('resolveParameterValue', `-> Exiting: Target status is not 'succeeded'.`);
            return undefined;
        }
        // Use the parameter values snapshot
        const targetPartParams = parameterValuesSnapshot[targetPartId];
        if (!targetPartParams) {
            logger.warn('resolveParameterValue', `-> Target Part (${targetPartId}) parameterValues object not found in snapshot!`);
            return undefined;
        }
        const paramData = targetPartParams === null || targetPartParams === void 0 ? void 0 : targetPartParams[targetParamName];
        logger.log('resolveParameterValue', `-> Found Param Data for ${targetParamName}:`, paramData);
        if (!paramData) {
            logger.warn('resolveParameterValue', `-> Parameter ${targetParamName} not found within part ${targetPartId} values!`);
            return undefined;
        }
        // Resolve actual value
        let resolvedValue = undefined;
        if (((_b = paramData.data) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'true')
            resolvedValue = true;
        else if (((_c = paramData.data) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === 'false')
            resolvedValue = false;
        else if (typeof paramData.data_numeric === 'number' && !isNaN(paramData.data_numeric)) {
            resolvedValue = paramData.data_numeric;
        }
        else {
            resolvedValue = paramData.data;
        }
        logger.log('resolveParameterValue', `-> Resolved Value: ${resolvedValue} (type: ${typeof resolvedValue})`);
        return resolvedValue;
    }
    else {
        // Standard lookup using the snapshot
        logger.log('resolveParameterValue', `-> Standard lookup for parameter: ${parameterIdentifier}`);
        const currentPartParams = parameterValuesSnapshot[currentPartId];
        if (!currentPartParams) {
            logger.warn('resolveParameterValue', `-> Current Part (${currentPartId}) parameterValues object not found in snapshot!`);
            return undefined;
        }
        const paramData = currentPartParams === null || currentPartParams === void 0 ? void 0 : currentPartParams[parameterIdentifier];
        logger.log('resolveParameterValue', `-> Found Param Data for ${parameterIdentifier}:`, paramData);
        if (!paramData) {
            logger.warn('resolveParameterValue', `-> Parameter ${parameterIdentifier} not found within part ${currentPartId} values!`);
            return undefined;
        }
        // Resolve actual value
        let resolvedValue = undefined;
        if (((_d = paramData.data) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === 'true')
            resolvedValue = true;
        else if (((_e = paramData.data) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === 'false')
            resolvedValue = false;
        else if (typeof paramData.data_numeric === 'number' && !isNaN(paramData.data_numeric)) {
            resolvedValue = paramData.data_numeric;
        }
        else {
            resolvedValue = paramData.data;
        }
        logger.log('resolveParameterValue', `-> Resolved Value: ${resolvedValue} (type: ${typeof resolvedValue})`);
        return resolvedValue;
    }
    // Add explicit return undefined if logic falls through (shouldn't happen but good practice)
    return undefined;
};
// --- Re-add evaluateCondition helper function ---
const evaluateCondition = (condition, currentPartParameters, // Can be undefined
allParameterValues // Can be undefined
) => {
    var _a, _b, _c;
    const parameterIdentifier = condition.parameter;
    let actualValue;
    const crossPartMatch = parameterIdentifier.match(/^part:(\d+):(.+)$/);
    if (crossPartMatch) { // Cross-part parameter
        const targetPartId = parseInt(crossPartMatch[1], 10);
        const targetParamName = crossPartMatch[2];
        actualValue = (_b = (_a = allParameterValues === null || allParameterValues === void 0 ? void 0 : allParameterValues[targetPartId]) === null || _a === void 0 ? void 0 : _a[targetParamName]) === null || _b === void 0 ? void 0 : _b.data;
    }
    else { // Local parameter
        if (!currentPartParameters) {
            // logger.warn('evaluateCondition', `Current part parameters undefined for local param: ${parameterIdentifier}`);
            return false; // Cannot evaluate if current part's params are missing
        }
        actualValue = (_c = currentPartParameters[parameterIdentifier]) === null || _c === void 0 ? void 0 : _c.data;
    }
    const expectedValue = condition.value;
    if (condition.operator === 'exists') {
        return actualValue !== undefined && actualValue !== null && actualValue !== '';
    }
    if (condition.operator === 'is_empty') {
        return actualValue === undefined || actualValue === null || actualValue === '';
    }
    if (actualValue === undefined || actualValue === null) {
        return false;
    }
    // Corrected order for compareValues based on its definition: actual, expected, operator
    return compareValues(actualValue, expectedValue || '', condition.operator);
};
// --- End of evaluateCondition ---
export const selectParametersForPart = createSelector([
    (state) => state.parameters.parametersByPartId,
    (_, partId) => partId
], (parametersByPartId, partId) => {
    return parametersByPartId[partId];
});
/**
 * Selector to compute visual modifiers based on parameter conditions.
 */
export const selectVisualModifiers = createSelector([
    selectParameterConfig, // Input 1: Parameter configuration
    (state) => state.parameters.parameterValues, // Input 2: Direct parameter values from the correct slice part
    // (state: RootState) => state.parameters.loadingStatus, // Input 3: All loading statuses (REMOVED - resolveParameterValue handles this if used)
    (_, partId) => partId // Input 3 (was 4): Pass partId through
], (config, allParameterValues, // Result from Input 2
// allLoadingStatuses: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>, // Result from Input 3 (REMOVED)
partId // Result from Input 3 (was 4)
) => {
    const modifiers = {};
    if (!(config === null || config === void 0 ? void 0 : config.enabled) || !config.conditions || config.conditions.length === 0) {
        return modifiers;
    }
    if (!allParameterValues || !allParameterValues[partId]) {
        // logger.warn('selectVisualModifiers', `Parameter values for part ${partId} not found in allParameterValues.`);
        return modifiers; // Data not ready for this part
    }
    const currentPartParameters = allParameterValues[partId]; // This is Record<string, ParameterDetail>
    for (const condition of config.conditions) {
        try {
            const conditionMet = evaluateCondition(condition, currentPartParameters, // Parameters for the current part
            allParameterValues // All parameters for potential cross-part lookups
            );
            if (conditionMet) {
                switch (condition.action) {
                    case 'highlight':
                        modifiers.highlight = condition.action_value;
                        break;
                    case 'text_color':
                        modifiers.textColor = condition.action_value;
                        break;
                    case 'border':
                        modifiers.border = condition.action_value;
                        break;
                    case 'icon':
                        modifiers.icon = condition.action_value;
                        break;
                    case 'badge':
                        modifiers.badge = condition.action_value;
                        break;
                    case 'sort':
                        modifiers.sort = condition.action_value;
                        break;
                    case 'filter':
                        modifiers.filter = condition.action_value;
                        break;
                    case 'show_section':
                        modifiers.showSection = condition.action_value;
                        break;
                    case 'priority':
                        modifiers.priority = condition.action_value;
                        break;
                    default:
                        // logger.warn('selectVisualModifiers', `Unknown action type: ${condition.action} for part ${partId}`);
                        break;
                }
            }
        }
        catch (error) {
            logger.error('selectVisualModifiers', `Error evaluating condition for part ${partId}:`, { condition, error });
        }
    }
    return modifiers;
});
// Keep other exports like selectParameterLoadingStatus if they are used elsewhere
export const selectParameterLoadingStatus = (state, partId) => { var _a, _b; return ((_b = (_a = state.parameters) === null || _a === void 0 ? void 0 : _a.loadingStatus) === null || _b === void 0 ? void 0 : _b[partId]) || 'idle'; };
/**
 * Selects the visual modifiers (highlight, color, etc.) for a specific part
 * based on evaluated parameter conditions.
 */
export const selectAnyParameterLoading = (state) => {
    const paramsState = state.parameters;
    if (paramsState.configLoadingStatus === 'loading')
        return true;
    if (paramsState.valuesLoadingStatus === 'loading')
        return true;
    // Optional: Check individual part parameter loading statuses
    // if (Object.values(paramsState.parameterLoadingStatus).some(status => status === 'loading')) return true;
    return false;
};
/**
 * Selector to get the loading status for a specific part's parameters.
 */
export const selectParametersLoadingStatusForPart = createSelector([
    (state) => state.parameters.loadingStatus,
    (_, partId) => partId
], (loadingStatus, partId) => {
    return loadingStatus[partId];
});
/**
 * Selector to get the error message for a specific part's parameter fetch, if any.
 */
export const selectParametersErrorForPart = createSelector([
    (state) => state.parameters.error,
    (_, partId) => partId
], (errors, partId) => {
    return errors ? errors[partId] : null;
});
// Example selector to get a specific parameter value for a part
export const selectParameterValue = createSelector([
    // Use the locally defined selectParametersForPart
    (state, partId) => selectParametersForPart(state, partId), // Input 1
    (_, _partId, parameterName) => parameterName // Input 2
], (parameters, parameterName) => {
    if (!parameters)
        return undefined;
    const param = parameters.find(p => { var _a; return ((_a = p.template_detail) === null || _a === void 0 ? void 0 : _a.name) === parameterName; });
    return param === null || param === void 0 ? void 0 : param.data;
});
// Placeholder for visibility check based on parameter conditions
export const checkPartVisibility = (partId, parameterConfig, loadingStatus, parameterValues) => {
    // TODO: Implement actual logic based on parameter conditions and filter actions
    if (!(parameterConfig === null || parameterConfig === void 0 ? void 0 : parameterConfig.enabled) || !parameterConfig.conditions) {
        return true; // Show if parameters or conditions aren't enabled/defined
    }
    // Default to visible for now until logic is implemented
    return true;
};
//# sourceMappingURL=parameterSelectors.js.map