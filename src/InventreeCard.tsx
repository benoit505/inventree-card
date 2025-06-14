import React, { useEffect, useMemo } from 'react';
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
  fetchPartsByPks,
} from './store/thunks/systemThunks';
import { initializeRuleDefinitionsThunk } from './store/thunks/conditionalLogicThunks';
import { fetchConfiguredParameters } from './store/thunks/parameterThunks';
import { evaluateAndApplyEffectsThunk } from './store/thunks/conditionalLogicThunks';
import { setConfigAction } from './store/slices/configSlice';
import { clearCache } from './store/slices/parametersSlice';
import { setActionDefinitions } from './store/slices/actionsSlice';
import { RootState } from './store';
import { selectCombinedParts, selectRegisteredEntities, removePartsForEntity, selectAllReferencedPartPksFromConfig, selectIsReadyForEvaluation } from './store/slices/partsSlice'; 
import { selectApiInitialized } from './store/slices/apiSlice';
import DetailLayout from './components/layouts/DetailLayout';
import GridLayout from './components/layouts/GridLayout';
import ListLayout from './components/layouts/ListLayout';
import PartsLayout from './components/layouts/PartsLayout';
import VariantLayout from './components/layouts/VariantLayout';
import GlobalActionButtons from './components/global/GlobalActionButtons';
import { registerComponent, removeComponent } from './store/slices/componentSlice';

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
  console.log(`%c[InventreeCard] Render #${renderCount.current}`, 'color: green; font-weight: bold;');

  const dispatch = useDispatch<any>();

  // Create a stable, stringified version of the config for use in dependency arrays
  const stringifiedConfig = useMemo(() => JSON.stringify(config), [config]);

  // --- SELECTORS ---
  const apiInitialized = useSelector(selectApiInitialized);
  const configInitialized = useSelector((state: RootState) => !!state.config.configInitialized);
  const previousRegisteredEntities = useSelector<RootState, string[]>(selectRegisteredEntities);

  // Memoize a stable, stringified version of the entity list to use as a dependency.
  const stringifiedPreviousRegisteredEntities = useMemo(() => {
    // Sorting ensures that the order of keys doesn't cause unnecessary changes.
    return JSON.stringify([...previousRegisteredEntities].sort());
  }, [previousRegisteredEntities]);

  const allPksToPrefetch = useSelector((state: RootState) => selectAllReferencedPartPksFromConfig(state, config));

  const parts = useSelector(selectCombinedParts);

  const isReadyForEvaluation = useSelector((state: RootState) => selectIsReadyForEvaluation(state, config));

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
    console.log(`%c[InventreeCard] Mount Effect Fired for card ${cardInstanceId}`, 'color: blue;');
    return () => {
      dispatch(removeComponent(cardInstanceId));
    };
  }, [cardInstanceId, dispatch]);

  // Main Initialization Effect
  useEffect(() => {
    console.log('%c[InventreeCard] Initialization Effect Fired', 'color: blue;');
    if (!stringifiedConfig) {
      console.log('[InventreeCard] Init Effect: Bailing out, no stringifiedConfig yet.');
      return;
    }
    const config = JSON.parse(stringifiedConfig);

    const initialize = async () => {
        // --- STAGE 1: Synchronous State Setup ---
        // These actions update the Redux state immediately.
        logger.setDebugConfig(config);
        dispatch(setConfigAction(config));
        dispatch(clearCache()); 
        if (config.actions) {
            dispatch(setActionDefinitions(config.actions));
        }
        // CRITICAL: Set up the rules BEFORE any async operation that might trigger an evaluation.
        dispatch(initializeRuleDefinitionsThunk(config.conditional_logic?.definedLogics || []));

        // --- STAGE 2: Asynchronous API Initialization ---
        if (config.direct_api?.enabled) {
            if (config.direct_api.url && config.direct_api.api_key) {
                await dispatch(initializeDirectApi({ directApiConfig: config.direct_api, logger }));
                
                if (config.direct_api.method !== 'hass' && (config.direct_api.url || config.direct_api.websocket_url)) {
                    dispatch(initializeWebSocketPlugin({ directApiConfig: config.direct_api, cardDebugWebSocket: config.debug_websocket, logger }));
                }
            } else {
                logger.warn('InventreeCard.tsx', '⚠️ Direct API URL or API Key missing.');
            }
        }
    };

    initialize();
  }, [stringifiedConfig, dispatch]);

  // Effect to dispatch the thunk to fetch parts by PKs whenever the list changes or API becomes available.
  useEffect(() => {
    console.log(`%c[InventreeCard] PK Fetch Effect Fired. API Initialized: ${apiInitialized}, PKs to fetch: ${allPksToPrefetch.length}`, 'color: blue;');
    if (apiInitialized && allPksToPrefetch.length > 0) {
      console.log('[InventreeCard] PK Fetch Effect: Dispatching fetchPartsByPks with PKs:', allPksToPrefetch);
      dispatch(fetchPartsByPks(allPksToPrefetch));
    }
  }, [apiInitialized, allPksToPrefetch, dispatch]);

  // The new, intelligent evaluation effect, guarded by our "gatekeeper" selector.
  useEffect(() => {
    // Only run if the gatekeeper selector gives the green light AND we have a stable ID.
    if (isReadyForEvaluation && cardInstanceId) {
      dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId }));
    }
  }, [isReadyForEvaluation, cardInstanceId, dispatch]);

  const hassSensorEntitiesFromConfig = useMemo((): string[] => {
    console.log('%c[InventreeCard] Recalculating hassSensorEntitiesFromConfig', 'color: orange;');
    if (!stringifiedConfig) return [];
    const config = JSON.parse(stringifiedConfig);
    const sensors = config?.data_sources?.inventree_hass_sensors;
    if (!sensors || !Array.isArray(sensors)) {
      return [];
    }
    const filteredSensors = sensors.filter((id): id is string => typeof id === 'string' && id.length > 0);
    return [...new Set(filteredSensors)];
  }, [stringifiedConfig]);

  useEffect(() => {
    console.log(`%c[InventreeCard] HASS Process Effect Fired. Sensor count: ${hassSensorEntitiesFromConfig.length}`, 'color: blue;');
    if (!hass) return;

    const entitiesToRemove = previousRegisteredEntities.filter((e: string) => !hassSensorEntitiesFromConfig.includes(e));
    if (entitiesToRemove.length > 0) {
      entitiesToRemove.forEach((entityId: string) => {
        dispatch(removePartsForEntity({ entityId }));
      });
    }

    if (hassSensorEntitiesFromConfig.length > 0) {
      dispatch(processHassEntities({ entityIds: hassSensorEntitiesFromConfig, hass, logger }));
    }
  }, [hass, hassSensorEntitiesFromConfig, dispatch, stringifiedPreviousRegisteredEntities]);

  const genericHaEntitiesFromConfig = useMemo(() => {
    console.log('%c[InventreeCard] Recalculating genericHaEntitiesFromConfig', 'color: orange;');
    if (!stringifiedConfig) return [];
    const config = JSON.parse(stringifiedConfig);
    if (!config?.data_sources?.ha_entities) return [];
    return [...new Set(config.data_sources.ha_entities.filter((id: string) => typeof id === 'string' && id !== ''))];
  }, [stringifiedConfig]);

  useEffect(() => {
    console.log(`%c[InventreeCard] Generic HASS Effect Fired. Entity count: ${genericHaEntitiesFromConfig.length}`, 'color: blue;');
    if (!hass || genericHaEntitiesFromConfig.length === 0) return;
    dispatch(initializeGenericHaStatesFromConfig({ hass, logger }));
  }, [hass, genericHaEntitiesFromConfig, dispatch]);

  const parametersToFetchFromConfig = useMemo(() => {
    console.log('%c[InventreeCard] Recalculating parametersToFetchFromConfig', 'color: orange;');
    if (!stringifiedConfig) return [];
    const config = JSON.parse(stringifiedConfig);
    return config?.data_sources?.inventreeParametersToFetch || [];
  }, [stringifiedConfig]);

  useEffect(() => {
    console.log(`%c[InventreeCard] Parameter Fetch Effect Fired. Config count: ${parametersToFetchFromConfig.length}`, 'color: blue;');
    if (!apiInitialized || parametersToFetchFromConfig.length === 0) return;
    dispatch(fetchConfiguredParameters(parametersToFetchFromConfig));
  }, [apiInitialized, parametersToFetchFromConfig, dispatch]);

  const idleRenderInterval = useMemo(() => {
    console.log('%c[InventreeCard] Recalculating idleRenderInterval', 'color: orange;');
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
    if (!config) return null;
    const commonLayoutProps: any = { hass, config, cardInstanceId };
    switch (config.view_type) {
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
      default:
        return React.createElement(PartsLayout, { ...commonLayoutProps, parts });
    }
  };

  return (
    <div className="inventree-card-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GlobalActionButtons />
      <div style={{ flex: 1 }}>
        {configInitialized ? renderLayout() : <div style={{ padding: '16px' }}>Initializing configuration...</div>}
      </div>
    </div>
  );
};

export default InventreeCard;