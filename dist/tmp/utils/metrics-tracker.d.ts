/**
 * Track usage of a feature for metrics and analytics
 * @param category Category of the feature (timer, rendering, etc)
 * @param action Action being performed
 * @param data Additional data to log
 */
export declare function trackUsage(category: string, action: string, data?: Record<string, any>): void;
/**
 * Clear all tracked metrics (used for testing)
 */
export declare function clearMetrics(): void;
/**
 * Get current metrics tracking state
 */
export declare function getMetrics(): Record<string, any>;
