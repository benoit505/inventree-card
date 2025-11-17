import React, { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch, store, RootState } from './store';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
import { 
    InventreeCardConfig, 
    InventreeItem, 
} from './types';
import { ConditionalLoggerEngine } from './core/logging/ConditionalLoggerEngine';
import { evaluateAndApplyEffectsThunk } from './store/thunks/conditionalLogicThunks';
import { 
  selectAllPartsForInstance, 
  selectAllReferencedPartPksFromConfig, 
  selectIsReadyForEvaluation,
  selectArePartsLoading,
  selectPartsError,
} from './store/slices/partsSlice'; 
import { selectLogSettingsForInstance } from './store/slices/loggingSlice';
import { fetchHaEntityStatesThunk } from './store/thunks/genericHaStateThunks';
import { processHassEntities } from './store/thunks/systemThunks';
import DetailLayout from './components/layouts/DetailLayout';
import GridLayout from './components/layouts/GridLayout';
import ListLayout from './components/layouts/ListLayout';
import PartsLayout from './components/layouts/PartsLayout';
import VariantLayout from './components/layouts/VariantLayout';
import TableLayout from './components/layouts/TableLayout';
import GlobalActionButtons from './components/global/GlobalActionButtons';
import { usePrefetchApiParts } from './hooks';
import { removeCardInstanceThunk } from './store/thunks/lifecycleThunks';
// REMOVED: evaluateEffectsForAllActiveCardsThunk - now using targeted per-card evaluation
import { selectWebSocketStatus } from './store/slices/websocketSlice';

// Register the category for this component
ConditionalLoggerEngine.getInstance().registerCategory('InventreeCard', { enabled: true, level: 'info' });

interface InventreeCardProps {
  hass: HomeAssistant;
  config: LovelaceCardConfig;
  cardInstanceId?: string;
}

