import React, { useCallback, ChangeEvent } from 'react';
import { DisplayConfig } from '../../types'; // Assuming types are correctly pathed
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

interface ElementVisibilitySectionProps {
  displayConfig?: Partial<DisplayConfig>; // Allow partial for initial state from config
  onDisplayConfigChanged: (newDisplayConfig: DisplayConfig) => void;
}

// Helper to create a more readable label from a camelCase key
const makeLabel = (key: string): string => {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const ElementVisibilitySection: React.FC<ElementVisibilitySectionProps> = ({
  displayConfig = {}, // Default to empty object
  onDisplayConfigChanged,
}) => {

  const handleCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const newDisplayConfig = {
      ...displayConfig,
      [name]: checked,
    } as DisplayConfig; // Assert to full DisplayConfig after update

    onDisplayConfigChanged(newDisplayConfig);
    logger.log('Editor:VisibilitySection', `Display option changed: ${name} = ${checked}`, { newDisplayConfig });
  }, [displayConfig, onDisplayConfigChanged]);

  // Define which keys from DisplayConfig we want to expose as checkboxes.
  // This allows us to add new DisplayConfig options without them automatically appearing.
  const visibleFlags: Array<keyof DisplayConfig> = [
    'show_header',
    'show_image',
    'show_name',
    'show_stock',
    'show_description',
    'show_category',
    'show_ipn',
    'show_location',
    'show_supplier',
    'show_manufacturer',
    'show_notes',
    'show_buttons',
    'show_parameters',
    'show_stock_status_border',
    'show_stock_status_colors',
    'show_related_parts',
    'show_part_details_component',
    // Variant specific (can be conditionally shown if needed based on view_type elsewhere)
    'show_stock_status_border_for_templates',
    'show_buttons_for_variants',
    'show_part_details_component_for_variants',
    'show_image_for_variants',
    'show_stock_for_variants',
    'show_name_for_variants',
  ];

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">Element Visibility</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
        {visibleFlags.map(key => (
          <div className="config-item" key={key}>
            <label htmlFor={`display_${key}`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id={`display_${key}`}
                name={key}
                checked={!!displayConfig[key]} // Use !! to ensure boolean, fallback to false if undefined
                onChange={handleCheckboxChange}
                style={{ marginRight: '8px' }}
              />
              {makeLabel(key).replace(/^Show /, '')} {/* Remove "Show " prefix for cleaner labels */}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElementVisibilitySection; 