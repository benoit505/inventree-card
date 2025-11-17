/**
 * Redux Middleware for managing the WebSocketPlugin connection 
 * based on the card configuration state.
 */
import { Middleware, MiddlewareAPI, UnknownAction, PayloadAction, Action, AnyAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { webSocketMessageReceived } from '../slices/websocketSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { WebSocketEventMessage, EnhancedStockItemEventData, EnhancedParameterEventData, ParameterDetail, InventreeItem } from '../../types';
import { evaluateAndApplyEffectsThunk } from '../thunks/conditionalLogicThunks';
// REMOVED: evaluateEffectsForAllActiveCardsThunk - unused import
import debounce from 'lodash-es/debounce';
import { inventreeApi } from '../apis/inventreeApi';
// Import actions from genericHaStateSlice
import { setEntityState, setEntityStatesBatch } from '../slices/genericHaStateSlice';
// Import selector for active card instances
import { selectActiveCardInstanceIds } from '../slices/componentSlice';
import { updateParameterForPart, partStockUpdateFromWebSocket } from '../slices/partsSlice';

const logger = ConditionalLoggerEngine.getInstance().getLogger('websocketMiddleware');
ConditionalLoggerEngine.getInstance().registerCategory('websocketMiddleware', { enabled: false, level: 'info' });

// Per-card debounced evaluators map
// FIXED: Changed from throttle to debounce to ensure we don't drop events
// Debounce waits for a quiet period, then executes with the latest state
const debouncedEvaluatorsMap = new Map<string, ReturnType<typeof debounce>>();

/**
 * Get or create a debounced evaluator for a specific card instance
 * Each card gets its own independent debounce based on its config
 */
const getOrCreateDebouncedEvaluator = (
  storeAPI: MiddlewareAPI<AppDispatch, RootState>, 
  cardInstanceId: string
): ReturnType<typeof debounce> => {
  const state = storeAPI.getState();
  const configState = state.config.configsByInstance[cardInstanceId];
  const wait = configState?.config?.performance?.parameters?.conditionEvalFrequency ?? 1000;
  
  // Check if we have a debounced function for this card
  const existing = debouncedEvaluatorsMap.get(cardInstanceId);
  
  // If exists and no config change, return existing
  if (existing) {
    return existing;
  }
  
  // Create new debounced function for this specific card
  // FIXED: Debounce ensures we always process the final state after events stop
  logger.info('getOrCreateDebouncedEvaluator', `Creating debounced evaluator for card ${cardInstanceId} with wait: ${wait}ms`);
  
  const debounced = debounce(() => {
    logger.debug('debouncedEvaluator', `Dispatching evaluateAndApplyEffectsThunk for card ${cardInstanceId} (debounced).`);
    storeAPI.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId })); 
  }, wait, { leading: false, trailing: true, maxWait: wait * 2 });
  
  debouncedEvaluatorsMap.set(cardInstanceId, debounced);
  return debounced;
};

/**
 * Update debounce for a specific card when its config changes
 */
const updateDebounceForCard = (
  storeAPI: MiddlewareAPI<AppDispatch, RootState>,
  cardInstanceId: string
) => {
  // Remove existing debounce to force recreation with new config
  debouncedEvaluatorsMap.delete(cardInstanceId);
  logger.info('updateDebounceForCard', `Cleared debounce for card ${cardInstanceId}, will recreate on next evaluation.`);
};

/**
 * Clean up debounces for inactive cards
 */
const cleanupInactiveCardDebounces = (storeAPI: MiddlewareAPI<AppDispatch, RootState>) => {
  const activeCardIds = selectActiveCardInstanceIds(storeAPI.getState());
  const activeSet = new Set(activeCardIds);
  
  // Remove debounces for cards that are no longer active
  for (const cardId of debouncedEvaluatorsMap.keys()) {
    if (!activeSet.has(cardId)) {
      debouncedEvaluatorsMap.delete(cardId);
      logger.info('cleanupInactiveCardDebounces', `Removed debounce for inactive card ${cardId}`);
    }
  }
};

