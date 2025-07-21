import React, { useState, useEffect } from 'react';
import { ConditionalLogicItem } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('ConditionSelectModal');
ConditionalLoggerEngine.getInstance().registerCategory('ConditionSelectModal', { enabled: false, level: 'info' });

interface ConditionSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedConditionId?: string) => void;
  availableConditions: ConditionalLogicItem[];
  currentConditionId?: string;
  elementName: string; // e.g., "Name visibility"
}

const ConditionSelectModal: React.FC<ConditionSelectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableConditions,
  currentConditionId,
  elementName,
}) => {
  const [selectedIdInModal, setSelectedIdInModal] = useState<string | undefined>(currentConditionId);

  useEffect(() => {
    // Reset selection when modal is opened with a new currentConditionId
    setSelectedIdInModal(currentConditionId);
  }, [currentConditionId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    logger.info('handleSave', `Saving condition for ${elementName}. Selected ID: ${selectedIdInModal}`);
    onSave(selectedIdInModal);
    onClose(); // Close modal after save
  };

  const handleCancel = () => {
    logger.info('handleCancel', `Cancelled condition selection for ${elementName}.`);
    onClose();
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '400px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  const listItemStyle: React.CSSProperties = {
    padding: '10px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
  };

  const selectedListItemStyle: React.CSSProperties = {
    ...listItemStyle,
    backgroundColor: '#e0f2f1', // Light teal
    fontWeight: 'bold',
  };

  return (
    <div style={modalOverlayStyle} onClick={handleCancel}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3>Set Condition for: {elementName}</h3>
        <p>Select a Conditional Logic block to control the visibility of this element. If the selected logic block's conditions are met, the element will be shown; otherwise, it will be hidden (overriding the default toggle).</p>
        
        <div style={{ marginBottom: '20px', maxHeight: '40vh', overflowY: 'auto', border: '1px solid #ccc' }}>
          <div 
            style={selectedIdInModal === undefined ? selectedListItemStyle : listItemStyle}
            onClick={() => setSelectedIdInModal(undefined)}
            title="No specific condition will be applied. Visibility will be based on the simple on/off toggle."
          >
            (No Condition - Use Default Toggle)
          </div>
          {availableConditions.length === 0 && <p>No conditions defined yet. Please create conditions in the 'Conditional Logic' section.</p>}
          {availableConditions.map((condition) => (
            <div
              key={condition.id}
              style={selectedIdInModal === condition.id ? selectedListItemStyle : listItemStyle}
              onClick={() => setSelectedIdInModal(condition.id)}
              title={`ID: ${condition.id}`}
            >
              {condition.name || `Unnamed Condition (${condition.id.substring(0,8)}...)`}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={handleCancel} style={{ padding: '8px 15px' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '8px 15px', background: '#00796b', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ConditionSelectModal; 