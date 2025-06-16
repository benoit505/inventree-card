import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { 
    InventreeCardConfig, 
    InventreeItem, 
} from './types';
import { Logger } from './utils/logger';
import { 
  initializeDirectApi, 
  initializeWebSocketPlugin,
  processHassEntities,
  initializeGenericHaStatesFromConfig,
} from './store/thunks/systemThunks';
import { initializeRuleDefinitionsThunk } from './store/thunks/conditionalLogicThunks';
import { fetchConfiguredParameters } from './store/thunks/parameterThunks';
import { evaluateAndApplyEffectsThunk } from './store/thunks/conditionalLogicThunks';
import { setConfigAction, removeConfigAction } from './store/slices/configSlice';
import { clearCache } from './store/slices/parametersSlice';
import { setActionDefinitions } from './store/slices/actionsSlice';
import { RootState } from './store';
import { 
  selectCombinedParts, 
  selectAllReferencedPartPksFromConfig, 
  selectIsReadyForEvaluation,
  removeInstance
} from './store/slices/partsSlice'; 
import { selectApiInitialized } from './store/slices/apiSlice';
import { inventreeApi } from './store/apis/inventreeApi';
import DetailLayout from './components/layouts/DetailLayout';
import GridLayout from './components/layouts/GridLayout';
import ListLayout from './components/layouts/ListLayout';
import PartsLayout from './components/layouts/PartsLayout';
import VariantLayout from './components/layouts/VariantLayout';
import TableLayout from './components/layouts/TableLayout';
import GlobalActionButtons from './components/global/GlobalActionButtons';
import { registerComponent, removeComponent } from './store/slices/componentSlice';
import { usePrefetchApiParts } from './store/hooks';

// Helper hook to get the previous value of a prop or state.
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const generateSimpleId = () => Math.random().toString(36).substring(2, 15);

interface InventreeCardProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  cardInstanceId?: string;
}

const logger = Logger.getInstance();

