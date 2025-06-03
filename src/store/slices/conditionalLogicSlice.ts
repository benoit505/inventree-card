import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConditionalLogicItem, ProcessedCondition } from '../../types';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface ConditionalLogicState {
  definedLogicItems: ConditionalLogicItem[];
  processedConditions: ProcessedCondition[];
  // We could add status flags here if needed, e.g., 'initializing', 'ready'
}

const initialState: ConditionalLogicState = {
  definedLogicItems: [],
  processedConditions: [],
};

const conditionalLogicSlice = createSlice({
  name: 'conditionalLogic',
  initialState,
  reducers: {
    setDefinedLogicItems(state: ConditionalLogicState, action: PayloadAction<ConditionalLogicItem[]>) {
      state.definedLogicItems = action.payload;
      logger.log('conditionalLogicSlice', `Set ${state.definedLogicItems.length} defined logic items.`);
    },
    setProcessedConditions(state: ConditionalLogicState, action: PayloadAction<ProcessedCondition[]>) {
      state.processedConditions = action.payload;
      logger.log('conditionalLogicSlice', `Set ${state.processedConditions.length} processed conditions.`);
    },
    clearAllConditions(state: ConditionalLogicState) {
      state.definedLogicItems = [];
      state.processedConditions = [];
      logger.log('conditionalLogicSlice', 'Cleared all conditions (defined logic items and processed).');
    }
  },
  // extraReducers: (builder) => {
    // Potentially handle thunk lifecycle for initializeRuleDefinitionsThunk if needed
  // }
});

export const {
  setDefinedLogicItems,
  setProcessedConditions,
  clearAllConditions
} = conditionalLogicSlice.actions;

// Selectors
export const selectDefinedLogicItems = (state: RootState): ConditionalLogicItem[] => state.conditionalLogic.definedLogicItems;
export const selectProcessedConditions = (state: RootState): ProcessedCondition[] => state.conditionalLogic.processedConditions;

export default conditionalLogicSlice.reducer; 