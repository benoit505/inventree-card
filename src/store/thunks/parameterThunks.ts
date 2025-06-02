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

// REMOVED: import { selectInventreeParametersToFetch } from '../slices/configSlice'; // No longer selecting from configSlice here
// REMOVED: import { ConditionalEffectsEngine } from '../../core/ConditionalEffectsEngine';

// Import the API slice for dispatching RTK Query actions
import { inventreeApi } from '../apis/inventreeApi';

const logger = Logger.getInstance();

// Thunk to initialize conditions and fetch required parameters
// REMOVED: Old initializeConditionsAndParameters thunk (lines ~40-160)
// ... (Thunk code was here)

// Thunk to fetch parameters for multiple part IDs
export const fetchParametersForReferencedParts = createAsyncThunk<
    void, // This thunk will now dispatch RTK Query actions, not return data directly for the slice
    number[],
    { state: RootState; rejectValue: string }
>(
    'parameters/fetchForReferencedParts',
    async (partIds, { getState, rejectWithValue, dispatch }) => {
        const state = getState();
        const apiInitialized = selectApiInitialized(state);
        const BATCH_SIZE = 5; 
        const INTER_CALL_DELAY_MS = 50;

        logger.log('fetchParametersForReferencedParts Thunk', `Thunk started. Original partIds received: ${partIds.join(', ')}`, { level: 'debug' });

        if (!apiInitialized) {
            const errorMsg = 'API not initialized. Cannot fetch referenced parameters.';
            logger.error('fetchParametersForReferencedParts Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }

        if (!partIds || partIds.length === 0) {
            logger.log('fetchParametersForReferencedParts Thunk', 'No part IDs provided, skipping fetch.');
            return; 
        }

        const validPartIdsToFetch = partIds.filter(id => {
            // With RTK Query, we don't need to check loading status here as RTK Query handles it.
            // We might still want to filter out IDs that are known to be invalid or don't exist.
            // For now, let's assume all provided partIds are candidates for fetching.
            return true;
        });


        if (validPartIdsToFetch.length === 0) {
            logger.log('fetchParametersForReferencedParts Thunk', 'No valid part IDs to fetch after filtering. Skipping API calls.');
            return; 
        }

        logger.log('fetchParametersForReferencedParts Thunk', `Attempting to initiate parameter fetches for part IDs: ${validPartIdsToFetch.join(', ')}`);
        
        let successCount = 0;
        let failureCount = 0;

        try {
            for (let i = 0; i < validPartIdsToFetch.length; i += BATCH_SIZE) {
                const batchPartIds = validPartIdsToFetch.slice(i, i + BATCH_SIZE);
                logger.log('fetchParametersForReferencedParts Thunk', `Processing batch: [${batchPartIds.join(', ')}]`, { level: 'debug' });

                for (const partId of batchPartIds) {
                    try {
                        logger.log('fetchParametersForReferencedParts Thunk', `Initiating getPartParameters query for partId: ${partId}`, { level: 'silly' });
                        // Dispatch RTK Query action to fetch parameters for the partId
                        // The `initiate` action returns a promise that resolves with the query result or rejects on error.
                        const promise = dispatch(inventreeApi.endpoints.getPartParameters.initiate(partId));
                        // We can choose to await promise.unwrap() if we need the result/error immediately
                        // or just let RTK Query handle it in the background.
                        // For this thunk, we primarily want to trigger the fetches.
                        promise.then(() => {
                            successCount++;
                        }).catch((err) => {
                            failureCount++;
                        }); 
                        // If not awaiting, apply delay immediately for the next call in the batch
                        if (batchPartIds.indexOf(partId) < batchPartIds.length - 1) { // If not last in batch
                            await new Promise(resolve => setTimeout(resolve, INTER_CALL_DELAY_MS));
                        }
                    } catch (error: any) {
                        failureCount++;
                        logger.error('fetchParametersForReferencedParts Thunk', `Error initiating getPartParameters for part ${partId}: ${error?.message || String(error)}`, { partIdForContext: partId, errorDetail: error });
                    }
                }
            }
            logger.log('fetchParametersForReferencedParts Thunk', `Finished initiating parameter fetches for ${validPartIdsToFetch.length} parts. Successes: ${successCount}, Failures (to initiate): ${failureCount}`);
            return; // Thunk completes after initiating all fetches
        } catch (batchError: any) { 
            const errorMsg = `Critical error during batch processing in fetchParametersForReferencedParts: ${batchError.message || batchError}`;
            logger.error('fetchParametersForReferencedParts Thunk', errorMsg, {batchIds: validPartIdsToFetch});
            return rejectWithValue(errorMsg);
        }
    }
);

// Thunk to update a single parameter value
export const updateParameterValue = createAsyncThunk<
    ParameterDetail, // Return type: The updated ParameterDetail from the mutation
    { partId: number; paramName: string; value: string },    // Argument type
    { state: RootState; rejectValue: string }                 // Thunk config
>(
    'parameters/updateValue',
    async ({ partId, paramName, value }, { getState, rejectWithValue, dispatch }) => {
        const state = getState();
        const apiInitialized = selectApiInitialized(state);

        if (!apiInitialized) {
            const errorMsg = 'API not initialized. Cannot update parameter.';
            logger.error('updateParameterValue Thunk', errorMsg);
            return rejectWithValue(errorMsg);
        }

        try {
            // Get parameterPk from RTK Query cache
            const partParametersQueryKey = `getPartParameters(${partId})`;
            const cachedParametersData = state.inventreeApi.queries[partParametersQueryKey]?.data as ParameterDetail[] | undefined;

            if (!cachedParametersData) {
                const errorMsg = `Parameters for part ${partId} not found in RTK Query cache. Cannot determine parameter PK for '${paramName}'.`;
                logger.warn('updateParameterValue Thunk', errorMsg);
                // Optionally, we could try to fetch them here if not found, but for an update operation,
                // it's generally assumed the data context (parameters) should already exist.
                // For now, we will reject if not found in cache.
                return rejectWithValue(errorMsg);
            }

            const parameterToUpdate = cachedParametersData.find(p => p.template_detail?.name === paramName);

            if (!parameterToUpdate) {
                 const errorMsg = `Parameter '${paramName}' not found for part ${partId} in cached data. Cannot get PK for update.`;
                 logger.error('updateParameterValue Thunk', errorMsg);
                 return rejectWithValue(errorMsg);
            }

            const parameterPk = parameterToUpdate.pk;

            logger.log('updateParameterValue Thunk', `Attempting to update param PK ${parameterPk} ('${paramName}') for part ${partId} to '${value}' via RTK Query mutation.`);

            // Dispatch the RTK Query mutation
            const updateResult = await dispatch(
                inventreeApi.endpoints.updatePartParameter.initiate({ partId, parameterPk, value })
            ).unwrap(); // Use unwrap to get the actual result or throw an error

            logger.log('updateParameterValue Thunk', `Successfully updated param PK ${parameterPk} ('${paramName}') for part ${partId} to '${value}'. Result:`, { data: updateResult });
            return updateResult; // The mutation itself returns ParameterDetail | null. Assuming success means ParameterDetail.
        } catch (error: any) {
            const errorMsg = `Failed to update parameter ${paramName} for part ${partId}: ${error.data?.message || error.message || String(error)}`;
            logger.error('updateParameterValue Thunk', errorMsg, { errorData: error });
            return rejectWithValue(errorMsg);
        }
    }
);

// NEW Thunk: Fetches parameters based on declarative configuration passed as argument
export const fetchConfiguredParameters = createAsyncThunk<
  void, // Return type
  InventreeParameterFetchConfig[], // Argument type: the configuration itself
  { state: RootState; rejectValue: string }
>(
  'parameters/fetchConfigured',
  async (parametersToFetchConfig, { dispatch, getState, rejectWithValue }) => { // Changed first arg
    logger.log('ParameterThunk', 'Fetching parameters based on config.dataSources.inventreeParametersToFetch...');
    const state = getState();
    const apiInitialized = selectApiInitialized(state);
    if (!apiInitialized) {
      logger.warn('ParameterThunk', 'API not initialized. Cannot fetch configured parameters.');
      return;
    }

    const allLoadedPartsMap = state.parts.partsById; 
    const allLoadedPartIds = Object.keys(allLoadedPartsMap).map(pk => parseInt(pk, 10));

    if (!parametersToFetchConfig || parametersToFetchConfig.length === 0) {
      logger.log('ParameterThunk', 'No inventreeParametersToFetch configured. Skipping proactive parameter fetch.');
      return;
    }

    const partIdsToFetchSet = new Set<number>();

    parametersToFetchConfig.forEach((configEntry: InventreeParameterFetchConfig) => { 
      if (configEntry.targetPartIds === 'all_loaded') {
        allLoadedPartIds.forEach(id => partIdsToFetchSet.add(id));
      } else if (Array.isArray(configEntry.targetPartIds)) {
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

    if (uniquePartIdsArray.length > 0) {
      logger.log('ParameterThunk', `Dispatching fetchParametersForReferencedParts for configured part IDs: ${uniquePartIdsArray.join(', ')}`);
      try {
        await dispatch(fetchParametersForReferencedParts(uniquePartIdsArray)).unwrap();
        logger.log('ParameterThunk', `Successfully initiated fetch for configured parameters. Parts: ${uniquePartIdsArray.join(', ')}`);
      } catch (error) {
        logger.error('ParameterThunk', `Failed to fetch some configured parameters. Parts: ${uniquePartIdsArray.join(', ')}`, { error });
      }
    } else {
      logger.log('ParameterThunk', 'No specific part IDs derived from inventreeParametersToFetch configuration.');
    }
  }
);