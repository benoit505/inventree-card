import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, ParameterDetail, ActionDefinition, ActionExecutionContext } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { RootState } from '../../store/index';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { useGetPartParametersQuery } from '../../store/apis/inventreeApi';
import { Logger } from '../../utils/logger';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { actionEngine } from '../../services/ActionEngine';

import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';

interface GridItemProps {
  part: InventreeItem;
  config: InventreeCardConfig;
  hass?: HomeAssistant;
  isCurrentlyLocating: boolean;
  parameterActions: ParameterAction[];
  parametersDisplayEnabled: boolean;
  handleLocateGridItem: (partId: number) => void;
  handleParameterActionClick: (partId: number, action: ParameterAction, parameterPk?: number) => void;
}

// Helper functions (can be co-located or imported if used elsewhere)
const getGridItemContainerStyle = (modifiers?: VisualEffect, config?: InventreeCardConfig): React.CSSProperties => {
  const styles: React.CSSProperties = {
    border: '1px solid #eee', // Default border
    padding: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    height: config?.item_height ? `${config.item_height}px` : 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  if (modifiers?.highlight) styles.backgroundColor = modifiers.highlight;
  if (modifiers?.border) styles.border = modifiers.border;
  if (typeof modifiers?.opacity === 'number') styles.opacity = modifiers.opacity;
  return styles;
};

const getGridItemTextStyle = (modifiers?: VisualEffect): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  if (modifiers?.textColor) styles.color = modifiers.textColor;
  return styles;
};

const GridItem: React.FC<GridItemProps> = ({
  part,
  config,
  hass,
  isCurrentlyLocating,
  parameterActions,
  parametersDisplayEnabled,
  handleLocateGridItem,
  handleParameterActionClick,
}) => {
  const logger = Logger.getInstance();
  const partId = part.pk;
  const visualModifiers = useSelector((state: RootState) => selectVisualEffectForPart(state, partId));
  const displayConfig = config.display || {};

  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError,
    error,
  } = useGetPartParametersQuery(partId, { skip: !parametersDisplayEnabled });

  const actualModifiers = visualModifiers || {} as VisualEffect;

  const itemContainerStyle = getGridItemContainerStyle(actualModifiers, config);
  const itemTextStyle = getGridItemTextStyle(actualModifiers);

  const itemClasses = [
    'part-container',
    isCurrentlyLocating ? 'locating' : '',
    actualModifiers?.priority ? `priority-${actualModifiers.priority}` : '',
    ...(actualModifiers?.customClasses || [])
  ].filter(Boolean).join(' ');

  if (actualModifiers.isVisible === false) {
    return null;
  }

  const handleThumbnailClick = React.useMemo(() => {
    if (!config.actions || !part) return undefined;

    const thumbnailClickAction = config.actions.find(
      (action: ActionDefinition) => action.trigger.type === 'ui_thumbnail_click'
    );

    if (thumbnailClickAction) {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        logger.log('GridItem', `Thumbnail clicked for part ${part.pk}, executing action: ${thumbnailClickAction.name}`);
        const executionContext: ActionExecutionContext = {
          part: part,
          hassStates: hass?.states,
        };
        actionEngine.executeAction(thumbnailClickAction.id, { ...executionContext, hass });
      };
    }
    return undefined;
  }, [config.actions, part, hass, logger]);

  return (
    <div
      key={partId}
      className={itemClasses}
      style={itemContainerStyle}
      onClick={() => handleLocateGridItem(partId)}
    >
      {displayConfig.show_image && (
        <div className="part-thumbnail" style={{ marginBottom: '8px' }}>
          <PartThumbnail
            partData={part}
            config={config}
            layout="grid"
            icon={actualModifiers?.icon}
            badge={actualModifiers?.badge}
            onClick={handleThumbnailClick}
          />
        </div>
      )}
      <div className="part-info" style={{ ...itemTextStyle, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {displayConfig.show_name && <div className="part-name" style={{ fontWeight: 'bold' }}>{part.name}</div>}
        {displayConfig.show_stock && (
          <div className="part-stock">Stock: {part.in_stock} {part.units || ''}</div>
        )}
        {displayConfig.show_description && part.description && (
          <p className="part-description" style={{ fontSize: '0.8em', margin: '4px 0' }}>{part.description}</p>
        )}
      </div>
      <div className="part-actions-footer" style={{ marginTop: 'auto' }}>
        {displayConfig.show_buttons && hass && config && (
          <div style={{ fontSize: 'small', color: 'gray', padding: '4px 0' }}>
            <PartButtons partItem={part} config={config} hass={hass} />
          </div>
        )}
        {parameterActions.length > 0 && (
          <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
            {parameterActions.map((action: ParameterAction) => (
              <button
                key={`${partId}-${action.label}`}
                className="param-action-button"
                onClick={(e) => { e.stopPropagation(); handleParameterActionClick(partId, action); }}
                title={action.label}
                style={{ fontSize: '0.75em', padding: '2px 5px' }}
              >
                {action.icon ? <span>{/* ha-icon placeholder */}({action.icon})</span> : action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {isCurrentlyLocating && <div className="locating-indicator">Locating...</div>}
      {parametersDisplayEnabled && (
        <div className="part-parameters" style={{ fontSize: '0.75em', textAlign: 'left', marginTop: '8px' }}>
          {isLoadingParameters && <p>Loading parameters...</p>}
          {isError && (
            <p style={{color: 'red'}}>
              Error loading parameters: {
                (() => {
                  if (error) {
                    if ('status' in error) {
                      const customError = error as { status?: number | 'CUSTOM_ERROR'; data?: any; message?: string };
                      if (customError.data && typeof customError.data === 'object' && customError.data.message) {
                        return customError.data.message;
                      } else if (typeof customError.data === 'string') {
                        return customError.data;
                      }
                      return customError.message || customError.status?.toString() || 'API error';
                    } else {
                      return (error as SerializedError).message || 'Unknown client error';
                    }
                  }
                  return 'Unknown error';
                })()
              }
            </p>
          )}
          {parametersData && parametersData.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {parametersData.map((parameter: ParameterDetail) => (
                <li key={parameter.pk}>{parameter.template_detail?.name}: {parameter.data}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GridItem; 