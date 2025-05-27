import { configureStore, combineReducers } from '@reduxjs/toolkit';
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
import searchReducer from './slices/searchSlice';
import timerReducer from './slices/timerSlice';
import uiReducer from './slices/uiSlice';
import visualEffectsReducer from './slices/visualEffectsSlice';
import websocketReducer from './slices/websocketSlice';

// Import Middleware
// Note: Paths are now relative to src/store/ not src/
import { loggingMiddleware } from './middleware/logging-middleware';
import { servicesMiddleware } from './middleware/services-middleware';
import { timerMiddleware } from './middleware/timer-middleware';
import { websocketMiddleware } from './middleware/websocketMiddleware';
import { debounceMiddleware } from './middleware/debounceMiddleware';
import metricsMiddleware from './middleware/metricsMiddleware';
import { Middleware } from '@reduxjs/toolkit'; // Import Middleware type

const rootReducer = combineReducers({
  api: apiReducer,
  components: componentReducer,
  conditionalLogic: conditionalLogicReducer,
  config: configReducer,
  counter: counterReducer,
  genericHaStates: genericHaStatesReducer,
  metrics: metricsReducer,
  parameters: parametersReducer,
  parts: partsReducer,
  search: searchReducer,
  timers: timerReducer,
  ui: uiReducer,
  visualEffects: visualEffectsReducer,
  websocket: websocketReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware: (options?: { serializableCheck?: boolean | Record<string, any> }) => Middleware[]) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      loggingMiddleware,
      servicesMiddleware,
      timerMiddleware,
      websocketMiddleware,
      debounceMiddleware,
      metricsMiddleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


