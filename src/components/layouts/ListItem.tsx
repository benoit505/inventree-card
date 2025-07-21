import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterAction, VisualEffect } from '../../types';
import { useGetPartParametersQuery, useUpdatePartParameterMutation } from '../../store/apis/inventreeApi';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { actionEngine } from '../../services/ActionEngine';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import PartThumbnail from '../part/PartThumbnail';
import PartButtons from '../part/PartButtons';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { selectLocatingPartId } from '../../store/slices/partsSlice';

ConditionalLoggerEngine.getInstance().registerCategory('ListItem', { enabled: false, level: 'info' });

interface ListItemProps {
  part: InventreeItem;
  config: InventreeCardConfig;
  hass: HomeAssistant;
  cardInstanceId?: string;
  onLocate: (partId: number) => void;
}

const ListItem: React.FC<ListItemProps> = ({
  part,
  config,
  hass,
  cardInstanceId,
  onLocate,
}) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('ListItem', cardInstanceId);
  }, [cardInstanceId]);

  const partId = part.pk;
  logger.verbose('ListItem', `Render Start for partId: ${partId}`);
  
  const conditionalEffect = useSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId || 'unknown_card', partId));
  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state, cardInstanceId || 'unknown_card'));
  const isCurrentlyLocating = locatingPartId === partId;

  const displayConfig = config.display || {};
  const shouldShowImage = displayConfig.show_image;
  const shouldShowName = displayConfig.show_name;
  const shouldShowStock = displayConfig.show_stock;
  const shouldShowIpn = displayConfig.show_ipn;
  const shouldShowDescription = displayConfig.show_description;
  const shouldShowButtons = displayConfig.show_buttons;
  const parametersDisplayEnabled = displayConfig.show_parameters;

  const {
    data: parameters,
    isLoading: isLoadingParameters,
    isError: isParametersError,
    error: parametersError,
  } = useGetPartParametersQuery({ partId, cardInstanceId: cardInstanceId || 'fallback' }, {
    skip: !parametersDisplayEnabled || !cardInstanceId,
  });

  const [updatePartParameter] = useUpdatePartParameterMutation();

  const handleParameterUpdate = async (parameterPk: number, value: string) => {
    if (!cardInstanceId) {
      logger.error('handleParameterUpdate', 'Cannot update parameter, cardInstanceId is missing.');
      return;
    }
    logger.info('handleParameterUpdate', `Updating parameter ${parameterPk} for part ${partId}`, { value });
    try {
      await updatePartParameter({ partId, parameterPk, value, cardInstanceId }).unwrap();
      logger.info('handleParameterUpdate', `Successfully updated parameter ${parameterPk}`);
    } catch (error) {
      logger.error('handleParameterUpdate', `Failed to update parameter ${parameterPk}`, error as Error);
    }
  };

  const actualModifiers = conditionalEffect || {} as VisualEffect;

  if (actualModifiers.isVisible === false) {
    logger.debug('ListItem', `partId ${partId} is not visible, rendering null.`);
    return null;
  }

  const listItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: actualModifiers.highlight,
    color: actualModifiers.textColor,
    border: actualModifiers.border,
    opacity: actualModifiers.opacity,
  };

  const handleThumbnailClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const thumbnailClickAction = config.actions?.find(action => action.trigger.type === 'ui_thumbnail_click');
    if (thumbnailClickAction && cardInstanceId) {
      logger.debug('handleThumbnailClick', `Executing thumbnail click action for part ${partId}`, { actionName: thumbnailClickAction.name });
      actionEngine.executeAction(thumbnailClickAction.id, { part, hass, cardInstanceId }, cardInstanceId);
    }
  };

  logger.verbose('ListItem', `Render complete for partId: ${partId}`);

  return (
    <div style={listItemStyle} onClick={() => onLocate(partId)}>
      {shouldShowImage && (
        <div style={{ marginRight: '10px' }}>
          <PartThumbnail 
            partData={part}
            config={config}
            layout="list"
            visualModifiers={actualModifiers}
            onClick={handleThumbnailClick}
            cardInstanceId={cardInstanceId}
          />
        </div>
      )}
      <div style={{ flex: 1 }}>
        {shouldShowName && <div style={{ fontWeight: 'bold' }}>{part.name}</div>}
        {shouldShowIpn && part.IPN && <div style={{ fontSize: '0.9em', color: '#666' }}>{part.IPN}</div>}
        {shouldShowStock && <div style={{ fontSize: '0.9em' }}>Stock: {part.in_stock}</div>}
        {shouldShowDescription && part.description && <div style={{ fontSize: '0.8em', color: '#888' }}>{part.description}</div>}
      </div>
      {shouldShowButtons && (
        <div style={{ marginLeft: '10px' }}>
          <PartButtons partItem={part} config={config} hass={hass} cardInstanceId={cardInstanceId} />
        </div>
      )}
      {isCurrentlyLocating && <div style={{ marginLeft: '10px', color: 'blue' }}>Locating...</div>}
    </div>
  );
};

export default ListItem; 