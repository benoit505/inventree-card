import { configureStore, combineReducers, Middleware, ThunkAction, Action, ThunkDispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// Import individual reducers
import componentReducer from './slices/componentSlice';
import conditionalLogicReducer from './slices/conditionalLogicSlice';
import configReducer from './slices/configSlice';
import genericHaStatesReducer from './slices/genericHaStateSlice';
import metricsReducer from './slices/metricsSlice';
import parametersReducer from './slices/parametersSlice';
import partsReducer from './slices/partsSlice';
import uiReducer from './slices/uiSlice';
import visualEffectsReducer from './slices/visualEffectsSlice';
import websocketReducer from './slices/websocketSlice';
import layoutReducer from './slices/layoutSlice';
import { inventreeApi } from './apis/inventreeApi';
import { loggingApi } from './apis/loggingApi';
import actionsReducer from './slices/actionsSlice';
import loggingReducer from './slices/loggingSlice';

// Import Middleware
import { websocketMiddleware } from './middleware/websocketMiddleware';
import metricsMiddleware from './middleware/metricsMiddleware';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';

// 1. Combine reducers first
const appReducer = combineReducers({
  components: componentReducer,
  conditionalLogic: conditionalLogicReducer,
  config: configReducer,
  genericHaStates: genericHaStatesReducer,
  metrics: metricsReducer,
  parameters: parametersReducer,
  parts: partsReducer,
  ui: uiReducer,
  visualEffects: visualEffectsReducer,
  websocket: websocketReducer,
  actions: actionsReducer,
  logging: loggingReducer,
  layout: layoutReducer,
  [inventreeApi.reducerPath]: inventreeApi.reducer,
  [loggingApi.reducerPath]: loggingApi.reducer,
});

// 2. Define RootState based on the combined reducer
export type RootState = ReturnType<typeof appReducer>;

// 3. Create the persist config with the correct RootState type
const persistConfig = {
  key: 'inventree-card-root',
  storage,
  whitelist: ['config', 'layout'],
};

// 4. Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, appReducer);

// 5. Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat([
      websocketMiddleware,
      metricsMiddleware,
      loggingMiddleware,
      inventreeApi.middleware,
      loggingApi.middleware,
    ]),
});

// 6. Connect core services to the store
ConditionalLoggerEngine.getInstance().connectToStore(store);

// 7. Set up the persistor
export const persistor = persistStore(store);

// Define AppDispatch and other types
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


