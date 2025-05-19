import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Added useSelector
import { HomeAssistant } from 'custom-card-helpers';
import { Provider } from 'react-redux';
import { InventreeCardConfig, InventreeItem } from './types'; // Changed import path
import { Logger } from './utils/logger';
// import { apiInitializationError } from './store/slices/apiSlice'; // Removed unused import
import { 
  initializeDirectApi, 
  initializeWebSocketPlugin,
  processHassEntities
} from './store/thunks/systemThunks';
// Only import fetchParametersForReferencedParts from parameterThunks
import { 
    fetchParametersForReferencedParts,
    initializeConditionsAndParameters
} from './store/thunks/parameterThunks';
import { RootState, AppDispatch } from './store'; // Import AppDispatch
import { selectPartsForEntities } from './store/slices/partsSlice'; // Selector for parts

// Import placeholder layouts
import DetailLayout from './components/layouts/DetailLayout';
import GridLayout from './components/layouts/GridLayout';
import ListLayout from './components/layouts/ListLayout';
import PartsLayout from './components/layouts/PartsLayout';
import VariantLayout from './components/layouts/VariantLayout';

interface InventreeCardProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
}

const logger = Logger.getInstance();

// Simple debounce utility function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        timeoutId = null; // Clear the timeoutId after execution
        resolve(func(...args));
      }, waitFor);
    });
}

