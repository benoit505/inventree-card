import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { InventreeCardConfig, DirectApiConfig } from '../../types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { trackUsage } from '../../utils/metrics-tracker';
import { WebSocketPlugin } from '../../services/websocket-plugin';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem } from '../../types';
import { setParts } from '../slices/partsSlice';
import { RootState, AppDispatch } from '../index';
import { setWebSocketStatus } from '../slices/websocketSlice';
import { fetchHaEntityStatesThunk } from './genericHaStateThunks';
import { selectConfigByInstanceId } from '../slices/configSlice';

ConditionalLoggerEngine.getInstance().registerCategory('SystemThunks', { enabled: false, level: 'info' });

// Thunk to initialize the WebSocket plugin
export const initializeWebSocketPlugin = createAsyncThunk<
  void,
  { directApiConfig?: DirectApiConfig; cardDebugWebSocket?: boolean; cardInstanceId: string },
  { dispatch: AppDispatch; state: RootState }
>(
  'system/initializeWebSocketPlugin',
  async (args: { directApiConfig?: DirectApiConfig; cardDebugWebSocket?: boolean; cardInstanceId: string }, { dispatch }) => {
    const { directApiConfig, cardInstanceId } = args;
    const logger = ConditionalLoggerEngine.getInstance().getLogger('SystemThunks', cardInstanceId);

    if (!directApiConfig) {
      logger.warn('initializeWebSocketPlugin', 'Skipping WebSocket plugin initialization: Direct API config not provided.');
      return;
    }

    const plugin = WebSocketPlugin.getInstance();

    logger.info('initializeWebSocketPlugin', 'Configuring WebSocket Plugin with settings', { data: directApiConfig });
    plugin.configure(directApiConfig);
    logger.info('initializeWebSocketPlugin', 'WebSocket Plugin configured.');

    if (directApiConfig.enabled && (directApiConfig.url || directApiConfig.websocket_url)) {
      logger.info('initializeWebSocketPlugin', 'Attempting to connect WebSocket plugin...');
      try {
        await plugin.connect();
        logger.info('initializeWebSocketPlugin', 'WebSocket plugin connected successfully.');
      } catch (error) {
        logger.error('initializeWebSocketPlugin', `WebSocket plugin connection failed`, error as Error);
        dispatch(setWebSocketStatus('disconnected'));
      }
    } else {
      logger.warn('initializeWebSocketPlugin', 'WebSocket plugin not connected: Direct API not enabled or URL/WebSocket URL is missing in config.');
      dispatch(setWebSocketStatus('disconnected'));
    }
  }
);

export const processHassEntities = createAsyncThunk<
  { processedCount: number; errors: number }, // Return type
  { hass: HomeAssistant; entityIds: string[]; cardInstanceId: string }, // Argument type
  { state: RootState; dispatch: AppDispatch; rejectValue: string } // ThunkAPI config
>(
  'system/processHassEntities',
  async (
    args,
    { dispatch, getState }
  ) => {
    const { hass, entityIds, cardInstanceId } = args;
    const logger = ConditionalLoggerEngine.getInstance().getLogger('SystemThunks', cardInstanceId);
    let processedCount = 0;
    
    if (!entityIds || entityIds.length === 0) {
      logger.warn('processHassEntities', 'No entities configured for HASS processing.');
      dispatch(setParts({ parts: [], cardInstanceId }));
      return { processedCount: 0, errors: 0 };
    }

    logger.info('processHassEntities', `Processing HASS state for entities: ${entityIds.join(', ')}`);

    let errorCount = 0;
    const allPartsFromInstanceSensors: InventreeItem[] = [];

    for (const entityId of entityIds) {
      const entityState = hass.states[entityId];
      if (!entityState) {
        logger.warn('processHassEntities', `Entity ${entityId} not found in HASS states.`);
        errorCount++;
        continue;
      }

      const items = entityState.attributes?.items as InventreeItem[] | undefined;

      if (items && Array.isArray(items)) {
        const partsFromThisSensor: InventreeItem[] = items.map(item => ({ ...item, source: `hass:${entityId}` }));
        allPartsFromInstanceSensors.push(...partsFromThisSensor);
        processedCount++;
      } else {
        logger.warn('processHassEntities', `No 'items' attribute or not an array for entity ${entityId}.`, { attributes: entityState.attributes });
        errorCount++;
      }
    }

    logger.debug('processHassEntities', `[Thunk:processHassEntities DEBUG]`, {
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
  { hass: HomeAssistant; cardInstanceId: string }, // Argument type
  { state: RootState; rejectValue: string }
>(
  'system/initializeGenericHaStatesFromConfig',
  async ({ hass, cardInstanceId }, { dispatch, getState, rejectWithValue }) => {
    const logger = ConditionalLoggerEngine.getInstance().getLogger('SystemThunks', cardInstanceId);
    logger.info('initializeGenericHaStatesFromConfig', 'Initializing generic HA states from config...');
    const state = getState();
    const config = selectConfigByInstanceId(state, cardInstanceId);
    
    if (!config) {
        logger.warn('initializeGenericHaStatesFromConfig', 'No config found for instance, skipping generic HA states initialization.');
        return;
    }
    
    const genericHaEntities = config.data_sources?.ha_entities?.filter((id: unknown): id is string => typeof id === 'string' && id !== '') || [];
    
    if (genericHaEntities.length > 0) {
        logger.info('initializeGenericHaStatesFromConfig', `Found ${genericHaEntities.length} generic HA entities to process.`, { entities: genericHaEntities });
        try {
            await dispatch(fetchHaEntityStatesThunk({ entityIds: genericHaEntities, hass }));
            logger.info('initializeGenericHaStatesFromConfig', 'Successfully dispatched fetchHaEntityStatesThunk.');
        } catch (error) {
            logger.error('initializeGenericHaStatesFromConfig', `Error dispatching fetchHaEntityStatesThunk`, error as Error);
        }
    }
  }
);
