import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConditionRuleDefinition, ProcessedCondition } from '../../types'; // MODIFIED: Import ProcessedCondition from ../../types
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface ConditionalLogicState {
  rawRuleDefinitions: ConditionRuleDefinition[];
  processedConditions: ProcessedCondition[];
  // We could add status flags here if needed, e.g., 'initializing', 'ready'
}

const initialState: ConditionalLogicState = {
  rawRuleDefinitions: [],
  processedConditions: [],
};

const conditionalLogicSlice = createSlice({
  name: 'conditionalLogic',
  initialState,
  reducers: {
    setRawRuleDefinitions(state: ConditionalLogicState, action: PayloadAction<ConditionRuleDefinition[]>) {
      state.rawRuleDefinitions = action.payload;
      logger.log('conditionalLogicSlice', `Set ${action.payload.length} raw rule definitions.`);
    },
    setProcessedConditions(state: ConditionalLogicState, action: PayloadAction<ProcessedCondition[]>) {
      state.processedConditions = action.payload;
      logger.log('conditionalLogicSlice', `Set ${action.payload.length} processed conditions.`);
    },
    clearAllConditions(state: ConditionalLogicState) {
      state.rawRuleDefinitions = [];
      state.processedConditions = [];
      logger.log('conditionalLogicSlice', 'Cleared all raw and processed conditions.');
    }
  },
  // extraReducers: (builder) => {
    // Potentially handle thunk lifecycle for initializeRuleDefinitionsThunk if needed
  // }
});

export const {
  setRawRuleDefinitions,
  setProcessedConditions,
  clearAllConditions
} = conditionalLogicSlice.actions;

// Selectors
export const selectRawRuleDefinitions = (state: RootState): ConditionRuleDefinition[] => state.conditionalLogic.rawRuleDefinitions;
export const selectProcessedConditions = (state: RootState): ProcessedCondition[] => state.conditionalLogic.processedConditions;

export default conditionalLogicSlice.reducer; 