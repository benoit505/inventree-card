import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, ParameterDetail, VisualModifiers, ActionDefinition, ActionExecutionContext } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { RootState } from '../../store';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { Logger } from '../../utils/logger';
import { actionEngine } from '../../services/ActionEngine';
import { useElementDisplayStatus } from '../../hooks/useElementDisplayStatus';

import { useGetPartParametersQuery, useUpdatePartParameterMutation } from '../../store/apis/inventreeApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import PartThumbnail from '../part/PartThumbnail';
import PartButtons from '../part/PartButtons';

interface ListItemProps {
  part: InventreeItem;
  config: InventreeCardConfig;
  hass?: HomeAssistant;
  parametersDisplayEnabled: boolean;
  onLocate?: (partId: number) => void;
  parameterActions?: ParameterAction[]; 
  cardInstanceId?: string;
}

const logger = Logger.getInstance();

const getListItemContainerStyle = (modifiers?: VisualEffect, isLocating?: boolean): React.CSSProperties => {
  const styles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    border: '1px solid var(--divider-color, #e0e0e0)',
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
    backgroundColor: 'var(--card-background-color, white)',
    transition: 'background-color 0.3s ease',
  };

  if (isLocating) {
    styles.boxShadow = '0 0 10px var(--primary-color)';
    styles.borderColor = 'var(--primary-color)';
  }

  if (modifiers?.highlight) {
    styles.backgroundColor = modifiers.highlight;
  }
  if (modifiers?.border) {
    styles.border = modifiers.border; 
  }
  if (typeof modifiers?.opacity === 'number') styles.opacity = modifiers.opacity;
  
  return styles;
};

const getListItemTextStyle = (modifiers?: VisualEffect): React.CSSProperties => {
  const styles: React.CSSProperties = {
    color: 'var(--primary-text-color, black)',
  };
  if (modifiers?.textColor) {
    styles.color = modifiers.textColor;
  }
  return styles;
};

