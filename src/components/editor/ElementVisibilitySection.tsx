import React, { useCallback, ChangeEvent, useState } from 'react';
import { DisplayConfig, ConditionalVisibility, DisplayConfigKey, ConditionalLogicItem } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import ConditionSelectModal from './ConditionSelectModal';

ConditionalLoggerEngine.getInstance().registerCategory('ElementVisibilitySection', { enabled: false, level: 'info' });

interface ElementVisibilitySectionProps {
  displayConfig?: Partial<DisplayConfig>;
  onDisplayConfigChanged: (newDisplayConfig: Partial<DisplayConfig>) => void;
  definedLogics: ConditionalLogicItem[];
}

const makeLabel = (key: string): string => {
  const result = key.replace(/([A-Z])/g, ' $1').replace(/^show /, '');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const ElementVisibilitySection: React.FC<ElementVisibilitySectionProps> = ({
  displayConfig = {},
  onDisplayConfigChanged,
  definedLogics,
}) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('ElementVisibilitySection');
    // This logger is for the editor form itself, which is not instance-specific
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeyForModal, setEditingKeyForModal] = useState<DisplayConfigKey | null>(null);

  const handleCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const key = name as DisplayConfigKey;
    const currentEntry = displayConfig[key];
    let newEntry: boolean | ConditionalVisibility;

    if (typeof currentEntry === 'object' && currentEntry !== null && 'default' in currentEntry) {
      newEntry = { ...currentEntry, default: checked };
    } else {
      newEntry = { default: checked, conditionId: undefined }; 
    }

    const newDisplayConfig = {
      ...displayConfig,
      [key]: newEntry,
    };

    onDisplayConfigChanged(newDisplayConfig);
    logger.info('handleCheckboxChange', `Display option changed: ${key} = default: ${checked}`, { newDisplayConfig });
  }, [displayConfig, onDisplayConfigChanged]);

  const handleAdvancedClick = (key: DisplayConfigKey) => {
    logger.debug('handleAdvancedClick', `Advanced clicked for ${key}`);
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
        const defaultVal = typeof currentEntry === 'boolean' ? currentEntry : false;
        newEntry = { default: defaultVal, conditionId: selectedConditionId };
      }
      const newDisplayConfig = { ...displayConfig, [editingKeyForModal]: newEntry };
      onDisplayConfigChanged(newDisplayConfig);
      logger.info('handleModalSave', `Condition ID for ${editingKeyForModal} set to ${selectedConditionId}`, { newDisplayConfig });
    }
    handleModalClose();
  };

  const visibleFlags: Array<DisplayConfigKey> = [
    'show_header', 'show_image', 'show_name', 'show_stock', 'show_description',
    'show_category', 'show_ipn', 'show_location', 'show_supplier', 'show_manufacturer',
    'show_notes', 'show_buttons', 'show_parameters', 'show_stock_status_border',
    'show_stock_status_colors', 'show_related_parts', 'show_part_details_component',
    'show_stock_status_border_for_templates', 'show_buttons_for_variants',
    'show_part_details_component_for_variants', 'show_image_for_variants',
    'show_stock_for_variants', 'show_name_for_variants',
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
                  background: conditionIsSet ? '#e0f2f1' : '#f0f0f0',
                  border: conditionIsSet ? '1px solid #00796b' : '1px solid #ccc',
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
          availableConditions={definedLogics}
          currentConditionId={currentConditionIdForModal}
          elementName={`${makeLabel(editingKeyForModal)} Visibility`}
        />
      )}
    </div>
  );
};

export default ElementVisibilitySection;
