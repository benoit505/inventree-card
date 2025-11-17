import { configureStore, combineReducers, Middleware, ThunkAction, Action, ThunkDispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, PersistConfig, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// Import individual reducers
import componentReducer from './slices/componentSlice';
import conditionalLogicReducer from './slices/conditionalLogicSlice';
import configReducer from './slices/configSlice';
import genericHaStatesReducer from './slices/genericHaStateSlice';
// REMOVED: metricsReducer - unused metrics system removed (210 lines)
import parametersReducer from './slices/parametersSlice';
import partsReducer from './slices/partsSlice';
import uiReducer from './slices/uiSlice';
import visualEffectsReducer from './slices/visualEffectsSlice';
import websocketReducer from './slices/websocketSlice';
import { inventreeApi } from './apis/inventreeApi';
import { loggingApi } from './apis/loggingApi';
import actionsReducer from './slices/actionsSlice';
import loggingReducer from './slices/loggingSlice';

// Import Middleware
import { websocketMiddleware } from './middleware/websocketMiddleware';
import { configRehydrationMiddleware } from './middleware/configRehydrationMiddleware';
// REMOVED: metricsMiddleware - unused metrics middleware removed (35 lines)
import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';

// 1. Combine reducers first
const appReducer = combineReducers({
  components: componentReducer,
  conditionalLogic: conditionalLogicReducer,
  config: configReducer,
  genericHaStates: genericHaStatesReducer,
  // REMOVED: metrics - unused metrics system removed
  parameters: parametersReducer,
  parts: partsReducer,
  ui: uiReducer,
  visualEffects: visualEffectsReducer,
  websocket: websocketReducer,
  actions: actionsReducer,
  logging: loggingReducer,
  [inventreeApi.reducerPath]: inventreeApi.reducer,
  [loggingApi.reducerPath]: loggingApi.reducer,
});

// 2. Define RootState based on the combined reducer
export type RootState = ReturnType<typeof appReducer>;

// 3. Create a transform to exclude API credentials from persistence
// API keys should always come fresh from the YAML config, not from localStorage
const excludeApiKeyTransform = createTransform(
  // Transform state before persisting (outbound)
  (inboundState: any, key) => {
    if (key === 'config') {
      const sanitized = { ...inboundState };
      // Remove API key from globalConfig before persisting
      if (sanitized.globalConfig?.direct_api) {
        sanitized.globalConfig = {
          ...sanitized.globalConfig,
          direct_api: {
            ...sanitized.globalConfig.direct_api,
            api_key: undefined, // Don't persist the API key
          },
        };
      }
      // Also remove API keys from individual card instances
      if (sanitized.configsByInstance) {
        const cleanedInstances: any = {};
        Object.keys(sanitized.configsByInstance).forEach(instanceId => {
          const instance = sanitized.configsByInstance[instanceId];
          if (instance?.config?.direct_api) {
            cleanedInstances[instanceId] = {
              ...instance,
              config: {
                ...instance.config,
                direct_api: {
                  ...instance.config.direct_api,
                  api_key: undefined, // Don't persist the API key
                },
              },
            };
          } else {
            cleanedInstances[instanceId] = instance;
          }
        });
        sanitized.configsByInstance = cleanedInstances;
      }
      console.log('%c[Redux Persist] Persisting config WITHOUT API keys', 'color: #E74C3C; font-weight: bold;');
      return sanitized;
    }
    return inboundState;
  },
  // Transform state after rehydrating (inbound) - no transformation needed
  (outboundState, key) => {
    if (key === 'config') {
      console.log('%c[Redux Persist] Rehydrating config (API keys will come from YAML)', 'color: #27AE60; font-weight: bold;');
    }
    return outboundState;
  },
  { whitelist: ['config'] }
);

// 4. Create the persist config with the correct RootState type
const persistConfig: PersistConfig<RootState> = {
  key: 'inventree-card-root',
  storage,
  whitelist: ['config'],
  transforms: [excludeApiKeyTransform],
  // Add type reconciler to help with type compatibility
  stateReconciler: autoMergeLevel2,
};

// 5. Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, appReducer);

// 6. Configure the store with proper typing
// Type assertion through 'unknown' to satisfy redux-persist compatibility
export const store = configureStore({
  reducer: persistedReducer as unknown as typeof appReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat([
      configRehydrationMiddleware as Middleware,
      websocketMiddleware as Middleware,
      inventreeApi.middleware,
      loggingApi.middleware,
    ]),
});

// 7. Connect core services to the store
ConditionalLoggerEngine.getInstance().connectToStore(store);

// 8. Set up the persistor
export const persistor = persistStore(store);

// Define AppDispatch and other types
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


