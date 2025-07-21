import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

// Import the PartView component
import PartView from '../part/PartView';

ConditionalLoggerEngine.getInstance().registerCategory('DetailLayout', { enabled: false, level: 'info' });

interface DetailLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  selectedPartId?: number;
  cardInstanceId?: string;
}

const DetailLayout: React.FC<DetailLayoutProps> = ({ hass, config, selectedPartId, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('DetailLayout', cardInstanceId);
  }, [cardInstanceId]);

  logger.verbose('DetailLayout', 'Component rendering', { selectedPartId, cardInstanceId });

  React.useEffect(() => {
    logger.debug('useEffect[props]', 'Props update', { hasHass: !!hass, hasConfig: !!config, selectedPartId });
  }, [hass, config, selectedPartId]);

  if (!config || !hass || !cardInstanceId) {
    logger.warn('DetailLayout', 'Missing critical props', { hasConfig: !!config, hasHass: !!hass, hasCardInstanceId: !!cardInstanceId });
    return <div>Error: Card is not fully initialized.</div>;
  }

  const layoutStyle: React.CSSProperties = {
    padding: '1rem',
    background: 'var(--ha-card-background, var(--card-background-color, white))',
    borderRadius: 'var(--ha-card-border-radius, 4px)',
  };

  return (
    <div style={layoutStyle}>
      {selectedPartId ? (
        <PartView 
          partId={selectedPartId} 
          config={config} 
          hass={hass} 
          cardInstanceId={cardInstanceId}
        />
      ) : (
        <div>
          <div>No part selected or available for the configured entities.</div>
          <div>Please check your card configuration and ensure entities have associated parts.</div>
        </div>
      )}
    </div>
  );
};

export default DetailLayout; 