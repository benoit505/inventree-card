import React, { useState, useCallback, ChangeEvent } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('InventreeParametersSection');
ConditionalLoggerEngine.getInstance().registerCategory('InventreeParametersSection', { enabled: false, level: 'info' });

interface InventreeParametersSectionProps {
  hass?: HomeAssistant;
  selectedParameters: string[]; 
  onParametersChanged: (newParameters: string[]) => void;
}

const InventreeParametersSection: React.FC<InventreeParametersSectionProps> = ({
  hass,
  selectedParameters,
  onParametersChanged,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const validateParameterString = (paramStr: string): boolean => {
    const parts = paramStr.split(':');
    if (parts.length !== 3) return false;
    if (parts[0].toLowerCase() !== 'part') return false;
    if (isNaN(parseInt(parts[1], 10))) return false;
    if (!parts[2] || parts[2].trim() === '') return false; // Parameter name should not be empty
    return true;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (error) setError(null); 
  };

  const handleAddParameters = useCallback(() => {
    if (!inputValue.trim()) return;

    const paramStrings = inputValue.split(',').map(s => s.trim()).filter(s => s !== '');
    const newParamsToAdd: string[] = [];
    let foundInvalid = false;

    for (const paramStr of paramStrings) {
      if (!validateParameterString(paramStr)) {
        foundInvalid = true;
        break;
      }
      if (!selectedParameters.includes(paramStr) && !newParamsToAdd.includes(paramStr)) {
        newParamsToAdd.push(paramStr);
      }
    }

    if (foundInvalid) {
      setError('Invalid format: Use comma-separated strings like \'part:ID:PARAM_NAME\' (e.g., part:123:color, part:456:size).');
      return;
    }

    if (newParamsToAdd.length > 0) {
      const combinedParams = [...selectedParameters, ...newParamsToAdd].sort(); // Keep sorted
      onParametersChanged(combinedParams);
      logger.info('handleAddParameters', `Added InvenTree Parameters: ${newParamsToAdd.join(', ')}`, { newParams: combinedParams });
    }
    setInputValue(''); 
    setError(null);
  }, [inputValue, selectedParameters, onParametersChanged]);

  const handleRemoveParameter = useCallback((paramToRemove: string) => {
    const newParams = selectedParameters.filter(param => param !== paramToRemove);
    onParametersChanged(newParams);
    logger.info('handleRemoveParameter', `Removed InvenTree Parameter: ${paramToRemove}`, { newParams });
  }, [selectedParameters, onParametersChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">InvenTree Parameters (Direct API)</h4>
      <div className="helper-text">
        Enter comma-separated parameter strings in the format <code>part:ID:PARAMETER_NAME</code>.
        These will be fetched directly via the InvenTree API.
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="e.g., part:145:microwavables, part:101:length_cm"
          style={{ flexGrow: 1, padding: '8px', border: error ? '1px solid red' : '1px solid var(--divider-color)' }}
        />
        <button onClick={handleAddParameters} style={{ padding: '8px 12px' }}>Add Parameters</button>
      </div>
      {error && <div style={{ color: 'red', fontSize: '0.9em', marginBottom: '8px' }}>{error}</div>}

      {selectedParameters.length > 0 && (
        <div className="selected-parameters-list" style={{ marginTop: '16px' }}>
          <h5>Selected Parameters:</h5>
          {selectedParameters.map(param => (
            <div key={param} className="selected-parameter-item" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '4px 0',
              borderBottom: '1px solid var(--divider-color)'
            }}>
              <span>{param}</span>
              <button 
                onClick={() => handleRemoveParameter(param)} 
                style={{color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventreeParametersSection; 