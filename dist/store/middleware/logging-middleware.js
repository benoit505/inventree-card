import { Logger } from '../../utils/logger';
/**
 * Redux middleware for comprehensive logging
 *
 * This middleware logs:
 * 1. All Redux actions with their payload
 * 2. State changes after actions (when in verbose mode)
 * 3. Performance metrics for actions
 *
 * Logging is controlled by the 'logReduxEvents' feature flag and the Logger configuration
 */
const logger = Logger.getInstance();
export const loggingMiddleware = (api) => (next) => (action) => {
    // Start timing the action
    const startTime = performance.now();
    // Log the action being dispatched
    logger.log('Redux Middleware', `🚀 Action Dispatched: ${action.type}`, {
        category: 'redux',
        subsystem: 'action',
        data: action.payload
    });
    // Call the next middleware in the chain
    const result = next(action);
    // Log the time taken for the action
    const endTime = performance.now();
    const duration = endTime - startTime;
    logger.log('Redux Middleware', `⏱️ Action Completed: ${action.type} (${duration.toFixed(2)}ms)`, {
        category: 'redux',
        subsystem: 'performance'
    });
    // Log state changes if the 'redux' system and 'state' subsystem are enabled
    if (logger.isEnabled('redux', 'state')) {
        const nextState = api.getState();
        logger.log('Redux Middleware', `🔄 State After Action: ${action.type}`, {
            category: 'redux',
            subsystem: 'state',
            data: nextState // Be cautious logging full state in production
        });
    }
    return result;
};
//# sourceMappingURL=logging-middleware.js.map