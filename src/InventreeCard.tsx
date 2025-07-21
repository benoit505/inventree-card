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
  selectCombinedParts, 
  selectAllReferencedPartPksFromConfig, 
  selectIsReadyForEvaluation,
  selectArePartsLoading,
  selectPartsError,
} from './store/slices/partsSlice'; 
import { selectLogSettingsForInstance } from './store/slices/loggingSlice';
import DetailLayout from './components/layouts/DetailLayout';
import GridLayout from './components/layouts/GridLayout';
import ListLayout from './components/layouts/ListLayout';
import PartsLayout from './components/layouts/PartsLayout';
import VariantLayout from './components/layouts/VariantLayout';
import TableLayout from './components/layouts/TableLayout';
import GlobalActionButtons from './components/global/GlobalActionButtons';
import { usePrefetchApiParts } from './hooks';
import { removeCardInstanceThunk } from './store/thunks/lifecycleThunks';

// Register the category for this component
ConditionalLoggerEngine.getInstance().registerCategory('InventreeCard', { enabled: true, level: 'info' });

interface InventreeCardProps {
  hass: HomeAssistant;
  config: LovelaceCardConfig;
  cardInstanceId?: string;
}

const InventreeCard: React.FC<InventreeCardProps> = ({ hass, config, cardInstanceId }) => {
  const logger = useMemo(() => {
    const instanceId = cardInstanceId || 'unknown';
    return ConditionalLoggerEngine.getInstance().getLogger('InventreeCard', instanceId);
  }, [cardInstanceId]);

  useEffect(() => {
    logger.info('Lifecycle', 'React component mounted.');
  }, [logger]);

  const allParts = useAppSelector((state) => selectCombinedParts(state, cardInstanceId ?? ''));

  logger.debug('Render', 'InventreeCard rendering.', {
    hasId: !!cardInstanceId,
    partCount: allParts.length,
  });

  // This hook is essential for fetching parts defined by their PK in the config.
  const pksToFetch = useAppSelector((state) => selectAllReferencedPartPksFromConfig(state, cardInstanceId ?? ''));
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