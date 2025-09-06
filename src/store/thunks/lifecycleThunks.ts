import { createAsyncThunk } from '@reduxjs/toolkit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
import { AppDispatch, RootState } from '../index';
import { inventreeApi } from '../apis/inventreeApi';
import { setConfigAction, removeConfigAction } from '../slices/configSlice';
import { parametersSlice } from '../slices/parametersSlice';
import { actionsSlice } from '../slices/actionsSlice';
import { initializeRuleDefinitionsThunk } from './conditionalLogicThunks';
import { initializeWebSocketPlugin } from './systemThunks';
import { processHassEntities, initializeGenericHaStatesFromConfig } from './systemThunks';
import { fetchConfiguredParameters } from './parameterThunks';
import { registerComponent, removeComponent } from '../slices/componentSlice';
import { partsSlice } from '../slices/partsSlice';
import { removeInstance as removeLoggingInstance } from '../slices/loggingSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

// Register the category globally, but create the logger instance inside the thunk
ConditionalLoggerEngine.getInstance().registerCategory('LifecycleThunks', { enabled: false, level: 'info' });

/**
 * Thunk to initialize a card instance. This is the new, centralized entry point for setting up a card.
 */
export const initializeCardThunk = createAsyncThunk<
  void,
  { cardInstanceId: string; hass: HomeAssistant; config: InventreeCardConfig },
  { dispatch: AppDispatch; state: RootState }
>('lifecycle/initialize', async ({ cardInstanceId, hass, config }, { dispatch, getState }) => {
  console.log(`%c[THUNK-LOG] ==> Initializing card: ${cardInstanceId}`, 'color: #28a745; font-weight: bold; background: #e8f5e9; padding: 2px 4px; border-radius: 3px;');
  const logger = ConditionalLoggerEngine.getInstance().getLogger('LifecycleThunks', cardInstanceId);
  logger.info('initializeCardThunk', `Initializing card instance: ${cardInstanceId}`);

  // STAGE 0: Set the configuration in the store. This is the new first step.
  dispatch(setConfigAction({ config, cardInstanceId }));

  // Register component for global tracking
  dispatch(registerComponent(cardInstanceId));
  const activeComponentIds = Object.keys(getState().components.registeredComponents);
  logger.info('initializeCardThunk', `Component registered. Active components: [${activeComponentIds.join(', ')}]`);
  
  // --- STAGE 0: Cache Reset ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 0: Resetting API state.`);
  dispatch(inventreeApi.util.resetApiState());

  // --- STAGE 1: Synchronous State Setup ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 1: Setting up synchronous state from config.`);
  dispatch(parametersSlice.actions.clearCache()); 
  if (config.actions) {
      dispatch(actionsSlice.actions.setActionDefinitions({ definitions: config.actions, cardInstanceId }));
  }
  dispatch(initializeRuleDefinitionsThunk({ logics: config.conditional_logic?.definedLogics || [], cardInstanceId }));

  // --- STAGE 2: Asynchronous API and Data Initialization ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 2: Initializing async API and data sources.`);
  if (config.direct_api?.enabled) {
      if (config.direct_api.method !== 'hass' && (config.direct_api.url || config.direct_api.websocket_url)) {
          dispatch(initializeWebSocketPlugin({ directApiConfig: config.direct_api, cardDebugWebSocket: config.debug_websocket, cardInstanceId }));
      }
  }

  // --- STAGE 3: HASS Data Processing ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 3: Processing HASS data.`);
  const hassSensorEntities = config?.data_sources?.inventree_hass_sensors?.filter((id: any): id is string => typeof id === 'string' && id.length > 0) || [];
  dispatch(processHassEntities({ entityIds: hassSensorEntities, hass, cardInstanceId }));
  
  const genericHaEntities = config?.data_sources?.ha_entities?.filter((id: any): id is string => typeof id === 'string' && id !== '') || [];
  if (genericHaEntities.length > 0) {
    dispatch(initializeGenericHaStatesFromConfig({ hass, cardInstanceId }));
  }

  // --- STAGE 4: Parameter Fetching ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 4: Fetching configured parameters.`);
  const parametersToFetch = config?.data_sources?.inventree_parameters_to_fetch || [];
  if (parametersToFetch.length > 0) {
    dispatch(fetchConfiguredParameters({ configs: parametersToFetch, cardInstanceId }));
  }
  logger.info('initializeCardThunk', `Card instance ${cardInstanceId} initialization sequence dispatched.`);
});

/**
 * Thunk to "soft" destroy a card instance view.
 * This clears out transient data (like API requests in flight) but preserves
 * persisted state like config and layout. This is used when switching between
 * the main card and the editor view.
 */
export const softDestroyCardThunk = createAsyncThunk<
  void,
  { cardInstanceId: string },
  { dispatch: AppDispatch; state: RootState }
>('lifecycle/softDestroy', async ({ cardInstanceId }, { dispatch }) => {
  const logger = ConditionalLoggerEngine.getInstance().getLogger('LifecycleThunks', cardInstanceId);
  logger.info('softDestroyCardThunk', `Soft destroying card instance view: ${cardInstanceId}`);
  // Only reset the API state to cancel pending requests.
  // Do NOT remove config or other persisted state.
  dispatch(inventreeApi.util.resetApiState());
});

/**
 * Thunk to completely remove a card instance and all its associated data.
 * This should be used when the card is removed from the Lovelace dashboard.
 */
export const removeCardInstanceThunk = createAsyncThunk<
  void,
  { cardInstanceId: string },
  { dispatch: AppDispatch; state: RootState }
>('lifecycle/remove', async ({ cardInstanceId }, { dispatch, getState }) => {
  console.log(`%c[THUNK-LOG] ==> Removing card: ${cardInstanceId}`, 'color: #dc3545; font-weight: bold; background: #fbe9e7; padding: 2px 4px; border-radius: 3px;');
  const logger = ConditionalLoggerEngine.getInstance().getLogger('LifecycleThunks', cardInstanceId);
  logger.info('removeCardInstanceThunk', `Completely removing card instance: ${cardInstanceId}`);
  dispatch(removeComponent(cardInstanceId));
  const activeComponentIds = Object.keys(getState().components.registeredComponents);
  logger.info('removeCardInstanceThunk', `Component removed. Active components: [${activeComponentIds.join(', ')}]`);
  dispatch(removeConfigAction({ cardInstanceId }));
  dispatch(partsSlice.actions.removeInstance({ cardInstanceId }));
  dispatch(removeLoggingInstance({ cardInstanceId }));
  logger.info('removeCardInstanceThunk', `Card instance ${cardInstanceId} fully removed.`);
});

// We are renaming destroyCardThunk to avoid confusion.
// The old `destroyCardThunk` is now `removeCardInstanceThunk`.
// The new "cleanup" thunk is `softDestroyCardThunk`.
export const destroyCardThunk = removeCardInstanceThunk; 