import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
import { Logger } from '../../utils/logger';

// Import the PartView component
import PartView from '../part/PartView';

interface DetailLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  selectedPartId?: number;
}

const DetailLayout: React.FC<DetailLayoutProps> = ({ hass, config, selectedPartId }) => {
  const logger = React.useMemo(() => Logger.getInstance(), []);

  React.useEffect(() => {
    logger.log('DetailLayout', 'Props update', { hasHass: !!hass, hasConfig: !!config, selectedPartId });
  }, [hass, config, selectedPartId, logger]);

  if (!config) {
    logger.log('DetailLayout', 'Warn - No config provided', { config });
    return <div>Error: Configuration is missing.</div>;
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