const InventreeCard = ({ hass, config, cardInstanceId }: InventreeCardProps): JSX.Element | null => {
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  logger.log('InventreeCard', `Render #${renderCount.current}`, { cardInstanceId, level: 'verbose' });

  const dispatch = useDispatch<any>();

  // Create a stable, stringified version of the config for use in dependency arrays
  const stringifiedConfig = useMemo(() => JSON.stringify(config), [config]);

  // --- HOOKS ---
  const apiInitialized = useSelector((state: RootState) => selectApiInitialized(state));
  logger.log('InventreeCard', `apiInitialized: ${apiInitialized}`, { cardInstanceId, level: 'debug' });

  const allPksToPrefetch = useSelector((state: RootState) => {
    if (!cardInstanceId) return [];
    const pks = selectAllReferencedPartPksFromConfig(state, cardInstanceId);
    logger.log('InventreeCard', `selectAllReferencedPartPksFromConfig for card ${cardInstanceId} found PKs:`, { pks, cardInstanceId, level: 'debug' });
    return pks;
  });

  logger.log('InventreeCard', `Calling usePrefetchApiParts with ${allPksToPrefetch.length} PKs and apiInitialized=${apiInitialized}`, { cardInstanceId, level: 'debug' });
  const apiPartPrefetchers = usePrefetchApiParts(allPksToPrefetch, apiInitialized);

  // --- SELECTORS ---
  const configInitialized = useSelector((state: RootState) => !!(cardInstanceId && state.config.configsByInstance[cardInstanceId]?.configInitialized));

  const parts = useSelector((state: RootState) => {
    if (!cardInstanceId) return [];
    return selectCombinedParts(state, cardInstanceId);
  });

  logger.log('InventreeCard', `Part data for cardInstanceId: ${cardInstanceId}`, {
    partsCount: parts.length,
    partNames: parts.map(p => p.name).join(', '),
    level: 'debug',
  });

  const isReadyForEvaluation = useSelector((state: RootState) => cardInstanceId ? selectIsReadyForEvaluation(state, cardInstanceId) : false);

  const selectedItem = useSelector((state: RootState) => {
    if (!config || !parts || parts.length === 0) return undefined;
    if (config.view_type === 'detail' || config.view_type === 'variants') {
      if (config.part_id) return parts.find(p => p.pk === config.part_id) || parts[0];
      return parts[0];
    }
    return undefined;
  });

  // --- EFFECTS ---
  
  useEffect(() => {
    if (!cardInstanceId) return; // Don't register if ID is not yet available
    dispatch(registerComponent(cardInstanceId));
    logger.log('InventreeCard', `Mount Effect Fired for card ${cardInstanceId}`, { cardInstanceId, level: 'verbose' });
    return () => {
      dispatch(removeComponent(cardInstanceId));
      dispatch(removeConfigAction({ cardInstanceId }));
      dispatch(removeInstance({ cardInstanceId })); // Also remove from parts slice
    };
  }, [cardInstanceId, dispatch]);

  // Main Initialization Effect
  useEffect(() => {
    logger.log('InventreeCard', `Initialization Effect Fired for card ${cardInstanceId}`, { cardInstanceId, level: 'debug' });
    if (!stringifiedConfig || !cardInstanceId) {
      logger.log('InventreeCard', `Bailing from Initialization for card ${cardInstanceId}: no stringifiedConfig or cardInstanceId yet.`, { cardInstanceId, level: 'debug' });
      return;
    }
    const config = JSON.parse(stringifiedConfig);

    const initialize = async () => {
        // --- STAGE 0: Cache Reset ---
        // On any config change, wipe the API cache and HASS parts cache
        // to ensure stale data is removed.
        dispatch(inventreeApi.util.resetApiState());

        // --- STAGE 1: Synchronous State Setup ---
        // These actions update the Redux state immediately.
        logger.setDebugConfig(config);
        dispatch(setConfigAction({ config, cardInstanceId }));
        dispatch(clearCache()); 
        if (config.actions) {
            dispatch(setActionDefinitions(config.actions));
        }
        // CRITICAL: Set up the rules BEFORE any async operation that might trigger an evaluation.
        dispatch(initializeRuleDefinitionsThunk({ logics: config.conditional_logic?.definedLogics || [], cardInstanceId }));

        // --- STAGE 2: Asynchronous API Initialization ---
        if (config.direct_api?.enabled) {
            if (config.direct_api.url && config.direct_api.api_key) {
                await dispatch(initializeDirectApi({ directApiConfig: config.direct_api, logger, cardInstanceId }));
                
                if (config.direct_api.method !== 'hass' && (config.direct_api.url || config.direct_api.websocket_url)) {
                    dispatch(initializeWebSocketPlugin({ directApiConfig: config.direct_api, cardDebugWebSocket: config.debug_websocket, logger, cardInstanceId }));
                }
            } else {
                logger.warn('InventreeCard.tsx', '⚠️ Direct API URL or API Key missing.');
            }
        }
    };

    initialize();
  }, [stringifiedConfig, cardInstanceId, dispatch]);

  // The new, intelligent evaluation effect, guarded by our "gatekeeper" selector.
  useEffect(() => {
    // Only run if the gatekeeper selector gives the green light AND we have a stable ID.
    if (isReadyForEvaluation && cardInstanceId) {
      dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId }));
    }
  }, [isReadyForEvaluation, cardInstanceId, dispatch]);

  const hassSensorEntitiesFromConfig = useMemo((): string[] => {
    logger.log('InventreeCard', 'Recalculating hassSensorEntitiesFromConfig', { cardInstanceId, level: 'debug' });
    if (!stringifiedConfig) return [];
    const config = JSON.parse(stringifiedConfig);
    const sensors = config?.data_sources?.inventree_hass_sensors;
    if (!sensors || !Array.isArray(sensors)) {
      return [];
    }
    const filteredSensors = sensors.filter((id): id is string => typeof id === 'string' && id.length > 0);
    return [...new Set(filteredSensors)];
  }, [stringifiedConfig]);

  const prevHassSensorEntities = usePrevious(hassSensorEntitiesFromConfig);

  useEffect(() => {
    logger.log('InventreeCard', `HASS Processing Effect Fired for card ${cardInstanceId}.`, { cardInstanceId, hasHass: !!hass, configInitialized, sensorCount: hassSensorEntitiesFromConfig.length, level: 'debug' });
    
    // GUARD: Do not proceed until both HASS and the config for this instance are ready.
    if (!hass) {
      logger.log('InventreeCard', `Bailing from HASS processing for card ${cardInstanceId}: No HASS object.`, { cardInstanceId, level: 'debug' });
      return;
    }
    if (!configInitialized) {
      logger.log('InventreeCard', `Bailing from HASS processing for card ${cardInstanceId}: Config not initialized.`, { cardInstanceId, level: 'debug' });
      return;
    }

    if (cardInstanceId) {
      logger.log('InventreeCard', `Dispatching processHassEntities for card ${cardInstanceId}.`, { cardInstanceId, level: 'verbose' });
      // We now pass all relevant sensors. If the list is empty, the thunk will handle clearing the state for this instance.
      dispatch(processHassEntities({ entityIds: hassSensorEntitiesFromConfig, hass, logger, cardInstanceId }));
    }
  }, [hass, configInitialized, hassSensorEntitiesFromConfig, dispatch, cardInstanceId]);

  const genericHaEntitiesFromConfig = useMemo(() => {
    logger.log('InventreeCard', 'Recalculating genericHaEntitiesFromConfig', { cardInstanceId, level: 'debug' });
    if (!stringifiedConfig) return [];
    const config = JSON.parse(stringifiedConfig);
    if (!config?.data_sources?.ha_entities) return [];
    return [...new Set(config.data_sources.ha_entities.filter((id: string) => typeof id === 'string' && id !== ''))];
  }, [stringifiedConfig]);

  useEffect(() => {
    logger.log('InventreeCard', `Generic HASS Effect Fired. Entity count: ${genericHaEntitiesFromConfig.length}`, { cardInstanceId, level: 'debug' });
    if (!hass || genericHaEntitiesFromConfig.length === 0 || !cardInstanceId) return;
    dispatch(initializeGenericHaStatesFromConfig({ hass, logger, cardInstanceId }));
  }, [hass, genericHaEntitiesFromConfig, dispatch, cardInstanceId]);

  const parametersToFetchFromConfig = useMemo(() => {
    logger.log('InventreeCard', 'Recalculating parametersToFetchFromConfig', { cardInstanceId, level: 'debug' });
    if (!stringifiedConfig) return [];
    const config = JSON.parse(stringifiedConfig);
    return config?.data_sources?.inventreeParametersToFetch || [];
  }, [stringifiedConfig]);

  useEffect(() => {
    logger.log('InventreeCard', `Parameter Fetch Effect Fired for card ${cardInstanceId}.`, { cardInstanceId, apiInitialized, configCount: parametersToFetchFromConfig.length, level: 'debug' });
    if (!apiInitialized || parametersToFetchFromConfig.length === 0 || !cardInstanceId) return;
    dispatch(fetchConfiguredParameters({ configs: parametersToFetchFromConfig, cardInstanceId }));
  }, [apiInitialized, parametersToFetchFromConfig, dispatch, cardInstanceId]);

  const idleRenderInterval = useMemo(() => {
    logger.log('InventreeCard', 'Recalculating idleRenderInterval', { cardInstanceId, level: 'debug' });
    if (!stringifiedConfig) return 5000;
    const config = JSON.parse(stringifiedConfig);
    return config?.performance?.rendering?.idleRenderInterval ?? 5000;
  }, [stringifiedConfig]);

  useEffect(() => {
    if (idleRenderInterval <= 0) return;
    const intervalId = setInterval(() => {
    }, idleRenderInterval);
    return () => clearInterval(intervalId);
  }, [idleRenderInterval, logger]);

  const renderLayout = (): JSX.Element | null => {
    if (!config || !config.layout) return null; // Guard against missing config or layout
    const commonLayoutProps: any = { hass, config, cardInstanceId };
    switch (config.layout.viewType) {
      case 'detail':
        return React.createElement(DetailLayout, { ...commonLayoutProps, selectedPartId: selectedItem?.pk });
      case 'grid':
        const gridPartIds = parts.map(p => p.pk);
        return React.createElement(GridLayout, { ...commonLayoutProps, partIds: gridPartIds });
      case 'list':
        return React.createElement(ListLayout, { ...commonLayoutProps, parts, item: selectedItem });
      case 'parts':
        return React.createElement(PartsLayout, { ...commonLayoutProps, parts });
      case 'variants':
        return React.createElement(VariantLayout, { ...commonLayoutProps, selectedPart: selectedItem });
      case 'custom':
        return React.createElement(TableLayout, { ...commonLayoutProps, parts, layoutConfig: config.layout });
      default:
        // Default to the new TableLayout if columns are defined, otherwise fallback to PartsLayout
        if (config.layout.columns && config.layout.columns.length > 0) {
          return React.createElement(TableLayout, { ...commonLayoutProps, parts, layoutConfig: config.layout });
        }
        return React.createElement(PartsLayout, { ...commonLayoutProps, parts });
    }
  };

  return (
    <div className="inventree-card-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', boxSizing: 'border-box' }}>
      {apiPartPrefetchers}
      <GlobalActionButtons />
      <div style={{ flex: 1 }}>
        {configInitialized ? renderLayout() : <div style={{ padding: '16px' }}>Initializing configuration...</div>}
      </div>
    </div>
  );
};

export default InventreeCard;