const ListItem: React.FC<ListItemProps> = React.memo(({
  part,
  config,
  hass,
  parametersDisplayEnabled,
  onLocate,
  parameterActions = [],
  cardInstanceId,
}) => {
  const partId = part.pk;
  const conditionalEffect = useSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId || 'unknown_card', partId));
  const locatingPartId = useSelector((state: RootState) => state.parts.locatingPartId);

  const isCurrentlyLocating = locatingPartId === partId;
  const actualModifiers = conditionalEffect || {} as VisualEffect;

  const shouldShowImage = useElementDisplayStatus(cardInstanceId, 'show_image', config.display);
  const shouldShowName = useElementDisplayStatus(cardInstanceId, 'show_name', config.display);
  const shouldShowStock = useElementDisplayStatus(cardInstanceId, 'show_stock', config.display);
  const shouldShowIpn = useElementDisplayStatus(cardInstanceId, 'show_ipn', config.display);
  const shouldShowDescription = useElementDisplayStatus(cardInstanceId, 'show_description', config.display);
  const shouldShowButtons = useElementDisplayStatus(cardInstanceId, 'show_buttons', config.display);

  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError: isParametersError,
    error: parametersFetchError,
  } = useGetPartParametersQuery(partId, { skip: !parametersDisplayEnabled });

  const [updatePartParameterMutation, { isLoading: isUpdatingParameter, error: updateParameterError }] = useUpdatePartParameterMutation();

  if (actualModifiers.isVisible === false) {
    logger.log('ListItem', `Part ${partId} is not visible due to conditional effect.`, { level: 'debug', partId, conditionalEffect });
    return null;
  }

  const itemContainerStyle = getListItemContainerStyle(actualModifiers, isCurrentlyLocating);
  const itemTextStyle = getListItemTextStyle(actualModifiers);

  const itemClasses = [
    'list-item',
    isCurrentlyLocating ? 'locating' : '',
    actualModifiers?.priority ? `priority-${actualModifiers.priority}` : '',
    ...(actualModifiers?.customClasses || [])
  ].filter(Boolean).join(' ');

  const handleItemClick = () => {
    if (onLocate) {
      onLocate(partId);
    }
  };
  
  const handleActionClick = async (e: React.MouseEvent, action: ParameterAction) => {
    e.stopPropagation();
    logger.log('ListItem', `Parameter action "${action.label}" for part ${partId}`, { action });

    let parameterPkToUpdate: number | undefined = undefined;
    if (parametersData) {
      const paramDetail = parametersData.find(p => p.template_detail?.name === action.parameter);
      if (paramDetail) {
        parameterPkToUpdate = paramDetail.pk;
      }
    }

    if (parameterPkToUpdate === undefined) {
      logger.error('ListItem', `Could not find parameter PK for ${action.parameter} on part ${partId}. Cannot update.`);
      return;
    }

    try {
      await updatePartParameterMutation({ partId, parameterPk: parameterPkToUpdate, value: action.value }).unwrap();
      logger.log('ListItem', `Successfully updated parameter ${action.parameter} (PK: ${parameterPkToUpdate}) for part ${partId}.`);
    } catch (err) {
      logger.error('ListItem', `Failed to update parameter ${action.parameter} for part ${partId}:`, { error: err });
    }
  };

  const handleThumbnailClick = React.useMemo(() => {
    if (!config.actions || !part) return undefined;
    const thumbnailClickAction = config.actions.find(
      (act: ActionDefinition) => act.trigger.type === 'ui_thumbnail_click'
    );
    if (thumbnailClickAction) {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        logger.log('ListItem', `Thumbnail clicked for part ${part.pk}, executing action: ${thumbnailClickAction.name}`);
        const executionContext: ActionExecutionContext = { part: part, hassStates: hass?.states };
        actionEngine.executeAction(thumbnailClickAction.id, { ...executionContext, hass });
      };
    }
    return undefined;
  }, [config.actions, part, hass]);

  return (
    <div
      key={partId}
      className={itemClasses}
      style={itemContainerStyle}
      onClick={handleItemClick}
      title={`Click to locate Part ID: ${partId}`}
    >
      {/* Thumbnail Section */}
      {shouldShowImage && (
        <div className="list-item-thumbnail" style={{ marginRight: '12px', flexShrink: 0 }}>
          <PartThumbnail
            partData={part}
            config={config}
            layout="list"
            icon={actualModifiers?.icon}
            badge={actualModifiers?.badge}
            onClick={handleThumbnailClick}
          />
        </div>
      )}

      {/* Main Info Section */}
      <div className="list-item-info" style={{ ...itemTextStyle, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {shouldShowName && <div className="part-name" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{part.name}</div>}
        {shouldShowStock && (
          <div className="part-stock" style={{ fontSize: '0.9em', opacity: 0.8 }}>
            Stock: {part.in_stock ?? 'N/A'} {part.units || ''}
          </div>
        )}
        {shouldShowIpn && part.IPN && (
            <div className="part-ipn" style={{ fontSize: '0.8em', opacity: 0.7 }}>IPN: {part.IPN}</div>
        )}
        {shouldShowDescription && part.description && (
          <p className="part-description" style={{ fontSize: '0.85em', margin: '4px 0 0 0', opacity: 0.9, fontStyle: 'italic' }}>
            {part.description}
          </p>
        )}

        {/* Parameter Display Section */}
        {parametersDisplayEnabled && (
          <div className="list-item-parameters" style={{ fontSize: '0.8em', marginTop: '6px' }}>
            {isLoadingParameters && <p><i>Loading parameters...</i></p>}
            {isParametersError && (
              <p style={{ color: 'red' }}>
                <i>Error parameters: {
                  (() => {
                    if (parametersFetchError) {
                      if ('status' in parametersFetchError) { 
                        const fetchError = parametersFetchError as FetchBaseQueryError;
                        if (typeof fetchError.data === 'string') return fetchError.data;
                        if (typeof fetchError.data === 'object' && fetchError.data && 'message' in fetchError.data) return (fetchError.data as any).message;
                        return fetchError.status?.toString() || 'API error';
                      } else { 
                        return (parametersFetchError as SerializedError).message || 'Unknown client error';
                      }
                    }
                    return 'Unknown error';
                  })()
                }</i>
              </p>
            )}
            {parametersData && parametersData.length > 0 && (
              <ul style={{ listStyle: 'none', paddingLeft: '10px', margin: '2px 0' }}>
                {parametersData.map((param: ParameterDetail) => (
                  <li key={param.pk}><strong>{param.template_detail?.name}:</strong> {param.data} {param.template_detail?.units || ''}</li>
                ))}
              </ul>
            )}
            {parametersData && parametersData.length === 0 && !isLoadingParameters && !isParametersError && (
                <p style={{fontSize: '0.8em', opacity: 0.7}}><i>No parameters for this part.</i></p>
            )}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      {(shouldShowButtons || (parameterActions && parameterActions.length > 0)) && hass && (
        <div className="list-item-actions-footer" style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          {shouldShowButtons && config && (
            <div style={{ marginBottom: (parameterActions && parameterActions.length > 0) ? '4px' : '0' }}>
              <PartButtons partItem={part} config={config} hass={hass} cardInstanceId={cardInstanceId} />
            </div>
          )}
          {parameterActions && parameterActions.length > 0 && (
            <div className="parameter-action-buttons" style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {parameterActions.map((action) => (
                <button
                  key={`${partId}-${action.id || action.label}`}
                  className="param-action-button"
                  style={{fontSize: '0.8em', padding: '2px 4px'}}
                  onClick={(e) => handleActionClick(e, action)}
                  title={action.label}
                  disabled={isUpdatingParameter}
                >
                  {action.icon ? <ha-icon icon={action.icon} style={{marginRight: action.label ? '2px' : '0'}} /> : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ListItem; 