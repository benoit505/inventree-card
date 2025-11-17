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
import { selectWebSocketStatus } from '../slices/websocketSlice';
import { inventreeApi } from '../apis/inventreeApi';
import { selectPartById } from '../slices/partsSlice';
import { ParameterDetail } from '../../types';

const logger = ConditionalLoggerEngine.getInstance().getLogger('conditionalLogicThunks');
ConditionalLoggerEngine.getInstance().registerCategory('conditionalLogicThunks', { enabled: false, level: 'info' });

// parseSourceString and extractAllRules are no longer needed here as processing moves to the engine

export const evaluateAndApplyEffectsThunk = createAsyncThunk<
  void,
  { cardInstanceId: string; logicItemIds?: string[] },
  { state: RootState, dispatch: AppDispatch }
>('conditionalLogic/evaluateAndApplyEffects', async ({ cardInstanceId, logicItemIds }, { dispatch, getState }) => {
  logger.debug('evaluateAndApplyEffectsThunk', `Running for card instance: ${cardInstanceId}`, { logicItemIds });
  const state = getState();

  // REMOVED: Leftover debug log for part 145 and parameter 134

  // --- POLLING FALLBACK LOGIC ---
  const wsStatus = selectWebSocketStatus(state);
  if (wsStatus !== 'connected') {
    logger.debug('evaluateAndApplyEffectsThunk', `WebSocket not connected (status: ${wsStatus}). Triggering polling refresh.`);
    
    // Invalidate tags to mark data as stale for any subscribed components
    dispatch(inventreeApi.util.invalidateTags(['Part', 'PartParameters']));

    // Explicitly re-fetch data for any queries that are already in the cache,
    // ensuring data is updated even without an active component subscription.
    const queries = state.inventreeApi.queries;
    for (const key in queries) {
      const query = queries[key];
      if (query && (query.endpointName === 'getPart' || query.endpointName === 'getPartParameters') && query.status === 'fulfilled') {
        // The old generic approach caused a massive TS error because the argument shapes differ.
        // This explicit check ensures the correct arguments are passed to the correct endpoint initiate function.
        if (query.endpointName === 'getPart') {
          dispatch(inventreeApi.endpoints.getPart.initiate(query.originalArgs, { forceRefetch: true }));
        } else if (query.endpointName === 'getPartParameters') {
          dispatch(inventreeApi.endpoints.getPartParameters.initiate(query.originalArgs, { forceRefetch: true }));
        }
      }
    }
  }
  
  let logicItems = selectDefinedLogicItems(state, cardInstanceId);
  
  // FIXED: If specific logic item IDs are provided, filter to only those items
  // This prevents nuclear re-evaluation of ALL logic when only specific items need updating
  if (logicItemIds && logicItemIds.length > 0) {
    const originalCount = logicItems.length;
    logicItems = logicItems.filter(item => logicItemIds.includes(item.id));
    logger.debug('evaluateAndApplyEffectsThunk', 
      `Filtered logic items: ${originalCount} → ${logicItems.length} (specific IDs: ${logicItemIds.join(', ')})`
    );
  }
  
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