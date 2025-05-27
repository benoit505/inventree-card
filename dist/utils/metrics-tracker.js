import { Logger } from './logger';
// Logger instance
const logger = Logger.getInstance();
/**
 * Track usage of a feature for metrics and analytics
 * @param category Category of the feature (timer, rendering, etc)
 * @param action Action being performed
 * @param data Additional data to log
 */
export function trackUsage(category, action, data = {}) {
    try {
        // Generate a unified key for StateAdapter API
        const key = `${category}-${action}`;
        // Track via StateAdapter based on data source
        if (data.source === 'redux') {
            // Placeholder for future implementation
        }
        else {
            // Placeholder for future implementation
        }
        // Only log metrics at debug level to avoid spam
        logger.log('MetricsTracker', `${category}/${action} [${data.source || 'unknown'}]`, Object.assign({ category: 'metrics', subsystem: 'tracking' }, data));
    }
    catch (error) {
        // Log error but don't fail the application
        logger.error('MetricsTracker', `Error tracking metrics: ${error}`, {
            category: 'metrics',
            subsystem: 'error'
        });
    }
}
/**
 * Clear all tracked metrics (used for testing)
 */
export function clearMetrics() {
    // No direct API to clear metrics in StateAdapter
    // This is a placeholder for future implementation
}
/**
 * Get current metrics tracking state
 */
export function getMetrics() {
    return {
    // Placeholder for future implementation
    };
}
//# sourceMappingURL=metrics-tracker.js.map