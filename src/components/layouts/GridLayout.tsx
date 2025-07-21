import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

// Import the new "smart" GridItem
import GridItem from './GridItem';

ConditionalLoggerEngine.getInstance().registerCategory('GridLayout', { enabled: false, level: 'info' });

interface GridLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  partIds: number[]; // Expects an array of part IDs
  cardInstanceId?: string;
}

const GridLayout: React.FC<GridLayoutProps> = ({ hass, config, partIds, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('GridLayout', cardInstanceId);
  }, [cardInstanceId]);

  logger.verbose('GridLayout', 'Component rendering', { partIdCount: partIds?.length, cardInstanceId });

  if (!config) {
    logger.warn('GridLayout', 'Render blocked: config is missing.');
    return <div className="grid-layout loading"><p>Loading config...</p></div>;
  }
  if (!partIds || partIds.length === 0) {
    logger.info('GridLayout', 'No parts to display.');
    return <div className="grid-layout no-parts"><p>No parts to display.</p></div>;
  }

  const layoutOptions = config.layout_options || {};
  const columns = layoutOptions.columns || 3;
  const gridSpacing = layoutOptions.grid_spacing || 8;

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gridSpacing}px`,
    padding: '8px',
  };

  const scrollContainerStyle: React.CSSProperties = {
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  };

  logger.debug('GridLayout', 'Rendering with partIds:', { partIds });

  return (
    <div className="grid-layout-scroll-container" style={scrollContainerStyle}>
      <div style={containerStyle}>
        {partIds.map(partId => (
          <GridItem
            key={partId}
            partId={partId}
            hass={hass}
            cardInstanceId={cardInstanceId}
          />
        ))}
      </div>
    </div>
  );
};

export default GridLayout; 