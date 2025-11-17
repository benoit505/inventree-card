import { Middleware } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { setConfigAction } from '../slices/configSlice';
import type { RootState } from '../index';

/**
 * Middleware to ensure fresh config from YAML always wins over persisted state.
 * 
 * When redux-persist rehydrates, it can overwrite the fresh config with stale data
 * from localStorage (including old API keys). This middleware captures the fresh
 * config when it's first set, then re-applies it after rehydration completes.
 */

// Store for the fresh configs that should survive rehydration
const freshConfigs: Map<string, any> = new Map();

export const configRehydrationMiddleware: Middleware = (store) => (next) => (action: any) => {
  // Capture fresh configs as they're set (before rehydration)
  if (action.type === setConfigAction.type) {
    const { cardInstanceId, config } = action.payload;
    console.log('%c[ConfigRehydrationMiddleware] Capturing fresh config', 'color: #9B59B6; font-weight: bold;', {
      cardInstanceId,
      hasApiKey: !!config?.direct_api?.api_key,
      apiKeyPrefix: config?.direct_api?.api_key?.substring(0, 20) + '...'
    });
    freshConfigs.set(cardInstanceId, config);
  }
  
  // Let the action through
  const result = next(action);
  
  // After rehydration completes, re-apply all fresh configs
  if (action.type === REHYDRATE) {
    console.log('%c[ConfigRehydrationMiddleware] REHYDRATE detected, re-applying fresh configs', 'color: #E74C3C; font-weight: bold;', {
      freshConfigCount: freshConfigs.size,
      cardInstanceIds: Array.from(freshConfigs.keys())
    });
    
    // Re-dispatch all fresh configs to overwrite rehydrated state
    freshConfigs.forEach((config, cardInstanceId) => {
      console.log('%c[ConfigRehydrationMiddleware] Re-applying fresh config for', 'color: #27AE60; font-weight: bold;', {
        cardInstanceId,
        hasApiKey: !!config?.direct_api?.api_key,
        apiKeyPrefix: config?.direct_api?.api_key?.substring(0, 20) + '...'
      });
      
      store.dispatch(setConfigAction({ cardInstanceId, config }));
    });
  }
  
  return result;
};

