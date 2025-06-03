import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { 
    ConditionalLogicItem,
    // ParameterOperator, // No longer directly used here for ProcessedCondition creation
    // RuleGroupType, // No longer directly used here for ProcessedCondition creation
    // RuleType // No longer directly used here for ProcessedCondition creation
} from '../../types';
import { Logger } from '../../core/logger';
// import { generateSimpleId } from '../../utils/generateSimpleId'; // No longer needed here
import {
  setDefinedLogicItems,
  selectDefinedLogicItems // Added selector
} from '../slices/conditionalLogicSlice'; // Removed setProcessedConditions
import { ConditionalEffectsEngine } from '../../core/ConditionalEffectsEngine';

const logger = Logger.getInstance();

// parseSourceString and extractAllRules are no longer needed here as processing moves to the engine

export const evaluateAndApplyEffectsThunk = createAsyncThunk<
  void,
  { cardInstanceId?: string; forceReevaluation?: boolean; /* logicItems argument removed, will be fetched from state */ },
  { state: RootState; dispatch: AppDispatch }
>('conditionalLogic/evaluateAndApplyEffects', async ({ cardInstanceId, forceReevaluation = false }, { dispatch, getState }) => {
  const cardId = cardInstanceId || 'undefined_card';
  const state = getState();
  const logicItemsToEvaluate = selectDefinedLogicItems(state); // Fetch logic items from state

  logger.debug('evaluateAndApplyEffectsThunk', `START for cardInstanceId: ${cardId}`, { data: { logicItems: logicItemsToEvaluate } });
  const engine = new ConditionalEffectsEngine(dispatch, getState);
  // Pass the fetched logicItems to the engine
  await engine.evaluateAndApplyEffects(cardId, forceReevaluation, logicItemsToEvaluate);
  logger.debug('evaluateAndApplyEffectsThunk', `END for cardInstanceId: ${cardId}`);
});

export const initializeRuleDefinitionsThunk = createAsyncThunk<
  void,
  ConditionalLogicItem[], // Expects the new structure
  { dispatch: AppDispatch; /* state: RootState // getState not needed here anymore */ }
>('conditionalLogic/initializeRuleDefinitions', async (logicItems, { dispatch }) => {
  logger.debug('initializeRuleDefinitionsThunk', 'Initializing rule definitions (now ConditionalLogicItems with logicPairs)...', { data: logicItems });
  
  // Directly store the received logicItems (which should have the new structure)
  dispatch(setDefinedLogicItems(logicItems || []));

  logger.debug('initializeRuleDefinitionsThunk', `Stored ${logicItems?.length || 0} defined logic items.`);
  
  // No more transformation to ProcessedCondition here.
  // After defining logic items, trigger an initial evaluation.
  dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: 'undefined_card', forceReevaluation: true }));
});