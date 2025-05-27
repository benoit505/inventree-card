import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { InventreeItem } from '../../types';
import { selectApiInitialized } from '../slices/apiSlice';
import { addParts } from '../slices/partsSlice'; // Assuming addParts can take an array
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';

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

    logger.log('fetchPartsByPks Thunk', `Fetching ${partPks.length} parts by PKs: ${partPks.join(', ')}`);

    try {
      // Fetch each part individually using Promise.allSettled
      const settledPromises = await Promise.allSettled(
        partPks.map(pk => inventreeApiService.getPart(pk))
      );

      const fetchedParts: InventreeItem[] = [];
      settledPromises.forEach((result, index) => {
        const pk = partPks[index];
        if (result.status === 'fulfilled' && result.value) {
          // Add a source to the part before adding to the list
          fetchedParts.push({ ...result.value, source: 'api:direct_pk' });
        } else if (result.status === 'rejected') {
          logger.error('fetchPartsByPks Thunk', `Failed to fetch part PK ${pk}:`, result.reason);
          // Optionally, you could collect errors or decide if one failure should reject the whole thunk
        }
      });

      if (fetchedParts.length > 0) {
        logger.log('fetchPartsByPks Thunk', `Successfully fetched ${fetchedParts.length}/${partPks.length} parts. Dispatching addParts.`);
        // The addParts reducer expects an array of InventreeItem
        // dispatch(addParts(fetchedParts)); // Dispatching happens where the thunk is called, not within another thunk usually
        // This thunk should return the data for the calling code to dispatch
      } else if (partPks.length > 0) {
        logger.warn('fetchPartsByPks Thunk', 'No parts were successfully fetched.');
      }
      
      return fetchedParts; // Return the array of fetched parts

    } catch (error: any) {
      const errorMsg = `Generic error in fetchPartsByPks: ${error.message || error}`;
      logger.error('fetchPartsByPks Thunk', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
); 