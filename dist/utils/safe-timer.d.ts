/**
 * SafeTimer - A lightweight, safer alternative to TimerManager
 *
 * This utility provides basic timer management functionality without the complexity
 * and potential issues of the original TimerManager.
 */
/**
 * Set a timeout and track it for cleanup
 * @param callback Function to call when timeout expires
 * @param delay Delay in milliseconds
 * @param debugLabel Optional label for debugging
 * @returns Timeout ID
 */
export declare function safeSetTimeout(callback: (...args: any[]) => void, delay: number, debugLabel?: string): number;
/**
 * Clear a timeout and remove it from tracking
 * @param id Timeout ID to clear
 */
export declare function safeClearTimeout(id: number): void;
/**
 * Set an interval and track it for cleanup
 * @param callback Function to call on each interval
 * @param delay Delay in milliseconds
 * @param debugLabel Optional label for debugging
 * @returns Interval ID
 */
export declare function safeSetInterval(callback: (...args: any[]) => void, delay: number, debugLabel?: string): number;
/**
 * Clear an interval and remove it from tracking
 * @param id Interval ID to clear
 */
export declare function safeClearInterval(id: number): void;
/**
 * Clean up all tracked timeouts and intervals
 */
export declare function cleanupAllTimers(): void;
/**
 * Get statistics about current timers
 */
export declare function getTimerStats(): {
    timeouts: number;
    intervals: number;
};
