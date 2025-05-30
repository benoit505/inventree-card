import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
// import { CacheService } from '../../services/cache'; // Removing CacheService
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
  (action: unknown) => {
  const typedAction = action as AnyAction;
  logger.log('Redux', `Action dispatched: ${typedAction.type}`, { 
    category: 'redux', 
    subsystem: 'middleware' 
  });

  // Process actions that need to interact with existing services
  if (typedAction.type === 'parts/fetchParts/fulfilled') {
    const { entityId, data } = typedAction.payload;
    
    // Cache update logic removed as RTK Query will handle API data caching
    // const cache = CacheService.getInstance(); // Removed
    // const cacheKey = `entity-data:${entityId}`; // Removed
    // cache.set(cacheKey, data); // Removed
    
    logger.log('Redux', `Updated service data for entity ${entityId} (cache.set removed)`, { 
      category: 'redux', 
      subsystem: 'sync' 
    });
  }
  
  // For parameter updates
  if (typedAction.type === 'parameters/updateValue') {
    const { partId: updatePartId, paramName: updateParamName, value: updateValue } = typedAction.payload;
    store.dispatch(updateParameterValue({ partId: updatePartId, paramName: updateParamName, value: updateValue }) as any);
    logger.log('Redux', `Dispatched updateParameterValue thunk for ${updateParamName}`, { /* ... */ });
  }
  
  // For parameter condition checks
  if (typedAction.type === 'parameters/checkCondition') {
    const { part, condition } = typedAction.payload;
    
    logger.log('Redux', `Checking condition for part ${part?.pk}`, { 
      category: 'redux', 
      subsystem: 'parameters',
      condition
    });
    
    // We don't need to do anything, this is just for tracking
  }
  
  // For condition cache clearing
  if (typedAction.type === 'parameters/clearConditionCache' || typedAction.type === 'parameters/clearCache') {
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
  return next(typedAction);
}; 