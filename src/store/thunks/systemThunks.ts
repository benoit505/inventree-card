import { Logger } from '../../utils/logger';
import { InventreeCardConfig, DirectApiConfig } from '../../types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiInitializationError, setApiConfig, apiInitializationSuccess } from '../slices/apiSlice';
import { trackUsage } from '../../utils/metrics-tracker';
import { WebSocketPlugin } from '../../services/websocket-plugin';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem } from '../../types';
import { setParts, registerEntity, removePartsForEntity } from '../slices/partsSlice';
import { selectAllReferencedPartPksFromConfig } from '../slices/partsSlice';
import { RootState, AppDispatch } from '../index';
import { setWebSocketStatus } from '../slices/websocketSlice';
import { inventreeApiService } from '../../services/inventree-api-service';
import { store } from '../../store';
import { fetchHaEntityStatesThunk } from './genericHaStateThunks';
import { selectFullConfig } from '../slices/configSlice';
import { inventreeApi } from '../apis/inventreeApi';
import { selectApiInitialized, selectApiUrl, selectApiKey } from '../slices/apiSlice';
import { evaluateAndApplyEffectsThunk } from './conditionalLogicThunks';

const logger = Logger.getInstance();

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
      await dispatch(fetchHaEntityStatesThunk({ entityIds: genericHaEntities, hass, logger }));
    }
  }
);
*/

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

export const processHassEntities = createAsyncThunk<
  { processedCount: number; errors: number }, // Return type
  { hass: HomeAssistant; entityIds: string[]; logger: Logger }, // Argument type
  { state: RootState; dispatch: AppDispatch; rejectValue: string } // ThunkAPI config
>(
  'system/processHassEntities',
  async (
    args,
    { dispatch, getState }
  ) => {
    const { hass, entityIds, logger } = args;
    const state = getState() as RootState;
    let processedCount = 0;

    // --- START: Stale Entity Cleanup ---
    const existingEntityIds = Object.keys(state.parts.partsByEntity);
    const newEntityIdSet = new Set(entityIds);
    
    const staleEntityIds = existingEntityIds.filter(id => !newEntityIdSet.has(id));

    if (staleEntityIds.length > 0) {
      logger.log('Thunk:processHassEntities', `Found ${staleEntityIds.length} stale HASS entities to remove.`, { staleEntityIds });
      staleEntityIds.forEach(staleId => {
        dispatch(removePartsForEntity({ entityId: staleId }));
      });
    }
    // --- END: Stale Entity Cleanup ---

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
    
    const entityIds = config.data_sources?.ha_entities;
    if (entityIds && entityIds.length > 0) {
      logger.log('SystemThunks', `Fetching states for ${entityIds.length} generic HA entities.`);
      await dispatch(fetchHaEntityStatesThunk({ entityIds, hass }));
    } else {
      logger.log('SystemThunks', 'No generic HA entities configured to fetch.');
    }
  }
);

export const fetchPartsByPks = createAsyncThunk<
  InventreeItem[], // Return type: an array of parts
  number[], // Argument type: an array of part PKs
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'system/fetchPartsByPks',
  async (pks, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const apiUrl = selectApiUrl(state);
      const apiKey = selectApiKey(state);

      if (!apiUrl || !apiKey) {
        return rejectWithValue('API URL or Key not configured.');
      }

      // Use RTK Query's cache policies by initiating individual 'getPart' queries
      const partPromises = pks.map(pk =>
        dispatch(inventreeApi.endpoints.getPart.initiate(pk)).unwrap()
      );
      
      // Wait for all fetches to settle
      const results = await Promise.allSettled(partPromises);
      
      // Filter for fulfilled promises and extract the data
      const parts = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => (r as PromiseFulfilledResult<InventreeItem>).value);

      logger.log('Thunk:fetchPartsByPks', `Successfully fetched data for ${parts.length} out of ${pks.length} requested parts.`);
      
      // The evaluation trigger is now removed from here.
      
      return parts; // Always return the fetched parts to satisfy the thunk's type.
    } catch (error: any) {
      logger.error('fetchPartsByPks Thunk', `Failed to fetch parts by PKs: ${error.message}`);
      return rejectWithValue('Failed to fetch parts by PKs.');
    }
  }
);