export const websocketMiddleware: Middleware<{}, RootState, AppDispatch> = 
  (storeAPI: MiddlewareAPI<AppDispatch, RootState>) => {

  return (next: AppDispatch) => (action: unknown): any => {
    const result = next(action as AnyAction);
    const actionWithType = action as { type?: string; payload?: any };

    // When config changes, update the debounce for that specific card
    if (actionWithType.type === 'config/setConfigAction') {
      const payload = actionWithType.payload as { cardInstanceId?: string };
      if (payload?.cardInstanceId) {
        logger.info('middleware', `Config changed for card ${payload.cardInstanceId}, updating debounce.`);
        updateDebounceForCard(storeAPI, payload.cardInstanceId);
      }
      
      // Also clean up any debounces for inactive cards
      cleanupInactiveCardDebounces(storeAPI);
    }

    // Check if the action is one of the HA entity state updates
    if (setEntityState.match(actionWithType as Action) || setEntityStatesBatch.match(actionWithType as Action)) {
      const entityData = setEntityStatesBatch.match(actionWithType as Action) 
        ? actionWithType.payload 
        : [actionWithType.payload];
      
      logger.info('middleware', `🚀 HA entity state updated (action: ${actionWithType.type}), triggering effects re-evaluation.`, {
        entityCount: Array.isArray(entityData) ? entityData.length : 1,
        entities: Array.isArray(entityData) ? entityData.map(e => `${e?.entity_id}=${e?.state}`) : [`${entityData?.entity_id}=${entityData?.state}`]
      });
      
      // Trigger debounced evaluation for EACH active card independently
      const activeCardIds = selectActiveCardInstanceIds(storeAPI.getState());
      activeCardIds.forEach(cardInstanceId => {
        const debouncedEval = getOrCreateDebouncedEvaluator(storeAPI, cardInstanceId);
        debouncedEval();
      });
    }

    if (webSocketMessageReceived.match(actionWithType as Action)) {
      // 🚀 TEMP DEBUG LOG
      console.log('%c[websocketMiddleware] Action Received:', 'color: #D35400; font-weight: bold;', actionWithType.payload);
      
      const message = actionWithType.payload;

      if (typeof message === 'object' && message !== null && 
          message.type === 'event' && 
          typeof message.event === 'string' && 
          typeof message.data === 'object' && message.data !== null) {
            
            const eventName = message.event;
            const eventData = message.data;

            logger.info('middleware', `Processing event: ${eventName}`, { eventData });

            if (eventName.includes('part_partparameter.saved') || eventName.includes('part_partparameter.created')) {
                const paramData = eventData as EnhancedParameterEventData;
                const partId = paramData.part_pk; 
                const parameterInstancePk = paramData.id;
                const paramValue = paramData.parameter_value;
                
                if (partId !== undefined && parameterInstancePk !== undefined && paramValue !== undefined) {
                    const activeInstances = selectActiveCardInstanceIds(storeAPI.getState());
                    
                    // 🚀 TEMP DEBUG LOG & FIX
                    const partIdNum = Number(partId);
                    const paramPkNum = Number(parameterInstancePk);
                    console.log('%c[websocketMiddleware] Dispatching update:', 'color: #1ABC9C; font-weight: bold;', {
                      partId, partIdNum,
                      parameterInstancePk, paramPkNum,
                      paramValue
                    });

                    activeInstances.forEach(instanceId => {
                        // NEW LOGIC: Dispatch directly to the partsSlice
                        storeAPI.dispatch(
                            updateParameterForPart({
                                cardInstanceId: instanceId,
                                partId: partIdNum,
                                parameterPk: paramPkNum,
                                newValue: paramValue,
                            })
                        );
                        
                        // Trigger debounced evaluation for this specific card
                        const debouncedEval = getOrCreateDebouncedEvaluator(storeAPI, instanceId);
                        debouncedEval();
                    });
                }
            } 
            else if (eventName.includes('stock_stockitem.saved') || eventName.includes('stock_stockitem.created') || eventName.includes('stock_stockitem.deleted')) {
                const stockData = eventData as any; // Use 'any' to access part_total_stock
                const partId = stockData.part_id;
                
                if (partId !== undefined && stockData.part_total_stock !== undefined) {
                    const totalStock = parseFloat(stockData.part_total_stock);
                    console.log(`📦 Stock WebSocket: Part ${partId}, total stock = ${totalStock}`);
                    
                    // 🎯 PERFECT! Use part_total_stock from WebSocket (no refetch needed!)
                    const activeInstances = selectActiveCardInstanceIds(storeAPI.getState());
                    activeInstances.forEach(instanceId => {
                        // Dispatch to partStockUpdateFromWebSocket - it will verify against pending changes!
                        storeAPI.dispatch(partStockUpdateFromWebSocket({ 
                            partId: Number(partId), 
                            quantity: totalStock.toString() 
                        }));
                        
                        // Trigger debounced evaluation for this specific card
                        const debouncedEval = getOrCreateDebouncedEvaluator(storeAPI, instanceId);
                        debouncedEval();
                    });
                }
            }
            else {
                 logger.debug('middleware', `Received unhandled event type: ${eventName}`, { eventData });
            }
        } else {
            logger.warn('middleware', 'Received webSocketMessageReceived action, but payload was not a valid WebSocketEventMessage structure', { payload: message });
        }
    } else if (actionWithType.type === 'websocket/connect') {
        logger.debug('middleware', 'Explicit connect action received (currently informational)');
    } else if (actionWithType.type === 'websocket/disconnect') {
        logger.debug('middleware', 'Explicit disconnect action received (currently informational)');
    }

    return result;
  };
}; 