const InventreeCard = ({ hass, config }: InventreeCardProps): JSX.Element | null => {
  const dispatch = useDispatch<any>();

  // Performance settings from config
  const renderPerformanceConfig = config?.performance?.rendering;
  const debounceTime = renderPerformanceConfig?.debounceTime ?? 50;
  const idleRenderInterval = renderPerformanceConfig?.idleRenderInterval ?? 5000;
  // maxRenderFrequency is not directly used in this step, but noted for future consideration

  const entityIdsFromConfig = useMemo(() => {
    if (!config) return [];
    const ids = config.entity ? [config.entity] : [];
    if (Array.isArray(config.selected_entities)) {
      ids.push(...config.selected_entities);
    }
    return [...new Set(ids)];
  }, [config?.entity, config?.selected_entities]);

  const parts = useSelector((state: RootState) => selectPartsForEntities(state, entityIdsFromConfig));
  
  const selectedItem = useSelector((state: RootState) => {
    if (!config || !parts || parts.length === 0) return undefined;
    if (config.view_type === 'detail' || config.view_type === 'variants') {
        if (config.part_id) {
            return parts.find(p => p.pk === config.part_id) || parts[0];
        }
        return parts[0];
    }
    return undefined;
  });

  useEffect(() => {
    if (config) {
      logger.log('InventreeCard.tsx', 'Config updated or available.', { config });
      logger.setDebugConfig(config);
    }
  }, [config]);

  // Debounced version of the initialization logic
  const debouncedInitializationEffect = useCallback(debounce(async (currentHass, currentConfig, currentDispatch) => {
    if (currentHass && currentConfig) {
      logger.log('InventreeCard.tsx', 'Debounced Effect: HASS and Config are available. Initializing.', { hass: !!currentHass, config: !!currentConfig });

      if (currentConfig.direct_api?.enabled) {
        if (!currentConfig.direct_api.url || !currentConfig.direct_api.api_key) {
          logger.warn('InventreeCard.tsx', '⚠️ Debounced Effect: Direct API URL or API Key missing, skipping initialization.');
        } else {
          logger.log('InventreeCard.tsx', '🚀 Debounced Effect: Dispatching initializeDirectApi thunk');
          currentDispatch(initializeDirectApi({ directApiConfig: currentConfig.direct_api, logger }));
        }

        if (currentConfig.direct_api.method !== 'hass') {
          if (currentConfig.direct_api.url || currentConfig.direct_api.websocket_url) {
            logger.log('InventreeCard.tsx', '🔌 Debounced Effect: Dispatching initializeWebSocketPlugin thunk');
            currentDispatch(initializeWebSocketPlugin({
              directApiConfig: currentConfig.direct_api,
              cardDebugWebSocket: currentConfig.debug_websocket,
              logger
            }));
          } else {
            logger.warn('InventreeCard.tsx', '⚠️ Debounced Effect: Cannot initialize WebSocket, base URL for WS derivation is missing when method is not HASS.');
          }
        }
      } else {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Direct API not enabled, skipping API/WebSocket initialization.');
      }

      const mainEntityId = currentConfig.entity;
      const selectedEntities = currentConfig.selected_entities || [];

      if (currentHass && (mainEntityId || selectedEntities.length > 0)) { 
        logger.log('InventreeCard.tsx', '🔄 Debounced Effect: Dispatching processHassEntities thunk');
        currentDispatch(processHassEntities({ 
          hass: currentHass, 
          mainEntityId, 
          selectedEntities, 
          logger 
        }));
      } else {
        if (!currentHass) {
            logger.warn('InventreeCard.tsx', 'Debounced Effect: HASS object not available, skipping HASS entity processing.');
        } else {
            logger.warn('InventreeCard.tsx', 'Debounced Effect: No main entity or selected entities configured, skipping HASS state processing.');
        }
      }

      if (currentConfig.direct_api?.enabled && currentConfig.parameters?.enabled && currentConfig.parameters.conditions) {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Dispatching initializeConditionsAndParameters...');
        currentDispatch(initializeConditionsAndParameters(currentConfig.parameters.conditions));
      } else {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Skipping parameter conditions initialization (Direct API/Parameters disabled or no conditions defined).');
        currentDispatch(initializeConditionsAndParameters([])); 
      }
    }
  }, debounceTime), [debounceTime, logger]); // logger is stable, debounceTime might change if config reloads

  useEffect(() => {
    debouncedInitializationEffect(hass, config, dispatch);
  }, [hass, config, dispatch, debouncedInitializationEffect]);

  // Idle Render Interval effect
  useEffect(() => {
    if (idleRenderInterval <= 0) return; // Do nothing if interval is zero or negative

    logger.log('InventreeCard.tsx', `Setting up idle render interval: ${idleRenderInterval}ms`);
    const intervalId = setInterval(() => {
      // What to do on idle? 
      // Option 1: Log
      logger.log('InventreeCard.tsx', 'Idle render interval fired.', { interval: idleRenderInterval });
      // Option 2: Dispatch a generic refresh/poll action (if one exists)
      // dispatch({ type: 'system/idlePoll' });
      // Option 3: Force a re-render (use with extreme caution, generally not recommended)
      // setForceUpdate(u => u + 1); // Requires a state: const [forceUpdate, setForceUpdate] = useState(0);
    }, idleRenderInterval);

    return () => {
      logger.log('InventreeCard.tsx', 'Clearing idle render interval.');
      clearInterval(intervalId);
    };
  }, [idleRenderInterval, logger]); // Re-run if interval or logger changes

  // --- Parameter Fetching for Referenced Parameters (e.g., in conditions) ---
  /*
  useEffect(() => {
    if (!config?.parameters?.conditions || !config.parameters.enabled) return;

    const referencedPartIds = new Set<number>();
    config.parameters.conditions.forEach(condition => {
      if (condition.entityId) { 
        // Logic to resolve entityId to partId(s) would go here
      }
    });

    // Fetching is now handled by initializeConditionsAndParameters
    // if (referencedPartIds.size > 0) {
    //   const idsToFetch = Array.from(referencedPartIds);
    //   logger.log('InventreeCard React', 'Dispatching fetchParametersForReferencedParts', { ids: idsToFetch });
    //   dispatch(fetchParametersForReferencedParts(idsToFetch)); 
    // }
  }, [config?.parameters?.conditions, config?.parameters?.enabled, dispatch, logger]);
  */

  // --- Parameter Condition & Action Effects (ALL COMMENTED OUT as related thunks don't exist) ---
  /*
  useEffect(() => {
    if (!config?.parameters?.conditions || !config.parameters.enabled) return;
    logger.log('InventreeCard React', 'Dispatching fetchParametersIfNeeded for conditions');
    dispatch(fetchParametersIfNeeded({ partIds: parts.map(p => p.pk) }));
  }, [parts, config?.parameters?.conditions, config?.parameters?.enabled, dispatch, logger]);

  useEffect(() => {
    if (!config?.parameters?.conditions || !config.parameters.enabled) return;
    parts.forEach(part => {
      config.parameters?.conditions?.forEach(condition => {
        logger.log('InventreeCard React', 'Dispatching applyParameterCondition', { partId: part.pk, condition });
        dispatch(applyParameterCondition({ partId: part.pk, condition }));
      });
    });
  }, [parts, config?.parameters?.conditions, config?.parameters?.enabled, dispatch, logger]);

  useEffect(() => {
    if (!config?.parameters?.enabled) return;
    logger.log('InventreeCard React', 'Dispatching updateParameterFilterVisibility');
    dispatch(updateParameterFilterVisibility());
  }, [parameterLoadingStatus, parameterConditions, config?.parameters?.enabled, dispatch, logger]);

  const handleParameterAction = (partId: number, action: ParameterAction) => {
    logger.log('InventreeCard React', 'Dispatching executeParameterAction', { partId, action });
    dispatch(executeParameterAction({ partId, action }));
  };
  */

  if (!config) {
    return React.createElement('div', null, 'Loading configuration...');
  }
  
  const renderLayout = () => {
    // Prepare common props
    let commonLayoutProps: any = { hass, config };

    switch (config.view_type) {
      case 'detail':
        // DetailLayout specifically needs selectedPartId
        return React.createElement(DetailLayout, { ...commonLayoutProps, selectedPartId: selectedItem?.pk });
      case 'grid':
        // GridLayout expects all parts and potentially a selected item for a detail panel (if any)
        return React.createElement(GridLayout, { ...commonLayoutProps, parts, item: selectedItem });
      case 'list':
        // ListLayout expects all parts and potentially a selected item
        return React.createElement(ListLayout, { ...commonLayoutProps, parts, item: selectedItem });
      case 'parts':
        // PartsLayout expects all parts
        return React.createElement(PartsLayout, { ...commonLayoutProps, parts });
      case 'variants':
        // VariantLayout expects the specific template part (selectedItem) and all parts for context if needed
        return React.createElement(VariantLayout, { ...commonLayoutProps, item: selectedItem, parts });
      default:
        logger.warn('InventreeCard.tsx', `Unknown view_type: ${config.view_type}. Defaulting to Detail view or placeholder.`);
        return React.createElement('div', null, `Unknown view_type: ${config.view_type}. Please configure a valid view.`);
    }
  };

  return (
    <div style={{ padding: '16px', border: '2px solid navy' }}>
      <h1 style={{ marginTop: 0, marginBottom: '8px' }}>InvenTree Card (React)</h1>
      <p style={{ fontSize: '12px', color: '#555', marginTop:0, marginBottom: '16px' }}>
        Config Entity: {config.entity || 'N/A'} | View: {config.view_type || 'N/A'} | Parts in Store for Config: {parts.length} | Selected Item PK: {selectedItem?.pk || 'N/A'}
      </p>
      {renderLayout()}
    </div>
  );
};

export default InventreeCard; 