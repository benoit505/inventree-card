import React, { useCallback, ChangeEvent } from 'react';
import { StyleConfig } from '../../types'; // Assuming types are correctly pathed
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

interface CardStylingSectionProps {
  styleConfig?: Partial<StyleConfig>;
  onStyleConfigChanged: (newStyleConfig: StyleConfig) => void;
}

const CardStylingSection: React.FC<CardStylingSectionProps> = ({
  styleConfig = {},
  onStyleConfigChanged,
}) => {

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    let processedValue: string | number | undefined = value;

    if (type === 'number') {
      if (value === '') {
        processedValue = undefined; // Allow clearing number inputs
      } else {
        const num = parseFloat(value);
        processedValue = isNaN(num) ? undefined : num; // Keep undefined if not a valid number
      }
    }

    const newStyleConfig = {
      ...styleConfig,
      [name]: processedValue,
    } as StyleConfig;

    onStyleConfigChanged(newStyleConfig);
    logger.log('Editor:StylingSection', `Style option changed: ${name} = ${processedValue}`, { newStyleConfig });
  }, [styleConfig, onStyleConfigChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">Overall Card Styling</h4>
      <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        
        <div className="config-item">
          <label htmlFor="style_background">Background CSS:</label>
          <input
            type="text"
            id="style_background"
            name="background"
            value={styleConfig?.background || ''}
            onChange={handleInputChange}
            placeholder="e.g., #f0f0f0, var(--ha-card-background)"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          <small>CSS value for card background (color, image, etc.)</small>
        </div>

        <div className="config-item">
          <label htmlFor="style_spacing">Overall Spacing (px):</label>
          <input
            type="number"
            id="style_spacing"
            name="spacing"
            value={styleConfig?.spacing === undefined ? '' : styleConfig.spacing}
            onChange={handleInputChange}
            placeholder="e.g., 16"
            min="0"
            style={{ width: '100px', padding: '8px' }}
          />
           <small>Default spacing/padding unit.</small>
        </div>
        
        <div className="config-item">
          <label htmlFor="style_image_size">Default Image Size (px):</label>
          <input
            type="number"
            id="style_image_size"
            name="image_size"
            value={styleConfig?.image_size === undefined ? '' : styleConfig.image_size}
            onChange={handleInputChange}
            placeholder="e.g., 50"
            min="10"
            max="300"
            style={{ width: '100px', padding: '8px' }}
          />
          <small>Default size for thumbnails/images.</small>
        </div>

        {/* Add more styling inputs here as StyleConfig expands */}
      </div>
    </div>
  );
};

export default CardStylingSection; 