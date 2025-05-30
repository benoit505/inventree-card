import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface ApiState {
  url: string | null;
  apiKey: string | null;
  initialized: boolean;
  error: string | null;
  throttleDelayMs: number;
  cacheLifetimeMs: number;
  failedRequestRetryDelayMs: number;
}

const initialState: ApiState = {
  url: null,
  apiKey: null,
  initialized: false,
  error: null,
  throttleDelayMs: 200,
  cacheLifetimeMs: 60000,
  failedRequestRetryDelayMs: 30000,
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setApiConfig(state: ApiState, action: PayloadAction<{ 
      url: string; 
      apiKey: string; 
      throttleDelayMs?: number; 
      cacheLifetime?: number;
      failedRequestRetryDelaySeconds?: number;
    }>) {
      state.url = action.payload.url;
      state.apiKey = action.payload.apiKey;
      if (typeof action.payload.throttleDelayMs === 'number' && action.payload.throttleDelayMs >= 0) {
        state.throttleDelayMs = action.payload.throttleDelayMs;
      }
      if (typeof action.payload.cacheLifetime === 'number' && action.payload.cacheLifetime >= 0) {
        state.cacheLifetimeMs = action.payload.cacheLifetime * 1000;
      } else if (action.payload.cacheLifetime === undefined) {
        // If not provided, keep the existing or default cacheLifetimeMs
      } else {
        state.cacheLifetimeMs = initialState.cacheLifetimeMs;
        logger.warn('apiSlice', 'Invalid cacheLifetime provided, reset to default.');
      }
      if (typeof action.payload.failedRequestRetryDelaySeconds === 'number' && action.payload.failedRequestRetryDelaySeconds >= 0) {
        state.failedRequestRetryDelayMs = action.payload.failedRequestRetryDelaySeconds * 1000;
      } else if (action.payload.failedRequestRetryDelaySeconds === undefined) {
        // If not provided, keep existing or default
      } else {
        state.failedRequestRetryDelayMs = initialState.failedRequestRetryDelayMs;
        logger.warn('apiSlice', 'Invalid failedRequestRetryDelaySeconds provided, reset to default.');
      }
      state.error = null;
      logger.log('apiSlice', 'API config set.', { data: { 
        url: state.url, 
        throttle: state.throttleDelayMs, 
        cacheLifetime: state.cacheLifetimeMs,
        failedRetryDelay: state.failedRequestRetryDelayMs
      }});
    },
    apiInitializationSuccess(state: ApiState) {
      if (state.url && state.apiKey) {
        state.initialized = true;
        state.error = null;
        logger.log('apiSlice', 'API marked as initialized successfully.');
      } else {
         logger.warn('apiSlice', 'Tried to mark API as initialized, but URL or API Key is missing.');
         state.error = 'Initialization attempted without full config.';
      }
    },
    apiInitializationError(state: ApiState, action: PayloadAction<string>) {
      state.initialized = false;
      state.error = action.payload;
      logger.error('apiSlice', `API initialization failed: ${action.payload}`);
    },
    clearApiConfig(state: ApiState) {
        state.url = null;
        state.apiKey = null;
        state.initialized = false;
        state.error = null;
        state.throttleDelayMs = initialState.throttleDelayMs;
        state.cacheLifetimeMs = initialState.cacheLifetimeMs;
        state.failedRequestRetryDelayMs = initialState.failedRequestRetryDelayMs;
        logger.log('apiSlice', 'API config cleared.');
    }
  },
});

export const { setApiConfig, apiInitializationSuccess, apiInitializationError, clearApiConfig } = apiSlice.actions;

// Selectors
export const selectApiUrl = (state: RootState): string | null => state.api.url;
export const selectApiKey = (state: RootState): string | null => state.api.apiKey;
export const selectApiInitialized = (state: RootState): boolean => state.api.initialized;
export const selectApiError = (state: RootState): string | null => state.api.error;
export const selectApiThrottleDelayMs = (state: RootState): number => state.api.throttleDelayMs;
export const selectApiCacheLifetimeMs = (state: RootState): number => state.api.cacheLifetimeMs;
export const selectApiFailedRequestRetryDelayMs = (state: RootState): number => state.api.failedRequestRetryDelayMs;
export const selectApiConfig = (state: RootState): ApiState => ({
    url: state.api.url,
    apiKey: state.api.apiKey,
    initialized: state.api.initialized,
    error: state.api.error,
    throttleDelayMs: state.api.throttleDelayMs,
    cacheLifetimeMs: state.api.cacheLifetimeMs,
    failedRequestRetryDelayMs: state.api.failedRequestRetryDelayMs,
});

export default apiSlice.reducer; 