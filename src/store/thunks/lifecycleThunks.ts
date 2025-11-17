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
import { registerComponent, removeComponent } from '../slices/componentSlice';
import { partsSlice } from '../slices/partsSlice';
import { removeInstance as removeLoggingInstance } from '../slices/loggingSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { InventreeParameterFetchConfig } from '../../types';

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
  
  // --- STAGE 0: Cache Management ---
  // REMOVED: inventreeApi.util.resetApiState() - This was wiping cache for ALL cards
  // RTK Query cache is now shared across card instances for better performance
  // If fresh data is needed, use { forceRefetch: true } on specific queries
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 0: Cache sharing enabled, no reset.`);

  // --- STAGE 1: Synchronous State Setup ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 1: Setting up synchronous state from config.`);
  dispatch(parametersSlice.actions.clearCache()); 
  if (config.actions) {
      dispatch(actionsSlice.actions.setActionDefinitions({ definitions: config.actions, cardInstanceId }));
  }
  
  // FIXED: Await rule initialization to prevent race conditions
  await dispatch(initializeRuleDefinitionsThunk({ logics: config.conditional_logic?.definedLogics || [], cardInstanceId }));
  logger.debug('initializeCardThunk', `[${cardInstanceId}] Rule definitions initialized.`);

  // --- STAGE 2: Asynchronous API and Data Initialization ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 2: Initializing async API and data sources.`);

  // 🔍 DIAGNOSTIC LOG: Check the data_sources object the thunk is working with.
  console.log('%c[LIFECYCLE-DIAGNOSTIC] Thunk received data_sources:', 'color: #9C27B0; font-weight: bold;', config?.data_sources);

  if (config.direct_api?.enabled) {
      if (config.direct_api.method !== 'hass' && (config.direct_api.url || config.direct_api.websocket_url)) {
          // FIXED: Await WebSocket initialization to ensure connection before proceeding
          await dispatch(initializeWebSocketPlugin({ directApiConfig: config.direct_api, cardDebugWebSocket: config.debug_websocket, cardInstanceId }));
          logger.debug('initializeCardThunk', `[${cardInstanceId}] WebSocket initialized.`);
      }
  }

  // --- STAGE 3: HASS Data Processing ---
  logger.debug('initializeCardThunk', `[${cardInstanceId}] STAGE 3: Processing HASS data.`);
  const hassSensorEntities = config?.data_sources?.inventree_hass_sensors?.filter((id: any): id is string => typeof id === 'string' && id.length > 0) || [];
  
  // FIXED: Await HA parts processing to ensure parts are loaded before mounting React
  if (hassSensorEntities.length > 0) {
    await dispatch(processHassEntities({ entityIds: hassSensorEntities, hass, cardInstanceId }));
    logger.debug('initializeCardThunk', `[${cardInstanceId}] HA sensor entities processed.`);
  }
  
  const genericHaEntities = config?.data_sources?.ha_entities?.filter((id: any): id is string => typeof id === 'string' && id !== '') || [];
  if (genericHaEntities.length > 0) {
    // FIXED: Await generic HA states initialization
    await dispatch(initializeGenericHaStatesFromConfig({ hass, cardInstanceId }));
    logger.debug('initializeCardThunk', `[${cardInstanceId}] Generic HA entities initialized.`);
  }

  // --- STAGE 4: Parameter Fetching ---
  console.log(`%c[LIFECYCLE-THUNK] STAGE 4: Fetching configured parameters for ${cardInstanceId}`, 'color: #1abc9c');
  const parametersToFetch = config?.data_sources?.inventree_parameters_to_fetch || [];
  if (parametersToFetch.length > 0) {
    // With RTK Query, we no longer need a dedicated thunk. We can just initiate the fetches.
    // The `evaluateExpression` logic will also auto-fetch any parameters needed by rules.
    parametersToFetch.forEach((fetchConfig: InventreeParameterFetchConfig) => {
      if (fetchConfig.targetPartIds === 'all_loaded') {
        const state = getState();
        const instancePartsState = state.parts.partsByInstance[cardInstanceId];
        // Use Entity Adapter's 'ids' array for O(1) access instead of Object.keys
        const allPartPks = instancePartsState ? instancePartsState.ids : [];
        allPartPks.forEach((pk: number) => {
          console.log(`%c[LIFECYCLE-THUNK] --> Dispatching getPartParameters for PK (all_loaded): ${pk}`, 'color: #1abc9c');
          dispatch(inventreeApi.endpoints.getPartParameters.initiate({ partId: pk, cardInstanceId }));
        });
      } else {
        // Fetch for the specific part IDs listed in the config
        fetchConfig.targetPartIds.forEach((pk: number) => {
          console.log(`%c[LIFECYCLE-THUNK] --> Dispatching getPartParameters for PK: ${pk}`, 'color: #1abc9c');
          dispatch(inventreeApi.endpoints.getPartParameters.initiate({ partId: pk, cardInstanceId }));
        });
      }
    });
  }
  logger.info('initializeCardThunk', `Card instance ${cardInstanceId} initialization sequence dispatched.`);
});

/**
 * Thunk to "soft" destroy a card instance view.
 * This preserves persisted state like config and layout, but clears transient view state.
 * Used when switching between the main card and the editor view.
 * 
 * NOTE: We intentionally do NOT reset RTK Query cache here to allow:
 * 1. Faster editor loading (can reuse cached data)
 * 2. Multiple cards to share cache without interference
 * 3. Pending requests to complete naturally (no forced cancellation)
 */
export const softDestroyCardThunk = createAsyncThunk<
  void,
  { cardInstanceId: string },
  { dispatch: AppDispatch; state: RootState }
>('lifecycle/softDestroy', async ({ cardInstanceId }, { dispatch }) => {
  const logger = ConditionalLoggerEngine.getInstance().getLogger('LifecycleThunks', cardInstanceId);
  logger.info('softDestroyCardThunk', `Soft destroying card instance view: ${cardInstanceId}`);
  
  // REMOVED: inventreeApi.util.resetApiState() 
  // Reason: This was wiping cache for ALL cards, not just this instance
  // Pending API requests will complete naturally and update the shared cache
  // If you need to force cancel specific requests, unsubscribe from individual queries
  
  logger.debug('softDestroyCardThunk', `Soft destroy completed without cache reset.`);
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