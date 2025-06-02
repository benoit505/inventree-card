import React, { useState, useCallback, ChangeEvent } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { Logger } from '../../utils/logger';
import { InventreeParameterFetchConfig } from '../../types';

const logger = Logger.getInstance();

interface InventreeParametersToFetchSectionProps {
  hass?: HomeAssistant;
  parameterFetchConfigs: InventreeParameterFetchConfig[];
  onFetchConfigsChanged: (newConfigs: InventreeParameterFetchConfig[]) => void;
}

const InventreeParametersToFetchSection: React.FC<InventreeParametersToFetchSectionProps> = ({
  hass,
  parameterFetchConfigs,
  onFetchConfigsChanged,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const validateParameterString = (paramStr: string): boolean => {
    const parts = paramStr.split(':');
    if (parts.length !== 3) return false;
    if (parts[0].toLowerCase() !== 'part') return false;
    if (isNaN(parseInt(parts[1], 10))) return false;
    if (!parts[2] || parts[2].trim() === '') return false;
    return true;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (error) setError(null);
  };

  const handleAddConfigs = useCallback(() => {
    if (!inputValue.trim()) return;

    const paramStrings = inputValue.split(',').map(s => s.trim()).filter(s => s !== '');
    const newConfigsToAdd: InventreeParameterFetchConfig[] = [];
    let foundInvalid = false;

    for (const paramStr of paramStrings) {
      if (!validateParameterString(paramStr)) {
        foundInvalid = true;
        break;
      }
      const parts = paramStr.split(':');
      const partId = parseInt(parts[1], 10);
      const paramName = parts[2];

      const newConfig: InventreeParameterFetchConfig = {
        targetPartIds: [partId],
        parameterNames: [paramName],
        fetchOnlyIfUsed: false,
      };

      const isDuplicate = parameterFetchConfigs.some(existingConfig => {
        const targetsMatch = Array.isArray(existingConfig.targetPartIds) && Array.isArray(newConfig.targetPartIds) ?
          JSON.stringify(existingConfig.targetPartIds.slice().sort()) === JSON.stringify(newConfig.targetPartIds.slice().sort()) :
          existingConfig.targetPartIds === newConfig.targetPartIds;
        const paramsMatch = Array.isArray(existingConfig.parameterNames) && Array.isArray(newConfig.parameterNames) ?
          JSON.stringify(existingConfig.parameterNames.slice().sort()) === JSON.stringify(newConfig.parameterNames.slice().sort()) :
          existingConfig.parameterNames === newConfig.parameterNames;
        return targetsMatch && paramsMatch && existingConfig.fetchOnlyIfUsed === newConfig.fetchOnlyIfUsed;
      });

      const isAlreadyInQueue = newConfigsToAdd.some(queuedConfig => {
        const targetsMatch = Array.isArray(queuedConfig.targetPartIds) && Array.isArray(newConfig.targetPartIds) ?
          JSON.stringify(queuedConfig.targetPartIds.slice().sort()) === JSON.stringify(newConfig.targetPartIds.slice().sort()) :
          queuedConfig.targetPartIds === newConfig.targetPartIds;
        const paramsMatch = Array.isArray(queuedConfig.parameterNames) && Array.isArray(newConfig.parameterNames) ?
          JSON.stringify(queuedConfig.parameterNames.slice().sort()) === JSON.stringify(newConfig.parameterNames.slice().sort()) :
          queuedConfig.parameterNames === newConfig.parameterNames;
        return targetsMatch && paramsMatch && queuedConfig.fetchOnlyIfUsed === newConfig.fetchOnlyIfUsed;
      });

      if (!isDuplicate && !isAlreadyInQueue) {
        newConfigsToAdd.push(newConfig);
      }
    }

    if (foundInvalid) {
      setError('Invalid format: Use comma-separated strings like \'part:ID:PARAM_NAME\' (e.g., part:123:color, part:456:size).');
      return;
    }

    if (newConfigsToAdd.length > 0) {
      const combinedConfigs = [...parameterFetchConfigs, ...newConfigsToAdd];
      combinedConfigs.sort((a, b) => {
        let aPartIdSortKey: string | number;
        let bPartIdSortKey: string | number;

        if (Array.isArray(a.targetPartIds)) aPartIdSortKey = a.targetPartIds[0] || 0;
        else aPartIdSortKey = a.targetPartIds; // 'all_loaded'

        if (Array.isArray(b.targetPartIds)) bPartIdSortKey = b.targetPartIds[0] || 0;
        else bPartIdSortKey = b.targetPartIds; // 'all_loaded'
        
        // Ensure consistent sorting between numbers and 'all_loaded' (e.g., 'all_loaded' first)
        if (typeof aPartIdSortKey === 'string' && typeof bPartIdSortKey !== 'string') return -1;
        if (typeof aPartIdSortKey !== 'string' && typeof bPartIdSortKey === 'string') return 1;
        if (typeof aPartIdSortKey === 'string' && typeof bPartIdSortKey === 'string') {
           if (aPartIdSortKey !== bPartIdSortKey) return aPartIdSortKey.localeCompare(bPartIdSortKey);           
        } else if (typeof aPartIdSortKey === 'number' && typeof bPartIdSortKey === 'number') {
           if (aPartIdSortKey !== bPartIdSortKey) return aPartIdSortKey - bPartIdSortKey;
        } // else: mixed types, should have been handled by string preference above

        let aParamNameSortKey: string;
        let bParamNameSortKey: string;

        if (Array.isArray(a.parameterNames)) aParamNameSortKey = a.parameterNames[0] || '';
        else aParamNameSortKey = a.parameterNames; // '*'
        
        if (Array.isArray(b.parameterNames)) bParamNameSortKey = b.parameterNames[0] || '';
        else bParamNameSortKey = b.parameterNames; // '*'

        // Ensure consistent sorting for '*' (e.g., '*' first)
        if (aParamNameSortKey === '*' && bParamNameSortKey !== '*') return -1;
        if (aParamNameSortKey !== '*' && bParamNameSortKey === '*') return 1;
        return aParamNameSortKey.localeCompare(bParamNameSortKey);
      });
      onFetchConfigsChanged(combinedConfigs);
      logger.log('Editor:InventreeParamsFetch', `Added InvenTree Parameter Fetch Configs: ${newConfigsToAdd.map(c => `Part ${Array.isArray(c.targetPartIds) ? c.targetPartIds.join('/') : c.targetPartIds} - ${Array.isArray(c.parameterNames) ? c.parameterNames.join('/') : c.parameterNames}`).join(', ')}`, { newConfigs: combinedConfigs });
    }
    setInputValue('');
    setError(null);
  }, [inputValue, parameterFetchConfigs, onFetchConfigsChanged]);

  const handleRemoveConfig = useCallback((configToRemove: InventreeParameterFetchConfig) => {
    const newConfigs = parameterFetchConfigs.filter(config => {
        const targetsMatch = Array.isArray(config.targetPartIds) && Array.isArray(configToRemove.targetPartIds) ?
          JSON.stringify(config.targetPartIds.slice().sort()) === JSON.stringify(configToRemove.targetPartIds.slice().sort()) :
          config.targetPartIds === configToRemove.targetPartIds;
        const paramsMatch = Array.isArray(config.parameterNames) && Array.isArray(configToRemove.parameterNames) ?
          JSON.stringify(config.parameterNames.slice().sort()) === JSON.stringify(configToRemove.parameterNames.slice().sort()) :
          config.parameterNames === configToRemove.parameterNames;
      return !(targetsMatch && paramsMatch && config.fetchOnlyIfUsed === configToRemove.fetchOnlyIfUsed);
    });
    onFetchConfigsChanged(newConfigs);
    logger.log('Editor:InventreeParamsFetch', `Removed InvenTree Parameter Fetch Config: Part ${Array.isArray(configToRemove.targetPartIds) ? configToRemove.targetPartIds.join('/') : configToRemove.targetPartIds} - ${Array.isArray(configToRemove.parameterNames) ? configToRemove.parameterNames.join('/') : configToRemove.parameterNames}`, { newConfigs });
  }, [parameterFetchConfigs, onFetchConfigsChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">InvenTree Parameters to Fetch (Direct API)</h4>
      <div className="helper-text">
        Enter comma-separated parameter strings in the format <code>part:ID:PARAMETER_NAME</code>.
        These define specific parameters to be fetched via the InvenTree API.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="e.g., part:145:microwavables, part:101:length_cm"
          style={{ flexGrow: 1, padding: '8px', border: error ? '1px solid red' : '1px solid var(--divider-color)' }}
        />
        <button onClick={handleAddConfigs} style={{ padding: '8px 12px' }}>Add Configurations</button>
      </div>
      {error && <div style={{ color: 'red', fontSize: '0.9em', marginBottom: '8px' }}>{error}</div>}

      {parameterFetchConfigs.length > 0 && (
        <div className="selected-configs-list" style={{ marginTop: '16px' }}>
          <h5>Current Fetch Configurations:</h5>
          {parameterFetchConfigs.map((config, index) => (
            <div key={`${Array.isArray(config.targetPartIds) ? config.targetPartIds.join('-') : config.targetPartIds}-${Array.isArray(config.parameterNames) ? config.parameterNames.join('-') : config.parameterNames}-${index}`} className="selected-config-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 0',
              borderBottom: '1px solid var(--divider-color)'
            }}>
              <span>
                Part(s): {(Array.isArray(config.targetPartIds) ? config.targetPartIds.join(', ') : config.targetPartIds) || 'N/A'} <br/>
                Parameter(s): {(Array.isArray(config.parameterNames) ? config.parameterNames.join(', ') : config.parameterNames) || 'N/A'} <br/>
                {/* fetchOnlyIfUsed: {config.fetchOnlyIfUsed ? 'Yes' : 'No'} */}
              </span>
              <button
                onClick={() => handleRemoveConfig(config)}
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

export default InventreeParametersToFetchSection; 