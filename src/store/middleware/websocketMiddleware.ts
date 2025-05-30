/**
 * Redux Middleware for managing the WebSocketPlugin connection 
 * based on the card configuration state.
 */
import { Middleware, MiddlewareAPI, UnknownAction, PayloadAction, Action, AnyAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { webSocketMessageReceived } from '../slices/websocketSlice';
import { Logger } from '../../utils/logger';
import { WebSocketEventMessage, EnhancedStockItemEventData, EnhancedParameterEventData, ParameterDetail, InventreeItem } from '../../types';
import { evaluateAndApplyEffectsThunk } from '../thunks/conditionalLogicThunks';
import throttle from 'lodash-es/throttle';
import { inventreeApi } from '../apis/inventreeApi';

const logger = Logger.getInstance();
let throttledEvaluateEffects: (() => void) | null = null;

const initializeThrottledEvaluator = (storeAPI: MiddlewareAPI<AppDispatch, RootState>) => {
  const state = storeAPI.getState();
  const conditionEvalFrequency = state.config.values?.performance?.parameters?.conditionEvalFrequency ?? 1000;
  
  logger.log('WebSocketMiddleware', `Initializing/Re-initializing throttledEvaluateEffects with frequency: ${conditionEvalFrequency}ms`);

  throttledEvaluateEffects = throttle(() => {
    logger.log('WebSocketMiddleware', `Dispatching evaluateAndApplyEffectsThunk (throttled).`);
    storeAPI.dispatch(evaluateAndApplyEffectsThunk());
  }, conditionEvalFrequency, { leading: false, trailing: true });
};

export const websocketMiddleware: Middleware<{}, RootState, AppDispatch> = 
  (storeAPI: MiddlewareAPI<AppDispatch, RootState>) => {
  
  initializeThrottledEvaluator(storeAPI);

  return (next: AppDispatch) => (action: unknown): any => {
    const result = next(action as AnyAction);
    const actionWithType = action as { type?: string; payload?: any };

    if (actionWithType.type === 'config/setConfigAction') {
      logger.log('WebSocketMiddleware', 'Config changed, re-initializing throttled evaluator.');
      initializeThrottledEvaluator(storeAPI);
    }

    if (webSocketMessageReceived.match(actionWithType as Action)) {
      const message = actionWithType.payload;

      if (typeof message === 'object' && message !== null && 
          message.type === 'event' && 
          typeof message.event === 'string' && 
          typeof message.data === 'object' && message.data !== null) {
            
            const eventName = message.event;
            const eventData = message.data;

            logger.log('WebSocketMiddleware', `Processing event: ${eventName}`, { eventData, level: 'info' });

            if (eventName.includes('part_partparameter.saved') || eventName.includes('part_partparameter.created')) {
                const paramData = eventData as EnhancedParameterEventData;
                const partId = paramData.part_pk; 
                const parameterInstancePk = paramData.id;
                const paramValue = paramData.parameter_value;
                
                if (partId !== undefined && parameterInstancePk !== undefined && paramValue !== undefined) {
                    storeAPI.dispatch(
                        inventreeApi.util.updateQueryData('getPartParameters', Number(partId), (draftParameters: ParameterDetail[]) => {
                            const paramIndex = draftParameters.findIndex(p => p.pk === parameterInstancePk);
                            if (paramIndex !== -1) {
                                draftParameters[paramIndex].data = paramValue;
                            }
                        })
                    );
                    if (throttledEvaluateEffects) throttledEvaluateEffects();
                }
            } 
            else if (eventName.includes('stock_stockitem.saved') || eventName.includes('stock_stockitem.created')) {
                const stockData = eventData as EnhancedStockItemEventData;
                const partId = stockData.part_id;
                
                if (partId !== undefined) {
                    storeAPI.dispatch(
                        inventreeApi.util.updateQueryData('getPart', Number(partId), (draftPart: InventreeItem) => {
                            if (typeof draftPart.in_stock === 'number' || draftPart.in_stock === undefined) {
                                const newStock = parseFloat(stockData.quantity);
                                if (!isNaN(newStock)) {
                                    draftPart.in_stock = newStock;
                                }
                            }
                        })
                    );
                    if (throttledEvaluateEffects) throttledEvaluateEffects();
                }
            }
            else {
                 logger.log('WebSocketMiddleware', `Received unhandled event type: ${eventName}`, { eventData });
            }
        } else {
            logger.warn('WebSocketMiddleware', 'Received webSocketMessageReceived action, but payload was not a valid WebSocketEventMessage structure', { payload: message });
        }
    } else if (actionWithType.type === 'websocket/connect') {
        logger.log('WebSocket Middleware', 'Explicit connect action received (currently informational)');
    } else if (actionWithType.type === 'websocket/disconnect') {
        logger.log('WebSocket Middleware', 'Explicit disconnect action received (currently informational)');
    }

    return result;
  };
}; 