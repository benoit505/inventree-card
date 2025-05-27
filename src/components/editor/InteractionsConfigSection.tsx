import React, { useCallback, useState } from 'react';
import { CustomAction, InteractionsConfig } from '../../types';
import { Logger } from '../../utils/logger';
import ActionEditorForm from './ActionEditorForm';
import { HomeAssistant } from 'custom-card-helpers';

const logger = Logger.getInstance();

interface InteractionsConfigSectionProps {
  hass: HomeAssistant;
  interactionsConfig?: InteractionsConfig;
  onInteractionsConfigChanged: (newInteractionsConfig: InteractionsConfig) => void;
}

const InteractionsConfigSection: React.FC<InteractionsConfigSectionProps> = ({
  hass,
  interactionsConfig = { buttons: [] },
  onInteractionsConfigChanged,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CustomAction | undefined>(undefined);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);

  const openModal = useCallback((action?: CustomAction, index?: number) => {
    setEditingAction(action ? { ...action } : undefined);
    setEditingActionIndex(index !== undefined ? index : null);
    setIsModalOpen(true);
    logger.log('Editor:InteractionsSection', 'Modal opened', { action, index });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAction(undefined);
    setEditingActionIndex(null);
    logger.log('Editor:InteractionsSection', 'Modal closed');
  }, []);

  const handleSaveAction = useCallback((savedAction: CustomAction) => {
    const currentActions = interactionsConfig.buttons || [];
    let updatedActions;

    if (editingActionIndex !== null) {
      updatedActions = currentActions.map((act, idx) => 
        idx === editingActionIndex ? { ...savedAction, id: act.id || String(Date.now()) } : act
      );
      logger.log('Editor:InteractionsSection', 'Action updated', { savedAction, index: editingActionIndex });
    } else {
      updatedActions = [...currentActions, { ...savedAction, id: String(Date.now()) }];
      logger.log('Editor:InteractionsSection', 'New action added', { savedAction });
    }
    onInteractionsConfigChanged({ ...interactionsConfig, buttons: updatedActions });
    closeModal();
  }, [interactionsConfig, onInteractionsConfigChanged, closeModal, editingActionIndex]);

  const handleDeleteAction = useCallback((index: number) => {
    const currentActions = interactionsConfig.buttons || [];
    const updatedActions = currentActions.filter((_, idx) => idx !== index);
    onInteractionsConfigChanged({ ...interactionsConfig, buttons: updatedActions });
    logger.log('Editor:InteractionsSection', 'Action deleted', { index });
  }, [interactionsConfig, onInteractionsConfigChanged]);

  return (
    <div className="interactions-section" style={{ border: '1px solid #ccc', padding: '16px', margin: '10px 0' }}>
      <h4>Custom Interactions (Actions/Buttons)</h4>
      {interactionsConfig.buttons && interactionsConfig.buttons.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {interactionsConfig.buttons.map((action, index) => (
            <li key={action.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee' }}>
              <span>{action.label} ({action.type})</span>
              <div>
                <button onClick={() => openModal(action, index)} style={{ marginRight: '8px' }}>Edit</button>
                <button onClick={() => handleDeleteAction(index)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No custom actions defined yet.</p>
      )}
      <button onClick={() => openModal()} style={{ marginTop: '10px' }}>+ Add New Action</button>

      {isModalOpen && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000, // Ensure modal is on top
          }}
          onClick={closeModal} // Close if overlay is clicked
        >
          <div 
            className="modal-content" 
            style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px'}} 
            onClick={(e) => e.stopPropagation()} // Prevent closing when content is clicked
          >
            <h5 style={{ marginTop: 0 }}>{editingAction ? 'Edit Action' : 'Add New Action'}</h5>
            <ActionEditorForm
              hass={hass}
              initialAction={editingAction}
              onSave={handleSaveAction}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionsConfigSection; 