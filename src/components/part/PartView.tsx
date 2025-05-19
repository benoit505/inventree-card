import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig } from '../../types';
import { RootState } from '../../store';
import { selectPartById } from '../../store/slices/partsSlice';
import { Logger } from '../../utils/logger';

// Import child React components
import PartThumbnail from './PartThumbnail';
import PartDetails from './PartDetails';
import PartButtons from './PartButtons';

interface PartViewProps {
  partId?: number;
  config?: InventreeCardConfig;
  hass?: HomeAssistant;
}

const PartView: React.FC<PartViewProps> = ({ partId, config, hass }) => {
  const logger = React.useMemo(() => Logger.getInstance(), []);

  const partData = useSelector((state: RootState) =>
    partId ? selectPartById(state, partId) : undefined
  );

  React.useEffect(() => {
    if (partData) {
      logger.log('PartView React', 'Received part data from Redux:', {
        partId: partData?.pk,
        partName: partData?.name,
        // partSource: partData?.source, // source might not be on InventreeItem
        hasPartData: !!partData,
      });
    }
  }, [partData, logger]);

  const getStockStatus = React.useCallback((): 'none' | 'low' | 'good' => {
    if (!partData || typeof partData.in_stock !== 'number') return 'none';
    if (partData.in_stock <= 0) return 'none';
    if (partData.minimum_stock && partData.in_stock <= partData.minimum_stock) return 'low';
    return 'good';
  }, [partData]);

  const getStockColor = React.useCallback((status: 'none' | 'low' | 'good'): string => {
    switch (status) {
      case 'none': return '#f44336'; // var(--error-color)
      case 'low': return '#ff9800';  // var(--warning-color)
      case 'good': return '#4caf50';  // var(--success-color)
      default: return 'transparent';
    }
  }, []);

  if (!partData || !config) {
    // logger.log('PartView React', 'Rendering null: No partData or config');
    return null; // Or a loading/error state
  }

  const display = config.display || {};
  const stockStatus = getStockStatus();
  const stockIndicatorColor = getStockColor(stockStatus);

  // Basic styles - these would ideally come from a shared theme or CSS modules
  const partContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '4px', // var(--ha-card-border-radius, 4px)
    background: 'white', // var(--ha-card-background, var(--card-background-color, white))
    // For the top border indicator:
    borderTop: display.show_stock_status_border ? `3px solid ${stockIndicatorColor}` : undefined,
  };

  const partNameStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.1em',
  };

  const stockValueStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.9em',
    backgroundColor: config.display?.show_stock_status_colors ? stockIndicatorColor : 'transparent',
    color: config.display?.show_stock_status_colors ? 'white' : 'inherit',
  };
  
  const partContentStyle: React.CSSProperties = {
    display: 'flex',
    // flexDirection: 'column', // Default, can be row if thumbnail is beside details
    gap: '0.5rem',
  };

  const detailsWrapperStyle: React.CSSProperties = {
    flexGrow: 1,
  };

  // logger.log('PartView React', 'Rendering PartView for:', { partId: partData.pk, name: partData.name });

  return (
    <div style={partContainerStyle}>
      {display.show_header !== false && (
        <div className="part-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {display.show_name !== false && <div style={partNameStyle}>{partData.name}</div>}
          {display.show_stock !== false && (
            <span style={stockValueStyle}>
              {partData.in_stock} {partData.units || ''}
            </span>
          )}
        </div>
      )}

      <div style={partContentStyle}>
        {display.show_image !== false && partData.thumbnail && (
          <div className="part-thumbnail-wrapper" style={{ width: '100px', height: '100px' /* Example size */ }}>
            <PartThumbnail partData={partData} config={config} layout="detail" />
          </div>
        )}

        <div style={detailsWrapperStyle}>
          {/* PartDetails will handle its own display toggles based on config */}
          <PartDetails partId={partData.pk} config={config} />
        </div>
      </div>

      {display.show_buttons !== false && (
        <div className="part-buttons-wrapper" style={{ marginTop: '0.5rem' }}>
          <PartButtons partItem={partData} config={config} hass={hass} />
        </div>
      )}
    </div>
  );
};

export default PartView; 