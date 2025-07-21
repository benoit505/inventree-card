import React, { useCallback, ChangeEvent } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { DirectApiConfig, InventreeCardConfig } from '../../types'; // Assuming types are correctly pathed
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('InventreeApiConfigSection');
ConditionalLoggerEngine.getInstance().registerCategory('InventreeApiConfigSection', { enabled: false, level: 'info' });

interface InventreeApiConfigSectionProps {
  hass?: HomeAssistant;
  directApiConfig?: DirectApiConfig;
  onDirectApiConfigChanged: (newApiConfig: DirectApiConfig) => void;
}

const InventreeApiConfigSection: React.FC<InventreeApiConfigSectionProps> = ({
  hass,
  directApiConfig = { enabled: false, url: '', api_key: '' }, // Default to prevent undefined errors
  onDirectApiConfigChanged,
}) => {

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      processedValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        // Handle or log error for non-numeric input if necessary, or allow it to be empty
        // For now, let's assume parseFloat will handle it or it becomes NaN which can be checked later
      }
    }

    const newConfig = {
      ...directApiConfig,
      [name]: processedValue,
    };
    onDirectApiConfigChanged(newConfig);
    logger.info('handleInputChange', `API Config changed: ${name} = ${processedValue}`, { newConfig });
  }, [directApiConfig, onDirectApiConfigChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">InvenTree API Configuration</h4>
      
      <div className="config-item" style={{ marginBottom: '16px' }}>
        <label htmlFor="direct_api_enabled" style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="direct_api_enabled"
            name="enabled"
            checked={directApiConfig.enabled}
            onChange={handleInputChange}
            style={{ marginRight: '8px' }}
          />
          Enable Direct API Communication
        </label>
      </div>

      {directApiConfig.enabled && (
        <>
          <div className="config-item" style={{ marginBottom: '12px' }}>
            <label htmlFor="direct_api_url">InvenTree API URL:</label>
            <input
              type="text"
              id="direct_api_url"
              name="url"
              value={directApiConfig.url || ''}
              onChange={handleInputChange}
              placeholder="e.g., http://inventree.local:8000"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="config-item" style={{ marginBottom: '12px' }}>
            <label htmlFor="direct_api_key">API Key:</label>
            <input
              type="password" // Use password type for API keys
              id="direct_api_key"
              name="api_key"
              value={directApiConfig.api_key || ''}
              onChange={handleInputChange}
              placeholder="Enter your InvenTree API Key"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="config-item" style={{ marginBottom: '12px' }}>
            <label htmlFor="direct_api_websocket_url">WebSocket URL (Optional):</label>
            <input
              type="text"
              id="direct_api_websocket_url"
              name="websocket_url"
              value={directApiConfig.websocket_url || ''}
              onChange={handleInputChange}
              placeholder="e.g., ws://inventree.local:8000/ws/api"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
            <div className="helper-text" style={{ fontSize: '0.9em', color: 'var(--secondary-text-color)' }}>
              Leave blank to auto-derive from API URL. Needed for reverse proxies or custom setups.
            </div>
          </div>

          <div className="config-item" style={{ marginBottom: '12px' }}>
            <label htmlFor="direct_api_idle_render_time">Idle Render Time (seconds):</label>
            <input
              type="number"
              id="direct_api_idle_render_time"
              name="idle_render_time"
              value={directApiConfig.idle_render_time === undefined ? 60 : directApiConfig.idle_render_time} // Default to 60 if undefined
              onChange={handleInputChange}
              min="10"
              max="600"
              style={{ width: '100px', padding: '8px' }}
            />
            <div className="helper-text" style={{ fontSize: '0.9em', color: 'var(--secondary-text-color)' }}>
              How often to refresh when no changes are detected (10-600s). Set in API performance settings if not here.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventreeApiConfigSection; 