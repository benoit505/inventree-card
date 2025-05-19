// Placeholder for Parameter Thunks
// This file will contain asynchronous logic related to parameters,
// such as fetching data from the API or performing complex updates.

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { ParameterDetail, InventreeCardConfig } from '../../types';
import { selectApiUrl, selectApiKey, selectApiInitialized } from '../slices/apiSlice'; // Import API selectors
import { Logger } from '../../utils/logger';
import { selectParameterLoadingStatus } from '../slices/parametersSlice'; // Import the selector
import { inventreeApiService } from '../../services/inventree-api-service'; // Import the refactored service

// Import necessary actions and types from parametersSlice
import { 
    setDefinedConditions, 
    setProcessedConditions,
    ProcessedCondition,
    setConditionalPartEffectsBatch,
    clearConditionalPartEffects,
    ConditionalPartEffect
} from '../slices/parametersSlice';
import { ParameterCondition, ParameterOperator, ParameterActionType, InventreeItem } from '../../types';
// Remove the placeholder/import for selectPrimaryPartId
// const selectPrimaryPartId = (state: RootState): number | null => { ... };

const logger = Logger.getInstance();

// Thunk to initialize conditions and fetch required parameters
export const initializeConditionsAndParameters = createAsyncThunk<
  void, // Return type
  ParameterCondition[], // Argument type: raw conditions from config
  { state: RootState; rejectValue: string }
