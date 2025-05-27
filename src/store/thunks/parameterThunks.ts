// Placeholder for Parameter Thunks
// This file will contain asynchronous logic related to parameters,
// such as fetching data from the API or performing complex updates.

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
// Consolidated imports from '../../types'
import { 
    ParameterDetail, 
    // REMOVED: InventreeCardConfig, // If no longer used directly by these thunks
    // REMOVED: ParameterCondition, // If no longer used
    // REMOVED: ParameterOperator, 
    // REMOVED: ParameterActionType, 
    // REMOVED: InventreeItem, 
    // REMOVED: ConditionalPartEffect, 
    InventreeParameterFetchConfig, 
    ConditionRuleDefinition // Keep if any remaining thunk processes raw rules, otherwise remove
} from '../../types'; 
import { selectApiUrl, selectApiKey, selectApiInitialized } from '../slices/apiSlice'; // Import API selectors
import { Logger } from '../../utils/logger';
import { selectParameterLoadingStatus } from '../slices/parametersSlice'; // Import the selector
import { inventreeApiService } from '../../services/inventree-api-service'; // Import the refactored service

// REMOVED: Imports from parametersSlice for setDefinedConditions, setProcessedConditions, ProcessedCondition
// import {
//     setDefinedConditions,
//     setProcessedConditions,
//     ProcessedCondition,
//     // setConditionalPartEffectsBatch, // This is used by ConditionalEffectsEngine, not directly here
//     // clearConditionalPartEffects
// } from '../slices/parametersSlice';

// ADD: Import selectAllPartIds from partsSlice
import { selectAllPartIds, selectAllParts } from '../slices/partsSlice'; 
// Remove the placeholder/import for selectPrimaryPartId
// const selectPrimaryPartId = (state: RootState): number | null => { ... };

import { selectInventreeParametersToFetch } from '../slices/configSlice'; // Assuming this selector exists or will be created
// REMOVED: import { ConditionalEffectsEngine } from '../../core/ConditionalEffectsEngine';

const logger = Logger.getInstance();

// Thunk to initialize conditions and fetch required parameters
// REMOVED: Old initializeConditionsAndParameters thunk (lines ~40-160)
// ... (Thunk code was here)

// Thunk action to fetch parameter data for a specific part
export const fetchParametersForPart = createAsyncThunk<
  { partId: number, parameters: ParameterDetail[] },
  number, 
  { state: RootState; rejectValue: string }
