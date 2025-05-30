import { configureStore, combineReducers, Middleware, ThunkAction, Action, ThunkDispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import individual reducers
import apiReducer from './slices/apiSlice';
import componentReducer from './slices/componentSlice';
import conditionalLogicReducer from './slices/conditionalLogicSlice';
import configReducer from './slices/configSlice';
import counterReducer from './slices/counterSlice';
import genericHaStatesReducer from './slices/genericHaStateSlice';
import metricsReducer from './slices/metricsSlice';
import parametersReducer from './slices/parametersSlice';
import partsReducer from './slices/partsSlice';
import uiReducer from './slices/uiSlice';
import visualEffectsReducer from './slices/visualEffectsSlice';
import websocketReducer from './slices/websocketSlice';

// Import the API slice we created
import { inventreeApi } from './apis/inventreeApi';

// Import Middleware
import { loggingMiddleware } from './middleware/logging-middleware';
import { servicesMiddleware } from './middleware/services-middleware';
import { websocketMiddleware } from './middleware/websocketMiddleware';
import metricsMiddleware from './middleware/metricsMiddleware';

// Export rootReducer for store/types.ts
export const rootReducer = combineReducers({
  api: apiReducer,
  components: componentReducer,
  conditionalLogic: conditionalLogicReducer,
  config: configReducer,
  counter: counterReducer,
  genericHaStates: genericHaStatesReducer,
  metrics: metricsReducer,
  parameters: parametersReducer,
  parts: partsReducer,
  ui: uiReducer,
  visualEffects: visualEffectsReducer,
  websocket: websocketReducer,
  // Add the generated reducer as a specific top-level slice for RTK Query
  [inventreeApi.reducerPath]: inventreeApi.reducer,
});

// Define RootState first
export type RootState = ReturnType<typeof rootReducer>;

// Define AppDispatch explicitly
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;

// A generic AppThunk type for creating thunks
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown, 
  Action<string>
>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([
      loggingMiddleware,
      servicesMiddleware,
      websocketMiddleware,
      metricsMiddleware,
      inventreeApi.middleware,
    ]),
});

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


