import { createAsyncThunk } from '@reduxjs/toolkit';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index'; // Adjusted path for RootState
import { HaEntityState, setEntityStatesBatch } from '../slices/genericHaStateSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('genericHaStateThunks');
ConditionalLoggerEngine.getInstance().registerCategory('genericHaStateThunks', { enabled: false, level: 'info' });

export const fetchHaEntityStatesThunk = createAsyncThunk<
  HaEntityState[],
  { hass: HomeAssistant; entityIds: string[] },
  { state: RootState; rejectValue: string }
>(
  'genericHaStates/fetchStates',
  async ({ hass, entityIds }, { rejectWithValue, dispatch }) => {
    logger.debug('fetchHaEntityStatesThunk', `Fetching states for entities: ${entityIds.join(', ')}`);

    if (!hass || !hass.states) {
      const errorMsg = 'HASS object or hass.states is not available.';
      logger.error('fetchHaEntityStatesThunk', errorMsg);
      return rejectWithValue(errorMsg);
    }

    if (!entityIds || entityIds.length === 0) {
      logger.debug('fetchHaEntityStatesThunk', 'No entity IDs provided. Returning empty array.');
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
      }
    }

    if (fetchedStates.length > 0) {
      logger.debug('fetchHaEntityStatesThunk', `Dispatching setEntityStatesBatch with ${fetchedStates.length} states.`);
      dispatch(setEntityStatesBatch(fetchedStates));
    } else {
      logger.debug('fetchHaEntityStatesThunk', 'No states were successfully fetched or processed.');
    }
    
    return fetchedStates;
  }
); 