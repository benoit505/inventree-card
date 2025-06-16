import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConditionalLogicItem } from '../../types';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface ConditionalLogicState {
  definedLogicsByInstance: Record<string, ConditionalLogicItem[]>;
}

const initialState: ConditionalLogicState = {
  definedLogicsByInstance: {},
};

const conditionalLogicSlice = createSlice({
  name: 'conditionalLogic',
  initialState,
  reducers: {
    setDefinedLogicItems(state: ConditionalLogicState, action: PayloadAction<{ logics: ConditionalLogicItem[], cardInstanceId: string }>) {
      const { logics, cardInstanceId } = action.payload;
      state.definedLogicsByInstance[cardInstanceId] = logics;
      logger.log('conditionalLogicSlice', `Set ${logics.length} defined logic items for instance ${cardInstanceId}.`);
    },
    removeDefinedLogicItemsForCard(state: ConditionalLogicState, action: PayloadAction<{ cardInstanceId: string }>) {
        delete state.definedLogicsByInstance[action.payload.cardInstanceId];
        logger.log('conditionalLogicSlice', `Removed defined logic items for instance ${action.payload.cardInstanceId}.`);
    },
    clearAllConditions(state: ConditionalLogicState) {
      state.definedLogicsByInstance = {};
      logger.log('conditionalLogicSlice', 'Cleared all defined logic items.');
    }
  },
  // extraReducers: (builder) => {
    // Potentially handle thunk lifecycle for initializeRuleDefinitionsThunk if needed
  // }
});

export const {
  setDefinedLogicItems,
  removeDefinedLogicItemsForCard,
  clearAllConditions
} = conditionalLogicSlice.actions;

// Selectors
export const selectDefinedLogicItems = (state: RootState, cardInstanceId: string): ConditionalLogicItem[] => {
    return state.conditionalLogic.definedLogicsByInstance[cardInstanceId] || [];
}

export default conditionalLogicSlice.reducer; 