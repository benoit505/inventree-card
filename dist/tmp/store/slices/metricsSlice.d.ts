import { RootState } from '../index';
export declare const trackUsage: any, trackEvent: any, trackTimerOperation: any, trackRenderTiming: any, clearMetrics: any;
export declare const selectUsageMetrics: (state: RootState) => any;
export declare const selectEvents: (state: RootState) => any;
export declare const selectTimerOperations: (state: RootState) => any;
export declare const selectRenderTimings: (state: RootState) => any;
export declare const selectMigrationProgress: (state: RootState) => {
    reduxOperations: number;
    legacyOperations: number;
    totalOperations: number;
    migrationPercentage: number;
};
declare const _default: any;
export default _default;
