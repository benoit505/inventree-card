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
import { RootState, store } from './../index'; // Trying relative path from selectors to store index
import { ParameterDetail, VisualModifiers, ParameterCondition, ParameterOperator, ParameterAction, ParameterConfig, InventreeItem, InventreeCardConfig } from '../../types'; // Changed import path
import { selectPartById } from './../slices/partsSlice'; // Relative path to partsSlice
import { Logger } from '../../utils/logger'; // Import Logger
import { RootState as RootStateImport } from '../index'; // Ensure RootState is imported

const logger = Logger.getInstance();

// Export this helper function
export const compareValues = (actualValue: any, expectedValue: any, operator: string): boolean => {
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
const applyAction = (modifiers: VisualModifiers, action: string, value: string): void => {
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
             modifiers.priority = value as 'high' | 'medium' | 'low';
             break;
        default:
            console.warn(`[parameterSelectors] Unknown action type: ${action}`);
    }
};

// Export selectParameterConfig
export const selectParameterConfig = (state: RootState): ParameterConfig | undefined => state.parameters.config;

// Type alias for clarity
type LoadingStatusSnapshot = Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
type ParameterValuesSnapshot = Record<number, Record<string, ParameterDetail>>;

/**
 * Export this helper function to resolve a parameter value, potentially from another part.
 */
