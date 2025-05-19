import { configureStore } from '@reduxjs/toolkit';
import partsReducer from '../../src/store/slices/partsSlice';
import parametersReducer from '../../src/store/slices/parametersSlice';
import uiReducer from '../../src/store/slices/uiSlice';
import counterReducer from '../../src/store/slices/counterSlice';

/**
 * Create a test store with predefined state
 */
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      parts: partsReducer,
      parameters: parametersReducer,
      ui: uiReducer,
      counter: counterReducer
    },
    preloadedState
  });
}

/**
 * Create a mock component that tracks property updates
 */
export function createMockComponent() {
  const updates: {name: string, value: any}[] = [];
  const component = {
    hass: undefined,
    config: undefined,
    parts: undefined,
    propertyUpdated(name: string, value: any) {
      updates.push({ name, value });
      (this as any)[name] = value;
    }
  };
  
  return { component, updates };
}

/**
 * Create a mock store subscriber
 */
export function createMockStoreSubscriber() {
  const calls: number[] = [];
  // Use function for jest compatibility
  const subscriber = function() {
    calls.push(Date.now());
    return;
  };
  
  return { subscriber, calls };
} 