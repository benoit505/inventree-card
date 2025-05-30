import { RootState } from '../index';
export interface ApiState {
    url: string | null;
    apiKey: string | null;
    initialized: boolean;
    error: string | null;
    throttleDelayMs: number;
    cacheLifetimeMs: number;
    failedRequestRetryDelayMs: number;
}
export declare const setApiConfig: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    url: string;
    apiKey: string;
    throttleDelayMs?: number;
    cacheLifetime?: number;
    failedRequestRetryDelaySeconds?: number;
}, "api/setApiConfig">, apiInitializationSuccess: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"api/apiInitializationSuccess">, apiInitializationError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "api/apiInitializationError">, clearApiConfig: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"api/clearApiConfig">;
export declare const selectApiUrl: (state: RootState) => string | null;
export declare const selectApiKey: (state: RootState) => string | null;
export declare const selectApiInitialized: (state: RootState) => boolean;
export declare const selectApiError: (state: RootState) => string | null;
export declare const selectApiThrottleDelayMs: (state: RootState) => number;
export declare const selectApiCacheLifetimeMs: (state: RootState) => number;
export declare const selectApiFailedRequestRetryDelayMs: (state: RootState) => number;
export declare const selectApiConfig: (state: RootState) => ApiState;
declare const _default: import("redux").Reducer<ApiState>;
export default _default;
