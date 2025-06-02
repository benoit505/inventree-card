import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { trackUsage } from '../../utils/metrics-tracker';
import { Logger } from '../../utils/logger';
// import { MetricsService } from '../../services/metrics'; // Import if a real service exists

const logger = Logger.getInstance();
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
            logger.log('MetricsMiddleware', `Tracked event: ${category}/${eventAction}`, { category: 'metrics', data: typedAction.payload });
        } catch (error) {
            logger.error('MetricsMiddleware', `Error tracking usage: ${error}`, { category: 'metrics', error });
        }
    }
    
    // Return the result of the next middleware
    return result;
    };

export default metricsMiddleware; 