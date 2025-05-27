import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import partsReducer from './slices/partsSlice';
import parametersReducer from './slices/parametersSlice';
import uiReducer from './slices/uiSlice';
import timerReducer from './slices/timerSlice';
import websocketReducer from './slices/websocketSlice';
import componentReducer from './slices/componentSlice';
import searchReducer from './slices/searchSlice';
import apiReducer from './slices/apiSlice';
import visualEffectsReducer from './slices/visualEffectsSlice';
import configReducer from './slices/configSlice';
import { loggingMiddleware } from './middleware/logging-middleware';
import { servicesMiddleware } from './middleware/services-middleware';
import { timerMiddleware } from './middleware/timer-middleware';
import { websocketMiddleware } from './middleware/websocketMiddleware';
import { debounceMiddleware } from './middleware/debounceMiddleware';
import metricsMiddleware from './middleware/metricsMiddleware';
export const store = configureStore({
    reducer: {
        parts: partsReducer,
        parameters: parametersReducer,
        ui: uiReducer,
        timers: timerReducer,
        websocket: websocketReducer,
        components: componentReducer,
        search: searchReducer,
        api: apiReducer,
        visualEffects: visualEffectsReducer,
        config: configReducer,
    },
    // @ts-ignore - Ignore the TypeScript error for getDefaultMiddleware
    middleware: (getDefaultMiddleware) => {
        // Use object notation style for TypeScript compatibility
        return getDefaultMiddleware({
            serializableCheck: false,
        }).concat(loggingMiddleware, servicesMiddleware, timerMiddleware, websocketMiddleware, debounceMiddleware, metricsMiddleware);
    }
});
// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
//# sourceMappingURL=index.js.map