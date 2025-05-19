/**
 * Redux Middleware for managing the WebSocketPlugin connection 
 * based on the card configuration state.
 */
import { Middleware } from '@reduxjs/toolkit';
import { MiddlewareAPI, Dispatch, UnknownAction } from 'redux';
import { RootState } from '../index';
import { setWebSocketStatus, webSocketMessageReceived } from '../slices/websocketSlice'; // Corrected path
import { updateValue as updateParameterValueInStore } from '../slices/parametersSlice';
import { WebSocketPlugin } from '../../services/websocket-plugin';
import { Logger } from '../../utils/logger';
import { setParts, partStockUpdateFromWebSocket, fetchPartDetails } from '../slices/partsSlice'; // Added partStockUpdateFromWebSocket and fetchPartDetails
import { WebSocketEventMessage, EnhancedStockItemEventData, EnhancedParameterEventData } from '../../types'; // Import new types
import { evaluateAndApplyConditions } from '../thunks/parameterThunks';

const logger = Logger.getInstance();
// let isWebSocketInitialized = false; // This flag is not currently used in the provided snippet, commented out to avoid lint error

// Module-scoped variables for throttling condition evaluation
let lastEvalDispatchTime = 0;
let evalScheduledTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const websocketMiddleware: Middleware = (storeAPI: MiddlewareAPI<Dispatch<UnknownAction>, RootState>) => (next: Dispatch<UnknownAction>) => (action: UnknownAction) => {
    const result = next(action);

    if (webSocketMessageReceived.match(action)) {
        // Cast the payload to our specific WebSocketEventMessage type
        const message = action.payload as WebSocketEventMessage;

        // Basic validation of the overall message structure
        if (typeof message === 'object' && message !== null && 
            message.type === 'event' && 
            typeof message.event === 'string' && 
            typeof message.data === 'object' && message.data !== null) {
            
            const eventName = message.event;
            const eventData = message.data; // This is now typed as a union or Record<string,any>

            logger.log('WebSocketMiddleware', `Processing event: ${eventName}`, { eventData, level: 'info' });

            // Handle Parameter Updates
            if (eventName.includes('part_partparameter.saved') || eventName.includes('part_partparameter.created')) {
                // Type cast eventData for parameter events
                const paramData = eventData as EnhancedParameterEventData;
                logger.log('WebSocketMiddleware', 'Parameter event data:', { data: paramData, level: 'debug' });
                
                const partId = paramData.part_pk ?? paramData.parent_id; 
                const paramName = paramData.parameter_name;
                const paramValue = paramData.parameter_value;
                
                if (partId !== undefined && paramName !== undefined && paramValue !== undefined) {
                    logger.log('WebSocketMiddleware', `Dispatching parameters/updateValue (direct action) for Part ${partId}, Param ${paramName} to value ${paramValue}`, { level: 'info' });
                    // Dispatch the synchronous action from parametersSlice directly
                    storeAPI.dispatch(updateParameterValueInStore({ 
                        partId: Number(partId),
                        paramName: String(paramName),
                        value: String(paramValue),
                        source: 'websocket' // Add source for clarity in logs
                    }));

                    // TEMPORARY TEST: Introduce a small delay to ensure store update has settled
                    setTimeout(() => {
                        // After updating the parameter value, re-evaluate conditions, but throttled.
                        const state = storeAPI.getState();
                        // Assuming InventreeCardConfig is stored in state.parameters.config based on parametersSlice.setConfig
                        // If your main card config is stored elsewhere (e.g., a root config slice), adjust this path.
                        const cardConfig = state.parameters.config; 
                        const conditionEvalFrequency = cardConfig?.performance?.parameters?.conditionEvalFrequency ?? 1000;
                        const now = Date.now();

                        if (evalScheduledTimeoutId) {
                            clearTimeout(evalScheduledTimeoutId);
                            evalScheduledTimeoutId = null;
                            logger.log('WebSocketMiddleware', 'Cleared pending (trailing) evaluateAndApplyConditions call due to new trigger.', { level: 'silly' });
                        }

                        if (now - lastEvalDispatchTime > conditionEvalFrequency) {
                            logger.log('WebSocketMiddleware', `Dispatching evaluateAndApplyConditions (direct). Interval: ${conditionEvalFrequency}ms. lastEval: ${lastEvalDispatchTime}, now: ${now}`, { level: 'info' });
                            storeAPI.dispatch(evaluateAndApplyConditions() as any); // Cast to any if thunk type causes issues with dispatch
                            lastEvalDispatchTime = now;
                        } else {
                            const delay = Math.max(0, conditionEvalFrequency - (now - lastEvalDispatchTime));
                            logger.log('WebSocketMiddleware', `Throttling evaluateAndApplyConditions. Scheduling trailing call. Delay: ${delay}ms. lastEval: ${lastEvalDispatchTime}, now: ${now}`, { level: 'info' });
                            evalScheduledTimeoutId = setTimeout(() => {
                                logger.log('WebSocketMiddleware', `Dispatching evaluateAndApplyConditions (trailing call). Interval: ${conditionEvalFrequency}ms.`, { level: 'info' });
                                storeAPI.dispatch(evaluateAndApplyConditions() as any); // Cast to any
                                lastEvalDispatchTime = Date.now();
                                evalScheduledTimeoutId = null;
                            }, delay);
                        }
                    }, 0); // 0ms delay, effectively pushing to next tick
                } else {
                    logger.warn('WebSocketMiddleware', 'Received parameter update, but missing key data fields.', { paramData });
                }
            } 
            // Handle Stock Updates
            else if (eventName.includes('stock_stockitem.saved') || eventName.includes('stock_stockitem.created')) {
                // Type cast eventData for stock events
                const stockData = eventData as EnhancedStockItemEventData;
                const partId = stockData.part_id;
                
                if (partId !== undefined) {
                    logger.log('WebSocketMiddleware', `Dispatching partStockUpdateFromWebSocket for Part ${partId}`);
                    storeAPI.dispatch(partStockUpdateFromWebSocket({
                        partId: Number(partId),
                        quantity: stockData.quantity,
                        batch: stockData.batch,
                        serial: stockData.serial,
                        status_label: stockData.status_label,
                        status_value: stockData.status_value,
                        last_updated: stockData.last_updated,
                        part_name: stockData.part_name,
                        part_ipn: stockData.part_ipn,
                        part_thumbnail: stockData.part_thumbnail,
                        location_id: stockData.location_id,
                        location_name: stockData.location_name,
                        location_pathstring: stockData.location_pathstring,
                        stockItemId: stockData.id 
                    }));
                    
                    logger.log('WebSocketMiddleware', `Dispatching fetchPartDetails for Part ${partId} due to stock event.`);
                    storeAPI.dispatch(fetchPartDetails(Number(partId)));

                } else {
                    logger.warn('WebSocketMiddleware', 'Received stock update, but missing part_id.', { stockData });
                }
            }
            else {
                 logger.log('WebSocketMiddleware', `Received unhandled event type: ${eventName}`, { eventData });
            }
        } else {
            logger.warn('WebSocketMiddleware', 'Received webSocketMessageReceived action, but payload was not a valid WebSocketEventMessage structure', { payload: action.payload });
        }
    }

    // Handle explicit connect/disconnect actions if needed later
    // For now, assuming connection is managed by WebSocketManager/Plugin directly
    // or via actions dispatched from the UI layer that this middleware could listen to.
    if (action.type === 'websocket/connect') {
        logger.log('WebSocket Middleware', 'Explicit connect action received (currently informational)');
        // const wsPlugin = WebSocketPlugin.getInstance();
        // wsPlugin.connect(); // Ensure plugin is configured before connecting
    } else if (action.type === 'websocket/disconnect') {
        logger.log('WebSocket Middleware', 'Explicit disconnect action received (currently informational)');
        // const wsPlugin = WebSocketPlugin.getInstance();
        // wsPlugin.disconnect();
    }

    return result;
}; 