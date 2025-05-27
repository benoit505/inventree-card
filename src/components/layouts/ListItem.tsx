import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, ConditionalPartEffect } from '../../types';
import { RootState } from '../../store';
import { selectConditionalEffectForPart } from '../../store/slices/parametersSlice';
import { Logger } from '../../utils/logger';

import PartThumbnail from '../part/PartThumbnail';
import PartButtons from '../part/PartButtons';

interface ListItemProps {
  part: InventreeItem;
  config: InventreeCardConfig;
  hass?: HomeAssistant;
  // Add any interaction handlers if they are passed down, e.g., for locate or parameter actions
  onLocate?: (partId: number) => void;
  onParameterAction?: (partId: number, action: ParameterAction) => void;
  // If parameter actions are globally defined or fetched by ListLayout, they can be passed too
  parameterActions?: ParameterAction[]; 
}

const logger = Logger.getInstance();

const getListItemContainerStyle = (modifiers?: ConditionalPartEffect, isLocating?: boolean): React.CSSProperties => {
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
    // Example: border: "2px solid red"
    // Ensure the border string is valid CSS
    styles.border = modifiers.border; 
  }
  
  // Potentially more specific styling based on list item needs
  return styles;
};

const getListItemTextStyle = (modifiers?: ConditionalPartEffect): React.CSSProperties => {
  const styles: React.CSSProperties = {
    color: 'var(--primary-text-color, black)',
  };
  if (modifiers?.textColor) {
    styles.color = modifiers.textColor;
  }
  return styles;
};

const ListItem: React.FC<ListItemProps> = ({
  part,
  config,
  hass,
  onLocate,
  onParameterAction,
  parameterActions = [], // Default to empty array
}) => {
  const partId = part.pk;
  // Fetch conditional effects for this specific part
  const conditionalEffect = useSelector((state: RootState) => selectConditionalEffectForPart(state, partId));
  const locatingPartId = useSelector((state: RootState) => state.parts.locatingPartId); // Assuming this state exists

  const displayConfig = config.display || {};
  const isCurrentlyLocating = locatingPartId === partId;

  // If the part is explicitly set to not visible by conditional logic, don't render it.
  if (conditionalEffect?.isVisible === false) {
    logger.log('ListItem', `Part ${partId} is not visible due to conditional effect.`, { level: 'debug', partId, conditionalEffect });
    return null;
  }

  const itemContainerStyle = getListItemContainerStyle(conditionalEffect, isCurrentlyLocating);
  const itemTextStyle = getListItemTextStyle(conditionalEffect);

  const itemClasses = [
    'list-item',
    isCurrentlyLocating ? 'locating' : '',
    conditionalEffect?.priority ? `priority-${conditionalEffect.priority}` : '',
    // Add any other dynamic classes based on conditionalEffect or part state
  ].filter(Boolean).join(' ');

  const handleItemClick = () => {
    if (onLocate) {
      onLocate(partId);
    }
    // Potentially other click actions if defined in config
  };
  
  const handleActionClick = (e: React.MouseEvent, action: ParameterAction) => {
    e.stopPropagation(); // Prevent item click when clicking a button
    if (onParameterAction) {
      onParameterAction(partId, action);
    }
  };

  return (
    <div
      key={partId}
      className={itemClasses}
      style={itemContainerStyle}
      onClick={handleItemClick}
      title={`Click to locate Part ID: ${partId}`}
    >
      {/* Thumbnail Section */}
      {displayConfig.show_image && (
        <div className="list-item-thumbnail" style={{ marginRight: '12px', flexShrink: 0 }}>
          <PartThumbnail
            partData={part}
            config={config}
            layout="list" // Explicitly set layout type
            icon={conditionalEffect?.icon}
            badge={conditionalEffect?.badge}
          />
        </div>
      )}

      {/* Main Info Section */}
      <div className="list-item-info" style={{ ...itemTextStyle, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {displayConfig.show_name && <div className="part-name" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{part.name}</div>}
        {displayConfig.show_stock && (
          <div className="part-stock" style={{ fontSize: '0.9em', opacity: 0.8 }}>
            Stock: {part.in_stock ?? 'N/A'} {part.units || ''}
          </div>
        )}
        {displayConfig.show_ipn && part.IPN && (
            <div className="part-ipn" style={{ fontSize: '0.8em', opacity: 0.7 }}>IPN: {part.IPN}</div>
        )}
        {displayConfig.show_description && part.description && (
          <p className="part-description" style={{ fontSize: '0.85em', margin: '4px 0 0 0', opacity: 0.9, fontStyle: 'italic' }}>
            {part.description}
          </p>
        )}
      </div>

      {/* Actions Footer - includes standard buttons and parameter actions */}
      {(displayConfig.show_buttons || parameterActions.length > 0) && hass && (
        <div className="list-item-actions-footer" style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          {displayConfig.show_buttons && config && (
            <div style={{ marginBottom: parameterActions.length > 0 ? '4px' : '0' }}>
              <PartButtons partItem={part} config={config} hass={hass} />
            </div>
          )}
          {parameterActions.length > 0 && (
            <div className="parameter-action-buttons" style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {parameterActions.map((action) => (
                <button
                  key={`${partId}-${action.id || action.label}`} // Use action.id if available
                  className="param-action-button"
                  onClick={(e) => handleActionClick(e, action)}
                  title={action.label}
                  style={{ fontSize: '0.75em', padding: '3px 6px', cursor: 'pointer' }}
                >
                  {action.icon ? <ha-icon icon={action.icon}></ha-icon> : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListItem; 