/**
 * SafeTimer - A lightweight, safer alternative to TimerManager
 * 
 * This utility provides basic timer management functionality without the complexity
 * and potential issues of the original TimerManager.
 */

// Track timers for cleanup
const timeouts = new Map<number, string>();
const intervals = new Map<number, string>();

/**
 * Set a timeout and track it for cleanup
 * @param callback Function to call when timeout expires
 * @param delay Delay in milliseconds
 * @param debugLabel Optional label for debugging
 * @returns Timeout ID
 */
export function safeSetTimeout(
  callback: (...args: any[]) => void,
  delay: number,
  debugLabel?: string
): number {
  const id = window.setTimeout(callback, delay);
  timeouts.set(id, debugLabel || 'anonymous');
  return id;
}

/**
 * Clear a timeout and remove it from tracking
 * @param id Timeout ID to clear
 */
export function safeClearTimeout(id: number): void {
  window.clearTimeout(id);
  timeouts.delete(id);
}

/**
 * Set an interval and track it for cleanup
 * @param callback Function to call on each interval
 * @param delay Delay in milliseconds
 * @param debugLabel Optional label for debugging
 * @returns Interval ID
 */
export function safeSetInterval(
  callback: (...args: any[]) => void,
  delay: number,
  debugLabel?: string
): number {
  const id = window.setInterval(callback, delay);
  intervals.set(id, debugLabel || 'anonymous');
  return id;
}

/**
 * Clear an interval and remove it from tracking
 * @param id Interval ID to clear
 */
export function safeClearInterval(id: number): void {
  window.clearInterval(id);
  intervals.delete(id);
}

/**
 * Clean up all tracked timeouts and intervals
 */
export function cleanupAllTimers(): void {
  // Clear all timeouts
  timeouts.forEach((_, id) => {
    window.clearTimeout(id);
  });
  timeouts.clear();
  
  // Clear all intervals
  intervals.forEach((_, id) => {
    window.clearInterval(id);
  });
  intervals.clear();
}

/**
 * Get statistics about current timers
 */
export function getTimerStats(): { timeouts: number, intervals: number } {
  return {
    timeouts: timeouts.size,
    intervals: intervals.size
  };
} 