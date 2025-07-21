import { Middleware } from 'redux';
import { RootState } from '../index';
import { captureLog, logFired } from '../slices/loggingSlice';
import { LogEntry, LogQuery } from '../../types';

export const loggingMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  if (logFired.match(action)) {
    // console.log('%c[loggingMiddleware] Matched logFired action!', 'color: #2ECC71; font-weight: bold;', action.payload);

    const { level, category, functionName, message, cardInstanceId, args } = action.payload;
    const state = store.getState();

    if (cardInstanceId) {
      // console.log(`[loggingMiddleware] Processing for cardInstanceId: ${cardInstanceId}`);
      const instanceLoggingState = state.logging.logsByInstance[cardInstanceId];
      // console.log('[loggingMiddleware] Instance logging state from store:', JSON.parse(JSON.stringify(instanceLoggingState || {})));

      const instanceQueries = state.config.configsByInstance[cardInstanceId]?.config?.logging?.queries || [];
      // console.log(`[loggingMiddleware] Found ${instanceQueries.length} queries for instance.`);

      if (instanceQueries.length > 0) {
        const shouldCapture = instanceQueries.some((query: LogQuery) => {
          if (!query.enabled) {
            return false;
          }
          
          if (!query.category) {
            return false;
          }

          const isCategoryMatch = query.category === category;

          if (!isCategoryMatch) {
            return false;
          }

          const isFunctionMatch = !query.functionName || query.functionName === functionName;
          
          const isFinalMatch = isCategoryMatch && isFunctionMatch;

          // console.log(`[loggingMiddleware]   - Checking query ${query.id}:`, { query: JSON.parse(JSON.stringify(query)), finalMatch: isFinalMatch });

          return isFinalMatch;
        });
        
        // console.log(`[loggingMiddleware] Should capture this log? -> ${shouldCapture}`);

        if (shouldCapture) {
          // console.log('%c[loggingMiddleware] CAPTURING LOG!', 'color: #E67E22; font-weight: bold;');
          const logEntry: LogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            category,
            level,
            functionName,
            message,
            args,
          };
          store.dispatch(captureLog({ cardInstanceId, log: logEntry }));
        }
      }
    } else {
      // console.warn('[loggingMiddleware] logFired action received without a cardInstanceId. Cannot capture.');
    }
  }

  return next(action);
}; 