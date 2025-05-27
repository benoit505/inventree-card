import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
// Use NodeJS.Timeout for standard setTimeout return type
const debounceTimers = new Map();
// Configuration for debouncing specific actions
const debounceConfig = {
    'parameters/webSocketUpdateReceived': 250, // Debounce parameter updates from WebSocket by 250ms
    // Add other actions to debounce here
};
// Let TypeScript infer the parameter types (api, next, action)
export const debounceMiddleware = (api) => (next) => (action) => {
    const actionType = action.type;
    // Check if this action type needs debouncing
    if (debounceConfig[actionType]) {
        const debounceTime = debounceConfig[actionType];
        // Create a unique key for this action instance (e.g., based on payload)
        // Simple approach: use action type + stringified payload (might be too broad)
        const debounceKey = `${actionType}:${JSON.stringify(action.payload || {})}`;
        logger.log('DebounceMiddleware', `Debouncing action: ${actionType}, Key: ${debounceKey}, Time: ${debounceTime}ms`);
        // Clear existing timer for this key, if any
        if (debounceTimers.has(debounceKey)) {
            clearTimeout(debounceTimers.get(debounceKey));
        }
        // Set a new timer
        const timerId = setTimeout(() => {
            logger.log('DebounceMiddleware', `Executing debounced action: ${actionType}, Key: ${debounceKey}`);
            debounceTimers.delete(debounceKey);
            next(action); // Dispatch the action after the debounce period
        }, debounceTime);
        // Store the timer ID
        debounceTimers.set(debounceKey, timerId);
        // Don't pass the action to the next middleware immediately
        return;
    }
    // If the action doesn't need debouncing, pass it through immediately
    return next(action);
};
//# sourceMappingURL=debounceMiddleware.js.map