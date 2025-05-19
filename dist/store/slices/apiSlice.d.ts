import { RootState } from '../index';
interface ApiState {
    url: string | null;
    apiKey: string | null;
    initialized: boolean;
    error: string | null;
    throttleDelayMs: number;
    cacheLifetimeMs: number;
    failedRequestRetryDelayMs: number;
}
export declare const setApiConfig: any, apiInitializationSuccess: any, apiInitializationError: any, clearApiConfig: any;
export declare const selectApiUrl: (state: RootState) => string | null;
export declare const selectApiKey: (state: RootState) => string | null;
export declare const selectApiInitialized: (state: RootState) => boolean;
export declare const selectApiError: (state: RootState) => string | null;
export declare const selectApiThrottleDelayMs: (state: RootState) => number;
export declare const selectApiCacheLifetimeMs: (state: RootState) => number;
export declare const selectApiFailedRequestRetryDelayMs: (state: RootState) => number;
export declare const selectApiConfig: (state: RootState) => ApiState;
declare const _default: any;
export default _default;
