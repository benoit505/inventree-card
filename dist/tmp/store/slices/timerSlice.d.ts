import { RootState } from '../index';
interface Timer {
    id: number;
    componentId: string;
    label?: string;
    startTime: number;
    delay: number;
    type: 'timeout' | 'interval';
}
export declare const timerSlice: any;
export declare const addTimer: any, removeTimer: any, clearComponentTimers: any, clearAllTimers: any;
export declare const selectAllTimers: (state: RootState) => any;
export declare const selectComponentTimers: (state: RootState, componentId: string) => Timer[];
export declare const selectTimerStats: (state: RootState) => {
    total: number;
    timeouts: number;
    intervals: number;
    byComponent: {
        [k: string]: {
            total: number;
            timeouts: number;
            intervals: number;
        };
    };
};
/**
 * Create a timeout and track it in Redux
 * @param componentId Component ID for tracking
 * @param callback Function to call when timeout expires
 * @param delay Delay in milliseconds
 * @param label Optional label for debugging
 * @returns Timeout ID
 */
export declare function createTimeout(componentId: string, callback: (...args: any[]) => void, delay: number, label?: string): (dispatch: any) => number;
/**
 * Create an interval and track it in Redux
 * @param componentId Component ID for tracking
 * @param callback Function to call on each interval
 * @param delay Delay in milliseconds
 * @param label Optional label for debugging
 * @returns Interval ID
 */
export declare function createInterval(componentId: string, callback: (...args: any[]) => void, delay: number, label?: string): (dispatch: any) => number;
/**
 * Clear a timeout and remove it from Redux
 * @param id Timeout ID to clear
 */
export declare function clearTimeout(id: number): (dispatch: any) => void;
/**
 * Clear an interval and remove it from Redux
 * @param id Interval ID to clear
 */
export declare function clearInterval(id: number): (dispatch: any) => void;
/**
 * Clear all timers for a component
 * @param componentId Component ID
 */
export declare function clearTimersForComponent(componentId: string): (dispatch: any, getState: () => RootState) => void;
/**
 * Clear all timers across all components
 */
export declare function clearAllTimersAction(): (dispatch: any) => void;
declare const _default: any;
export default _default;
