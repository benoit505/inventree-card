import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualModifiers, ConditionalPartEffect } from '../../types';
import { RootState } from '../../store';
import { selectConditionalEffectForPart } from '../../store/slices/parametersSlice';

import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';

interface GridItemProps {
  part: InventreeItem;
  config: InventreeCardConfig;
  hass?: HomeAssistant;
  isCurrentlyLocating: boolean;
  parameterActions: ParameterAction[];
  handleLocateGridItem: (partId: number) => void;
  handleParameterActionClick: (partId: number, action: ParameterAction) => void;
}

// Helper functions (can be co-located or imported if used elsewhere)
const getGridItemContainerStyle = (modifiers?: VisualModifiers, config?: InventreeCardConfig): React.CSSProperties => {
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
  if (modifiers?.border) styles.border = modifiers.border; // Directly use the border string
  return styles;
};

const getGridItemTextStyle = (modifiers?: VisualModifiers): React.CSSProperties => {
  if (!modifiers || !modifiers.textColor) return {};
  return { color: modifiers.textColor };
};

const GridItem: React.FC<GridItemProps> = ({
  part,
  config,
  hass,
  isCurrentlyLocating,
  parameterActions,
  handleLocateGridItem,
  handleParameterActionClick,
}) => {
  const partId = part.pk;
  const visualModifiers = useSelector((state: RootState) => selectConditionalEffectForPart(state, partId)) as VisualModifiers | undefined;
  const displayConfig = config.display || {};

  const actualModifiers = visualModifiers || {};

  const itemContainerStyle = getGridItemContainerStyle(actualModifiers, config);
  const itemTextStyle = getGridItemTextStyle(actualModifiers);

  const itemClasses = [
    'part-container',
    isCurrentlyLocating ? 'locating' : '',
    actualModifiers?.priority ? `priority-${actualModifiers.priority}` : ''
  ].filter(Boolean).join(' ');

  if (actualModifiers.isVisible === false) {
    return null;
  }

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
    </div>
  );
};

export default GridItem; 