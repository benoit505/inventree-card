import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

// --- STATE STRUCTURE ---
export interface HaEntityState {
  entity_id: string; // Include entity_id here for easier object mapping if needed
  state: string | number | boolean;
  attributes: Record<string, any>;
  last_updated: string;
  last_changed: string; // Also useful for conditions
}

export interface GenericHaStates {
  entities: Record<string, HaEntityState | undefined>; // Keyed by entity_id
  // Future: loading/error states for individual entities if needed
  // loading: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  // error: Record<string, string | null>;
}

const initialState: GenericHaStates = {
  entities: {},
  // loading: {},
  // error: {},
};

// --- SLICE DEFINITION ---
const genericHaStateSlice = createSlice({
  name: 'genericHaStates',
  initialState,
  reducers: {
    setEntityState(state: GenericHaStates, action: PayloadAction<HaEntityState>) {
      const entity = action.payload;
      if (entity && entity.entity_id) {
        state.entities[entity.entity_id] = entity;
        logger.log('genericHaStateSlice', `Set state for entity: ${entity.entity_id}` , { data: entity, level: 'debug' });
      } else {
        logger.warn('genericHaStateSlice', 'setEntityState called with invalid payload', { data: action.payload });
      }
    },
    setEntityStatesBatch(state: GenericHaStates, action: PayloadAction<HaEntityState[]>) {
      const entities = action.payload;
      if (entities && Array.isArray(entities)) {
        let count = 0;
        entities.forEach(entity => {
          if (entity && entity.entity_id) {
            state.entities[entity.entity_id] = entity;
            count++;
          }
        });
        logger.log('genericHaStateSlice', `Set batch of ${count} entity states.`, { level: 'debug' });
      } else {
        logger.warn('genericHaStateSlice', 'setEntityStatesBatch called with invalid payload', { data: action.payload });
      }
    },
    removeEntityState(state: GenericHaStates, action: PayloadAction<string>) {
      const entityId = action.payload;
      if (entityId && state.entities[entityId]) {
        delete state.entities[entityId];
        // Optionally, also clear loading/error states if implemented
        // if (state.loading[entityId]) delete state.loading[entityId];
        // if (state.error[entityId]) delete state.error[entityId];
        logger.log('genericHaStateSlice', `Removed state for entity: ${entityId}`, { level: 'debug' });
      }
    },
    clearAllGenericHaStates(state: GenericHaStates) {
      state.entities = {};
      // state.loading = {};
      // state.error = {};
      logger.log('genericHaStateSlice', 'Cleared all generic HA entity states.');
    },
  },
  // extraReducers: builder => {
  //   // Handle pending/fulfilled/rejected for thunks fetching these states if we add them
  // }
});

// --- ACTIONS ---
export const {
  setEntityState,
  setEntityStatesBatch,
  removeEntityState,
  clearAllGenericHaStates,
} = genericHaStateSlice.actions;

// --- SELECTORS ---
export const selectAllGenericHaStates = (state: RootState): Record<string, HaEntityState | undefined> => 
  state.genericHaStates.entities;

export const selectGenericHaEntityState = (state: RootState, entityId: string): HaEntityState | undefined => 
  state.genericHaStates.entities[entityId];

// Example: Selector to get just the 'state' value of a generic HA entity
export const selectGenericHaEntityActualState = (state: RootState, entityId: string): string | number | boolean | undefined => 
  state.genericHaStates.entities[entityId]?.state;

// Example: Selector to get a specific attribute of a generic HA entity
export const selectGenericHaEntityAttribute = (state: RootState, entityId: string, attributeName: string): any | undefined => 
  state.genericHaStates.entities[entityId]?.attributes?.[attributeName];

// --- REDUCER EXPORT ---
export default genericHaStateSlice.reducer; 