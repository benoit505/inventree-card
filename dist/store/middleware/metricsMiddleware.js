import { trackUsage } from '../../utils/metrics-tracker';
import { Logger } from '../../utils/logger';
// import { MetricsService } from '../../services/metrics'; // Import if a real service exists
const logger = Logger.getInstance();
// const metricsService = MetricsService.getInstance(); // Get instance if service exists
const metricsMiddleware = (api) => (next) => (action) => {
    // Let the action pass through first
    const result = next(action);
    // Check if this is a metrics tracking action
    if (action.type === 'metrics/trackEvent') {
        const { category, action: eventAction, label, value } = action.payload;
        try {
            trackUsage(category, eventAction, { label, value, source: 'redux' });
            logger.log('MetricsMiddleware', `Tracked event: ${category}/${eventAction}`, { category: 'metrics', data: action.payload });
        }
        catch (error) {
            logger.error('MetricsMiddleware', `Error tracking usage: ${error}`, { category: 'metrics', error });
        }
    }
    // Return the result of the next middleware
    return result;
};
export default metricsMiddleware;
//# sourceMappingURL=metricsMiddleware.js.map