const InventreeCard: React.FC<InventreeCardProps> = ({ hass, config, cardInstanceId }) => {
  const dispatch = useAppDispatch();
  const logger = useMemo(() => {
    const instanceId = cardInstanceId || 'unknown';
    return ConditionalLoggerEngine.getInstance().getLogger('InventreeCard', instanceId);
  }, [cardInstanceId]);

  useEffect(() => {
    logger.info('Lifecycle', 'React component mounted.');
  }, [logger]);

  const websocketStatus = useAppSelector(selectWebSocketStatus);

  // Set up polling fallback if WebSocket is not connected
  useEffect(() => {
    if (!cardInstanceId) return;

    if (websocketStatus !== 'connected') {
      const idleRenderInterval = (config?.performance?.rendering?.idleRenderInterval || 30) * 1000;
      logger.info('PollingFallback', `WebSocket not connected. Setting up polling fallback every ${idleRenderInterval}ms.`);

      const intervalId = setInterval(() => {
        logger.debug('PollingFallback', 'Polling timer fired. Dispatching effects evaluation for this card only.');
        // FIXED: Only evaluate THIS card instance, not all cards (was causing 300+ API calls)
        dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId }));
      }, idleRenderInterval);

      return () => {
        logger.info('PollingFallback', 'Cleaning up polling interval.');
        clearInterval(intervalId);
      };
    }
  }, [cardInstanceId, websocketStatus, config, dispatch, logger]);

  // Extract only the entity STATE VALUES we care about (prevents re-render on every HA update)
  // FIXED: Create a JSON string of monitored entity values for stable comparison
  const monitoredEntityStatesKey = useMemo(() => {
    const haEntities = config?.data_sources?.ha_entities || [];
    if (!hass || haEntities.length === 0) return '';
    
    // Extract only the state values (strings) for entities we monitor
    const stateValues: Record<string, string> = {};
    haEntities.forEach((entityId: string) => {
      const entityState = hass.states[entityId];
      if (entityState) {
        stateValues[entityId] = entityState.state;  // Only the state value, not full object
      }
    });
    
    // Return JSON string for stable comparison - only changes when VALUES change
    return JSON.stringify(stateValues);
  }, [hass, config?.data_sources?.ha_entities]);  // hass itself, but we extract values

  // FIXED: Only update Redux when MONITORED entity VALUES change, not on every HA update
  useEffect(() => {
    if (!hass || !cardInstanceId || !monitoredEntityStatesKey) return;

    const haEntities = config?.data_sources?.ha_entities || [];
    
    if (haEntities.length > 0) {
      logger.debug('HASS Update', `Monitored entity states changed. Updating ${haEntities.length} entities in Redux.`);
      
      // Update the Redux store with fresh HASS data
      dispatch(fetchHaEntityStatesThunk({ hass, entityIds: haEntities }));
    }
  }, [monitoredEntityStatesKey, cardInstanceId, dispatch, logger, hass, config?.data_sources?.ha_entities]);

  // FIXED: Create stable key for InvenTree HASS sensor data to prevent unnecessary re-processing
  const hassInventreeSensorKey = useMemo(() => {
    const hassSensors = config?.data_sources?.inventree_hass_sensors || [];
    if (!hass || hassSensors.length === 0) return '';
    
    // Create a key based on the sensor's items array (the actual part data)
    const sensorDataKeys: string[] = [];
    hassSensors.forEach((entityId: string) => {
      const entityState = hass.states[entityId];
      if (entityState && entityState.attributes?.items) {
        // Use array length and first/last PK as a quick fingerprint
        const items = entityState.attributes.items;
        const fingerprint = `${entityId}:${items.length}:${items[0]?.pk || ''}:${items[items.length - 1]?.pk || ''}`;
        sensorDataKeys.push(fingerprint);
      }
    });
    
    return sensorDataKeys.join('|');
  }, [hass, config?.data_sources?.inventree_hass_sensors]);

  // Re-process InvenTree HASS sensors when sensor data actually changes
  useEffect(() => {
    if (!hass || !cardInstanceId || !hassInventreeSensorKey) return;

    const hassSensors = config?.data_sources?.inventree_hass_sensors || [];
    
    if (hassSensors.length > 0) {
      logger.debug('HASS Sensor Update', `InvenTree HASS sensor data changed. Re-processing ${hassSensors.length} sensor(s).`);
      dispatch(processHassEntities({ entityIds: hassSensors, hass, cardInstanceId }));
    }
  }, [hassInventreeSensorKey, cardInstanceId, dispatch, logger, hass, config?.data_sources?.inventree_hass_sensors]);

  const allParts = useAppSelector((state) => selectAllPartsForInstance(state, cardInstanceId ?? ''));

  logger.debug('Render', 'InventreeCard rendering.', {
    hasId: !!cardInstanceId,
    partCount: allParts.length,
  });

  // This hook is essential for fetching parts defined by their PK in the config.
  const pksToFetch = useAppSelector((state) => selectAllReferencedPartPksFromConfig(state, cardInstanceId ?? ''));
  console.log('%c[InventreeCard] PKs to fetch:', 'color: #3498DB; font-weight: bold;', { pksToFetch, cardInstanceId, configExists: cardInstanceId && !!store.getState().config?.configsByInstance?.[cardInstanceId] });
  const prefetchElements = usePrefetchApiParts(pksToFetch, cardInstanceId ?? '');

  const renderLayout = () => {
    const layoutType = config.layout?.type || 'table';
    logger.debug('renderLayout', `Determined layout type: ${layoutType}`);

    switch (layoutType) {
      case 'table':
        return <TableLayout hass={hass} parts={allParts} config={config} cardInstanceId={cardInstanceId ?? ''} />;
      case 'parts':
        return <PartsLayout hass={hass} parts={allParts} config={config} cardInstanceId={cardInstanceId ?? ''} />;
      default:
        logger.error('renderLayout', `Unknown layout type specified: ${layoutType}`);
        return <div>Error: Unknown layout type '{layoutType}'</div>;
    }
  };

  if (!cardInstanceId) {
    logger.warn('RenderGuard', 'Cannot render, cardInstanceId is missing.');
    return <div style={{ padding: '16px' }}>Initializing... (No Instance ID)</div>;
  }
  
  // The "Initializing..." message is now primarily handled by the Lit parent.
  // We still keep this as a fallback.
  const configExists = useAppSelector((state) => !!(cardInstanceId && state.config.configsByInstance[cardInstanceId]));
  if (!configExists) {
    logger.warn('RenderGuard', 'Config not yet initialized in Redux store.');
    return <div style={{ padding: '16px' }}>Waiting for configuration...</div>;
  }

  return (
    <div className="inventree-card" style={{ width: '100%', height: '100%' }}>
      {prefetchElements}
      {renderLayout()}
    </div>
  );
};

export default InventreeCard;