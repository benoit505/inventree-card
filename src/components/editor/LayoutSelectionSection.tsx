import React, { useCallback, ChangeEvent } from 'react';
import { InventreeCardConfig, ViewType } from '../../types'; // Assuming types are correctly pathed
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export interface LayoutOptions {
  columns?: number | undefined;
  grid_spacing?: number | undefined;
  item_height?: number | undefined;
  // Add other layout-specific options here as needed
}

interface LayoutSelectionSectionProps {
  viewType?: ViewType;
  layoutOptions?: LayoutOptions;
  onLayoutConfigChanged: (newViewType: ViewType, newLayoutOptions: LayoutOptions) => void;
}

const ALL_VIEW_TYPES: ViewType[] = ['detail', 'grid', 'list', 'parts', 'variants', 'base', 'debug', 'custom'];

const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps> = ({
  viewType = 'detail', // Default view type
  layoutOptions = {},
  onLayoutConfigChanged,
}) => {

  const handleViewTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const newViewType = event.target.value as ViewType;
    // When view type changes, we might want to reset or adjust layoutOptions
    // For now, just pass the current layoutOptions, or an empty object if it makes sense
    const newOptionsForViewType: LayoutOptions = {}; // Or some default based on newViewType
    onLayoutConfigChanged(newViewType, newOptionsForViewType);
    logger.log('Editor:LayoutSection', `View type changed to: ${newViewType}`);
  }, [onLayoutConfigChanged]); // Removed layoutOptions from dependency array for reset behavior

  const handleLayoutOptionChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let processedValue: number | undefined = undefined;

    if (value === '') {
      processedValue = undefined; // Explicitly set to undefined if input is cleared
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        processedValue = numValue;
      }
      // If still NaN (e.g., invalid characters), it remains undefined, or you could add error handling
    }

    const newLayoutOptions: LayoutOptions = {
      ...layoutOptions,
      [name]: processedValue,
    };

    // Filter out undefined values before calling back, if desired by parent
    // Or allow undefined to signify deletion/reset of an option
    const cleanedLayoutOptions = Object.entries(newLayoutOptions).reduce((acc, [key, val]) => {
        if (val !== undefined) {
            acc[key as keyof LayoutOptions] = val as number; // Cast val to number as undefined is filtered
        }
        return acc;
    }, {} as LayoutOptions);

    onLayoutConfigChanged(viewType, cleanedLayoutOptions); // Send cleaned options
    logger.log('Editor:LayoutSection', `Layout option changed: ${name} = ${processedValue}`, { newLayoutOptions: cleanedLayoutOptions });
  }, [viewType, layoutOptions, onLayoutConfigChanged]);

  const renderGridOptions = () => {
    if (viewType === 'grid') {
      return (
        <div className="grid-options" style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
          <h5 style={{ marginBottom: '8px' }}>Grid Layout Options:</h5>
          <div className="config-item" style={{ marginBottom: '8px' }}>
            <label htmlFor="layout_columns">Columns:</label>
            <input
              type="number"
              id="layout_columns"
              name="columns"
              value={layoutOptions.columns === undefined ? '' : layoutOptions.columns}
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
              value={layoutOptions.grid_spacing === undefined ? '' : layoutOptions.grid_spacing}
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
              value={layoutOptions.item_height === undefined ? '' : layoutOptions.item_height}
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
          value={viewType}
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
      {/* Add more conditional rendering for other view types here */}
    </div>
  );
};

export default LayoutSelectionSection; 