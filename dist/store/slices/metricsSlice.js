import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    usage: {
        redux: {},
        legacy: {}
    },
    events: [],
    performance: {
        timerOperations: {
            redux: {
                setTimeout: 0,
                clearTimeout: 0,
                setInterval: 0,
                clearInterval: 0
            },
            legacy: {
                setTimeout: 0,
                clearTimeout: 0,
                setInterval: 0,
                clearInterval: 0
            }
        },
        renderTiming: {
            lastRender: 0,
            history: [],
            maxHistory: 20
        }
    }
};
const metricsSlice = createSlice({
    name: 'metrics',
    initialState,
    reducers: {
        trackUsage: (state, action) => {
            const { system, operation } = action.payload;
            // Initialize if doesn't exist
            if (!state.usage[system][operation]) {
                state.usage[system][operation] = 0;
            }
            // Increment counter
            state.usage[system][operation]++;
        },
        trackEvent: (state, action) => {
            state.events.push(Object.assign(Object.assign({}, action.payload), { timestamp: Date.now() }));
            // Trim events array if it gets too large
            if (state.events.length > 100) {
                state.events = state.events.slice(-100);
            }
        },
        trackTimerOperation: (state, action) => {
            const { system, operation } = action.payload;
            state.performance.timerOperations[system][operation]++;
        },
        trackRenderTiming: (state, action) => {
            state.performance.renderTiming.lastRender = Date.now();
            state.performance.renderTiming.history.push({
                component: action.payload.component,
                duration: action.payload.duration,
                timestamp: Date.now()
            });
            // Keep history within limits
            if (state.performance.renderTiming.history.length > state.performance.renderTiming.maxHistory) {
                state.performance.renderTiming.history = state.performance.renderTiming.history.slice(-state.performance.renderTiming.maxHistory);
            }
        },
        clearMetrics: (state) => {
            state.usage = { redux: {}, legacy: {} };
            state.events = [];
            state.performance.timerOperations = {
                redux: {
                    setTimeout: 0,
                    clearTimeout: 0,
                    setInterval: 0,
                    clearInterval: 0
                },
                legacy: {
                    setTimeout: 0,
                    clearTimeout: 0,
                    setInterval: 0,
                    clearInterval: 0
                }
            };
        }
    }
});
// Action creators
export const { trackUsage, trackEvent, trackTimerOperation, trackRenderTiming, clearMetrics } = metricsSlice.actions;
// Selectors
export const selectUsageMetrics = (state) => state.metrics.usage;
export const selectEvents = (state) => state.metrics.events;
export const selectTimerOperations = (state) => state.metrics.performance.timerOperations;
export const selectRenderTimings = (state) => state.metrics.performance.renderTiming;
export const selectMigrationProgress = (state) => {
    const { redux, legacy } = state.metrics.usage;
    // Calculate total operations
    let reduxTotal = 0;
    let legacyTotal = 0;
    // Sum all operation counts using proper type assertions
    Object.values(redux).forEach(count => { reduxTotal += count; });
    Object.values(legacy).forEach(count => { legacyTotal += count; });
    const total = reduxTotal + legacyTotal;
    // Calculate percentage
    const percentage = total > 0 ? Math.round((reduxTotal / total) * 100) : 0;
    return {
        reduxOperations: reduxTotal,
        legacyOperations: legacyTotal,
        totalOperations: total,
        migrationPercentage: percentage
    };
};
export default metricsSlice.reducer;
//# sourceMappingURL=metricsSlice.js.map