import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConditionalLogicItem } from '../../types';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface ConditionalLogicState {
  definedLogicItems: ConditionalLogicItem[];
  // We could add status flags here if needed, e.g., 'initializing', 'ready'
}

const initialState: ConditionalLogicState = {
  definedLogicItems: [],
};

const conditionalLogicSlice = createSlice({
  name: 'conditionalLogic',
  initialState,
  reducers: {
    setDefinedLogicItems(state: ConditionalLogicState, action: PayloadAction<ConditionalLogicItem[]>) {
      state.definedLogicItems = action.payload;
      logger.log('conditionalLogicSlice', `Set ${state.definedLogicItems.length} defined logic items.`);
    },
    clearAllConditions(state: ConditionalLogicState) {
      state.definedLogicItems = [];
      logger.log('conditionalLogicSlice', 'Cleared all defined logic items.');
    }
  },
  // extraReducers: (builder) => {
    // Potentially handle thunk lifecycle for initializeRuleDefinitionsThunk if needed
  // }
});

export const {
  setDefinedLogicItems,
  clearAllConditions
} = conditionalLogicSlice.actions;

// Selectors
export const selectDefinedLogicItems = (state: RootState): ConditionalLogicItem[] => state.conditionalLogic.definedLogicItems;

export default conditionalLogicSlice.reducer; 