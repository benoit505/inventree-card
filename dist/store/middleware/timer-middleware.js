import { clearTimersForComponent } from '../slices/timerSlice';
/**
 * Middleware to handle timer-related side effects
 *
 * This middleware:
 * 1. Listens for component disconnect actions
 * 2. Cleans up all timers for disconnected components
 */
export const timerMiddleware = store => next => action => {
    // Handle component disconnection
    if (action.type === 'components/disconnectComponent') {
        const componentId = action.payload;
        // Clean up all timers for this component
        store.dispatch(clearTimersForComponent(componentId));
    }
    return next(action);
};
//# sourceMappingURL=timer-middleware.js.map