import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import {
  ActionDefinition,
  ActionOperation,
  ActionOperationType,
  ActionTriggerUIType,
  ActionUITriggerConfig,
  ActionCallHAServiceOperation,
  ActionUpdateInvenTreeParameterOperation,
  ActionDispatchReduxActionOperation,
  ActionTriggerConditionalLogicOperation,
  ActionAdjustStockOperation,
} from '../../types';
import CustomEntityPicker from './CustomEntityPicker';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import HaIconPickerWrapper from './HaIconPickerWrapper';
import MultipleOperationsEditor from './MultipleOperationsEditor';

ConditionalLoggerEngine.getInstance().registerCategory('ActionEditorForm', { enabled: false, level: 'info' });

// --- Default Initializers for Operations ---
const getDefaultCallHAServiceOperation = (): ActionCallHAServiceOperation => ({
  type: 'call_ha_service',
  service: '',
  target: undefined,
  dataTemplate: {},
});

const getDefaultUpdateInvenTreeParameterOperation = (): ActionUpdateInvenTreeParameterOperation => ({
  type: 'update_inventree_parameter',
  partIdContext: 'current',
  parameterName: '',
  valueTemplate: '',
});

const getDefaultDispatchReduxActionOperation = (): ActionDispatchReduxActionOperation => ({
  type: 'dispatch_redux_action',
  actionType: '',
  payloadTemplate: {},
});

const getDefaultTriggerConditionalLogicOperation = (): ActionTriggerConditionalLogicOperation => ({
  type: 'trigger_conditional_logic',
  logicIdToTrigger: '',
});

const getDefaultAdjustStockOperation = (): ActionAdjustStockOperation => ({
  type: 'adjust_stock',
  partIdContext: 'current',
  deltaTemplate: '+1',
});

// --- Default for the entire Action Definition ---
const getDefaultActionDefinition = (): Partial<ActionDefinition> => ({
  name: '',
  trigger: {
    type: 'ui_button',
    ui: {
      labelTemplate: '',
      icon: undefined,
      placement: 'part_footer',
    },
  },
  operation: getDefaultCallHAServiceOperation(), // Default to a valid operation
  isEnabledExpressionId: '',
  postEvaluationLogicIds: [],
});

interface ActionEditorFormProps {
  hass: HomeAssistant;
  initialAction?: ActionDefinition;
  onSave: (action: ActionDefinition) => void;
  onCancel: () => void;
}