>(
  'parameters/fetchForPart',
  async (partId, thunkAPI) => {
    // ADD TEMP LOG
    // console.log(`[TEMP LOG - parameterThunks.ts:25] fetchParametersForPart THUNK START for partId: ${partId}`);
    const state = thunkAPI.getState();
    const apiInitialized = selectApiInitialized(state);
    // ADD TEMP LOG
    // console.log(`[TEMP LOG - parameterThunks.ts:29] fetchParametersForPart: API Initialized: ${apiInitialized}`);

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
      // ADD TEMP LOG
      // console.log(`[TEMP LOG - parameterThunks.ts:41] fetchParametersForPart: Calling inventreeApiService.getPartParameters(${partId})`);
      const parameters = await inventreeApiService.getPartParameters(partId);
      // ADD TEMP LOG
      // console.log(`[TEMP LOG - parameterThunks.ts:44] fetchParametersForPart: inventreeApiService.getPartParameters(${partId}) returned:`, JSON.parse(JSON.stringify(parameters || null)));
      
      if (parameters === null) {
        // ADD TEMP LOG
        // console.error(`[TEMP LOG - parameterThunks.ts:48] fetchParametersForPart: API call returned null for part ${partId}. Throwing error.`);
        throw new Error('API call to getPartParameters returned null.');
      }

      const parametersCount = parameters.length; // No need for Array.isArray check if non-null
      logger.log('ParameterThunk', `Successfully fetched ${parametersCount} parameters for part ID: ${partId}`, { 
        category: 'parameters',
        subsystem: 'thunk-fetch' 
      });
      
      // Return the fetched data (which is guaranteed to be an array here)
      // Include the original partId in the success payload
      // ADD TEMP LOG
      // console.log(`[TEMP LOG - parameterThunks.ts:58] fetchParametersForPart: Success for part ${partId}. Returning:`, JSON.parse(JSON.stringify({ partId, parameters })));
      return { partId, parameters }; 
      
    } catch (error: any) {
      // ADD TEMP LOG
      // console.error(`[TEMP LOG - parameterThunks.ts:63] fetchParametersForPart: ERROR for part ${partId}:`, error.message, error);
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
    Record<number, { data: ParameterDetail[]; error?: string }>, 
    number[],
    { state: RootState; rejectValue: string }
>(
    'parameters/fetchForReferencedParts',
    async (partIds, { getState, rejectWithValue, dispatch }) => {
        // ADD TEMP LOG
        // console.log(`[TEMP LOG - parameterThunks.ts:76] fetchParametersForReferencedParts THUNK START. Original partIds: ${partIds.join(', ')}`);
        const state = getState();
        const apiInitialized = selectApiInitialized(state);
        const BATCH_SIZE = 5; // Keep BATCH_SIZE if it was correctly added by a previous step
        const INTER_CALL_DELAY_MS = 50; // Introduce this delay

        logger.log('fetchParametersForReferencedParts Thunk', `Thunk started. Original partIds received: ${partIds.join(', ')}`, { level: 'debug' });
        // ADD TEMP LOG
        // console.log(`[TEMP LOG - parameterThunks.ts:84] fetchParametersForReferencedParts: API Initialized: ${apiInitialized}`);

        if (!apiInitialized) {
            // ADD TEMP LOG
            // console.error('[TEMP LOG - parameterThunks.ts:88] fetchParametersForReferencedParts: API not initialized. Rejecting.');
            const errorMsg = 'API not initialized. Cannot fetch referenced parameters.';
            logger.error('fetchParametersForReferencedParts Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }

        if (!partIds || partIds.length === 0) {
            // ADD TEMP LOG
            // console.log('[TEMP LOG - parameterThunks.ts:95] fetchParametersForReferencedParts: No partIds provided. Returning empty object.');
            logger.log('fetchParametersForReferencedParts Thunk', 'No part IDs provided, skipping fetch.');
            return {};
        }

        const validPartIdsToFetch = partIds.filter(id => {
            const currentStatus = selectParameterLoadingStatus(state, id);
            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:103] fetchParametersForReferencedParts: Filtering partId ${id}. Current status: ${currentStatus}`);
            if (currentStatus === 'failed') {
                logger.warn('fetchParametersForReferencedParts Thunk', `Part ${id} previously failed. CONSIDER if this check is still needed or if fetchParametersForPart should always attempt.`);
                // ADD TEMP LOG
                // console.warn(`[TEMP LOG - parameterThunks.ts:113] fetchParametersForReferencedParts: PartId ${id} previously failed. SKIPPING (or consider removing this skip).`);
                return false; 
            }
            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:117] fetchParametersForReferencedParts: PartId ${id} is ${currentStatus}. INCLUDING for fetch.`);
            return true;
        });

        if (validPartIdsToFetch.length === 0) {
            // ADD TEMP LOG
            // console.log('[TEMP LOG - parameterThunks.ts:122] fetchParametersForReferencedParts: No valid partIds to fetch after filtering. Returning empty object.');
            logger.log('fetchParametersForReferencedParts Thunk', 'All provided part IDs are already loading, recently failed, or list was empty after filtering. Skipping API calls.');
            return {};
        }

        logger.log('fetchParametersForReferencedParts Thunk', `Attempting to fetch parameters for part IDs: ${validPartIdsToFetch.join(', ')} (after filtering). Original IDs: ${partIds.join(', ')}`);
        // ADD TEMP LOG
        // console.log(`[TEMP LOG - parameterThunks.ts:129] fetchParametersForReferencedParts: Valid partIds to fetch: ${validPartIdsToFetch.join(', ')}`);

        const results: Record<number, { data: ParameterDetail[]; error?: string }> = {};

        try {
            for (let i = 0; i < validPartIdsToFetch.length; i += BATCH_SIZE) {
                const batchPartIds = validPartIdsToFetch.slice(i, i + BATCH_SIZE);
                // ADD TEMP LOG
                // console.log(`[TEMP LOG - parameterThunks.ts:138] fetchParametersForReferencedParts: Processing batch: [${batchPartIds.join(', ')}]`);
                logger.log('fetchParametersForReferencedParts Thunk', `Processing batch: [${batchPartIds.join(', ')}]`, { level: 'debug' });

                for (const partId of batchPartIds) {
                    // ADD TEMP LOG
                    // console.log(`[TEMP LOG - parameterThunks.ts:143] fetchParametersForReferencedParts: In batch loop for partId: ${partId}. Dispatching fetchParametersForPart.`);
                    // logger.log('fetchParametersForReferencedParts Thunk', `Fetching parameters for partId: ${partId}`, { level: 'silly' });
                    try {
                        // Instead of direct API call, dispatch the individual thunk
                        // const parameters = await inventreeApiService.getPartParameters(partId);
                        // ADD TEMP LOG
                        // console.log(`[TEMP LOG - parameterThunks.ts:149] fetchParametersForReferencedParts: Dispatching fetchParametersForPart(${partId}) from within batch.`);
                        const resultAction = await dispatch(fetchParametersForPart(partId));
                        // ADD TEMP LOG
                        // console.log(`[TEMP LOG - parameterThunks.ts:152] fetchParametersForReferencedParts: Result action from dispatched fetchParametersForPart(${partId}):`, JSON.parse(JSON.stringify(resultAction || {})));

                        if (fetchParametersForPart.fulfilled.match(resultAction)) {
                            results[partId] = { data: resultAction.payload.parameters };
                            // ADD TEMP LOG
                            // console.log(`[TEMP LOG - parameterThunks.ts:157] fetchParametersForReferencedParts: fetchParametersForPart(${partId}) FULFILLED. Count: ${resultAction.payload.parameters.length}. Stored in results.`);
                            logger.log('fetchParametersForReferencedParts Thunk', `Fetched ${resultAction.payload.parameters.length} parameters for part ${partId}.`, { level: 'debug', partIdForContext: partId });
                        } else if (fetchParametersForPart.rejected.match(resultAction)) {
                            const errorMsg = `Nested fetch for part ${partId} rejected: ${resultAction.payload || resultAction.error.message}`;
                            results[partId] = { data: [], error: errorMsg };
                            // ADD TEMP LOG
                            // console.error(`[TEMP LOG - parameterThunks.ts:163] fetchParametersForReferencedParts: fetchParametersForPart(${partId}) REJECTED: ${errorMsg}`);
                            logger.error('fetchParametersForReferencedParts Thunk', errorMsg, { partIdForContext: partId, errorDetail: resultAction.payload || resultAction.error });
                        } else {
                            // Should not happen if thunk lifecycle is correct
                            const errorMsg = `Nested fetch for part ${partId} had unexpected result.`;
                            results[partId] = { data: [], error: errorMsg };
                            // ADD TEMP LOG
                            // console.error(`[TEMP LOG - parameterThunks.ts:170] fetchParametersForReferencedParts: fetchParametersForPart(${partId}) UNEXPECTED RESULT.`);
                            logger.error('fetchParametersForReferencedParts Thunk', errorMsg, { partIdForContext: partId, resultAction });
                        }
                    } catch (error: any) {
                        // This catch is for errors in dispatching or unwrap itself, not for the logic of the dispatched thunk
                        const errorMsg = `Critical error dispatching/handling fetch for part ${partId}: ${error?.message || String(error)}`;
                        // ADD TEMP LOG
                        // console.error(`[TEMP LOG - parameterThunks.ts:177] fetchParametersForReferencedParts: CRITICAL ERROR dispatching/handling fetch for part ${partId}: ${errorMsg}`);
                        logger.error('fetchParametersForReferencedParts Thunk', errorMsg, { partIdForContext: partId, errorDetail: error });
                        results[partId] = { data: [], error: errorMsg };
                    }

                    // Delay before the next call *within the same batch*, unless it's the very last ID overall or last in this specific batch
                    const isLastOverall = validPartIdsToFetch.indexOf(partId) === validPartIdsToFetch.length - 1;
                    const isLastInBatch = batchPartIds.indexOf(partId) === batchPartIds.length - 1;

                    if (!isLastOverall && !isLastInBatch) { // Only delay if there's another call coming *in this batch*
                         logger.log('fetchParametersForReferencedParts Thunk', `Delaying ${INTER_CALL_DELAY_MS}ms before next call in batch.`, { level: 'silly' });
                         await new Promise(resolve => setTimeout(resolve, INTER_CALL_DELAY_MS));
                    }
                }
                 // Optional: Add a small delay between batches if still seeing issues
                 // if (i + BATCH_SIZE < validPartIdsToFetch.length) {
                 //    logger.log('fetchParametersForReferencedParts Thunk', `Delaying 100ms before next BATCH.`, { level: 'debug' });
                 //    await new Promise(resolve => setTimeout(resolve, 100)); // e.g., 100ms between batches
                 // }
            }

            logger.log('fetchParametersForReferencedParts Thunk', `Finished processing parameter fetches for ${validPartIdsToFetch.length} parts.`);
            logger.log('fetchParametersForReferencedParts Thunk', 'Final results object being returned:', { data: results, level: 'debug' });
            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:202] fetchParametersForReferencedParts THUNK END. Returning results:`, JSON.parse(JSON.stringify(results)));
            return results; 
        } catch (batchError: any) { 
            // ADD TEMP LOG
            // console.error(`[TEMP LOG - parameterThunks.ts:206] fetchParametersForReferencedParts: CRITICAL BATCH ERROR: ${batchError.message}`, batchError);
            const errorMsg = `Critical error during batch processing in fetchParametersForReferencedParts: ${batchError.message || batchError}`;
            logger.error('fetchParametersForReferencedParts Thunk', errorMsg, {batchIds: validPartIdsToFetch});
            validPartIdsToFetch.forEach(id => {
                if (!results[id]) { 
                    results[id] = { data: [], error: `Batch processing error: ${errorMsg}` };
                }
            });
            return results;
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
        // ADD TEMP LOG
        // console.log(`[TEMP LOG - parameterThunks.ts:220] updateParameterValue THUNK START for partId: ${partId}, paramName: ${paramName}, value: ${value}`);
        const state = getState();
        const apiInitialized = selectApiInitialized(state);
        // ADD TEMP LOG
        // console.log(`[TEMP LOG - parameterThunks.ts:224] updateParameterValue: API Initialized: ${apiInitialized}`);

        if (!apiInitialized) {
            // ADD TEMP LOG
            // console.error('[TEMP LOG - parameterThunks.ts:228] updateParameterValue: API not initialized. Rejecting.');
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

            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:245] updateParameterValue: Parameter to update:`, JSON.parse(JSON.stringify(parameterToUpdate || null)));

            if (!parameterToUpdate) {
                 // ADD TEMP LOG
                // console.error(`[TEMP LOG - parameterThunks.ts:249] updateParameterValue: Parameter '${paramName}' not found for part ${partId}. Rejecting.`);
                 const errorMsg = `Parameter '${paramName}' not found in state for part ${partId}. Cannot get PK for update.`;
                 logger.error('updateParameterValue Thunk', errorMsg);
                 return rejectWithValue(errorMsg);
            }

            const parameterInstancePk = parameterToUpdate.pk;

            // Call the refactored service method with the instance PK
            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:257] updateParameterValue: Calling inventreeApiService.updatePartParameter(${parameterInstancePk}, ${value})`);
            const updateResult = await inventreeApiService.updatePartParameter(parameterInstancePk, value);
            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:260] updateParameterValue: inventreeApiService.updatePartParameter returned:`, JSON.parse(JSON.stringify(updateResult || null)));

            if (!updateResult) {
                // ADD TEMP LOG
                // console.error(`[TEMP LOG - parameterThunks.ts:264] updateParameterValue: API call returned null for update. Throwing error.`);
                throw new Error('API call to updatePartParameter returned null.');
            }

            logger.log('updateParameterValue Thunk', `Successfully updated param PK ${parameterInstancePk} (${paramName}) for part ${partId} to ${value}.`);
            // ADD TEMP LOG
            // console.log(`[TEMP LOG - parameterThunks.ts:270] updateParameterValue THUNK END. Success. Returning:`, JSON.parse(JSON.stringify({ partId, parameterName: paramName, value })));
            return { partId, parameterName: paramName, value };
        } catch (error: any) {
            // ADD TEMP LOG
            // console.error(`[TEMP LOG - parameterThunks.ts:274] updateParameterValue: ERROR for partId ${partId}, paramName ${paramName}:`, error.message, error);
            const errorMsg = `Failed to update parameter ${paramName} for part ${partId}: ${error.message || error}`;
            logger.error('updateParameterValue Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

// NEW Thunk: Fetches parameters based on declarative configuration in configSlice
export const fetchConfiguredParameters = createAsyncThunk<
  void, // Return type
  void, // Argument type (none for this thunk)
  { state: RootState; rejectValue: string }
>(
  'parameters/fetchConfigured',
  async (_, { dispatch, getState, rejectWithValue }) => {
    // ADD TEMP LOG
    // console.log('[TEMP LOG - parameterThunks.ts:284] fetchConfiguredParameters THUNK START');
    logger.log('ParameterThunk', 'Fetching parameters based on config.dataSources.inventreeParametersToFetch...');
    const state = getState();
    const apiInitialized = selectApiInitialized(state);
    // ADD TEMP LOG
    // console.log(`[TEMP LOG - parameterThunks.ts:289] fetchConfiguredParameters: API Initialized: ${apiInitialized}`);
    if (!apiInitialized) {
      // ADD TEMP LOG
      // console.warn('[TEMP LOG - parameterThunks.ts:292] fetchConfiguredParameters: API not initialized. Returning early.');
      logger.warn('ParameterThunk', 'API not initialized. Cannot fetch configured parameters.');
      return;
    }

    // ADD TEMP LOG
    // console.log('[TEMP LOG - parameterThunks.ts:298] fetchConfiguredParameters: Calling selectInventreeParametersToFetch(state)');
    const parametersToFetchConfig = selectInventreeParametersToFetch(state);
    // ADD TEMP LOG
    // console.log('[TEMP LOG - parameterThunks.ts:301] fetchConfiguredParameters: selectInventreeParametersToFetch returned:', JSON.parse(JSON.stringify(parametersToFetchConfig || [])));
    const allLoadedPartsMap = state.parts.partsById; 
    const allLoadedPartIds = Object.keys(allLoadedPartsMap).map(pk => parseInt(pk, 10));
    // ADD TEMP LOG
    // console.log('[TEMP LOG - parameterThunks.ts:305] fetchConfiguredParameters: All loaded part IDs:', JSON.parse(JSON.stringify(allLoadedPartIds)));

    if (!parametersToFetchConfig || parametersToFetchConfig.length === 0) {
      // ADD TEMP LOG
      // console.log('[TEMP LOG - parameterThunks.ts:309] fetchConfiguredParameters: No inventreeParametersToFetch configured. Returning early.');
      logger.log('ParameterThunk', 'No inventreeParametersToFetch configured. Skipping proactive parameter fetch.');
      return;
    }

    const partIdsToFetchSet = new Set<number>();

    parametersToFetchConfig.forEach((configEntry: InventreeParameterFetchConfig) => { 
      // ADD TEMP LOG
      // console.log('[TEMP LOG - parameterThunks.ts:318] fetchConfiguredParameters: Processing configEntry:', JSON.parse(JSON.stringify(configEntry)));
      if (configEntry.targetPartIds === 'all_loaded') {
        // ADD TEMP LOG
        // console.log('[TEMP LOG - parameterThunks.ts:321] fetchConfiguredParameters: targetPartIds is \'all_loaded\'. Adding all loaded part IDs to set.');
        allLoadedPartIds.forEach(id => partIdsToFetchSet.add(id));
      } else if (Array.isArray(configEntry.targetPartIds)) {
        // ADD TEMP LOG
        // console.log('[TEMP LOG - parameterThunks.ts:325] fetchConfiguredParameters: targetPartIds is an array. Adding to set:', JSON.parse(JSON.stringify(configEntry.targetPartIds)));
        configEntry.targetPartIds.forEach(id => {
          if (typeof id === 'number' && !isNaN(id)) {
            partIdsToFetchSet.add(id);
          }
        });
      }
      // The parameterNames and fetchOnlyIfUsed fields are noted but not directly used by this thunk's logic;
      // fetchParametersForReferencedParts fetches all parameters for the given IDs.
      // Future optimizations could pass specific parameter names if the API/thunk supports it.
    });

    const uniquePartIdsArray = Array.from(partIdsToFetchSet);
    // ADD TEMP LOG
    // console.log('[TEMP LOG - parameterThunks.ts:336] fetchConfiguredParameters: Unique part IDs to fetch:', JSON.parse(JSON.stringify(uniquePartIdsArray)));

    if (uniquePartIdsArray.length > 0) {
      logger.log('ParameterThunk', `Dispatching fetchParametersForReferencedParts for configured part IDs: ${uniquePartIdsArray.join(', ')}`);
      // ADD TEMP LOG
      // console.log(`[TEMP LOG - parameterThunks.ts:341] fetchConfiguredParameters: Dispatching fetchParametersForReferencedParts with IDs: ${uniquePartIdsArray.join(', ')}`);
      try {
        // ADD TEMP LOG
        // console.log('[TEMP LOG - parameterThunks.ts:344] fetchConfiguredParameters: AWAITING dispatch(fetchParametersForReferencedParts(...)).unwrap()');
        await dispatch(fetchParametersForReferencedParts(uniquePartIdsArray)).unwrap();
        // ADD TEMP LOG
        // console.log('[TEMP LOG - parameterThunks.ts:347] fetchConfiguredParameters: fetchParametersForReferencedParts dispatch UNWRAPPED successfully.');
        logger.log('ParameterThunk', `Successfully initiated fetch for configured parameters. Parts: ${uniquePartIdsArray.join(', ')}`);
      } catch (error) {
        // ADD TEMP LOG
        // console.error('[TEMP LOG - parameterThunks.ts:351] fetchConfiguredParameters: ERROR during fetchParametersForReferencedParts dispatch/unwrap:', error);
        logger.error('ParameterThunk', `Failed to fetch some configured parameters. Parts: ${uniquePartIdsArray.join(', ')}`, { error });
      }
    } else {
      // ADD TEMP LOG
      // console.log('[TEMP LOG - parameterThunkscard/src/store/thunks/parameterThunks.ts:356] fetchConfiguredParameters: No unique part IDs derived. SKIPPING dispatch of fetchParametersForReferencedParts.');
      logger.log('ParameterThunk', 'No specific part IDs derived from inventreeParametersToFetch configuration.');
    }
    // ADD TEMP LOG
    // console.log('[TEMP LOG - parameterThunks.ts:360] fetchConfiguredParameters THUNK END');
  }
);