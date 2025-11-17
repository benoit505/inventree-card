import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../index';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('inventreeBaseQuery');

const baseQuery = fetchBaseQuery({
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    // Since we can't get cardInstanceId here, we'll rely on a global/last-used config.
    // This is a limitation we must accept for now. A more advanced solution might involve a custom middleware.
    const globalConfig = state.config.globalConfig?.direct_api;
    
    console.log('%c[prepareHeaders] Preparing request headers', 'color: #8E44AD; font-weight: bold;', {
      hasGlobalConfig: !!globalConfig,
      hasApiKey: !!globalConfig?.api_key,
      apiKeyPrefix: globalConfig?.api_key?.substring(0, 20) + '...',
      willSetHeader: !!(globalConfig && globalConfig.api_key)
    });
    
    if (globalConfig && globalConfig.api_key) {
      headers.set('Authorization', `Token ${globalConfig.api_key}`);
    }
    return headers;
  },
});

export const inventreeBaseQuery = (): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const globalConfig = state.config.globalConfig?.direct_api;

  console.log('%c[inventreeBaseQuery] Making API request', 'color: #9B59B6; font-weight: bold;', {
    hasGlobalConfig: !!globalConfig,
    hasUrl: !!globalConfig?.url,
    hasApiKey: !!globalConfig?.api_key,
    apiKeyPrefix: globalConfig?.api_key?.substring(0, 20) + '...',
    url: globalConfig?.url,
    requestArgs: typeof args === 'string' ? args : args.url
  });

  if (!globalConfig || !globalConfig.url) {
    logger.error('inventreeBaseQuery', 'InvenTree API URL is not configured in the global settings.');
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: 'InvenTree API URL not configured.',
      },
    };
  }
  
  const finalArgs = typeof args === 'string' ? { url: args } : args;

  // Prepend the base URL to the request URL
  const url = `${globalConfig.url.replace(/\/$/, '')}/${finalArgs.url.replace(/^\//, '')}`;
  
  const result = await baseQuery({ ...finalArgs, url }, api, extraOptions);
  
  console.log('%c[inventreeBaseQuery] API request result', 'color: #9B59B6; font-weight: bold;', {
    url,
    hasError: !!result.error,
    error: result.error,
    hasData: !!result.data
  });
  
  return result;
};
