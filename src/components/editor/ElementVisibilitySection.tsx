import React, { useCallback, ChangeEvent, useState } from 'react';
import { DisplayConfig, ConditionalVisibility, DisplayConfigKey, ConditionalLogicItem } from '../../types'; // Assuming types are correctly pathed
import { Logger } from '../../utils/logger';
import ConditionSelectModal from './ConditionSelectModal'; // Import the modal

const logger = Logger.getInstance();

interface ElementVisibilitySectionProps {
  displayConfig?: Partial<DisplayConfig>; // Allow partial for initial state from config
  onDisplayConfigChanged: (newDisplayConfig: Partial<DisplayConfig>) => void;
  definedLogics: ConditionalLogicItem[]; // Add this prop
}

// Helper to create a more readable label from a camelCase key
const makeLabel = (key: string): string => {
  const result = key.replace(/([A-Z])/g, ' $1').replace(/^show /, ''); // Also remove "show " prefix here
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const ElementVisibilitySection: React.FC<ElementVisibilitySectionProps> = ({
  displayConfig = {}, // Default to empty object
  onDisplayConfigChanged,
  definedLogics, // Destructure the new prop
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeyForModal, setEditingKeyForModal] = useState<DisplayConfigKey | null>(null);

  const handleCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const key = name as DisplayConfigKey;
    const currentEntry = displayConfig[key];
    let newEntry: boolean | ConditionalVisibility;

    if (typeof currentEntry === 'object' && currentEntry !== null && 'default' in currentEntry) {
      // It's already a ConditionalVisibility object, update its default
      newEntry = { ...currentEntry, default: checked };
    } else {
      // It's a boolean, undefined, or something else. Create/overwrite as ConditionalVisibility.
      // If it was a boolean, that becomes the new default. If undefined, checked is the default.
      newEntry = { default: checked, conditionId: undefined }; 
    }

    const newDisplayConfig = {
      ...displayConfig,
      [key]: newEntry,
    };

    onDisplayConfigChanged(newDisplayConfig);
    logger.log('Editor:VisibilitySection', `Display option changed: ${key} = default: ${checked}`, { newDisplayConfig });
  }, [displayConfig, onDisplayConfigChanged]);

  const handleAdvancedClick = (key: DisplayConfigKey) => {
    logger.log('Editor:VisibilitySection', `Advanced clicked for ${key}`);
    setEditingKeyForModal(key);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKeyForModal(null);
  };

  const handleModalSave = (selectedConditionId?: string) => {
    if (editingKeyForModal) {
      const currentEntry = displayConfig[editingKeyForModal];
      let newEntry: ConditionalVisibility;

      if (typeof currentEntry === 'object' && currentEntry !== null && 'default' in currentEntry) {
        newEntry = { ...currentEntry, conditionId: selectedConditionId };
      } else {
        // If it was boolean or undefined, preserve the current default (or false if undefined)
        const defaultVal = typeof currentEntry === 'boolean' ? currentEntry : false;
        newEntry = { default: defaultVal, conditionId: selectedConditionId };
      }
      const newDisplayConfig = { ...displayConfig, [editingKeyForModal]: newEntry };
      onDisplayConfigChanged(newDisplayConfig);
      logger.log('Editor:VisibilitySection', `Condition ID for ${editingKeyForModal} set to ${selectedConditionId}`, { newDisplayConfig });
    }
    handleModalClose();
  };

  const visibleFlags: Array<DisplayConfigKey> = [
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
    'show_stock_status_border_for_templates',
    'show_buttons_for_variants',
    'show_part_details_component_for_variants',
    'show_image_for_variants',
    'show_stock_for_variants',
    'show_name_for_variants',
  ];

  const currentConditionIdForModal = editingKeyForModal 
    ? (typeof displayConfig[editingKeyForModal] === 'object' && displayConfig[editingKeyForModal] !== null 
        ? (displayConfig[editingKeyForModal] as ConditionalVisibility).conditionId 
        : undefined) 
    : undefined;

  return (
    <div className="sub-section-container">
      <h4 className="sub-section-title">Element Visibility</h4>
      <p style={{ fontSize: '0.9em', color: 'gray' }}>
        Toggle the default visibility of standard card elements. Use the "Advanced" or "Conditional" button 
        to set conditions that can override this default.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
        {visibleFlags.map(key => {
          const currentEntry = displayConfig[key];
          const isChecked = typeof currentEntry === 'object' && currentEntry !== null && 'default' in currentEntry 
                            ? (currentEntry as ConditionalVisibility).default 
                            : typeof currentEntry === 'boolean' ? currentEntry : false;
          
          const conditionIsSet = typeof currentEntry === 'object' && currentEntry !== null && !!currentEntry.conditionId;
          const label = makeLabel(key);

          return (
            <div className="config-item" key={key} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <label htmlFor={`display_${key}`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id={`display_${key}`}
                  name={key}
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  style={{ marginRight: '8px' }}
                />
                {label}
              </label>
              <button 
                onClick={() => handleAdvancedClick(key)}
                style={{
                  marginLeft: '10px', 
                  padding: '2px 6px',
                  fontSize: '0.8em',
                  lineHeight: '1',
                  background: conditionIsSet ? '#e0f2f1' /* Light teal for conditioned */ : '#f0f0f0',
                  border: conditionIsSet ? '1px solid #00796b' /* Darker teal border */ : '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontWeight: conditionIsSet ? 'bold' : 'normal',
                }}
                title={conditionIsSet ? `Conditional visibility is set for ${label}` : `Set conditional visibility for ${label}`}
              >
                {conditionIsSet ? "Conditional" : "Advanced"}
              </button>
            </div>
          );
        })}
      </div>
      {editingKeyForModal && (
        <ConditionSelectModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          availableConditions={definedLogics} // Pass the defined logics
          currentConditionId={currentConditionIdForModal}
          elementName={`${makeLabel(editingKeyForModal)} Visibility`}
        />
      )}
    </div>
  );
};

export default ElementVisibilitySection; 