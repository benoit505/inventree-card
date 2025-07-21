import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { 
    ConditionalLogicItem,
    // ParameterOperator, // No longer directly used here for ProcessedCondition creation
    // RuleGroupType, // No longer directly used here for ProcessedCondition creation
    // RuleType // No longer directly used here for ProcessedCondition creation
} from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
// import { generateSimpleId } from '../../utils/generateSimpleId'; // No longer needed here
import {
  setDefinedLogicItems,
  selectDefinedLogicItems
} from '../slices/conditionalLogicSlice';
import { selectActiveCardInstanceIds } from '../slices/componentSlice';
import { ConditionalEffectsEngine } from '../../core/ConditionalEffectsEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('conditionalLogicThunks');
ConditionalLoggerEngine.getInstance().registerCategory('conditionalLogicThunks', { enabled: false, level: 'info' });

// parseSourceString and extractAllRules are no longer needed here as processing moves to the engine

export const evaluateAndApplyEffectsThunk = createAsyncThunk<
  void,
  { cardInstanceId: string },
  { state: RootState, dispatch: AppDispatch }
>('conditionalLogic/evaluateAndApplyEffects', async ({ cardInstanceId }, { dispatch, getState }) => {
  logger.debug('evaluateAndApplyEffectsThunk', `Running for card instance: ${cardInstanceId}`);
  const state = getState();
  const logicItems = selectDefinedLogicItems(state, cardInstanceId);
  const engine = new ConditionalEffectsEngine(dispatch, getState);
  try {
    logger.debug('evaluateAndApplyEffectsThunk', `About to call engine.evaluateAndApplyEffects with ${logicItems.length} logic items for instance ${cardInstanceId}.`);
    await engine.evaluateAndApplyEffects(cardInstanceId, false, logicItems);
    logger.debug('evaluateAndApplyEffectsThunk', `Engine finished evaluation for instance ${cardInstanceId}.`);
  } catch (error) {
    logger.error('evaluateAndApplyEffectsThunk', `An error occurred during conditional logic evaluation for instance ${cardInstanceId}:`, error as Error);
  }
});

export const evaluateEffectsForAllActiveCardsThunk = createAsyncThunk<
  void,
  void, // No arguments needed
  { state: RootState; dispatch: AppDispatch }
>('conditionalLogic/evaluateEffectsForAllActiveCards', async (_, { dispatch, getState }) => {
    const state = getState();
    const activeCardIds = selectActiveCardInstanceIds(state);
    logger.debug('evaluateEffectsForAllActiveCardsThunk', `Found ${activeCardIds.length} active card(s) to re-evaluate.`, { data: activeCardIds });

    if (activeCardIds.length === 0) {
        // If no active cards, we might still want to evaluate the 'undefined_card' for any global, non-card-specific logic.
        logger.debug('evaluateEffectsForAllActiveCardsThunk', `No active card instances found. Evaluating for 'undefined_card' context.`);
        dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: 'undefined_card' }));
    } else {
        activeCardIds.forEach((cardInstanceId: string) => {
            dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId })); 
        });
    }
});

export const initializeRuleDefinitionsThunk = createAsyncThunk<
  void,
  { logics: ConditionalLogicItem[], cardInstanceId: string }, // Expects the new structure with instance ID
  { dispatch: AppDispatch; }
>('conditionalLogic/initializeRuleDefinitions', async ({ logics, cardInstanceId }, { dispatch }) => {
  logger.debug('initializeRuleDefinitionsThunk', `Initializing rule definitions for instance ${cardInstanceId}...`, { data: logics });
  
  // Dispatch the instance-aware action
  dispatch(setDefinedLogicItems({ logics: logics || [], cardInstanceId }));

  logger.debug('initializeRuleDefinitionsThunk', `Stored ${logics?.length || 0} defined logic items for instance ${cardInstanceId}.`);
});