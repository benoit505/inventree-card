import { createSlice } from '@reduxjs/toolkit';
import { cleanupAllTimers, safeSetTimeout, safeClearTimeout, safeSetInterval, safeClearInterval } from '../../utils/safe-timer';
const initialState = {
    timers: {},
    componentTimers: {},
    lastId: 0
};
export const timerSlice = createSlice({
    name: 'timers',
    initialState,
    reducers: {
        addTimer: (state, action) => {
            const { componentId, label, startTime, delay, type } = action.payload;
            const id = ++state.lastId;
            // Add timer to the timers map
            state.timers[id] = {
                id,
                componentId,
                label,
                startTime,
                delay,
                type
            };
            // Ensure the component exists in the componentTimers map
            if (!state.componentTimers[componentId]) {
                state.componentTimers[componentId] = new Set();
            }
            // Add the timer ID to the component's set of timers
            state.componentTimers[componentId].add(id);
        },
        removeTimer: (state, action) => {
            const id = action.payload;
            const timer = state.timers[id];
            if (timer) {
                // Remove from componentTimers
                if (state.componentTimers[timer.componentId]) {
                    state.componentTimers[timer.componentId].delete(id);
                    // Clean up empty component entries
                    if (state.componentTimers[timer.componentId].size === 0) {
                        delete state.componentTimers[timer.componentId];
                    }
                }
                // Remove from timers map
                delete state.timers[id];
            }
        },
        clearComponentTimers: (state, action) => {
            const componentId = action.payload;
            const timers = state.componentTimers[componentId];
            if (timers) {
                // Clean up each timer
                timers.forEach((id) => {
                    delete state.timers[id];
                });
                // Remove the component entry
                delete state.componentTimers[componentId];
            }
        },
        clearAllTimers: (state) => {
            state.timers = {};
            state.componentTimers = {};
            // Do not reset lastId to prevent ID collisions
        }
    }
});
// Action creators
export const { addTimer, removeTimer, clearComponentTimers, clearAllTimers } = timerSlice.actions;
// Selectors
export const selectAllTimers = (state) => state.timers.timers;
export const selectComponentTimers = (state, componentId) => Object.values(state.timers.timers).filter((timer) => timer !== null &&
    typeof timer === 'object' &&
    'componentId' in timer &&
    timer.componentId === componentId);
export const selectTimerStats = (state) => {
    const timers = Object.values(state.timers.timers);
    return {
        total: timers.length,
        timeouts: timers.filter((t) => t.type === 'timeout').length,
        intervals: timers.filter((t) => t.type === 'interval').length,
        byComponent: Object.fromEntries(Object.entries(state.timers.componentTimers).map(([componentId, timerIds]) => [
            componentId,
            {
                total: timerIds.size,
                timeouts: Array.from(timerIds)
                    .filter(id => { var _a; return ((_a = state.timers.timers[id]) === null || _a === void 0 ? void 0 : _a.type) === 'timeout'; }).length,
                intervals: Array.from(timerIds)
                    .filter(id => { var _a; return ((_a = state.timers.timers[id]) === null || _a === void 0 ? void 0 : _a.type) === 'interval'; }).length
            }
        ]))
    };
};
// Middleware functions
/**
 * Create a timeout and track it in Redux
 * @param componentId Component ID for tracking
 * @param callback Function to call when timeout expires
 * @param delay Delay in milliseconds
 * @param label Optional label for debugging
 * @returns Timeout ID
 */
export function createTimeout(componentId, callback, delay, label) {
    return (dispatch) => {
        const id = safeSetTimeout(callback, delay, label);
        dispatch(addTimer({
            componentId,
            label,
            startTime: Date.now(),
            delay,
            type: 'timeout'
        }));
        return id;
    };
}
/**
 * Create an interval and track it in Redux
 * @param componentId Component ID for tracking
 * @param callback Function to call on each interval
 * @param delay Delay in milliseconds
 * @param label Optional label for debugging
 * @returns Interval ID
 */
export function createInterval(componentId, callback, delay, label) {
    return (dispatch) => {
        const id = safeSetInterval(callback, delay, label);
        dispatch(addTimer({
            componentId,
            label,
            startTime: Date.now(),
            delay,
            type: 'interval'
        }));
        return id;
    };
}
/**
 * Clear a timeout and remove it from Redux
 * @param id Timeout ID to clear
 */
export function clearTimeout(id) {
    return (dispatch) => {
        safeClearTimeout(id);
        dispatch(removeTimer(id));
    };
}
/**
 * Clear an interval and remove it from Redux
 * @param id Interval ID to clear
 */
export function clearInterval(id) {
    return (dispatch) => {
        safeClearInterval(id);
        dispatch(removeTimer(id));
    };
}
/**
 * Clear all timers for a component
 * @param componentId Component ID
 */
export function clearTimersForComponent(componentId) {
    return (dispatch, getState) => {
        const timers = selectComponentTimers(getState(), componentId);
        timers.forEach((timer) => {
            if (timer.type === 'timeout') {
                safeClearTimeout(timer.id);
            }
            else {
                safeClearInterval(timer.id);
            }
        });
        dispatch(clearComponentTimers(componentId));
    };
}
/**
 * Clear all timers across all components
 */
export function clearAllTimersAction() {
    return (dispatch) => {
        cleanupAllTimers();
        dispatch(clearAllTimers());
    };
}
export default timerSlice.reducer;
//# sourceMappingURL=timerSlice.js.map