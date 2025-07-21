import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConditionalLogicItem } from '../../types';
import { RootState } from '../index';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('conditionalLogicSlice');
ConditionalLoggerEngine.getInstance().registerCategory('conditionalLogicSlice', { enabled: false, level: 'info' });

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
      logger.info('setDefinedLogicItems', `Set ${logics.length} defined logic items for instance ${cardInstanceId}.`);
    },
    removeDefinedLogicItemsForCard(state: ConditionalLogicState, action: PayloadAction<{ cardInstanceId: string }>) {
        delete state.definedLogicsByInstance[action.payload.cardInstanceId];
        logger.info('removeDefinedLogicItemsForCard', `Removed defined logic items for instance ${action.payload.cardInstanceId}.`);
    },
    clearAllConditions(state: ConditionalLogicState) {
      state.definedLogicsByInstance = {};
      logger.info('clearAllConditions', 'Cleared all defined logic items.');
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