const ActionEditorForm: React.FC<ActionEditorFormProps> = ({
  hass,
  initialAction,
  onSave,
  onCancel,
}) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('ActionEditorForm');
    // This logger is for the editor form itself, which is not instance-specific
    // in the same way as a card. A global logger is acceptable here.
  }, []);

  const [action, setAction] = useState<Partial<ActionDefinition>>(getDefaultActionDefinition());
  
  // These are now derived from the main `action` state, not separate states
  const currentOperationType = action.operation?.type || 'call_ha_service';
  const currentTriggerType = action.trigger?.type || 'ui_button';

  // Local state for string representations of JSON templates
  const [serviceDataString, setServiceDataString] = useState<string>('{}');
  const [reduxPayloadString, setReduxPayloadString] = useState<string>('{}');
  
  // Local state for UI controls that don't map 1:1 with the action object
  const [isConfirmationEnabled, setIsConfirmationEnabled] = useState<boolean>(false);
  const [isTargetEntityEnabled, setIsTargetEntityEnabled] = useState<boolean>(false);
  const [postEvaluationLogicIdsString, setPostEvaluationLogicIdsString] = useState<string>('');
  const [useMultipleOperations, setUseMultipleOperations] = useState<boolean>(false);

  useEffect(() => {
    const defaults = getDefaultActionDefinition();
    let effectiveInitial = initialAction ? JSON.parse(JSON.stringify(initialAction)) : null;

    if (effectiveInitial) {
      // Ensure nested objects exist
      effectiveInitial.trigger = effectiveInitial.trigger || defaults.trigger;
      effectiveInitial.operation = effectiveInitial.operation || defaults.operation;

      // Check if this action uses multiple operations
      if (effectiveInitial.operations && effectiveInitial.operations.length > 0) {
        setUseMultipleOperations(true);
      }

      setAction({ ...defaults, ...effectiveInitial });
      
      // Initialize local state from the effective action
      if (effectiveInitial.operation.type === 'call_ha_service') {
        const sds = effectiveInitial.operation.dataTemplate;
        setServiceDataString(sds && typeof sds === 'object' ? JSON.stringify(sds, null, 2) : '{}');
        setIsTargetEntityEnabled(!!effectiveInitial.operation.target);
      }
      if (effectiveInitial.operation.type === 'dispatch_redux_action') {
        const rps = effectiveInitial.operation.payloadTemplate;
        setReduxPayloadString(rps && typeof rps === 'object' ? JSON.stringify(rps, null, 2) : '{}');
      }
      if (effectiveInitial.confirmation) {
        setIsConfirmationEnabled(true);
      }
      if (Array.isArray(effectiveInitial.postEvaluationLogicIds)) {
        setPostEvaluationLogicIdsString(effectiveInitial.postEvaluationLogicIds.join(', '));
      }

    } else {
      // Reset everything for a new action
      setAction(defaults);
      setServiceDataString('{}');
      setReduxPayloadString('{}');
      setIsConfirmationEnabled(false);
      setIsTargetEntityEnabled(false);
      setPostEvaluationLogicIdsString('');
    }
  }, [initialAction]);

  const handleInputChange = useCallback((path: string, value: any) => {
    setAction(prevAction => {
      const keys = path.split('.');
      const newActionState = JSON.parse(JSON.stringify(prevAction));
      let currentLevel: any = newActionState;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (currentLevel[key] === undefined || currentLevel[key] === null) {
          currentLevel[key] = {};
        }
        currentLevel = currentLevel[key];
      }
      currentLevel[keys[keys.length - 1]] = value;
      return newActionState;
    });
  }, []);

  const handleOperationTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const newOpType = event.target.value as ActionOperationType;
    
    setAction(prevAction => {
      let newOperation: ActionOperation;
      
      switch (newOpType) {
        case 'update_inventree_parameter':
          newOperation = getDefaultUpdateInvenTreeParameterOperation();
          break;
        case 'dispatch_redux_action':
          newOperation = getDefaultDispatchReduxActionOperation();
          setReduxPayloadString('{}');
          break;
        case 'trigger_conditional_logic':
          newOperation = getDefaultTriggerConditionalLogicOperation();
          break;
        case 'adjust_stock':
          newOperation = getDefaultAdjustStockOperation();
          break;
        case 'call_ha_service':
        default:
          newOperation = getDefaultCallHAServiceOperation();
          setServiceDataString('{}');
          setIsTargetEntityEnabled(false);
          break;
      }
      return { ...prevAction, operation: newOperation };
    });
  }, []);

  const handleSave = () => {
    const finalAction = JSON.parse(JSON.stringify(action));

    if (!finalAction.name?.trim()) {
      alert("Action Name is required.");
      return;
    }

    if (finalAction.operation?.type === 'call_ha_service') {
      try {
        finalAction.operation.dataTemplate = serviceDataString.trim() ? JSON.parse(serviceDataString) : {};
      } catch (e) {
        alert("Invalid JSON in Service Data Template.");
        return;
      }
    } else if (finalAction.operation?.type === 'dispatch_redux_action') {
      try {
        finalAction.operation.payloadTemplate = reduxPayloadString.trim() ? JSON.parse(reduxPayloadString) : {};
      } catch (e) {
        alert("Invalid JSON in Redux Payload Template.");
        return;
      }
    }

    if (isConfirmationEnabled) {
      if (!finalAction.confirmation) {
        finalAction.confirmation = { textTemplate: '' };
      }
    } else {
      delete finalAction.confirmation;
    }
    
    finalAction.postEvaluationLogicIds = postEvaluationLogicIdsString.split(',').map(s => s.trim()).filter(Boolean);

    onSave(finalAction as ActionDefinition);
  };

  const getServiceDomain = (serviceCall: string = '') => serviceCall.split('.')[0];
  const getServiceAction = (serviceCall: string = '') => serviceCall.split('.')[1];

  // Helper to render operation fields for a specific operation (for multiple operations mode)
  const renderOperationFieldsFor = (operation: ActionOperation, onChange: (op: ActionOperation) => void) => {
    const updateField = (path: string, value: any) => {
      const keys = path.split('.');
      const updatedOp = { ...operation };
      let current: any = updatedOp;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      onChange(updatedOp);
    };

    switch (operation.type) {
      case 'call_ha_service':
        const op = operation as ActionCallHAServiceOperation;
        const serviceDomain = op.service?.split('.')[0] || '';
        const serviceAction = op.service?.split('.')[1] || '';
        const servicesForDomain = hass.services[serviceDomain] ? Object.keys(hass.services[serviceDomain]) : [];
        
        return (
          <>
            <label>Service:
              <input 
                type="text" 
                value={op.service || ''} 
                onChange={(e) => updateField('service', e.target.value)}
                placeholder="e.g. switch.toggle"
              />
            </label>
            <label>Target Entity ID:
              <input 
                type="text" 
                value={op.target?.type === 'standard_object_target' ? op.target.target_details?.entity_id || '' : ''}
                onChange={(e) => updateField('target', { 
                  type: 'standard_object_target', 
                  target_details: { entity_id: e.target.value } 
                })}
                placeholder="e.g. switch.test_plug_socket_1"
              />
            </label>
          </>
        );
      case 'update_inventree_parameter':
        const paramOp = operation as ActionUpdateInvenTreeParameterOperation;
        return (
          <>
            <label>Parameter Name:
              <input 
                type="text" 
                value={paramOp.parameterName || ''} 
                onChange={(e) => updateField('parameterName', e.target.value)}
                placeholder="e.g. microwavables"
              />
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={paramOp.valueTemplate === 'TOGGLE'}
                onChange={(e) => updateField('valueTemplate', e.target.checked ? 'TOGGLE' : '')}
              />
              Use as Toggle Switch
            </label>
            {paramOp.valueTemplate !== 'TOGGLE' && (
              <label>Value:
                <input 
                  type="text" 
                  value={paramOp.valueTemplate || ''} 
                  onChange={(e) => updateField('valueTemplate', e.target.value)}
                  placeholder="e.g. True, False, or a value"
                />
              </label>
            )}
          </>
        );
      case 'trigger_conditional_logic':
        const logicOp = operation as ActionTriggerConditionalLogicOperation;
        return (
          <label>Logic ID:
            <input 
              type="text" 
              value={logicOp.logicIdToTrigger || ''} 
              onChange={(e) => updateField('logicIdToTrigger', e.target.value)}
              placeholder="Logic ID to trigger"
            />
          </label>
        );
      case 'adjust_stock':
        const stockOp = operation as ActionAdjustStockOperation;
        return (
          <>
            <label>Part Context:
              <select 
                value={stockOp.partIdContext || 'current'} 
                onChange={(e) => updateField('partIdContext', e.target.value)}
              >
                <option value="current">Current Part</option>
              </select>
            </label>
            <label>Stock Adjustment:
              <input 
                type="text" 
                value={stockOp.deltaTemplate || ''} 
                onChange={(e) => updateField('deltaTemplate', e.target.value)}
                placeholder="e.g. +1, -2, {{quantity}}"
              />
              <small style={{ display: 'block', marginTop: '4px', color: 'var(--secondary-text-color)' }}>
                Use +/- for add/remove. Supports templates like %%context.part.in_stock%%
              </small>
            </label>
          </>
        );
      default:
        return <div>Operation type not yet supported in multiple operations mode</div>;
    }
  };

  const renderOperationFields = () => {
    if (!action.operation) return null;

    switch (action.operation.type) {
      case 'call_ha_service':
        const op = action.operation;
        const serviceDomain = getServiceDomain(op.service);
        const serviceAction = getServiceAction(op.service);
        const servicesForDomain = hass.services[serviceDomain] ? Object.keys(hass.services[serviceDomain]) : [];
        let currentTargetEntityId = '';
        if (op.target?.type === 'standard_object_target') {
          currentTargetEntityId = op.target.target_details.entity_id || '';
        } else if (op.target?.type === 'direct_entity') {
          currentTargetEntityId = op.target.entity_id;
        }
        
        return (
          <>
            <label>Service Domain:
              <select value={serviceDomain} onChange={(e) => handleInputChange('operation.service', `${e.target.value}.${serviceAction}`)}>
                <option value="">-- Select Domain --</option>
                {Object.keys(hass.services).sort().map(d => (<option key={d} value={d}>{d}</option>))}
              </select>
            </label>
            <label>Service:
              <select value={serviceAction} onChange={(e) => handleInputChange('operation.service', `${serviceDomain}.${e.target.value}`)} disabled={!serviceDomain}>
                <option value="">-- Select Service --</option>
                {servicesForDomain.sort().map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </label>
            <label>
              <input type="checkbox" checked={isTargetEntityEnabled} onChange={(e) => {
                  setIsTargetEntityEnabled(e.target.checked);
                  if (!e.target.checked) handleInputChange('operation.target', undefined);
                  else handleInputChange('operation.target', { type: 'standard_object_target', target_details: { entity_id: '' } });
              }}/>
              Specify Target Entity
            </label>
            {isTargetEntityEnabled && (
              <CustomEntityPicker hass={hass} value={currentTargetEntityId} label="Target Entity"
                onValueChanged={(newValue) => handleInputChange('operation.target', { type: 'standard_object_target', target_details: { entity_id: newValue } })}/>
            )}
            <label>Service Data (JSON Template):
              <textarea rows={5} value={serviceDataString} onChange={(e) => setServiceDataString(e.target.value)}/>
            </label>
          </>
        );
      case 'update_inventree_parameter':
        return (
          <>
            <label>Part Context:
              <select value={action.operation.partIdContext} onChange={(e) => handleInputChange('operation.partIdContext', e.target.value)}>
                <option value="current">Current Part</option>
                <option value="all_in_view">All Parts in View</option>
              </select>
            </label>
            <label>Parameter Name:
              <input type="text" value={action.operation.parameterName} onChange={(e) => handleInputChange('operation.parameterName', e.target.value)}/>
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={action.operation.valueTemplate === 'TOGGLE'}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('operation.valueTemplate', 'TOGGLE');
                  } else {
                    handleInputChange('operation.valueTemplate', '');
                  }
                }}
              />
              Use as Toggle Switch (flips True ↔ False)
            </label>
            {action.operation.valueTemplate !== 'TOGGLE' && (
              <label>Value Template:
                <input type="text" value={action.operation.valueTemplate} onChange={(e) => handleInputChange('operation.valueTemplate', e.target.value)}/>
              </label>
            )}
          </>
        );
      case 'dispatch_redux_action':
        return (
          <>
            <label>Action Type:
              <input type="text" value={action.operation.actionType} onChange={(e) => handleInputChange('operation.actionType', e.target.value)}/>
            </label>
            <label>Payload (JSON Template):
              <textarea rows={5} value={reduxPayloadString} onChange={(e) => setReduxPayloadString(e.target.value)}/>
            </label>
          </>
        );
      case 'trigger_conditional_logic':
        return (
          <label>Logic ID to Trigger:
            <input type="text" value={action.operation.logicIdToTrigger} onChange={(e) => handleInputChange('operation.logicIdToTrigger', e.target.value)}/>
          </label>
        );
      case 'adjust_stock':
        return (
          <>
            <label>Part Context:
              <select value={action.operation.partIdContext} onChange={(e) => handleInputChange('operation.partIdContext', e.target.value)}>
                <option value="current">Current Part</option>
              </select>
            </label>
            <label>Stock Adjustment:
              <input 
                type="text" 
                value={action.operation.deltaTemplate} 
                onChange={(e) => handleInputChange('operation.deltaTemplate', e.target.value)}
                placeholder="e.g. +1, -2, {{quantity}}"
              />
              <small style={{ display: 'block', marginTop: '4px', color: 'var(--secondary-text-color)' }}>
                Use +/- for add/remove. Supports templates like %%context.part.in_stock%%
              </small>
            </label>
          </>
        );
      default:
        return <div>Unsupported operation type.</div>;
    }
  };

  const renderUITriggerFields = () => {
    if (action.trigger?.type !== 'ui_button' && action.trigger?.type !== 'ui_thumbnail_click') return null;
    return (
      <>
        <h4>UI Trigger Options</h4>
        <label>Label Template:
          <input type="text" value={action.trigger.ui?.labelTemplate || ''} onChange={(e) => handleInputChange('trigger.ui.labelTemplate', e.target.value)}/>
        </label>
        <label>Icon:
          <HaIconPickerWrapper hass={hass} value={action.trigger.ui?.icon || ''}
            onValueChanged={(val) => handleInputChange('trigger.ui.icon', val)}
          />
        </label>
        {action.trigger.type === 'ui_button' && (
          <label>Placement:
            <select value={action.trigger.ui?.placement || 'part_footer'} onChange={(e) => handleInputChange('trigger.ui.placement', e.target.value)}>
              <option value="part_footer">Part Footer</option>
              <option value="global_header">Global Header</option>
            </select>
          </label>
        )}
      </>
    );
  };

  return (
    <div className="action-editor-form">
      <h3>{initialAction ? 'Edit Action' : 'Create New Action'}</h3>
      <label>Action Name:
        <input type="text" value={action.name || ''} onChange={(e) => handleInputChange('name', e.target.value)}/>
      </label>
      <label>Trigger Type:
        <select value={currentTriggerType} onChange={(e) => handleInputChange('trigger.type', e.target.value)}>
          <option value="ui_button">UI Button</option>
          <option value="ui_thumbnail_click">UI Thumbnail Click</option>
        </select>
      </label>
      
      {renderUITriggerFields()}

      <h4>Operations</h4>
      <label>
        <input
          type="checkbox"
          checked={useMultipleOperations}
          onChange={(e) => {
            setUseMultipleOperations(e.target.checked);
            if (e.target.checked && action.operation) {
              // Convert single operation to operations array
              setAction(prev => ({ ...prev, operations: [prev.operation!], operation: undefined }));
            } else if (!e.target.checked && action.operations && action.operations.length > 0) {
              // Convert back to single operation (use first one)
              setAction(prev => ({ ...prev, operation: prev.operations![0], operations: undefined }));
            }
          }}
        />
        ✨ Use Multiple Operations (one button → many actions!)
      </label>

      {!useMultipleOperations && (
        <>
          <label>Operation Type:
            <select value={currentOperationType} onChange={handleOperationTypeChange}>
              <option value="call_ha_service">Call HA Service</option>
              <option value="update_inventree_parameter">Update InvenTree Parameter</option>
              <option value="adjust_stock">🚌 Adjust Stock</option>
              <option value="dispatch_redux_action">Dispatch Redux Action</option>
              <option value="trigger_conditional_logic">Trigger Conditional Logic</option>
            </select>
          </label>

          {renderOperationFields()}
        </>
      )}

      {useMultipleOperations && (
        <MultipleOperationsEditor
          operations={action.operations || [getDefaultCallHAServiceOperation()]}
          onChange={(ops) => setAction(prev => ({ ...prev, operations: ops, operation: undefined }))}
          renderOperationFields={(operation, index, onChange) => renderOperationFieldsFor(operation, onChange)}
        />
      )}

      <h4>Advanced</h4>
      <label>
        <input type="checkbox" checked={isConfirmationEnabled} onChange={(e) => setIsConfirmationEnabled(e.target.checked)}/>
        Require Confirmation
      </label>
      {isConfirmationEnabled && (
        <label>Confirmation Text Template:
          <input type="text" value={action.confirmation?.textTemplate || ''} onChange={(e) => handleInputChange('confirmation.textTemplate', e.target.value)}/>
        </label>
      )}
      <label>Enable/Disable Condition ID:
        <input type="text" value={action.isEnabledExpressionId || ''} onChange={(e) => handleInputChange('isEnabledExpressionId', e.target.value)}/>
      </label>
      <label>Post-Evaluation Logic IDs (comma-separated):
        <input type="text" value={postEvaluationLogicIdsString} onChange={(e) => setPostEvaluationLogicIdsString(e.target.value)}/>
      </label>

      <div className="form-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel} className="cancel-button">Cancel</button>
      </div>
    </div>
  );
};

export default ActionEditorForm; 