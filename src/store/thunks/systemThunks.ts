import { Logger } from '../../utils/logger';
import { InventreeCardConfig, DirectApiConfig } from '../../types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiInitializationError, setApiConfig, apiInitializationSuccess } from '../slices/apiSlice';
import { trackUsage } from '../../utils/metrics-tracker';
import { WebSocketPlugin } from '../../services/websocket-plugin';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem } from '../../types';
import { setParts } from '../slices/partsSlice';
import { selectAllReferencedPartPksFromConfig } from '../slices/partsSlice';
import { RootState, AppDispatch } from '../index';
import { setWebSocketStatus } from '../slices/websocketSlice';
import { inventreeApiService } from '../../services/inventree-api-service';
import { store } from '../../store';
import { fetchHaEntityStatesThunk } from './genericHaStateThunks';
import { selectConfigForInstance } from '../slices/configSlice';
import { inventreeApi } from '../apis/inventreeApi';
import { selectApiInitialized, selectApiUrl, selectApiKey } from '../slices/apiSlice';
import { evaluateAndApplyEffectsThunk } from './conditionalLogicThunks';

const logger = Logger.getInstance();

// Thunk to initialize the Direct API
export const initializeDirectApi = createAsyncThunk(
  'system/initializeDirectApi',
  async (args: { directApiConfig: DirectApiConfig; logger: Logger; cardInstanceId: string }, { dispatch }) => {
    const { directApiConfig, logger } = args;
    try {
      logger.log('SystemThunks', 'Initializing Direct API...', { ...directApiConfig, instanceId: args.cardInstanceId });
      
      const throttleSec = directApiConfig.performance?.api?.throttle;
      let throttleDelayMs = 200; 
      if (typeof throttleSec === 'number' && throttleSec >= 0) {
        throttleDelayMs = throttleSec * 1000;
      } else if (throttleSec !== undefined) {
        logger.warn('SystemThunks', `Invalid API throttle value: ${throttleSec}, using default ${throttleDelayMs}ms`, { instanceId: args.cardInstanceId });
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
        logger.log('SystemThunks', 'Direct API Initialized', { instanceId: args.cardInstanceId });
        trackUsage('api', 'initialize', { success: true, method: 'direct' });
        return true;
      } else {
        logger.error('SystemThunks', 'Direct API Initialization Failed: Missing URL or API key', { instanceId: args.cardInstanceId });
        dispatch(apiInitializationError('Missing URL or API key'));
        return false;
      }
    } catch (error: any) {
      logger.error('SystemThunks', 'Direct API Initialization Failed:', { message: error.message, instanceId: args.cardInstanceId });
      dispatch(apiInitializationError(error.message || 'Unknown API initialization error'));
      return false;
    }
  }
);

/*
 * @deprecated This thunk represents a flawed, imperative approach to data fetching.
 * It is being replaced by a declarative, component-based approach in InventreeCard.tsx
 * using the <DataPrefetcher> component and the `areAllPartsLoading` selector.
 * This will be removed in a future commit.
 */
/*
export const updateDataSources = createAsyncThunk(
  'system/updateDataSources',
  async ({ hass }: { hass: HomeAssistant }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const logger = Logger.getInstance();

    const config = selectFullConfig(state);
    if (!config) {
      logger.warn('updateDataSources Thunk', 'No config found, aborting.');
      return;
    }
    
    // --- HASS Sensor Processing ---
    const newSensorEntities = config.data_sources?.inventree_hass_sensors || [];
    const previousRegisteredEntities = selectRegisteredEntities(state);
    const entitiesToRemove = previousRegisteredEntities.filter(e => !newSensorEntities.includes(e));

    if (entitiesToRemove.length > 0) {
      logger.log('updateDataSources Thunk', `Removing ${entitiesToRemove.length} stale HASS entities.`, { entities: entitiesToRemove });
      entitiesToRemove.forEach(entityId => {
        dispatch(removePartsForEntity({ entityId }));
      });
    }
    
    if (newSensorEntities.length > 0) {
      await dispatch(processHassEntities({ entityIds: newSensorEntities, hass }));
    }

    // --- API PK Processing ---
    const pksToFetch = new Set<number>();
    if (config.data_sources?.inventree_pks) {
      config.data_sources.inventree_pks.forEach(pk => pksToFetch.add(pk));
    }
    // Add logic to extract PKs from conditional_logic, etc.
    // ...

    if (pksToFetch.size > 0) {
      const pksArray = Array.from(pksToFetch);
      logger.log('updateDataSources Thunk', `Triggering API fetch for ${pksArray.length} parts.`, { pks: pksArray });
      // This part is tricky. We can't easily await the RTK Query hooks here.
      // This is the fundamental flaw in this imperative approach.
      // The declarative approach in the component is better.
      pksArray.forEach(pk => {
        // This just initiates the fetch, it doesn't wait for it.
        dispatch(inventreeApi.endpoints.getPart.initiate(pk));
      });
    }
    
    // --- Generic HA Entity Processing ---
    const genericHaEntities = config.data_sources?.ha_entities || [];
    if (genericHaEntities.length > 0) {
      await dispatch(fetchHaEntityStatesThunk({ entityIds: genericHaEntities, hass }));
    }
  }
);
*/

