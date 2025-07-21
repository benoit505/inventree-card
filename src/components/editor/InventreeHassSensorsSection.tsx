import React, { useState, useCallback, useMemo } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types'; // Adjusted path
// import HaEntityPickerWrapper from './HaEntityPickerWrapper'; // Updated path - REMOVE
import CustomEntityPicker from './CustomEntityPicker'; // ADD
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('InventreeHassSensorsSection');
ConditionalLoggerEngine.getInstance().registerCategory('InventreeHassSensorsSection', { enabled: false, level: 'info' });

// Define stable array reference for includeDomains
const SENSOR_DOMAINS = ["sensor"];

interface InventreeHassSensorsSectionProps {
  hass: HomeAssistant;
  // We'll manage a specific part of the config here, e.g., config.data_sources.inventree_hass_sensors
  selectedSensors: string[]; 
  onSensorsChanged: (newSensors: string[]) => void;
}

const InventreeHassSensorsSection: React.FC<InventreeHassSensorsSectionProps> = ({
  hass,
  selectedSensors,
  onSensorsChanged,
}) => {

  const handleAddSensor = useCallback((entityId: string) => {
    if (entityId && !selectedSensors.includes(entityId)) {
      const newSensors = [...selectedSensors, entityId];
      onSensorsChanged(newSensors);
      logger.info('handleAddSensor', `Added InvenTree HASS sensor: ${entityId}`, { newSensors });
    }
  }, [selectedSensors, onSensorsChanged]);

  const handleRemoveSensor = useCallback((entityIdToRemove: string) => {
    const newSensors = selectedSensors.filter(id => id !== entityIdToRemove);
    onSensorsChanged(newSensors);
    logger.info('handleRemoveSensor', `Removed InvenTree HASS sensor: ${entityIdToRemove}`, { newSensors });
  }, [selectedSensors, onSensorsChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">InvenTree HASS Sensors</h4>
      <div className="helper-text">
        Select Home Assistant sensor entities that represent InvenTree parts or provide InvenTree-related data.
      </div>
      
      <CustomEntityPicker
        hass={hass}
        label="Add InvenTree Sensor Entity"
        onValueChanged={handleAddSensor}
        includeDomains={SENSOR_DOMAINS} // Use the stable array reference
        value={''} // Reset picker after selection
        placeholder="Select an InvenTree sensor..."
      />

      {selectedSensors.length > 0 && (
        <div className="selected-entities-list" style={{ marginTop: '16px' }}>
          <h5>Selected Sensors:</h5>
          {selectedSensors.map(entityId => (
            <div key={entityId} className="selected-entity-item" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '4px 0',
              borderBottom: '1px solid var(--divider-color)'
            }}>
              <span>{hass.states[entityId]?.attributes.friendly_name || entityId}</span>
              <button 
                onClick={() => handleRemoveSensor(entityId)} 
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

export default InventreeHassSensorsSection; 