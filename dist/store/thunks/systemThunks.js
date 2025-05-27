import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiInitializationError, setApiConfig, apiInitializationSuccess } from '../slices/apiSlice';
import { trackUsage } from '../../utils/metrics-tracker';
import { WebSocketPlugin } from '../../services/websocket-plugin';
import { setParts, registerEntity } from '../slices/partsSlice';
import { setWebSocketStatus } from '../slices/websocketSlice';
// Thunk to initialize the Direct API
export const initializeDirectApi = createAsyncThunk('system/initializeDirectApi', async (args, { dispatch, getState }) => {
    var _a, _b, _c, _d, _e, _f;
    const { directApiConfig, logger } = args;
    try {
        logger.log('SystemThunks', 'Initializing Direct API...', directApiConfig);
        const throttleSec = (_b = (_a = directApiConfig.performance) === null || _a === void 0 ? void 0 : _a.api) === null || _b === void 0 ? void 0 : _b.throttle;
        let throttleDelayMs = 200;
        if (typeof throttleSec === 'number' && throttleSec >= 0) {
            throttleDelayMs = throttleSec * 1000;
        }
        else if (throttleSec !== undefined) {
            logger.warn('SystemThunks', `Invalid API throttle value: ${throttleSec}, using default ${throttleDelayMs}ms`);
        }
        const cacheLifetimeSec = (_d = (_c = directApiConfig.performance) === null || _c === void 0 ? void 0 : _c.api) === null || _d === void 0 ? void 0 : _d.cacheLifetime;
        const failedRetryDelaySec = (_f = (_e = directApiConfig.performance) === null || _e === void 0 ? void 0 : _e.api) === null || _f === void 0 ? void 0 : _f.failedRequestRetryDelaySeconds;
        if (directApiConfig.url && directApiConfig.api_key) {
            dispatch(setApiConfig({
                url: directApiConfig.url,
                apiKey: directApiConfig.api_key,
                throttleDelayMs: throttleDelayMs,
                cacheLifetime: cacheLifetimeSec,
                failedRequestRetryDelaySeconds: failedRetryDelaySec
            }));
            dispatch(apiInitializationSuccess());
            logger.log('SystemThunks', 'Direct API Initialized');
            trackUsage('api', 'initialize', { success: true, method: 'direct' });
            return true;
        }
        else {
            logger.error('SystemThunks', 'Direct API Initialization Failed: Missing URL or API key');
            dispatch(apiInitializationError('Missing URL or API key'));
            return false;
        }
    }
    catch (error) {
        logger.error('SystemThunks', 'Direct API Initialization Failed:', error.message);
        dispatch(apiInitializationError(error.message || 'Unknown API initialization error'));
        return false;
    }
});
// Thunk to initialize the WebSocket plugin
export const initializeWebSocketPlugin = createAsyncThunk('system/initializeWebSocketPlugin', async (args, { dispatch, getState }) => {
    const { directApiConfig, cardDebugWebSocket, logger } = args;
    if (!directApiConfig) {
        logger.warn('Thunk:initializeWebSocketPlugin', 'Direct API config not provided, skipping WebSocket plugin initialization.');
        return;
    }
    const plugin = WebSocketPlugin.getInstance();
    logger.log('Thunk:initializeWebSocketPlugin', 'Configuring WebSocket Plugin with settings', { data: directApiConfig });
    // Corrected: Assuming configure only takes directApiConfig. 
    // cardDebugWebSocket and dispatch are not passed here based on the linter error.
    plugin.configure(directApiConfig);
    logger.log('Thunk:initializeWebSocketPlugin', 'WebSocket Plugin configured.');
    if (directApiConfig.enabled && (directApiConfig.url || directApiConfig.websocket_url)) {
        logger.log('Thunk:initializeWebSocketPlugin', 'Attempting to connect WebSocket plugin...');
        try {
            await plugin.connect();
            logger.log('Thunk:initializeWebSocketPlugin', 'WebSocket plugin connected successfully.');
        }
        catch (error) {
            logger.error('Thunk:initializeWebSocketPlugin', 'WebSocket plugin connection failed:', { error });
            dispatch(setWebSocketStatus('disconnected'));
        }
    }
    else {
        logger.warn('Thunk:initializeWebSocketPlugin', 'WebSocket plugin not connected: Direct API not enabled or URL/WebSocket URL is missing in config.');
        dispatch(setWebSocketStatus('disconnected'));
    }
});
export const processHassEntities = createAsyncThunk('system/processHassEntities', async (args, { dispatch }) => {
    var _a;
    const { hass, mainEntityId, selectedEntities = [], logger } = args;
    let processedCount = 0;
    const entityIdsToProcess = new Set();
    if (mainEntityId) {
        entityIdsToProcess.add(mainEntityId);
    }
    selectedEntities.forEach(id => entityIdsToProcess.add(id));
    if (entityIdsToProcess.size === 0) {
        logger.warn('Thunk:processHassEntities', 'No entities configured for HASS processing.');
        trackUsage('redux', 'thunk:processHassEntities:noentities');
        return { processedCount: 0, errors: 0 };
    }
    logger.log('Thunk:processHassEntities', `Processing HASS state for entities: ${Array.from(entityIdsToProcess).join(', ')}`);
    trackUsage('redux', 'thunk:processHassEntities:attempt', { count: entityIdsToProcess.size });
    let errorCount = 0;
    for (const entityId of entityIdsToProcess) {
        const entityState = hass.states[entityId];
        if (!entityState) {
            logger.warn('Thunk:processHassEntities', `Entity ${entityId} not found in HASS states.`);
            errorCount++;
            continue;
        }
        const items = (_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.items;
        if (items && Array.isArray(items)) {
            const parts = items.map(item => (Object.assign(Object.assign({}, item), { source: `hass:${entityId}` })));
            const partIds = parts.map(p => p.pk);
            if (parts.length > 0) {
                logger.log('Thunk:processHassEntities', `Dispatching setParts for ${entityId} with ${parts.length} items.`);
                dispatch(setParts({ entityId, parts }));
                dispatch(registerEntity({ entityId, partIds }));
                processedCount++;
            }
            else {
                logger.log('Thunk:processHassEntities', `No items found for entity ${entityId} after processing.`);
                dispatch(setParts({ entityId, parts: [] }));
                dispatch(registerEntity({ entityId, partIds: [] }));
            }
        }
        else {
            logger.warn('Thunk:processHassEntities', `No 'items' attribute or not an array for entity ${entityId}.`, { attributes: entityState.attributes });
            dispatch(setParts({ entityId, parts: [] }));
            dispatch(registerEntity({ entityId, partIds: [] }));
            errorCount++;
        }
    }
    trackUsage('redux', `thunk:processHassEntities:${errorCount > 0 ? 'partial_success' : 'success'}`, { processed: processedCount, errors: errorCount });
    return { processedCount, errors: errorCount };
});
// We can add initializeWebSocketPlugin thunk here later 
//# sourceMappingURL=systemThunks.js.map