>(
  'parameters/initializeConditions',
  async (rawConditions, { dispatch, getState, rejectWithValue }) => {
    logger.log('ParameterThunk', 'Initializing conditions and parameters...', { rawConditionsCount: rawConditions.length });

    if (!rawConditions || rawConditions.length === 0) { // Ensure to handle empty array too
      logger.log('ParameterThunk', 'No raw conditions provided. Clearing processed conditions.');
      dispatch(setDefinedConditions([]));
      dispatch(setProcessedConditions([]));
      return;
    }

    dispatch(setDefinedConditions(rawConditions));

    const state = getState();
    // Remove primaryPartId, as it must come from the condition string
    const processedConditions: ProcessedCondition[] = [];
    const partIdsToFetch = new Set<number>();

    for (let i = 0; i < rawConditions.length; i++) {
      const rawCond = rawConditions[i];
      let partId: number | null = null;
      let parameterName = '';

      const paramString = rawCond.parameter;
      // Expect format: "part:<ID>:<PARAMETER_NAME>"
      if (paramString && paramString.startsWith('part:')) { // Add null check for paramString
        const parts = paramString.split(':');
        if (parts.length === 3) {
          const parsedPartId = parseInt(parts[1], 10);
          if (!isNaN(parsedPartId)) {
            partId = parsedPartId;
            parameterName = parts[2];
          } else {
            logger.warn('ParameterThunk', `Invalid partId in condition parameter string: ${paramString}` , { rawCond });
            continue; // Skip this condition
          }
        } else {
          logger.warn('ParameterThunk', `Malformed condition parameter string (expected part:id:name): ${paramString}` , { rawCond });
          continue; // Skip this condition
        }
      } else {
        logger.warn('ParameterThunk', `Condition parameter string does not follow part:id:name format: ${paramString}` , { rawCond });
        continue; // Skip this condition if format is not met
      }

      // partId and parameterName must be resolved at this point from the string
      if (partId !== null && parameterName) { 
        if (rawCond.operator && rawCond.action && rawCond.action_value !== undefined) {
            processedConditions.push({
                id: `cond-${i}-${Date.now()}`,
                rawConditionString: JSON.stringify(rawCond),
                sourceParameterString: rawCond.parameter,
                partId: partId, // partId is now guaranteed to be a number here
                parameterName: parameterName,
                operator: rawCond.operator as ParameterOperator,
                valueToCompare: rawCond.value,
                action: rawCond.action as ParameterActionType,
                actionValue: rawCond.action_value,
                targetPartIds: rawCond.targetPartIds,
            });

            // Check if parameters for this partId need fetching
            const currentStatus = selectParameterLoadingStatus(state, partId);
            // Check if the specific parameter value exists in the store for this part
            // const parameterValueExists = !!state.parameters.parameterValues[partId]?.[parameterName]; // Commented out as new logic is simpler

            // Only fetch if truly idle. If failed, it requires a manual refresh or different trigger.
            // If loading, let the current fetch complete.
            if (currentStatus === 'idle') {
                partIdsToFetch.add(partId);
            } else if (currentStatus === 'failed') {
                logger.warn('ParameterThunk', `Parameters for part ${partId} previously failed to load. Skipping automatic refetch in this cycle. Part: ${partId}, ParamName: ${parameterName}`);
            } else if (currentStatus === 'loading') {
                logger.log('ParameterThunk', `Parameters for part ${partId} are already loading. Skipping. Part: ${partId}, ParamName: ${parameterName}`, { level: 'debug' });
            }
        } else {
            logger.warn('ParameterThunk', 'Skipping condition due to missing operator, action, or action_value', { rawCond });
        }
      } // No else needed here as we `continue` above if partId/parameterName are not resolved
    }

    dispatch(setProcessedConditions(processedConditions));
    logger.log('ParameterThunk', `Processed ${processedConditions.length} conditions.`, { processedConditions });

    if (partIdsToFetch.size > 0) {
      const idsArray = Array.from(partIdsToFetch);
      logger.log('ParameterThunk', `Need to fetch parameters for part IDs: ${idsArray.join(', ')}`);
      // Consider using fetchParametersForReferencedParts if it's more efficient for multiple IDs
      // For simplicity here, dispatching individually, but batching is better.
      // Using fetchParametersForReferencedParts directly
      if (idsArray.length > 0) {
          try {
            await dispatch(fetchParametersForReferencedParts(idsArray)).unwrap();
            logger.log('ParameterThunk', `Successfully initiated fetch for referenced parts: ${idsArray.join(', ')}`);
          } catch (error) {
            logger.error('ParameterThunk', `Failed to fetch parameters for referenced parts: ${idsArray.join(', ')}`, { error });
            // Do not reject the whole thunk if fetches fail, still try to evaluate with what we have or log it.
            // return rejectWithValue(`Failed to fetch some referenced parameters: ${error}`);
          }
      }
    } else {
      logger.log('ParameterThunk', 'No new part parameters need to be fetched based on conditions.');
    }

    // Always evaluate conditions after setup, even if some fetches failed or none were needed
    // This ensures that effects are cleared or updated based on current state.
    try {
      await dispatch(evaluateAndApplyConditions()).unwrap(); // Dispatch and await our new thunk
    } catch (evalError) {
      logger.error('ParameterThunk', 'Error during evaluateAndApplyConditions', { evalError });
      // Optionally, reject the initializeConditionsAndParameters thunk if eval is critical
      // return rejectWithValue('Failed to evaluate and apply conditions');
    }
  }
);

// Thunk action to fetch parameter data for a specific part
export const fetchParametersForPart = createAsyncThunk<
  { partId: number, parameters: ParameterDetail[] }, // Updated return type on success
  number, // Argument type (partId)
  { state: RootState; rejectValue: string } // ThunkAPI config with rejectValue
