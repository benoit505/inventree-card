import React, { useCallback, useState } from 'react';
import { ActionDefinition } from '../../types'; // Updated type
import { Logger } from '../../utils/logger';
import ActionEditorForm from './ActionEditorForm';
import { HomeAssistant } from 'custom-card-helpers';

const logger = Logger.getInstance();

interface ConfigurableActionsSectionProps { // Renamed props interface
  hass: HomeAssistant;
  actions?: ActionDefinition[]; // Changed from interactionsConfig
  onActionsChanged: (newActions: ActionDefinition[]) => void; // Changed callback
}

const ConfigurableActionsSection: React.FC<ConfigurableActionsSectionProps> = ({ // Renamed component
  hass,
  actions = [], // Default to empty array
  onActionsChanged,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionDefinition | undefined>(undefined); // Type changed
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);

  const openModal = useCallback((action?: ActionDefinition, index?: number) => { // Type changed
    setEditingAction(action ? { ...action } : undefined);
    setEditingActionIndex(index !== undefined ? index : null);
    setIsModalOpen(true);
    logger.log('Editor:ConfigurableActionsSection', 'Modal opened', { action, index });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAction(undefined);
    setEditingActionIndex(null);
    logger.log('Editor:ConfigurableActionsSection', 'Modal closed');
  }, []);

  const handleSaveAction = useCallback((savedAction: ActionDefinition) => { // Type changed
    const currentActions = actions || [];
    let updatedActions;

    if (editingActionIndex !== null) {
      updatedActions = currentActions.map((act, idx) =>
        idx === editingActionIndex ? { ...savedAction, id: act.id || String(Date.now()) } : act
      );
      logger.log('Editor:ConfigurableActionsSection', 'Action updated', { savedAction, index: editingActionIndex });
    } else {
      updatedActions = [...currentActions, { ...savedAction, id: savedAction.id || String(Date.now()) }]; // Ensure new actions get an ID
      logger.log('Editor:ConfigurableActionsSection', 'New action added', { savedAction });
    }
    onActionsChanged(updatedActions); // Use new callback
    closeModal();
  }, [actions, onActionsChanged, closeModal, editingActionIndex]);

  const handleDeleteAction = useCallback((index: number) => {
    const currentActions = actions || [];
    const updatedActions = currentActions.filter((_, idx) => idx !== index);
    onActionsChanged(updatedActions); // Use new callback
    logger.log('Editor:ConfigurableActionsSection', 'Action deleted', { index });
  }, [actions, onActionsChanged]);

  return (
    <div className="configurable-actions-section" style={{ border: '1px solid #ccc', padding: '16px', margin: '10px 0' }}>
      <h4>Configurable Actions</h4>
      {actions && actions.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {actions.map((action, index) => (
            <li key={action.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee' }}>
              <span>{action.name || `Action ID: ${action.id}`} (Trigger: {action.trigger.type})</span>
              <div>
                <button onClick={() => openModal(action, index)} style={{ marginRight: '8px' }}>Edit</button>
                <button onClick={() => handleDeleteAction(index)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No actions defined yet.</p>
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
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            className="modal-content"
            style={{ background: 'var(--ha-card-background, var(--card-background-color, white))', padding: '20px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px', color: 'var(--primary-text-color)'}}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginTop: 0 }}>{editingAction ? 'Edit Action' : 'Add New Action'}</h5>
            <ActionEditorForm
              hass={hass}
              initialAction={editingAction} // This will be ActionDefinition | undefined
              onSave={handleSaveAction} // Expects ActionDefinition
              onCancel={closeModal}
              // We might need to pass other config context if ActionEditorForm needs it (e.g. all expression IDs)
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurableActionsSection; 