import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig, ParameterDetail, ActionDefinition, ActionExecutionContext } from '../../types';
import { Logger } from '../../utils/logger';
import { useElementDisplayStatus } from '../../hooks/useElementDisplayStatus';

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
  cardInstanceId?: string;
}

const PartView: React.FC<PartViewProps> = ({ partId, config, hass, cardInstanceId }) => {
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
  const shouldShowParametersForDetails = useElementDisplayStatus(cardInstanceId, 'show_parameters', config?.display);
  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError: isParametersError,
    error: parametersError,
    isFetching: isFetchingParameters,
  } = useGetPartParametersQuery(partId!, { 
    skip: !partId || !partData || !shouldShowParametersForDetails 
  });

  // Visual effects selector remains the same
  const visualEffect = useSelector((state: RootState) => 
    partId ? selectVisualEffectForPart(state, cardInstanceId || 'unknown_card', partId) : undefined
  );

  // Use the new hook for individual element visibility
  const shouldShowHeader = useElementDisplayStatus(cardInstanceId, 'show_header', config?.display);
  const shouldShowImage = useElementDisplayStatus(cardInstanceId, 'show_image', config?.display);
  const shouldShowName = useElementDisplayStatus(cardInstanceId, 'show_name', config?.display);
  const shouldShowStock = useElementDisplayStatus(cardInstanceId, 'show_stock', config?.display);
  const shouldShowButtons = useElementDisplayStatus(cardInstanceId, 'show_buttons', config?.display);
  const shouldShowStockStatusBorder = useElementDisplayStatus(cardInstanceId, 'show_stock_status_border', config?.display);
  const shouldShowStockStatusColors = useElementDisplayStatus(cardInstanceId, 'show_stock_status_colors', config?.display);
  
  // Props for PartDetails - these will also use the hook
  const shouldShowDescriptionForDetails = useElementDisplayStatus(cardInstanceId, 'show_description', config?.display);
  const shouldShowCategoryForDetails = useElementDisplayStatus(cardInstanceId, 'show_category', config?.display);
  const shouldShowIpnForDetails = useElementDisplayStatus(cardInstanceId, 'show_ipn', config?.display);
  const shouldShowLocationForDetails = useElementDisplayStatus(cardInstanceId, 'show_location', config?.display);
  const shouldShowSupplierForDetails = useElementDisplayStatus(cardInstanceId, 'show_supplier', config?.display);
  const shouldShowManufacturerForDetails = useElementDisplayStatus(cardInstanceId, 'show_manufacturer', config?.display);
  const shouldShowNotesForDetails = useElementDisplayStatus(cardInstanceId, 'show_notes', config?.display);
  // shouldShowParametersForDetails is already defined above for the skip logic

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

  if (!config) {
    return <div>Configuration is missing.</div>;
  }

  if (isLoadingPart || (isFetchingPart && !partData)) {
    return <div>Loading part details...</div>;
  }

  if (isPartError) {
    let errorMessage = 'Unknown error';
    if (partError) {
        if ('status' in partError) { 
            const fetchError = partError as { status?: number | string; data?: any; error?: string };
            if (typeof fetchError.data === 'string') errorMessage = fetchError.data;
            else if (fetchError.data && typeof fetchError.data === 'object' && fetchError.data.message) errorMessage = fetchError.data.message;
            else if (fetchError.error) errorMessage = fetchError.error;
            else errorMessage = `API error status: ${fetchError.status}`;
        } else { 
            errorMessage = (partError as { message?: string }).message || 'Client error';
        }
    }
    return <div>Error loading part: {errorMessage}</div>;
  }

  if (!partData) {
    return <div>Part data not available.</div>;
  }

  if (visualEffect?.isVisible === false) {
    logger.log('PartView React', `Part ${partId} is not visible due to conditional effect.`, { partId, visualEffect });
    return null;
  }

  const stockStatus = getStockStatus();
  const stockIndicatorColor = getStockColor(stockStatus);

  const partContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '4px',
    background: visualEffect?.highlight || 'white',
    border: visualEffect?.border,
    opacity: typeof visualEffect?.opacity === 'number' ? visualEffect.opacity : 1,
    borderTop: shouldShowStockStatusBorder && !visualEffect?.border ? `3px solid ${stockIndicatorColor}` : visualEffect?.border || undefined,
  };

  const partNameStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: visualEffect?.textColor,
  };

  const stockValueStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.9em',
    backgroundColor: shouldShowStockStatusColors ? stockIndicatorColor : 'transparent',
    color: shouldShowStockStatusColors ? 'white' : visualEffect?.textColor || 'inherit',
  };
  
  const partContentStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
  };

  const detailsWrapperStyle: React.CSSProperties = {
    flexGrow: 1,
    color: visualEffect?.textColor,
  };

  const itemClasses = [
    'part-view-container',
    visualEffect?.priority ? `priority-${visualEffect.priority}` : '',
    ...(visualEffect?.customClasses || [])
  ].filter(Boolean).join(' ');

  const handleThumbnailClick = React.useMemo(() => {
    if (!config?.actions || !partData) return undefined;
    const thumbnailClickAction = config.actions.find(
      (action: ActionDefinition) => action.trigger.type === 'ui_thumbnail_click'
    );
    if (thumbnailClickAction) {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        logger.log('PartView', `Thumbnail clicked for part ${partData.pk}, executing action: ${thumbnailClickAction.name}`);
        const executionContext: ActionExecutionContext = { part: partData, hassStates: hass?.states };
        actionEngine.executeAction(thumbnailClickAction.id, { ...executionContext, hass });
      };
    }
    return undefined;
  }, [config?.actions, partData, hass, logger]);

  console.log('%c[PartView Debug]', 'color: red; font-weight: bold;', {
    partId,
    partData,
    visualEffect,
    parametersData,
    parametersError,
    config
  });

  return (
    <div style={partContainerStyle} className={itemClasses}>
      {shouldShowHeader && (
        <div className="part-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {shouldShowName && <div style={partNameStyle}>{partData.name}</div>}
          {shouldShowStock && (
            <span style={stockValueStyle}>
              {partData.in_stock} {partData.units || ''}
            </span>
          )}
        </div>
      )}

      <div style={partContentStyle}>
        {shouldShowImage && partData.thumbnail && (
          <div className="part-thumbnail-wrapper" style={{ width: '100px', height: '100px' }}>
            <PartThumbnail 
              partData={partData} 
              config={config} 
              layout="detail" 
              icon={visualEffect?.icon} 
              badge={visualEffect?.badge} 
              onClick={handleThumbnailClick}
            />
          </div>
        )}

        <div style={detailsWrapperStyle}>
          <PartDetails 
            config={config}
            visualEffect={visualEffect}
            description={partData.description}
            categoryName={partData.category_name}
            ipn={partData.IPN}
            locationName={partData.location_pathstring}
            notes={partData.notes}
            parametersData={parametersData}
            isLoadingParameters={isLoadingParameters || (isFetchingParameters && !parametersData)}
            isParametersError={isParametersError}
            parametersError={parametersError}
            showDescription={shouldShowDescriptionForDetails}
            showCategory={shouldShowCategoryForDetails}
            showIpn={shouldShowIpnForDetails}
            showLocation={shouldShowLocationForDetails}
            showSupplier={shouldShowSupplierForDetails}
            showManufacturer={shouldShowManufacturerForDetails}
            showNotes={shouldShowNotesForDetails}
            showParameters={shouldShowParametersForDetails}
          />
        </div>
      </div>

      {shouldShowButtons && (
        <div className="part-buttons-wrapper" style={{ marginTop: '0.5rem' }}>
          <PartButtons partItem={partData} config={config} hass={hass} cardInstanceId={cardInstanceId} />
        </div>
      )}
    </div>
  );
};

export default PartView; 