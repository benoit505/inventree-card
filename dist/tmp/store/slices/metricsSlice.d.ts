import { RootState } from '../index';
/**
 * Metrics slice for Redux store to track migration progress and usage statistics
 */
export interface MetricsState {
    usage: {
        redux: Record<string, number>;
        legacy: Record<string, number>;
    };
    events: Array<{
        category: string;
        action: string;
        label?: string;
        value?: number;
        timestamp: number;
    }>;
    performance: {
        timerOperations: {
            redux: {
                setTimeout: number;
                clearTimeout: number;
                setInterval: number;
                clearInterval: number;
            };
            legacy: {
                setTimeout: number;
                clearTimeout: number;
                setInterval: number;
                clearInterval: number;
            };
        };
        renderTiming: {
            lastRender: number;
            history: Array<{
                component: string;
                duration: number;
                timestamp: number;
            }>;
            maxHistory: number;
        };
    };
}
export declare const trackUsage: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    system: "redux" | "legacy";
    operation: string;
}, "metrics/trackUsage">, trackEvent: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    category: string;
    action: string;
    label?: string;
    value?: number;
}, "metrics/trackEvent">, trackTimerOperation: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    system: "redux" | "legacy";
    operation: "setTimeout" | "clearTimeout" | "setInterval" | "clearInterval";
}, "metrics/trackTimerOperation">, trackRenderTiming: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    component: string;
    duration: number;
}, "metrics/trackRenderTiming">, clearMetrics: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"metrics/clearMetrics">;
export declare const selectUsageMetrics: (state: RootState) => {
    redux: Record<string, number>;
    legacy: Record<string, number>;
};
export declare const selectEvents: (state: RootState) => {
    category: string;
    action: string;
    label?: string;
    value?: number;
    timestamp: number;
}[];
export declare const selectTimerOperations: (state: RootState) => {
    redux: {
        setTimeout: number;
        clearTimeout: number;
        setInterval: number;
        clearInterval: number;
    };
    legacy: {
        setTimeout: number;
        clearTimeout: number;
        setInterval: number;
        clearInterval: number;
    };
};
export declare const selectRenderTimings: (state: RootState) => {
    lastRender: number;
    history: Array<{
        component: string;
        duration: number;
        timestamp: number;
    }>;
    maxHistory: number;
};
export declare const selectMigrationProgress: (state: RootState) => {
    reduxOperations: number;
    legacyOperations: number;
    totalOperations: number;
    migrationPercentage: number;
};
declare const _default: import("redux").Reducer<MetricsState>;
export default _default;
