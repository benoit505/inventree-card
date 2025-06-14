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
  selectDefinedLogicItems
} from '../slices/conditionalLogicSlice';
import { selectActiveCardInstanceIds } from '../slices/componentSlice';
import { ConditionalEffectsEngine } from '../../core/ConditionalEffectsEngine';

const logger = Logger.getInstance();

// parseSourceString and extractAllRules are no longer needed here as processing moves to the engine

export const evaluateAndApplyEffectsThunk = createAsyncThunk<
  void,
  { cardInstanceId: string },
  { state: RootState, dispatch: AppDispatch }
>('conditionalLogic/evaluateAndApplyEffects', async ({ cardInstanceId }, { dispatch, getState }) => {
  console.log(`[Thunk:evaluateAndApplyEffects] Running for card instance: ${cardInstanceId}`);
  const state = getState();
  const logicItems = selectDefinedLogicItems(state);
  const engine = new ConditionalEffectsEngine(dispatch, getState);
  try {
    console.log(`[Thunk:evaluateAndApplyEffects] About to call engine.evaluateAndApplyEffects with ${logicItems.length} logic items.`);
    await engine.evaluateAndApplyEffects(cardInstanceId, false, logicItems);
    console.log(`[Thunk:evaluateAndApplyEffects] Engine finished evaluation.`);
  } catch (error) {
    logger.error('evaluateAndApplyEffectsThunk', 'An error occurred during conditional logic evaluation:', { data: error });
    // Optionally re-throw or handle as needed
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
  ConditionalLogicItem[], // Expects the new structure
  { dispatch: AppDispatch; /* state: RootState // getState not needed here anymore */ }
>('conditionalLogic/initializeRuleDefinitions', async (logicItems, { dispatch }) => {
  logger.debug('initializeRuleDefinitionsThunk', 'Initializing rule definitions (now ConditionalLogicItems with logicPairs)...', { data: logicItems });
  
  // Directly store the received logicItems (which should have the new structure)
  dispatch(setDefinedLogicItems(logicItems || []));

  logger.debug('initializeRuleDefinitionsThunk', `Stored ${logicItems?.length || 0} defined logic items.`);
  
  // No more transformation to ProcessedCondition here.
  // REMOVED: Initial evaluation should not be triggered from here.
  // dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: 'undefined_card', forceReevaluation: true }));
});