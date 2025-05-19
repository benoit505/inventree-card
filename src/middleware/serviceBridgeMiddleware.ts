import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { RootState } from '../store';
import { trackUsage } from '../utils/metrics-tracker';
import { Logger } from '../utils/logger';

/**
 * Middleware to bridge Redux with existing InvenTree services
 * 
 * This middleware allows us to:
 * 1. Gradually migrate from service-based logic to Redux actions/thunks
 * 2. Keep existing services functional during the transition
 * 3. Dispatch Redux actions based on service events (if needed later)
 */
const serviceBridgeMiddleware: Middleware<{}, RootState> =
  (api) => (next) => (action) => {
    const logger = Logger.getInstance();

    // Handle parameter updates
    if (typeof action === 'object' && action !== null && 'type' in action && action.type === 'parameters/updateValue') {
      // Assert the action structure since we checked the type
      const typedAction = action as { type: string; payload: { partId: number; paramName: string; value: any } };
      const { partId, paramName, value } = typedAction.payload;
      
      // Assume Redux for Parameters is always true now
      if (true) { // Simplified condition
        logger.log('Redux', `Updating parameter ${paramName} for part ${partId}`, { 
          category: 'redux', 
          subsystem: 'parameters' 
        });
      }
    }

    // Let the action continue through the middleware chain
    return next(action);
  };

export default serviceBridgeMiddleware; 