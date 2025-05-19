import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { CacheService } from '../../services/cache';
import { Logger } from '../../utils/logger';
import { store } from '../index';
import { updateParameterValue } from '../thunks/parameterThunks';

/**
 * Middleware to bridge Redux with existing InvenTree services
 * 
 * This middleware allows us to:
 * 1. Gradually migrate from service singletons to Redux
 * 2. Keep existing functionality working during transition
 * 3. Sync data between old and new state systems
 */
const logger = Logger.getInstance();

export const servicesMiddleware: Middleware = 
  (api) => 
  (next) => 
  (action) => {
  logger.log('Redux', `Action dispatched: ${action.type}`, { 
    category: 'redux', 
    subsystem: 'middleware' 
  });

  // Process actions that need to interact with existing services
  if (action.type === 'parts/fetchParts/fulfilled') {
    const { entityId, data } = action.payload;
    
    // Keep Cache update logic (maybe refine later)
    const cache = CacheService.getInstance();
    const cacheKey = `entity-data:${entityId}`;
    cache.set(cacheKey, data);
    
    logger.log('Redux', `Updated service data for entity ${entityId}`, { 
      category: 'redux', 
      subsystem: 'sync' 
    });
  }
  
  // For parameter updates
  if (action.type === 'parameters/updateValue') {
    const { partId: updatePartId, parameterName: updateParamName, value: updateValue } = action.payload;
    store.dispatch(updateParameterValue({ partId: updatePartId, parameterName: updateParamName, value: updateValue }));
    logger.log('Redux', `Dispatched updateParameterValue thunk for ${updateParamName}`, { /* ... */ });
  }
  
  // For parameter condition checks
  if (action.type === 'parameters/checkCondition') {
    const { part, condition } = action.payload;
    
    logger.log('Redux', `Checking condition for part ${part?.pk}`, { 
      category: 'redux', 
      subsystem: 'parameters',
      condition
    });
    
    // We don't need to do anything, this is just for tracking
  }
  
  // For condition cache clearing
  if (action.type === 'parameters/clearConditionCache' || action.type === 'parameters/clearCache') {
    logger.log('Redux', `Clearing parameter cache`, { 
      category: 'redux', 
      subsystem: 'parameters' 
    });
    
    // If we have a parameter service, clear its cache
    // if (ParameterService.hasInstance()) {
    //   const paramService = ParameterService.getInstance();
    //   paramService.clearConditionCache();
    //   
    //   // Also dispatch a cache cleared event to notify components
    //   window.dispatchEvent(new CustomEvent('inventree-cache-cleared'));
    // }
  }
  
  // Continue the action through the middleware chain
  return next(action);
}; 