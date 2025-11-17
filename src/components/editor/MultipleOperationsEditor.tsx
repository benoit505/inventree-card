import React from 'react';
import { ActionOperation, ActionOperationType } from '../../types';

interface MultipleOperationsEditorProps {
  operations: ActionOperation[];
  onChange: (operations: ActionOperation[]) => void;
  renderOperationFields: (operation: ActionOperation, index: number, onChange: (op: ActionOperation) => void) => React.ReactNode;
}

const getDefaultOperation = (type: ActionOperationType): ActionOperation => {
  switch (type) {
    case 'call_ha_service':
      return { type: 'call_ha_service', service: '', dataTemplate: {} };
    case 'update_inventree_parameter':
      return { type: 'update_inventree_parameter', partIdContext: 'current', parameterName: '', valueTemplate: '' };
    case 'adjust_stock':
      return { type: 'adjust_stock', partIdContext: 'current', deltaTemplate: '+1' };
    case 'dispatch_redux_action':
      return { type: 'dispatch_redux_action', actionType: '', payloadTemplate: {} };
    case 'trigger_conditional_logic':
      return { type: 'trigger_conditional_logic', logicIdToTrigger: '' };
    default:
      return { type: 'call_ha_service', service: '', dataTemplate: {} };
  }
};

const MultipleOperationsEditor: React.FC<MultipleOperationsEditorProps> = ({
  operations,
  onChange,
  renderOperationFields,
}) => {
  const addOperation = () => {
    onChange([...operations, getDefaultOperation('call_ha_service')]);
  };

  const removeOperation = (index: number) => {
    const newOperations = operations.filter((_, i) => i !== index);
    onChange(newOperations.length > 0 ? newOperations : [getDefaultOperation('call_ha_service')]);
  };

  const updateOperation = (index: number, updatedOp: ActionOperation) => {
    const newOperations = [...operations];
    newOperations[index] = updatedOp;
    onChange(newOperations);
  };

  const changeOperationType = (index: number, newType: ActionOperationType) => {
    const newOperations = [...operations];
    newOperations[index] = getDefaultOperation(newType);
    onChange(newOperations);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Operations ({operations.length})</h3>
        <button type="button" onClick={addOperation} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ➕ Add Operation
        </button>
      </div>

      {operations.map((operation, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ddd',
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong>Operation {index + 1}</strong>
            {operations.length > 1 && (
              <button
                type="button"
                onClick={() => removeOperation(index)}
                style={{ padding: '4px 12px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                🗑️ Remove
              </button>
            )}
          </div>

          <label>Operation Type:
            <select
              value={operation.type}
              onChange={(e) => changeOperationType(index, e.target.value as ActionOperationType)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
            >
              <option value="call_ha_service">Call HA Service</option>
              <option value="update_inventree_parameter">Update InvenTree Parameter</option>
              <option value="adjust_stock">🚌 Adjust Stock</option>
              <option value="dispatch_redux_action">Dispatch Redux Action</option>
              <option value="trigger_conditional_logic">Trigger Conditional Logic</option>
              <option value="set_card_state">Set Card State</option>
            </select>
          </label>

          {renderOperationFields(operation, index, (updatedOp) => updateOperation(index, updatedOp))}
        </div>
      ))}
    </div>
  );
};

export default MultipleOperationsEditor;

