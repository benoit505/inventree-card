import React, { useCallback } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
// Assuming InventreeCardConfig is not directly needed here, but types might be shared elsewhere
// import { InventreeCardConfig } from '../../types'; 
import CustomEntityPicker from './CustomEntityPicker'; // ADD
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

ConditionalLoggerEngine.getInstance().registerCategory('HaEntitiesSection', { enabled: false, level: 'info' });

interface HaEntitiesSectionProps {
  hass: HomeAssistant;
  selectedEntities: string[]; 
  onEntitiesChanged: (newEntities: string[]) => void;
}

const HaEntitiesSection: React.FC<HaEntitiesSectionProps> = ({
  hass,
  selectedEntities,
  onEntitiesChanged,
}) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('HaEntitiesSection');
  }, []);

  const handleAddEntity = useCallback((entityId: string) => {
    if (entityId && !selectedEntities.includes(entityId)) {
      const newEntities = [...selectedEntities, entityId];
      onEntitiesChanged(newEntities);
      logger.info('handleAddEntity', `Added HA entity: ${entityId}`, { newEntities });
    }
  }, [selectedEntities, onEntitiesChanged]);

  const handleRemoveEntity = useCallback((entityIdToRemove: string) => {
    const newEntities = selectedEntities.filter(id => id !== entityIdToRemove);
    onEntitiesChanged(newEntities);
    logger.info('handleRemoveEntity', `Removed HA entity: ${entityIdToRemove}`, { newEntities });
  }, [selectedEntities, onEntitiesChanged]);

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">Home Assistant Entities (Other)</h4>
      <div className="helper-text">
        Select any Home Assistant entities whose states or attributes you want to use in conditional logic.
      </div>
      
      <CustomEntityPicker
        hass={hass}
        label="Add Home Assistant Entity"
        onValueChanged={handleAddEntity}
        // No includeDomains filter by default, to allow any entity type
        // includeDomains={["sensor", "binary_sensor", "switch", "light"]} // Example if filtering is desired
        value={''} // Changed from null to empty string to satisfy string | undefined type
        placeholder="Select an HA entity..."
      />

      {selectedEntities.length > 0 && (
        <div className="selected-entities-list" style={{ marginTop: '16px' }}>
          <h5>Selected Entities:</h5>
          {selectedEntities.map(entityId => (
            <div key={entityId} className="selected-entity-item" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '4px 0',
              borderBottom: '1px solid var(--divider-color)'
            }}>
              <span>{hass.states[entityId]?.attributes.friendly_name || entityId}</span>
              <button 
                onClick={() => handleRemoveEntity(entityId)} 
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

export default HaEntitiesSection; 