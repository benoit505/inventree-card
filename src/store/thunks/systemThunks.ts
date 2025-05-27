import { Logger } from '../../utils/logger';
import { InventreeCardConfig, DirectApiConfig } from '../../types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiInitializationError, setApiConfig, apiInitializationSuccess } from '../slices/apiSlice';
import { trackUsage } from '../../utils/metrics-tracker';
import { WebSocketPlugin } from '../../services/websocket-plugin';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem } from '../../types';
import { setParts, registerEntity } from '../slices/partsSlice';
import { RootState } from '../index';
import { setWebSocketStatus } from '../slices/websocketSlice';
import { inventreeApiService } from '../../services/inventree-api-service';
import { store } from '../../store';
import { fetchHaEntityStatesThunk } from './genericHaStateThunks';
import { selectFullConfig } from '../slices/configSlice';

// Thunk to initialize the Direct API
export const initializeDirectApi = createAsyncThunk(
  'system/initializeDirectApi',
  async (args: { directApiConfig: DirectApiConfig; logger: Logger }, { dispatch, getState }) => {
    const { directApiConfig, logger } = args;
    try {
      logger.log('SystemThunks', 'Initializing Direct API...', directApiConfig);
      
      const throttleSec = directApiConfig.performance?.api?.throttle;
      let throttleDelayMs = 200; 
      if (typeof throttleSec === 'number' && throttleSec >= 0) {
        throttleDelayMs = throttleSec * 1000;
      } else if (throttleSec !== undefined) {
        logger.warn('SystemThunks', `Invalid API throttle value: ${throttleSec}, using default ${throttleDelayMs}ms`);
      }

      const cacheLifetimeSec = directApiConfig.performance?.api?.cacheLifetime;
      const failedRetryDelaySec = directApiConfig.performance?.api?.failedRequestRetryDelaySeconds;

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
      } else {
        logger.error('SystemThunks', 'Direct API Initialization Failed: Missing URL or API key');
        dispatch(apiInitializationError('Missing URL or API key'));
        return false;
      }
    } catch (error: any) {
      logger.error('SystemThunks', 'Direct API Initialization Failed:', error.message);
      dispatch(apiInitializationError(error.message || 'Unknown API initialization error'));
      return false;
    }
  }
);

// Thunk to initialize the WebSocket plugin
export const initializeWebSocketPlugin = createAsyncThunk(
  'system/initializeWebSocketPlugin',
  async (args: { directApiConfig?: DirectApiConfig; cardDebugWebSocket?: boolean; logger: Logger }, { dispatch, getState }) => {
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
      } catch (error) {
        logger.error('Thunk:initializeWebSocketPlugin', 'WebSocket plugin connection failed:', { error });
        dispatch(setWebSocketStatus('disconnected'));
      }
    } else {
      logger.warn('Thunk:initializeWebSocketPlugin', 'WebSocket plugin not connected: Direct API not enabled or URL/WebSocket URL is missing in config.');
      dispatch(setWebSocketStatus('disconnected'));
    }
  }
);

export const processHassEntities = createAsyncThunk(
  'system/processHassEntities',
  async (
    args: {
      hass: HomeAssistant;
      entityIds: string[];
      logger: Logger;
    },
    { dispatch }
  ) => {
    const { hass, entityIds, logger } = args;
    let processedCount = 0;

    if (!entityIds || entityIds.length === 0) {
      logger.warn('Thunk:processHassEntities', 'No entities configured for HASS processing.');
      trackUsage('redux', 'thunk:processHassEntities:noentities');
      return { processedCount: 0, errors: 0 };
    }

    logger.log('Thunk:processHassEntities', `Processing HASS state for entities: ${entityIds.join(', ')}`);
    trackUsage('redux', 'thunk:processHassEntities:attempt', { count: entityIds.length });

    let errorCount = 0;

    for (const entityId of entityIds) {
      const entityState = hass.states[entityId];
      if (!entityState) {
        logger.warn('Thunk:processHassEntities', `Entity ${entityId} not found in HASS states.`);
        errorCount++;
        continue;
      }

      const items = entityState.attributes?.items as InventreeItem[] | undefined;

      if (items && Array.isArray(items)) {
        const parts: InventreeItem[] = items.map(item => ({ ...item, source: `hass:${entityId}` }));
        const partIds = parts.map(p => p.pk);

        if (parts.length > 0) {
          logger.log('Thunk:processHassEntities', `Dispatching setParts for ${entityId} with ${parts.length} items.`);
          dispatch(setParts({ entityId, parts }));
          dispatch(registerEntity(entityId));
          processedCount++;
        } else {
          logger.log('Thunk:processHassEntities', `No items found for entity ${entityId} after processing.`);
          dispatch(setParts({ entityId, parts: [] }));
          dispatch(registerEntity(entityId));
        }
      } else {
        logger.warn('Thunk:processHassEntities', `No 'items' attribute or not an array for entity ${entityId}.`, { attributes: entityState.attributes });
        dispatch(setParts({ entityId, parts: [] }));
        dispatch(registerEntity(entityId));
        errorCount++;
      }
    }
    trackUsage('redux', `thunk:processHassEntities:${errorCount > 0 ? 'partial_success' : 'success'}`, { processed: processedCount, errors: errorCount });
    return { processedCount, errors: errorCount };
  }
);

// NEW THUNK: Initializes generic HA entity states based on card configuration
export const initializeGenericHaStatesFromConfig = createAsyncThunk<
  void, // Return type
  { hass: HomeAssistant; logger: Logger }, // Argument type
  { state: RootState; rejectValue: string }
>(
  'system/initializeGenericHaStatesFromConfig',
  async ({ hass, logger }, { dispatch, getState, rejectWithValue }) => {
    logger.log('SystemThunks', 'Initializing generic HA states from config...');
    const state = getState();
    const config = selectFullConfig(state); // Assuming selectFullConfig selector exists in configSlice

    if (!config) {
      const errorMsg = 'Card configuration not found in state.';
      logger.error('SystemThunks', errorMsg);
      return rejectWithValue(errorMsg);
    }

    const genericEntityIds = config.data_sources?.ha_entities;

    if (genericEntityIds && Array.isArray(genericEntityIds) && genericEntityIds.length > 0) {
      logger.log('SystemThunks', `Found ${genericEntityIds.length} generic HA entity IDs in config. Dispatching fetchHaEntityStatesThunk.`);
      try {
        await dispatch(fetchHaEntityStatesThunk({ hass, entityIds: genericEntityIds })).unwrap();
        logger.log('SystemThunks', 'Successfully dispatched and processed fetchHaEntityStatesThunk for generic HA entities.');
      } catch (error: any) {
        const errorMsg = `Error fetching generic HA entity states: ${error.message || error}`;
        logger.error('SystemThunks', errorMsg, { errorData: error });
        // Not rejecting the parent thunk here, as failure to fetch some generic HA states might not be critical
        // Individual errors are logged by fetchHaEntityStatesThunk
      }
    } else {
      logger.log('SystemThunks', 'No generic HA entity IDs found in config.data_sources.ha_entities.');
    }
  }
);