import React, { useCallback, ChangeEvent } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, ViewType, LayoutConfig, ActionDefinition } from '../../types'; // Add LayoutConfig and ActionDefinition
import { Logger } from '../../utils/logger';
import LayoutBuilder from './LayoutBuilder'; // Import the new builder

const logger = Logger.getInstance();

interface LayoutSelectionSectionProps {
  hass?: HomeAssistant;
  layoutConfig: LayoutConfig;
  onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
  actions: ActionDefinition[];
}

const ALL_VIEW_TYPES: ViewType[] = ['detail', 'grid', 'list', 'parts', 'variants', 'base', 'debug', 'custom'];

const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps> = ({
  hass,
  layoutConfig,
  onLayoutConfigChanged,
  actions,
}) => {

  const handleViewTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const newViewType = event.target.value as ViewType;
    onLayoutConfigChanged({
      ...layoutConfig,
      viewType: newViewType,
    });
    logger.log('Editor:LayoutSection', `View type changed to: ${newViewType}`);
  }, [onLayoutConfigChanged, layoutConfig]);

  const handleLayoutOptionChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let processedValue: number | undefined = undefined;

    if (value !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        processedValue = numValue;
      }
    }

    const newLayoutOptions = {
      ...layoutConfig,
      [name]: processedValue,
    };

    onLayoutConfigChanged(newLayoutOptions);
    logger.log('Editor:LayoutSection', `Layout option changed: ${name} = ${processedValue}`);
  }, [layoutConfig, onLayoutConfigChanged]);

  const renderCustomTableOptions = () => {
    if (layoutConfig.viewType !== 'custom') {
      return null;
    }
    return (
      <div className="custom-table-options" style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
        <div className="config-item" style={{ marginBottom: '8px' }}>
            <label htmlFor="row_height">Row Height (px):</label>
            <input
              type="number"
              id="row_height"
              name="rowHeight"
              value={layoutConfig.rowHeight === undefined ? '' : layoutConfig.rowHeight}
              onChange={handleLayoutOptionChange}
              min="20"
              style={{ width: '70px', marginLeft: '8px', padding: '6px' }}
            />
          </div>
      </div>
    );
  };

  const renderGridOptions = () => {
    if (layoutConfig.viewType === 'grid') {
      return (
        <div className="grid-options" style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
          <h5 style={{ marginBottom: '8px' }}>Grid Layout Options (Legacy):</h5>
          <div className="config-item" style={{ marginBottom: '8px' }}>
            <label htmlFor="layout_columns">Columns:</label>
            <input
              type="number"
              id="layout_columns"
              name="legacy_columns"
              value={layoutConfig.legacy_columns === undefined ? '' : layoutConfig.legacy_columns}
              onChange={handleLayoutOptionChange}
              min="1"
              max="6"
              style={{ width: '60px', marginLeft: '8px', padding: '6px' }}
            />
          </div>
          <div className="config-item" style={{ marginBottom: '8px' }}>
            <label htmlFor="layout_grid_spacing">Grid Spacing (px):</label>
            <input
              type="number"
              id="layout_grid_spacing"
              name="grid_spacing"
              value={layoutConfig.grid_spacing === undefined ? '' : layoutConfig.grid_spacing}
              onChange={handleLayoutOptionChange}
              min="0"
              max="32"
              style={{ width: '60px', marginLeft: '8px', padding: '6px' }}
            />
          </div>
          <div className="config-item" style={{ marginBottom: '8px' }}>
            <label htmlFor="layout_item_height">Item Height (px):</label>
            <input
              type="number"
              id="layout_item_height"
              name="item_height"
              value={layoutConfig.item_height === undefined ? '' : layoutConfig.item_height}
              onChange={handleLayoutOptionChange}
              min="50"
              max="500"
              style={{ width: '70px', marginLeft: '8px', padding: '6px' }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">Layout Configuration</h4>
      <div className="config-item" style={{ marginBottom: '12px' }}>
        <label htmlFor="view_type_select">View Type:</label>
        <select
          id="view_type_select"
          name="view_type"
          value={layoutConfig.viewType}
          onChange={handleViewTypeChange}
          style={{ marginLeft: '8px', padding: '8px', minWidth: '150px' }}
        >
          {ALL_VIEW_TYPES.map(vt => (
            <option key={vt} value={vt}>
              {vt.charAt(0).toUpperCase() + vt.slice(1)} {/* Capitalize first letter */}
            </option>
          ))}
        </select>
      </div>
      {renderGridOptions()}
      {renderCustomTableOptions()}
      <LayoutBuilder layoutConfig={layoutConfig} onLayoutConfigChanged={onLayoutConfigChanged} actions={actions} />
    </div>
  );
};

export default LayoutSelectionSection; 