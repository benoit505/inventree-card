import { createAsyncThunk } from '@reduxjs/toolkit';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index'; // Adjusted path for RootState
import { HaEntityState, setEntityStatesBatch } from '../slices/genericHaStateSlice';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export const fetchHaEntityStatesThunk = createAsyncThunk<
  HaEntityState[], // Return type: an array of the fetched/processed entity states
  { hass: HomeAssistant; entityIds: string[] }, // Argument type: HASS object and an array of entity IDs
  { state: RootState; rejectValue: string }
>(
  'genericHaStates/fetchStates',
  async ({ hass, entityIds }, { rejectWithValue, dispatch }) => {
    logger.log('fetchHaEntityStatesThunk', `Fetching states for entities: ${entityIds.join(', ')}` , { level: 'debug' });

    if (!hass || !hass.states) {
      const errorMsg = 'HASS object or hass.states is not available.';
      logger.error('fetchHaEntityStatesThunk', errorMsg);
      return rejectWithValue(errorMsg);
    }

    if (!entityIds || entityIds.length === 0) {
      logger.log('fetchHaEntityStatesThunk', 'No entity IDs provided. Returning empty array.', { level: 'debug' });
      return [];
    }

    const fetchedStates: HaEntityState[] = [];

    for (const entityId of entityIds) {
      const entityState = hass.states[entityId];
      if (entityState) {
        const processedState: HaEntityState = {
          entity_id: entityId,
          state: entityState.state,
          attributes: entityState.attributes,
          last_changed: entityState.last_changed,
          last_updated: entityState.last_updated,
        };
        fetchedStates.push(processedState);
      } else {
        logger.warn('fetchHaEntityStatesThunk', `State for entity ${entityId} not found in HASS object.`);
        // Optionally, still push a representation of a missing/unavailable entity
        // For now, we just skip it or log.
      }
    }

    if (fetchedStates.length > 0) {
      logger.log('fetchHaEntityStatesThunk', `Dispatching setEntityStatesBatch with ${fetchedStates.length} states.`, { level: 'debug' });
      dispatch(setEntityStatesBatch(fetchedStates));
    } else {
      logger.log('fetchHaEntityStatesThunk', 'No states were successfully fetched or processed.', { level: 'debug' });
    }
    
    return fetchedStates; // Return the states for potential direct use or further processing by the caller
  }
); 