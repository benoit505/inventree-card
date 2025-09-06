/**
 * Redux Middleware for managing the WebSocketPlugin connection 
 * based on the card configuration state.
 */
import { Middleware, MiddlewareAPI, UnknownAction, PayloadAction, Action, AnyAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { webSocketMessageReceived } from '../slices/websocketSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { WebSocketEventMessage, EnhancedStockItemEventData, EnhancedParameterEventData, ParameterDetail, InventreeItem } from '../../types';
import { evaluateAndApplyEffectsThunk, evaluateEffectsForAllActiveCardsThunk } from '../thunks/conditionalLogicThunks';
import throttle from 'lodash-es/throttle';
import { inventreeApi } from '../apis/inventreeApi';
// Import actions from genericHaStateSlice
import { setEntityState, setEntityStatesBatch } from '../slices/genericHaStateSlice';
// Import selector for active card instances
import { selectActiveCardInstanceIds } from '../slices/componentSlice';

const logger = ConditionalLoggerEngine.getInstance().getLogger('websocketMiddleware');
ConditionalLoggerEngine.getInstance().registerCategory('websocketMiddleware', { enabled: false, level: 'info' });

let throttledEvaluateEffects: (() => void) | null = null;

const initializeThrottledEvaluator = (storeAPI: MiddlewareAPI<AppDispatch, RootState>) => {
  const state = storeAPI.getState();
  // In a multi-instance world, find the most frequent (lowest) requested evaluation frequency.
  const allConfigs = Object.values(state.config.configsByInstance);
  const conditionEvalFrequency = allConfigs.reduce((min: number, configState: { config?: { performance?: { parameters?: { conditionEvalFrequency?: number } } } } | undefined) => {
    const freq = configState?.config?.performance?.parameters?.conditionEvalFrequency ?? 1000;
    return Math.min(min, freq);
  }, 1000); // Default to 1000ms
  
  logger.info('initializeThrottledEvaluator', `Initializing/Re-initializing throttledEvaluateEffects with frequency: ${conditionEvalFrequency}ms`);

  throttledEvaluateEffects = throttle(() => {
    logger.debug('throttledEvaluateEffects', `Dispatching evaluateEffectsForAllActiveCardsThunk (throttled).`);
    storeAPI.dispatch(evaluateEffectsForAllActiveCardsThunk()); 
  }, conditionEvalFrequency, { leading: false, trailing: true });
};

export const websocketMiddleware: Middleware<{}, RootState, AppDispatch> = 
  (storeAPI: MiddlewareAPI<AppDispatch, RootState>) => {
  
  initializeThrottledEvaluator(storeAPI);

  return (next: AppDispatch) => (action: unknown): any => {
    const result = next(action as AnyAction);
    const actionWithType = action as { type?: string; payload?: any };

    if (actionWithType.type === 'config/setConfigAction') {
      logger.info('middleware', 'Config changed, re-initializing throttled evaluator.');
      initializeThrottledEvaluator(storeAPI);
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
      
      if (throttledEvaluateEffects) {
        throttledEvaluateEffects();
      } else {
        logger.warn('middleware', 'throttledEvaluateEffects is not initialized!');
      }
    }

    if (webSocketMessageReceived.match(actionWithType as Action)) {
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
                    activeInstances.forEach(instanceId => {
                        storeAPI.dispatch(
                            inventreeApi.util.updateQueryData('getPartParameters', { partId: Number(partId), cardInstanceId: instanceId }, (draftParameters: ParameterDetail[]) => {
                                const paramIndex = draftParameters.findIndex(p => p.pk === parameterInstancePk);
                                if (paramIndex !== -1) {
                                    draftParameters[paramIndex].data = paramValue;
                                }
                            })
                        );
                    });
                    if (throttledEvaluateEffects) throttledEvaluateEffects();
                }
            } 
            else if (eventName.includes('stock_stockitem.saved') || eventName.includes('stock_stockitem.created')) {
                const stockData = eventData as EnhancedStockItemEventData;
                const partId = stockData.part_id;
                
                if (partId !== undefined) {
                    const activeInstances = selectActiveCardInstanceIds(storeAPI.getState());
                    activeInstances.forEach(instanceId => {
                        storeAPI.dispatch(
                            inventreeApi.util.updateQueryData('getPart', { pk: Number(partId), cardInstanceId: instanceId }, (draftPart: InventreeItem) => {
                                if (typeof draftPart.in_stock === 'number' || draftPart.in_stock === undefined) {
                                    const newStock = parseFloat(stockData.quantity);
                                    if (!isNaN(newStock)) {
                                        draftPart.in_stock = newStock;
                                    }
                                }
                            })
                        );
                    });
                    if (throttledEvaluateEffects) throttledEvaluateEffects();
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