>(
  'parameters/fetchForPart', // Action type prefix
  async (partId, thunkAPI) => {
    const state = thunkAPI.getState();
    // Check if API is initialized via apiSlice
    const apiInitialized = selectApiInitialized(state);

    logger.log('ParameterThunk', `Fetching parameters for part ID: ${partId}`, { 
      category: 'parameters',
      subsystem: 'thunk-fetch' 
    });

    // Use apiInitialized from apiSlice
    if (!apiInitialized) {
      const errorMsg = 'Direct API is not initialized (checked via apiSlice).';
      logger.error('ParameterThunk', errorMsg, { 
        category: 'parameters',
        subsystem: 'thunk-fetch' 
      });
      return thunkAPI.rejectWithValue(errorMsg);
    }

    try {
      // Use the refactored inventreeApiService (which gets config from store)
      const parameters = await inventreeApiService.getPartParameters(partId);
      
      // Check if the result is null (API error) or an array
      if (parameters === null) {
        throw new Error('API call to getPartParameters returned null.');
      }

      const parametersCount = parameters.length; // No need for Array.isArray check if non-null
      logger.log('ParameterThunk', `Successfully fetched ${parametersCount} parameters for part ID: ${partId}`, { 
        category: 'parameters',
        subsystem: 'thunk-fetch' 
      });
      
      // Return the fetched data (which is guaranteed to be an array here)
      // Include the original partId in the success payload
      return { partId, parameters }; 
      
    } catch (error: any) {
      const errorMsg = `Failed to fetch parameters for part ${partId}: ${error.message || error}`;
      logger.error('ParameterThunk', errorMsg, { 
        error,
        category: 'parameters',
        subsystem: 'thunk-fetch' 
      });
      // Return error message (will become the rejected action payload)
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);

// Thunk to fetch parameters for multiple part IDs
export const fetchParametersForReferencedParts = createAsyncThunk<
    Record<number, { data: ParameterDetail[]; error?: string }>, // UPDATED return type
    number[],                        // Argument type: Array of part IDs
    { state: RootState; rejectValue: string } // Thunk config
>(
    'parameters/fetchForReferencedParts',
    async (partIds, { getState, rejectWithValue }) => {
        const state = getState();
        const apiInitialized = selectApiInitialized(state);

        logger.log('fetchParametersForReferencedParts Thunk', `Thunk started. Original partIds received: ${partIds.join(', ')}`, { level: 'debug' });

        if (!apiInitialized) {
            const errorMsg = 'API not initialized. Cannot fetch referenced parameters.';
            logger.error('fetchParametersForReferencedParts Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }

        if (!partIds || partIds.length === 0) {
            logger.log('fetchParametersForReferencedParts Thunk', 'No part IDs provided, skipping fetch.');
            return {};
        }

        // Filter out part IDs that are already loading or have recently failed
        const validPartIdsToFetch = partIds.filter(id => {
            const currentStatus = selectParameterLoadingStatus(state, id);
            if (currentStatus === 'failed') {
                logger.warn('fetchParametersForReferencedParts Thunk', `Part ${id} previously failed. Skipping fetch in this batch.`);
                return false; 
            }
            return true;
        });

        if (validPartIdsToFetch.length === 0) {
            logger.log('fetchParametersForReferencedParts Thunk', 'All provided part IDs are already loading, recently failed, or list was empty after filtering. Skipping API calls.');
            return {};
        }

        logger.log('fetchParametersForReferencedParts Thunk', `Attempting to fetch parameters for part IDs: ${validPartIdsToFetch.join(', ')} (after filtering). Original IDs: ${partIds.join(', ')}`);

        try {
            const results: Record<number, { data: ParameterDetail[]; error?: string }> = {}; // UPDATED type for results
            
            const promises = validPartIdsToFetch.map(partId => {
                logger.log('fetchParametersForReferencedParts Thunk', `Preparing API call for partId: ${partId}`, { level: 'silly' });
                return inventreeApiService.getPartParameters(partId)
                 .then(parameters => ({ status: 'fulfilled', value: parameters, partId }))
                 .catch(error => ({ status: 'rejected', reason: error, partId }));
            });
            
            // Using Promise.allSettled isn't strictly necessary here since .then/.catch on individual promises handles settlement.
            // However, to keep the structure and ensure we process all, we can map the results of Promise.all on the transformed promises.
            // Or, more simply, await all promises and build the results object directly.
            
            const settledIndividualPromises = await Promise.all(promises.map(p => p.catch(e => e))); // Catch individual errors to ensure all complete
            logger.log('fetchParametersForReferencedParts Thunk', 'Raw settledIndividualPromises:', { data: settledIndividualPromises, level: 'silly' });

            settledIndividualPromises.forEach(result => {
                // Result structure from .then/.catch is { status: 'fulfilled'/'rejected', value/reason, partId }
                const partId = result.partId; // partId is attached in both fulfilled and rejected cases
                logger.log('fetchParametersForReferencedParts Thunk', `Processing settled promise for partId: ${partId}`, { status: result.status, level: 'silly' });

                if (result.status === 'fulfilled') {
                    const parameters = result.value as ParameterDetail[] | null; // value from .then
                    if (parameters === null) {
                        const errorMsg = `API returned null or failed to fetch parameters for part ${partId}.`;
                        logger.warn('fetchParametersForReferencedParts Thunk', errorMsg, { partIdForContext: partId });
                        results[partId] = { data: [], error: errorMsg };
                    } else {
                        results[partId] = { data: parameters };
                        logger.log('fetchParametersForReferencedParts Thunk', `Fetched ${parameters.length} parameters for part ${partId}.`, { level: 'debug', partIdForContext: partId });
                    }
                } else { // status === 'rejected' or it's the caught error object itself
                    const errorReason = result.reason || result; // reason from .catch or the error if map(p => p.catch(e => e)) was used
                    const errorMsg = errorReason?.message || String(errorReason);
                    logger.error('fetchParametersForReferencedParts Thunk', `Failed to fetch parameters for part ${partId}: ${errorMsg}`, { partIdForContext: partId, errorDetail: errorReason });
                    results[partId] = { data: [], error: errorMsg };
                }
            });

            logger.log('fetchParametersForReferencedParts Thunk', `Finished processing parameter fetches for ${validPartIdsToFetch.length} parts.`);
            logger.log('fetchParametersForReferencedParts Thunk', 'Final results object being returned:', { data: results, level: 'debug' });
            return results;
        } catch (error: any) { 
            const errorMsg = `Overall failure in fetchParametersForReferencedParts thunk: ${error.message || error}`;
            logger.error('fetchParametersForReferencedParts Thunk', errorMsg);
            // For a top-level error, we might want to reject the whole thunk
            // or return a structure indicating failure for all initially requested validPartIds.
            // For now, let's attempt to return error for all parts it was trying to fetch.
            const failedResults: Record<number, { data: ParameterDetail[]; error?: string }> = {};
            validPartIdsToFetch.forEach(id => {
                failedResults[id] = { data: [], error: errorMsg };
            });
            // This rejectWithValue will make the whole thunk action '.rejected'
            // If we want partial success/failure to be handled by '.fulfilled', the catch block
            // for individual promises inside the try is more appropriate.
            // The current structure aims for the latter.
            // So, if an error reaches here, it's unexpected.
            return rejectWithValue(errorMsg); // This makes the entire thunk fail.
        }
    }
);

// Thunk to update a single parameter value
export const updateParameterValue = createAsyncThunk<
    { partId: number; parameterName: string; value: string }, // Return type
    { partId: number; paramName: string; value: string },    // Argument type
    { state: RootState; rejectValue: string }                 // Thunk config
>(
    'parameters/updateValue',
    async ({ partId, paramName, value }, { getState, rejectWithValue }) => {
        const state = getState();
        // Check API initialization
        const apiInitialized = selectApiInitialized(state);

        if (!apiInitialized) {
            const errorMsg = 'API not initialized. Cannot update parameter.';
            logger.error('updateParameterValue Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }

        try {
            // REMOVED: Old API instance creation
            // const api = new InvenTreeDirectAPI(apiUrl, apiKey);
            
            // We need the Parameter *Instance* PK, not just the name, for the update API.
            // Find the parameter in the current state to get its PK.
            const parametersForPart = state.parameters.parametersByPartId[partId] || [];
            const parameterToUpdate = parametersForPart.find((p: ParameterDetail) => p.template_detail?.name === paramName);

            if (!parameterToUpdate) {
                 const errorMsg = `Parameter '${paramName}' not found in state for part ${partId}. Cannot get PK for update.`;
                 logger.error('updateParameterValue Thunk', errorMsg);
                 return rejectWithValue(errorMsg);
            }

            const parameterInstancePk = parameterToUpdate.pk;

            // Call the refactored service method with the instance PK
            const updateResult = await inventreeApiService.updatePartParameter(parameterInstancePk, value);

            if (!updateResult) {
                // Throw an error if the API call failed (returned null)
                throw new Error('API call to updatePartParameter returned null.');
            }

            logger.log('updateParameterValue Thunk', `Successfully updated param PK ${parameterInstancePk} (${paramName}) for part ${partId} to ${value}.`);
            // Return the original arguments on success, as expected by the reducer
            return { partId, parameterName: paramName, value };
        } catch (error: any) {
            const errorMsg = `Failed to update parameter ${paramName} for part ${partId}: ${error.message || error}`;
            logger.error('updateParameterValue Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

// NEW Thunk: Evaluates conditions and applies their effects
export const evaluateAndApplyConditions = createAsyncThunk<
  void, // Return type
  void, // Argument type (none for this thunk)
  { state: RootState; rejectValue: string }
>(
  'parameters/evaluateAndApplyConditions',
  async (_, { dispatch, getState }) => {
    // logger.log('ParameterThunk', 'Evaluating and applying conditions...'); // Original log
    const state = getState();
    const { processedConditions, parameterValues } = state.parameters;

    // NEW CONSOLE LOG HERE
    console.log('[PT_DEBUG] evaluateAndApplyConditions - START. Processed Conditions:', JSON.parse(JSON.stringify(processedConditions)));
    console.log('[PT_DEBUG] evaluateAndApplyConditions - Current parameterValues:', JSON.parse(JSON.stringify(parameterValues)));

    const allPartsById = state.parts.partsById; // Used for wildcard target

    if (!processedConditions || processedConditions.length === 0) {
      logger.log('ParameterThunk', 'No processed conditions to evaluate. Clearing existing effects.');
      dispatch(clearConditionalPartEffects());
      return;
    }

    const newEffects: Record<number, ConditionalPartEffect> = {};

    // Helper to merge effects for a part
    const mergeEffect = (partId: number, effect: Partial<ConditionalPartEffect>) => {
      if (!newEffects[partId]) {
        newEffects[partId] = {};
      }
      // Simple merge: last condition setting an effect wins for that specific effect property
      // More sophisticated merging (e.g., for borders, or multiple badges) could be added if needed
      newEffects[partId] = { ...newEffects[partId], ...effect };
    };

    for (const condition of processedConditions) {
      const paramValue = parameterValues[condition.partId]?.[condition.parameterName]?.data;
      let conditionMet = false;

      // Specific log for our target condition
      if (condition.partId === 145 && condition.parameterName === 'microwavables') {
        console.log('[PT_DEBUG] Evaluating condition for part:145:microwavables', {
          conditionSourceString: condition.sourceParameterString,
          operator: condition.operator,
          valueToCompare: condition.valueToCompare,
          paramValueReadFromState: paramValue, 
          currentParameterValuesForPart145: parameterValues[145]
        });
      }

      // --- Evaluate Condition --- (Simplified, can be expanded)
      switch (condition.operator) {
        case 'equals': conditionMet = String(paramValue) === String(condition.valueToCompare); break;
        case 'not_equals': conditionMet = String(paramValue) !== String(condition.valueToCompare); break;
        case 'contains': conditionMet = String(paramValue).includes(String(condition.valueToCompare)); break;
        case 'exists': conditionMet = paramValue !== undefined && paramValue !== null && paramValue !== ''; break;
        case 'is_empty': conditionMet = paramValue === undefined || paramValue === null || paramValue === ''; break;
        case 'greater_than': conditionMet = parseFloat(paramValue) > parseFloat(condition.valueToCompare); break;
        case 'less_than': conditionMet = parseFloat(paramValue) < parseFloat(condition.valueToCompare); break;
        default: logger.warn('ParameterThunk', `Unknown operator: ${condition.operator}`, { condition });
      }

      if (conditionMet) {
        // Using console.log for this specific MET log
        console.log('[PT_DEBUG] Condition MET', { 
          conditionSource: condition.sourceParameterString, 
          evaluatedParamValue: paramValue, 
          comparedTo: condition.valueToCompare,
          operator: condition.operator
        });
        let targetPartPks: number[] = [];

        if (condition.targetPartIds === '*') {
          targetPartPks = Object.keys(allPartsById).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        } else if (Array.isArray(condition.targetPartIds)) {
          targetPartPks = condition.targetPartIds;
        }
        // ELSE: targetPartPks remains [] if not '*' and not an array

        logger.log('ParameterThunk', '[DEBUG] Target Part ID Resolution', {
          level: 'info',
          conditionSource: condition.sourceParameterString,
          rawTargetPartIds: condition.targetPartIds, // Log the raw value
          resolvedTargetPartPks: targetPartPks,     // Log the resolved array
          targetPartPksLength: targetPartPks.length
        });

        if (targetPartPks.length > 0) {
          let effectToApply: Partial<ConditionalPartEffect> = {};
          switch (condition.action) {
            case 'filter': effectToApply.isVisible = condition.actionValue === 'show'; break;
            case 'highlight': effectToApply.highlight = condition.actionValue; break;
            case 'text_color': effectToApply.textColor = condition.actionValue; break;
            case 'border': effectToApply.border = condition.actionValue; break; // Assuming actionValue is a valid CSS border string
            case 'icon': effectToApply.icon = condition.actionValue; break;
            case 'badge': effectToApply.badge = condition.actionValue; break;
            // 'sort', 'priority', 'show_section' might need different handling or state structures
            // For now, logging them:
            case 'sort': 
            case 'priority': 
            case 'show_section': 
              logger.log('ParameterThunk', `Action type '${condition.action}' requires specific handling not yet implemented in basic effects.`, { condition });
              break;
            default: logger.warn('ParameterThunk', `Unknown action type: ${condition.action}`, { condition });
          }

          // Using console.log for this specific effect log
          console.log('[PT_DEBUG] Effect to Apply for MET condition', {
            conditionSource: condition.sourceParameterString,
            action: condition.action,
            actionValue: condition.actionValue,
            effectToApply, 
            targetPartPks 
          });

          if (Object.keys(effectToApply).length > 0) {
            targetPartPks.forEach(pk => mergeEffect(pk, effectToApply));
          } else {
            // Using console.log for this specific warning
            console.warn('[PT_DEBUG] effectToApply is empty, no effect merged.', {
                conditionSource: condition.sourceParameterString,
                action: condition.action,
                actionValue: condition.actionValue,
                targetPartPks
            });
          }
        } else {
          // This new log will be crucial if targetPartPks is empty
          logger.warn('ParameterThunk', '[DEBUG] No target part PKs resolved for MET condition. Effect will not be applied.', {
              conditionSource: condition.sourceParameterString,
              rawTargetPartIds: condition.targetPartIds,
              conditionAction: condition.action, // Adding more context
              conditionActionValue: condition.actionValue
          });
        }
      } else { // Log when condition is NOT met
        logger.log('ParameterThunk', 'Condition NOT MET', {
          level: 'info', // Elevate for clarity
          conditionSource: condition.sourceParameterString,
          evaluatedParamValue: paramValue,
          comparedTo: condition.valueToCompare,
          operator: condition.operator
        });
      }
    }
    
    // Using console.log for the final effects object
    console.log('[PT_DEBUG] Final newEffects before dispatching setConditionalPartEffectsBatch', {
      newEffects 
    });
    dispatch(setConditionalPartEffectsBatch(newEffects));
    logger.log('ParameterThunk', 'Finished evaluating conditions and dispatched effects batch.', { newEffectsCount: Object.keys(newEffects).length });
  }
);