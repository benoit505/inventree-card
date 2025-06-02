import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig, ParameterDetail, ActionDefinition, ActionExecutionContext } from '../../types';
import { Logger } from '../../utils/logger';

// ADDED: RTK Query hooks
import { useGetPartQuery, useGetPartParametersQuery } from '../../store/apis/inventreeApi';

// ADD: Import VisualEffect and selector
import { VisualEffect, selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { actionEngine } from '../../services/ActionEngine';

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

  // Fetch Part Data using RTK Query hook
  const {
    data: partData,
    isLoading: isLoadingPart,
    isError: isPartError,
    error: partError,
    isFetching: isFetchingPart,
  } = useGetPartQuery(partId!, { skip: !partId });

  // Fetch Parameters Data using RTK Query hook
  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError: isParametersError,
    error: parametersError,
    isFetching: isFetchingParameters,
  } = useGetPartParametersQuery(partId!, { skip: !partId || !partData });

  // Visual effects selector remains the same
  const visualEffect = useSelector((state: RootState) => 
    partId ? selectVisualEffectForPart(state, partId) : undefined
  );

  React.useEffect(() => {
    if (partData) {
      logger.log('PartView React', 'Part data from RTK Query:', {
        partId: partData?.pk,
        partName: partData?.name,
        hasPartData: !!partData,
        isLoading: isLoadingPart,
        isFetching: isFetchingPart,
        isError: isPartError,
        visualEffect,
      });
    }
    if (parametersData) {
        logger.log('PartView React', 'Parameters data from RTK Query:', {
            partId: partId,
            parametersCount: parametersData?.length,
            isLoading: isLoadingParameters,
            isFetching: isFetchingParameters,
            isError: isParametersError,
        });
    }
  }, [partData, parametersData, isLoadingPart, isFetchingPart, isPartError, isLoadingParameters, isFetchingParameters, isParametersError, visualEffect, logger, partId]);

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

  // Handle Loading and Error states from RTK Query
  if (!config) {
    return <div>Configuration is missing.</div>;
  }

  if (isLoadingPart || (isFetchingPart && !partData)) { // Show loading if initially loading or fetching without data yet
    return <div>Loading part details...</div>;
  }

  if (isPartError) {
    // Attempt to get a more specific error message if available
    let errorMessage = 'Unknown error';
    if (partError) {
        if ('status' in partError) { // FetchBaseQueryError
            const fetchError = partError as { status?: number | string; data?: any; error?: string };
            if (typeof fetchError.data === 'string') errorMessage = fetchError.data;
            else if (fetchError.data && typeof fetchError.data === 'object' && fetchError.data.message) errorMessage = fetchError.data.message;
            else if (fetchError.error) errorMessage = fetchError.error;
            else errorMessage = `API error status: ${fetchError.status}`;
        } else { // SerializedError
            errorMessage = (partError as { message?: string }).message || 'Client error';
        }
    }
    return <div>Error loading part: {errorMessage}</div>;
  }

  if (!partData) {
    return <div>Part data not available.</div>;
  }

  // ADD: Check for visibility from visualEffect
  if (visualEffect?.isVisible === false) {
    logger.log('PartView React', `Part ${partId} is not visible due to conditional effect.`, { partId, visualEffect });
    return null;
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
    background: visualEffect?.highlight || 'white', // APPLY highlight
    border: visualEffect?.border, // APPLY border
    opacity: typeof visualEffect?.opacity === 'number' ? visualEffect.opacity : 1, // APPLY opacity
    // For the top border indicator:
    borderTop: display.show_stock_status_border && !visualEffect?.border ? `3px solid ${stockIndicatorColor}` : visualEffect?.border || undefined,
  };

  const partNameStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: visualEffect?.textColor, // APPLY textColor
  };

  const stockValueStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.9em',
    backgroundColor: config.display?.show_stock_status_colors ? stockIndicatorColor : 'transparent',
    color: config.display?.show_stock_status_colors ? 'white' : visualEffect?.textColor || 'inherit', // APPLY textColor
  };
  
  const partContentStyle: React.CSSProperties = {
    display: 'flex',
    // flexDirection: 'column', // Default, can be row if thumbnail is beside details
    gap: '0.5rem',
  };

  const detailsWrapperStyle: React.CSSProperties = {
    flexGrow: 1,
    color: visualEffect?.textColor, // APPLY textColor to details wrapper
  };

  const itemClasses = [
    'part-view-container',
    visualEffect?.priority ? `priority-${visualEffect.priority}` : '',
    ...(visualEffect?.customClasses || [])
  ].filter(Boolean).join(' ');

  // logger.log('PartView React', 'Rendering PartView for:', { partId: partData.pk, name: partData.name });

  const handleThumbnailClick = React.useMemo(() => {
    if (!config?.actions || !partData) return undefined;

    const thumbnailClickAction = config.actions.find(
      (action: ActionDefinition) => action.trigger.type === 'ui_thumbnail_click'
    );

    if (thumbnailClickAction) {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        logger.log('PartView', `Thumbnail clicked for part ${partData.pk}, executing action: ${thumbnailClickAction.name}`);
        const executionContext: ActionExecutionContext = {
          part: partData,
          hassStates: hass?.states,
        };
        actionEngine.executeAction(thumbnailClickAction.id, { ...executionContext, hass });
      };
    }
    return undefined;
  }, [config?.actions, partData, hass, logger]);

  return (
    <div style={partContainerStyle} className={itemClasses}>
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
            {/* Pass visualEffect down to PartThumbnail */}
            <PartThumbnail 
              partData={partData} 
              config={config} 
              layout="detail" 
              visualEffect={visualEffect} 
              onClick={handleThumbnailClick}
            />
          </div>
        )}

        <div style={detailsWrapperStyle}>
          {/* Pass part data and parameter data (and their states) to PartDetails */}
          <PartDetails 
            config={config} 
            visualEffect={visualEffect}
            name={partData.name}
            description={partData.description}
            inStock={partData.in_stock}
            units={partData.units}
            minimumStock={partData.minimum_stock}
            parametersData={parametersData}
            isLoadingParameters={isLoadingParameters || (isFetchingParameters && !parametersData)} // Consider fetching as loading too
            isParametersError={isParametersError}
            parametersError={parametersError}
          />
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