// Thunk to initialize the WebSocket plugin
export const initializeWebSocketPlugin = createAsyncThunk(
  'system/initializeWebSocketPlugin',
  async (args: { directApiConfig?: DirectApiConfig; cardDebugWebSocket?: boolean; logger: Logger; cardInstanceId: string }, { dispatch }) => {
    const { directApiConfig, logger, cardInstanceId } = args; 

    if (!directApiConfig) {
      logger.warn('Thunk:initializeWebSocketPlugin', 'Direct API config not provided, skipping WebSocket plugin initialization.', { instanceId: cardInstanceId });
      return;
    }

    const plugin = WebSocketPlugin.getInstance();

    logger.log('Thunk:initializeWebSocketPlugin', 'Configuring WebSocket Plugin with settings', { data: directApiConfig, instanceId: cardInstanceId });
    plugin.configure(directApiConfig);
    logger.log('Thunk:initializeWebSocketPlugin', 'WebSocket Plugin configured.', { instanceId: cardInstanceId });

    if (directApiConfig.enabled && (directApiConfig.url || directApiConfig.websocket_url)) {
      logger.log('Thunk:initializeWebSocketPlugin', 'Attempting to connect WebSocket plugin...', { instanceId: cardInstanceId });
      try {
        await plugin.connect();
        logger.log('Thunk:initializeWebSocketPlugin', 'WebSocket plugin connected successfully.', { instanceId: cardInstanceId });
      } catch (error) {
        logger.error('Thunk:initializeWebSocketPlugin', 'WebSocket plugin connection failed:', { error, instanceId: cardInstanceId });
        dispatch(setWebSocketStatus('disconnected'));
      }
    } else {
      logger.warn('Thunk:initializeWebSocketPlugin', 'WebSocket plugin not connected: Direct API not enabled or URL/WebSocket URL is missing in config.', { instanceId: cardInstanceId });
      dispatch(setWebSocketStatus('disconnected'));
    }
  }
);

export const processHassEntities = createAsyncThunk<
  { processedCount: number; errors: number }, // Return type
  { hass: HomeAssistant; entityIds: string[]; logger: Logger; cardInstanceId: string }, // Argument type
  { state: RootState; dispatch: AppDispatch; rejectValue: string } // ThunkAPI config
>(
  'system/processHassEntities',
  async (
    args,
    { dispatch, getState }
  ) => {
    const { hass, entityIds, logger, cardInstanceId } = args;
    let processedCount = 0;
    
    if (!entityIds || entityIds.length === 0) {
      logger.warn('Thunk:processHassEntities', 'No entities configured for HASS processing.', { instanceId: cardInstanceId });
      dispatch(setParts({ parts: [], cardInstanceId }));
      return { processedCount: 0, errors: 0 };
    }

    logger.log('Thunk:processHassEntities', `Processing HASS state for entities: ${entityIds.join(', ')}`, { instanceId: cardInstanceId });

    let errorCount = 0;
    const allPartsFromInstanceSensors: InventreeItem[] = [];

    for (const entityId of entityIds) {
      const entityState = hass.states[entityId];
      if (!entityState) {
        logger.warn('Thunk:processHassEntities', `Entity ${entityId} not found in HASS states.`, { instanceId: cardInstanceId });
        errorCount++;
        continue;
      }

      const items = entityState.attributes?.items as InventreeItem[] | undefined;

      if (items && Array.isArray(items)) {
        const partsFromThisSensor: InventreeItem[] = items.map(item => ({ ...item, source: `hass:${entityId}` }));
        allPartsFromInstanceSensors.push(...partsFromThisSensor);
        processedCount++;
      } else {
        logger.warn('Thunk:processHassEntities', `No 'items' attribute or not an array for entity ${entityId}.`, { attributes: entityState.attributes, instanceId: cardInstanceId });
        errorCount++;
      }
    }

    console.log(`%c[Thunk:processHassEntities DEBUG]`, 'color: orange; font-weight: bold;', {
      cardInstanceId,
      entityIds,
      totalFoundItems: allPartsFromInstanceSensors.length,
      partPks: allPartsFromInstanceSensors.map(p => p.pk)
    });

    dispatch(setParts({ parts: allPartsFromInstanceSensors, cardInstanceId }));
    
    return { processedCount, errors: errorCount };
  }
);

// NEW THUNK: Initializes generic HA entity states based on card configuration
export const initializeGenericHaStatesFromConfig = createAsyncThunk<
  void, // Return type
  { hass: HomeAssistant; logger: Logger; cardInstanceId: string }, // Argument type
  { state: RootState; rejectValue: string }
>(
  'system/initializeGenericHaStatesFromConfig',
  async ({ hass, logger, cardInstanceId }, { dispatch, getState, rejectWithValue }) => {
    logger.log('SystemThunks', 'Initializing generic HA states from config...', { instanceId: cardInstanceId });
    const state = getState();
    const config = selectConfigForInstance(state, cardInstanceId);
    
    if (!config) {
        logger.warn('SystemThunks', 'No config found for instance, skipping generic HA states initialization.', { instanceId: cardInstanceId });
        return;
    }
    
    const genericHaEntities = config.data_sources?.ha_entities || [];
    
    if (genericHaEntities.length > 0) {
        logger.log('SystemThunks', `Found ${genericHaEntities.length} generic HA entities to process.`, { entities: genericHaEntities, instanceId: cardInstanceId });
        try {
            await dispatch(fetchHaEntityStatesThunk({ entityIds: genericHaEntities, hass }));
            logger.log('SystemThunks', 'Successfully dispatched fetchHaEntityStatesThunk.', { instanceId: cardInstanceId });
        } catch (error) {
            logger.error('SystemThunks', 'Error dispatching fetchHaEntityStatesThunk:', { error, instanceId: cardInstanceId });
        }
    } else {
        logger.log('SystemThunks', 'No generic HA entities to process for this instance.', { instanceId: cardInstanceId });
    }
  }
);