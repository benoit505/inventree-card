import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { InventreeItem } from '../../types';
import { selectApiInitialized } from '../slices/apiSlice';
import { addParts } from '../slices/partsSlice'; // Assuming addParts can take an array
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';
import { inventreeApi } from '../apis/inventreeApi'; // Added import for RTK Query API

const logger = Logger.getInstance();

export const fetchPartsByPks = createAsyncThunk<
  InventreeItem[], // Return type: the fetched parts
  number[],          // Argument type: array of part PKs
  { state: RootState; rejectValue: string }
>(
  'parts/fetchByPks',
  async (partPks, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const apiInitialized = selectApiInitialized(state);

    if (!apiInitialized) {
      const errorMsg = 'API not initialized. Cannot fetch parts by PKs.';
      logger.error('fetchPartsByPks Thunk', errorMsg);
      return rejectWithValue(errorMsg);
    }

    if (!partPks || partPks.length === 0) {
      logger.log('fetchPartsByPks Thunk', 'No part PKs provided, skipping fetch.');
      return []; // Return empty array if no PKs
    }

    logger.log('fetchPartsByPks Thunk', `Fetching ${partPks.length} parts by PKs via RTK Query: ${partPks.join(', ')}`);

    try {
      // Dispatch getPart query for each part PK using Promise.allSettled
      const settledPromises = await Promise.allSettled(
        partPks.map(pk => dispatch(inventreeApi.endpoints.getPart.initiate(pk)).unwrap())
      );

      const fetchedParts: InventreeItem[] = [];
      settledPromises.forEach((result, index) => {
        const pk = partPks[index];
        if (result.status === 'fulfilled' && result.value) {
          // Add a source to the part before adding to the list
          // The result.value should be the InventreeItem directly from the unwrap()
          fetchedParts.push({ ...result.value, source: 'api:direct_pk_rtk' }); 
        } else if (result.status === 'rejected') {
          logger.error('fetchPartsByPks Thunk', `Failed to fetch part PK ${pk} via RTK Query:`, { reason: result.reason });
          // Optionally, collect errors or decide if one failure should reject the whole thunk
        }
      });

      if (fetchedParts.length > 0) {
        logger.log('fetchPartsByPks Thunk', `Successfully fetched ${fetchedParts.length}/${partPks.length} parts via RTK Query.`);
      } else if (partPks.length > 0) {
        logger.warn('fetchPartsByPks Thunk', 'No parts were successfully fetched via RTK Query.');
      }
      
      return fetchedParts; // Return the array of fetched parts

    } catch (error: any) {
      // This catch block might be less likely to be hit if errors are handled per-promise by allSettled and unwrap
      // However, it's good for unexpected issues during the mapping or dispatching phase itself.
      const errorMsg = `Generic error in fetchPartsByPks (RTK Query): ${error.message || error}`;
      logger.error('fetchPartsByPks Thunk', errorMsg, { errorData: error });
      return rejectWithValue(errorMsg);
    }
  }
); 