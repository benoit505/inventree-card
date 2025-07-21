import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { trackUsage } from '../../utils/metrics-tracker';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
// import { MetricsService } from '../../services/metrics'; // Import if a real service exists

const logger = ConditionalLoggerEngine.getInstance().getLogger('metricsMiddleware');
ConditionalLoggerEngine.getInstance().registerCategory('metricsMiddleware', { enabled: false, level: 'info' });

// const metricsService = MetricsService.getInstance(); // Get instance if service exists

const metricsMiddleware: Middleware = 
    (api) => 
    (next) => 
    (action) => {
    const typedAction = action as AnyAction; // Cast to AnyAction for use
    // Let the action pass through first
    const result = next(action);

    // Check if this is a metrics tracking action
    if (typedAction.type === 'metrics/trackEvent') {
        const { category, action: eventAction, label, value } = typedAction.payload;
        try {
            trackUsage(category, eventAction, { label, value, source: 'redux' });
            logger.debug('middleware', `Tracked event: ${category}/${eventAction}`, { data: typedAction.payload });
        } catch (error) {
            logger.error('middleware', `Error tracking usage: ${(error as Error).message}`, error as Error);
        }
    }
    
    // Return the result of the next middleware
    return result;
    };

export default metricsMiddleware; 