export const resolveParameterValue = (
  currentPartId: number,
  parameterIdentifier: string,
  loadingStatusSnapshot: LoadingStatusSnapshot, // Add snapshot parameter
  parameterValuesSnapshot: ParameterValuesSnapshot | undefined // Add values snapshot
): string | number | boolean | undefined => {
  logger.log('resolveParameterValue', `Resolving: ${parameterIdentifier} for part ${currentPartId}`);
  
  // Log the snapshot received
  logger.log('resolveParameterValue', 'Checking snapshots received by resolver.', {
      loadingStatusSnapshotInResolver: loadingStatusSnapshot,
      targetPartId: parameterIdentifier.match(/^part:(\d+):/)?.[1]
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
    const paramData = targetPartParams?.[targetParamName];
    logger.log('resolveParameterValue', `-> Found Param Data for ${targetParamName}:`, paramData);
    
    if (!paramData) {
        logger.warn('resolveParameterValue', `-> Parameter ${targetParamName} not found within part ${targetPartId} values!`);
        return undefined;
    }

    // Resolve actual value
    let resolvedValue: string | number | boolean | undefined = undefined;
    if (paramData.data?.toLowerCase() === 'true') resolvedValue = true;
    else if (paramData.data?.toLowerCase() === 'false') resolvedValue = false;
    else if (typeof paramData.data_numeric === 'number' && !isNaN(paramData.data_numeric)) {
      resolvedValue = paramData.data_numeric;
    } else {
      resolvedValue = paramData.data;
    }
    logger.log('resolveParameterValue', `-> Resolved Value: ${resolvedValue} (type: ${typeof resolvedValue})`);
    return resolvedValue;

  } else {
    // Standard lookup using the snapshot
    logger.log('resolveParameterValue', `-> Standard lookup for parameter: ${parameterIdentifier}`);
    const currentPartParams = parameterValuesSnapshot[currentPartId]; 
    if (!currentPartParams) {
        logger.warn('resolveParameterValue', `-> Current Part (${currentPartId}) parameterValues object not found in snapshot!`);
        return undefined;
    }
    const paramData = currentPartParams?.[parameterIdentifier];
    logger.log('resolveParameterValue', `-> Found Param Data for ${parameterIdentifier}:`, paramData);

    if (!paramData) {
        logger.warn('resolveParameterValue', `-> Parameter ${parameterIdentifier} not found within part ${currentPartId} values!`);
        return undefined;
    }

    // Resolve actual value
    let resolvedValue: string | number | boolean | undefined = undefined;
    if (paramData.data?.toLowerCase() === 'true') resolvedValue = true;
    else if (paramData.data?.toLowerCase() === 'false') resolvedValue = false;
    else if (typeof paramData.data_numeric === 'number' && !isNaN(paramData.data_numeric)) {
      resolvedValue = paramData.data_numeric;
    } else {
        resolvedValue = paramData.data;
    }
    logger.log('resolveParameterValue', `-> Resolved Value: ${resolvedValue} (type: ${typeof resolvedValue})`);
    return resolvedValue;
  }
  // Add explicit return undefined if logic falls through (shouldn't happen but good practice)
  return undefined; 
};

// --- Re-add evaluateCondition helper function ---
const evaluateCondition = (
    condition: ParameterCondition,
    currentPartParameters: Record<string, ParameterDetail> | undefined, // Can be undefined
    allParameterValues: Record<number, Record<string, ParameterDetail>> | undefined // Can be undefined
): boolean => {
    const parameterIdentifier = condition.parameter;
    let actualValue: string | number | boolean | undefined;

    const crossPartMatch = parameterIdentifier.match(/^part:(\d+):(.+)$/);
    if (crossPartMatch) { // Cross-part parameter
        const targetPartId = parseInt(crossPartMatch[1], 10);
        const targetParamName = crossPartMatch[2];
        actualValue = allParameterValues?.[targetPartId]?.[targetParamName]?.data;
    } else { // Local parameter
        if (!currentPartParameters) {
            // logger.warn('evaluateCondition', `Current part parameters undefined for local param: ${parameterIdentifier}`);
            return false; // Cannot evaluate if current part's params are missing
        }
        actualValue = currentPartParameters[parameterIdentifier]?.data;
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

export const selectParametersForPart = createSelector(
    [
        (state: RootState) => state.parameters.parametersByPartId,
        (_: RootState, partId: number) => partId
    ],
    (parametersByPartId, partId): ParameterDetail[] | undefined => {
        return parametersByPartId[partId];
    }
);

/**
 * Selector to compute visual modifiers based on parameter conditions.
 */
export const selectVisualModifiers = createSelector(
    [
        selectParameterConfig, // Input 1: Parameter configuration
        (state: RootState) => state.parameters.parameterValues, // Input 2: Direct parameter values from the correct slice part
        // (state: RootState) => state.parameters.loadingStatus, // Input 3: All loading statuses (REMOVED - resolveParameterValue handles this if used)
        (_: RootState, partId: number) => partId // Input 3 (was 4): Pass partId through
    ],
    (
        config: ParameterConfig | undefined,
        allParameterValues: Record<number, Record<string, ParameterDetail>> | undefined, // Result from Input 2
        // allLoadingStatuses: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>, // Result from Input 3 (REMOVED)
        partId: number // Result from Input 3 (was 4)
    ): VisualModifiers => {
        const modifiers: VisualModifiers = {};

        if (!config?.enabled || !config.conditions || config.conditions.length === 0) {
            return modifiers;
        }

        if (!allParameterValues || !allParameterValues[partId]) {
            // logger.warn('selectVisualModifiers', `Parameter values for part ${partId} not found in allParameterValues.`);
            return modifiers; // Data not ready for this part
        }

        const currentPartParameters = allParameterValues[partId]; // This is Record<string, ParameterDetail>

        for (const condition of config.conditions) {
            try {
                const conditionMet = evaluateCondition(
                    condition,
                    currentPartParameters, // Parameters for the current part
                    allParameterValues    // All parameters for potential cross-part lookups
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
                             modifiers.sort = condition.action_value as 'top' | 'bottom';
                             break;
                        case 'filter':
                             modifiers.filter = condition.action_value as 'show' | 'hide';
                             break;
                        case 'show_section':
                             modifiers.showSection = condition.action_value as 'show' | 'hide';
                             break;
                        case 'priority':
                             modifiers.priority = condition.action_value as 'high' | 'medium' | 'low';
                             break;
                        default:
                            // logger.warn('selectVisualModifiers', `Unknown action type: ${condition.action} for part ${partId}`);
                            break;
                    }
                }
            } catch (error) {
                logger.error('selectVisualModifiers', `Error evaluating condition for part ${partId}:`, { condition, error });
            }
        }
        return modifiers;
    }
);

// Keep other exports like selectParameterLoadingStatus if they are used elsewhere
export const selectParameterLoadingStatus = (
  state: RootState,
  partId: number
): 'idle' | 'loading' | 'succeeded' | 'failed' => state.parameters?.loadingStatus?.[partId] || 'idle';

/**
 * Selects the visual modifiers (highlight, color, etc.) for a specific part
 * based on evaluated parameter conditions.
 */

export const selectAnyParameterLoading = (state: RootState): boolean => {
  const paramsState = state.parameters;
  if (paramsState.configLoadingStatus === 'loading') return true;
  if (paramsState.valuesLoadingStatus === 'loading') return true;
  // Optional: Check individual part parameter loading statuses
  // if (Object.values(paramsState.parameterLoadingStatus).some(status => status === 'loading')) return true;
  return false;
};

export {}; // Ensure this file is treated as a module 

/**
 * Selector to get the loading status for a specific part's parameters.
 */
export const selectParametersLoadingStatusForPart = createSelector(
    [
        (state: RootState) => state.parameters.loadingStatus,
        (_: RootState, partId: number) => partId
    ],
    (loadingStatus, partId): 'idle' | 'loading' | 'succeeded' | 'failed' | undefined => {
        return loadingStatus[partId];
    }
);

/**
 * Selector to get the error message for a specific part's parameter fetch, if any.
 */
export const selectParametersErrorForPart = createSelector(
    [
        (state: RootState) => state.parameters.error,
        (_: RootState, partId: number) => partId
    ],
    (errors, partId): string | null | undefined => {
        return errors ? errors[partId] : null;
    }
);

// Example selector to get a specific parameter value for a part
export const selectParameterValue = createSelector(
    [
        // Use the locally defined selectParametersForPart
        (state: RootState, partId: number) => selectParametersForPart(state, partId), // Input 1
        (_: RootState, _partId: number, parameterName: string) => parameterName // Input 2
    ],
    (parameters: ParameterDetail[] | undefined, parameterName: string): string | undefined => {
        if (!parameters) return undefined;
        const param = parameters.find(p => p.template_detail?.name === parameterName);
        return param?.data;
    }
);

// Placeholder for visibility check based on parameter conditions
export const checkPartVisibility = (
    partId: number,
    parameterConfig: InventreeCardConfig['parameters'] | undefined,
    loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>,
    parameterValues: Record<number, Record<string, ParameterDetail>> | undefined
): boolean => {
    // TODO: Implement actual logic based on parameter conditions and filter actions
    if (!parameterConfig?.enabled || !parameterConfig.conditions) {
        return true; // Show if parameters or conditions aren't enabled/defined
    }
    
    // Default to visible for now until logic is implemented
    return true; 
}; 