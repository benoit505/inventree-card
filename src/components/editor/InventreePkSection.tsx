import React, { useState, useCallback, ChangeEvent } from 'react';
import type { HomeAssistant } from 'custom-card-helpers'; // Keep for potential future use, though not directly used now
import { Logger } from '../../utils/logger'; // Correct path

const logger = Logger.getInstance();

interface InventreePkSectionProps {
  // hass is not strictly needed for this component but often passed down through editor sections
  hass?: HomeAssistant; 
  selectedPks: number[]; 
  onPksChanged: (newPks: number[]) => void;
}

const InventreePkSection: React.FC<InventreePkSectionProps> = ({
  hass,
  selectedPks,
  onPksChanged,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (error) setError(null); // Clear error on new input
  };

  const handleAddPks = useCallback(() => {
    if (!inputValue.trim()) return; // Do nothing if input is empty or just whitespace

    const pkStrings = inputValue.split(',').map(s => s.trim()).filter(s => s !== '');
    const newPksToAdd: number[] = [];
    let foundInvalid = false;

    for (const pkStr of pkStrings) {
      const num = parseInt(pkStr, 10);
      if (isNaN(num)) {
        foundInvalid = true;
        break;
      } else {
        if (!selectedPks.includes(num) && !newPksToAdd.includes(num)) { // Avoid duplicates from input and existing
          newPksToAdd.push(num);
        }
      }
    }

    if (foundInvalid) {
      setError('Invalid input: Please enter comma-separated numbers (e.g., 101, 102).');
      return;
    }

    if (newPksToAdd.length > 0) {
      const combinedPks = [...selectedPks, ...newPksToAdd].sort((a, b) => a - b); // Keep sorted
      onPksChanged(combinedPks);
      logger.log('Editor:InventreePk', `Added InvenTree PKs: ${newPksToAdd.join(', ')}`, { newPks: combinedPks });
    }
    setInputValue(''); // Clear input field
    setError(null);
  }, [inputValue, selectedPks, onPksChanged]);

  const handleRemovePk = useCallback((pkToRemove: number) => {
    const newPks = selectedPks.filter(pk => pk !== pkToRemove);
    onPksChanged(newPks);
    logger.log('Editor:InventreePk', `Removed InvenTree PK: ${pkToRemove}`, { newPks });
  }, [selectedPks, onPksChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">By InvenTree Part PK</h4>
      <div className="helper-text">
        Enter comma-separated InvenTree Part Primary Keys (PKs) to fetch their data directly via API.
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="e.g., 101, 102, 145"
          style={{ flexGrow: 1, padding: '8px', border: error ? '1px solid red' : '1px solid var(--divider-color)' }}
        />
        <button onClick={handleAddPks} style={{ padding: '8px 12px' }}>Add PKs</button>
      </div>
      {error && <div style={{ color: 'red', fontSize: '0.9em', marginBottom: '8px' }}>{error}</div>}

      {selectedPks.length > 0 && (
        <div className="selected-pks-list" style={{ marginTop: '16px' }}>
          <h5>Selected Part PKs:</h5>
          {selectedPks.map(pk => (
            <div key={pk} className="selected-pk-item" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '4px 0',
              borderBottom: '1px solid var(--divider-color)'
            }}>
              <span>Part PK: {pk}</span>
              <button 
                onClick={() => handleRemovePk(pk)} 
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

export default InventreePkSection; 