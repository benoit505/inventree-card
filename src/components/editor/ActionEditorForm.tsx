import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import {
  ActionDefinition,
  ActionOperationType,
  ActionTriggerUIType,
  ActionUITriggerConfig,
  ActionCallHAServiceOperation,
  ActionUpdateInvenTreeParameterOperation,
  ActionDispatchReduxActionOperation,
  ActionTriggerConditionalLogicOperation,
  ActionHAStandardTarget,
  ActionDirectEntityTarget,
  ActionStandardObjectTarget
} from '../../types';
import CustomEntityPicker from './CustomEntityPicker';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

// Default initializers (ensure they align with new target types if applicable)
const getDefaultUiTriggerConfig = (): ActionUITriggerConfig => ({
  labelTemplate: '',
  icon: undefined,
  placement: 'part_footer',
});

const getDefaultCallHAServiceOperation = (): ActionCallHAServiceOperation => ({
  service: '',
  target: undefined,
  dataTemplate: {},
});

const getDefaultUpdateInvenTreeParameterOperation = (): ActionUpdateInvenTreeParameterOperation => ({
  partIdContext: 'current',
  parameterName: '',
  valueTemplate: '',
});

const getDefaultDispatchReduxActionOperation = (): ActionDispatchReduxActionOperation => ({
  actionType: '',
  payloadTemplate: {},
});

const getDefaultTriggerConditionalLogicOperation = (): ActionTriggerConditionalLogicOperation => ({
  logicIdToTrigger: '',
});

const getDefaultActionDefinition = (): Partial<ActionDefinition> => ({
  name: '',
  trigger: {
    type: 'ui_button',
    ui: getDefaultUiTriggerConfig(),
  },
  operation: {
    type: 'call_ha_service',
    callHAService: getDefaultCallHAServiceOperation(),
  },
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
  const [action, setAction] = useState<Partial<ActionDefinition>>(getDefaultActionDefinition());
  const [currentOperationType, setCurrentOperationType] = useState<ActionOperationType>('call_ha_service');
  const [currentTriggerType, setCurrentTriggerType] = useState<ActionTriggerUIType>('ui_button');

  const [serviceDataString, setServiceDataString] = useState<string>('{}');
  const [reduxPayloadString, setReduxPayloadString] = useState<string>('{}');
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isConfirmationEnabled, setIsConfirmationEnabled] = useState<boolean>(false);
  const [isTargetEntityEnabled, setIsTargetEntityEnabled] = useState<boolean>(false);

  const [postEvaluationLogicIdsString, setPostEvaluationLogicIdsString] = useState<string>('');

  React.useEffect(() => {
    const defaults = getDefaultActionDefinition();
    let effectiveInitial = initialAction ? JSON.parse(JSON.stringify(initialAction)) : null;

    if (effectiveInitial) {
      effectiveInitial.trigger = effectiveInitial.trigger || { type: 'ui_button', ui: getDefaultUiTriggerConfig() };
      effectiveInitial.trigger.ui = effectiveInitial.trigger.ui || getDefaultUiTriggerConfig();
      effectiveInitial.operation = effectiveInitial.operation || { type: 'call_ha_service', callHAService: getDefaultCallHAServiceOperation() };
      
      const triggerType = effectiveInitial.trigger.type || 'ui_button';
      setCurrentTriggerType(triggerType as ActionTriggerUIType);

      const opType = effectiveInitial.operation.type || 'call_ha_service';
      setCurrentOperationType(opType);

      if (opType === 'call_ha_service' && !effectiveInitial.operation.callHAService) {
        effectiveInitial.operation.callHAService = getDefaultCallHAServiceOperation();
      } else if (opType === 'update_inventree_parameter' && !effectiveInitial.operation.updateInvenTreeParameter) {
        effectiveInitial.operation.updateInvenTreeParameter = getDefaultUpdateInvenTreeParameterOperation();
      } else if (opType === 'dispatch_redux_action' && !effectiveInitial.operation.dispatchReduxAction) {
        effectiveInitial.operation.dispatchReduxAction = getDefaultDispatchReduxActionOperation();
      } else if (opType === 'trigger_conditional_logic' && !effectiveInitial.operation.triggerConditionalLogic) {
        effectiveInitial.operation.triggerConditionalLogic = getDefaultTriggerConditionalLogicOperation();
      }
      
      if (effectiveInitial.operation?.callHAService) {
        const currentTarget = effectiveInitial.operation.callHAService.target;
        let migratedTarget: ActionDirectEntityTarget | ActionStandardObjectTarget | undefined = undefined;

        if (typeof currentTarget === 'string') {
          migratedTarget = { type: 'direct_entity', entity_id: currentTarget };
          logger.warn("ActionEditorForm", "Migrating legacy string target to ActionDirectEntityTarget (likely should be standard_object_target). Review configuration.", { currentTarget });
          if (currentTarget.trim()) {
            setIsTargetEntityEnabled(true);
          } else {
            setIsTargetEntityEnabled(false);
          }
        } else if (currentTarget && !('type' in currentTarget) && ('entity_id' in currentTarget || 'device_id' in currentTarget || 'area_id' in currentTarget )) {
          migratedTarget = { type: 'standard_object_target', target_details: currentTarget as ActionHAStandardTarget };
           if ((currentTarget as ActionHAStandardTarget).entity_id) {
            setIsTargetEntityEnabled(true);
          } else {
            setIsTargetEntityEnabled(false);
          }
        } else if (currentTarget && ('type' in currentTarget)) {
            migratedTarget = currentTarget as ActionDirectEntityTarget | ActionStandardObjectTarget;
            if (migratedTarget.type === 'standard_object_target' && migratedTarget.target_details.entity_id) {
                setIsTargetEntityEnabled(true);
            } else {
                setIsTargetEntityEnabled(false);
            }
        } else {
            setIsTargetEntityEnabled(false);
        }
        
        effectiveInitial.operation.callHAService.target = migratedTarget;

        const sds = effectiveInitial.operation.callHAService.dataTemplate;
        setServiceDataString(sds && typeof sds === 'object' ? JSON.stringify(sds, null, 2) : (typeof sds === 'string' ? sds : '{}'));
      } else if (opType === 'call_ha_service') {
        effectiveInitial.operation.callHAService = getDefaultCallHAServiceOperation();
        setServiceDataString('{}');
        setIsTargetEntityEnabled(false);
      } else {
        setServiceDataString('{}');
        setIsTargetEntityEnabled(false);
      }

      if (effectiveInitial.operation?.dispatchReduxAction) {
        const rps = effectiveInitial.operation.dispatchReduxAction.payloadTemplate;
        setReduxPayloadString(rps && typeof rps === 'object' ? JSON.stringify(rps, null, 2) : (typeof rps === 'string' ? rps : '{}'));
      } else {
        setReduxPayloadString('{}');
      }
      
      setAction({ ...defaults, ...effectiveInitial });
      
      if (effectiveInitial.confirmation) {
        setIsConfirmationEnabled(true);
        setConfirmationText(effectiveInitial.confirmation.textTemplate || '');
      } else {
        setIsConfirmationEnabled(false);
        setConfirmationText('');
      }

      if (effectiveInitial?.isEnabledExpressionId) {
        handleInputChange('isEnabledExpressionId', effectiveInitial.isEnabledExpressionId);
      } else if (defaults.isEnabledExpressionId !== undefined) {
        handleInputChange('isEnabledExpressionId', defaults.isEnabledExpressionId);
      } else {
        handleInputChange('isEnabledExpressionId', '');
      }

      if (effectiveInitial?.postEvaluationLogicIds && Array.isArray(effectiveInitial.postEvaluationLogicIds)) {
        setPostEvaluationLogicIdsString(effectiveInitial.postEvaluationLogicIds.join(', '));
      } else {
        setPostEvaluationLogicIdsString('');
      }

      if (effectiveInitial?.trigger?.ui?.icon) {
        console.log('[ICON_TRACE] useEffect - Icon from effectiveInitial:', { icon: effectiveInitial.trigger.ui.icon });
      }
    } else {
      setAction(defaults);
      setCurrentOperationType(defaults.operation?.type || 'call_ha_service');
      setServiceDataString('{}');
      setReduxPayloadString('{}');
      setIsConfirmationEnabled(false);
      setConfirmationText('');
      setIsTargetEntityEnabled(false);
    }
  }, [initialAction]);

  const handleInputChange = useCallback((path: string, value: any) => {
    setAction(prevAction => {
      const keys = path.split('.');
      const newActionState = JSON.parse(JSON.stringify(prevAction)); 
      let currentLevel = newActionState;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!currentLevel[key]) {
          if (path === 'operation.callHAService.target.target_details.entity_id' && key === 'target' && i === keys.length - 3) {
            currentLevel[key] = { type: 'standard_object_target', target_details: {} };
          } else if (path === 'operation.callHAService.target.target_details.entity_id' && key === 'target_details' && i === keys.length - 2) {
             currentLevel[key] = {};
          }
          else {
            currentLevel[key] = {};
          }
        }
        currentLevel = currentLevel[key];
      }

      const lastKey = keys[keys.length - 1];
      if (path === 'operation.callHAService.target.target_details.entity_id' && value === '') {
        if(currentLevel[lastKey]) {
            currentLevel[lastKey] = undefined;
        } else if (newActionState.operation?.callHAService?.target?.type === 'standard_object_target' ) {
             if (newActionState.operation.callHAService.target.target_details) {
                newActionState.operation.callHAService.target.target_details.entity_id = undefined;
             }
        }
      } else {
        currentLevel[lastKey] = value;
      }

      return newActionState;
    });
  }, []);

  const handleOperationTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const newOpType = event.target.value as ActionOperationType;
    setCurrentOperationType(newOpType);
    setAction(prevAction => {
      let newOperationSpecifics = {};
      let targetEntityEnabledForNewOp = false;

      switch (newOpType) {
        case 'call_ha_service':
          const existingCallHAService = prevAction.operation?.callHAService || getDefaultCallHAServiceOperation();
          newOperationSpecifics = { callHAService: existingCallHAService };
          setServiceDataString(JSON.stringify(existingCallHAService.dataTemplate || {}, null, 2));
          if (existingCallHAService.target?.type === 'standard_object_target' && existingCallHAService.target.target_details.entity_id) {
            targetEntityEnabledForNewOp = true;
          }
          break;
        case 'update_inventree_parameter':
          newOperationSpecifics = { updateInvenTreeParameter: prevAction.operation?.updateInvenTreeParameter || getDefaultUpdateInvenTreeParameterOperation() };
          break;
        case 'dispatch_redux_action':
          newOperationSpecifics = { dispatchReduxAction: prevAction.operation?.dispatchReduxAction || getDefaultDispatchReduxActionOperation() };
          setReduxPayloadString(JSON.stringify(prevAction.operation?.dispatchReduxAction?.payloadTemplate || {}, null, 2));
          break;
        case 'trigger_conditional_logic':
          newOperationSpecifics = { triggerConditionalLogic: prevAction.operation?.triggerConditionalLogic || getDefaultTriggerConditionalLogicOperation() };
          break;
      }
      
      setIsTargetEntityEnabled(targetEntityEnabledForNewOp);
      
      return {
        ...prevAction,
        operation: {
          type: newOpType,
          ...newOperationSpecifics,
        }
      };
    });
  }, []);

  const handleTriggerTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const newTriggerType = event.target.value as ActionTriggerUIType;
    setCurrentTriggerType(newTriggerType);
    setAction(prevAction => {
      const updatedTrigger = {
        ...(prevAction.trigger || {}),
        type: newTriggerType,
        ui: prevAction.trigger?.ui || getDefaultUiTriggerConfig(),
      };
      return {
        ...prevAction,
        trigger: updatedTrigger,
      };
    });
  }, []);
  
  const handleConfirmationToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIsConfirmationEnabled(event.target.checked);
    if (!event.target.checked) {
      setConfirmationText('');
      setAction(prev => ({...prev, confirmation: undefined})); 
    }
  }, []);

  const handleServiceDataChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setServiceDataString(event.target.value);
  }, []);

  const handleReduxPayloadChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setReduxPayloadString(event.target.value);
  }, []);

  const handleConfirmationTextChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(event.target.value);
  }, []);

  const handleTargetEntityCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsTargetEntityEnabled(checked);
    if (!checked) {
      setAction(prevAction => {
        const newAction = { ...prevAction };
        if (newAction.operation?.callHAService) {
          newAction.operation.callHAService.target = undefined;
        }
        return newAction;
      });
    } else {
       setAction(prevAction => {
        const newAction = JSON.parse(JSON.stringify(prevAction));
        if (newAction.operation?.callHAService) {
            if (!newAction.operation.callHAService.target || newAction.operation.callHAService.target.type !== 'standard_object_target') {
                newAction.operation.callHAService.target = {
                    type: 'standard_object_target',
                    target_details: {} 
                };
            }
        } else if (newAction.operation?.type === 'call_ha_service') { 
             newAction.operation.callHAService = {
                service: prevAction.operation?.callHAService?.service || '', 
                target: { type: 'standard_object_target', target_details: {} },
                dataTemplate: prevAction.operation?.callHAService?.dataTemplate || {}
             }
        }
        return newAction;
      });
    }
  }, []);

  const handleSave = useCallback(() => {
    let dataObject: Record<string, any> | undefined;
    let payloadObject: Record<string, any> | undefined;

    // Basic validation
    if (!action.name) {
      alert("Action Name is required.");
      return;
    }

    // Trigger specific validation
    if (currentTriggerType === 'ui_button') {
      if (!action.trigger?.ui?.placement) {
        alert("Button Placement is required for UI Button trigger.");
        return;
      }
    }

    // Operation validation
    if (!action.operation?.type) {
      alert("Operation Type is required.");
      return;
    }

    let finalAction = JSON.parse(JSON.stringify(action)) as ActionDefinition;
    finalAction.operation = finalAction.operation || { type: currentOperationType };
    finalAction.operation.type = currentOperationType;


    if (currentOperationType === 'call_ha_service') {
      finalAction.operation.callHAService = finalAction.operation.callHAService || getDefaultCallHAServiceOperation();
      if (!finalAction.operation.callHAService.service?.trim()) {
        alert('Service Call is required for HA Service operation.');
        return;
      }
      
      if (isTargetEntityEnabled) {
        const currentTargetInState = finalAction.operation.callHAService.target;
        let pickerEntityId: string | undefined = undefined;

        if (currentTargetInState && currentTargetInState.type === 'standard_object_target') {
            pickerEntityId = currentTargetInState.target_details.entity_id;
        }

        if (pickerEntityId && pickerEntityId.trim() !== '') {
            finalAction.operation.callHAService.target = { 
                type: 'standard_object_target', 
                target_details: { entity_id: pickerEntityId } 
            };
        } else {
            finalAction.operation.callHAService.target = undefined; 
        }
      } else {
        finalAction.operation.callHAService.target = undefined;
      }

      try {
        finalAction.operation.callHAService.dataTemplate = serviceDataString.trim() ? JSON.parse(serviceDataString) : {};
      } catch (e) {
        alert('Invalid JSON in Service Data for HA Service.');
        return;
      }
    } else if (currentOperationType === 'update_inventree_parameter') {
      finalAction.operation.updateInvenTreeParameter = finalAction.operation.updateInvenTreeParameter || getDefaultUpdateInvenTreeParameterOperation();
      if (!finalAction.operation.updateInvenTreeParameter.partIdContext?.toString().trim()) {
        alert('Part ID Context is required for Update InvenTree Parameter operation.');
        return;
      }
      if (!finalAction.operation.updateInvenTreeParameter.parameterName?.trim()) {
        alert('Parameter Name is required for Update InvenTree Parameter operation.');
        return;
      }
    } else if (currentOperationType === 'dispatch_redux_action') {
      finalAction.operation.dispatchReduxAction = finalAction.operation.dispatchReduxAction || getDefaultDispatchReduxActionOperation();
      if (!finalAction.operation.dispatchReduxAction.actionType?.trim()) {
        alert('Action Type is required for Dispatch Redux Action operation.');
        return;
      }
      try {
        finalAction.operation.dispatchReduxAction.payloadTemplate = reduxPayloadString.trim() ? JSON.parse(reduxPayloadString) : {};
      } catch (e) {
        alert('Invalid JSON in Payload Template for Dispatch Redux Action.');
        return;
      }
    } else if (currentOperationType === 'trigger_conditional_logic') {
      finalAction.operation.triggerConditionalLogic = finalAction.operation.triggerConditionalLogic || getDefaultTriggerConditionalLogicOperation();
      if (!finalAction.operation.triggerConditionalLogic.logicIdToTrigger?.trim()) {
        alert('Logic ID to Trigger is required.');
        return;
      }
    }
    
    if (isConfirmationEnabled && confirmationText.trim()) {
      finalAction.confirmation = { textTemplate: confirmationText };
    } else {
      finalAction.confirmation = undefined;
    }
    
    if (postEvaluationLogicIdsString.trim()) {
      finalAction.postEvaluationLogicIds = postEvaluationLogicIdsString.split(',').map(id => id.trim()).filter(id => id);
    } else {
      finalAction.postEvaluationLogicIds = undefined;
    }

    console.log("[ICON_TRACE] Saving action (within handleSave, for context if icon issues persist during save):", { finalAction });
    onSave(finalAction as ActionDefinition);
  }, [action, onSave, serviceDataString, reduxPayloadString, isConfirmationEnabled, confirmationText, currentOperationType, currentTriggerType, postEvaluationLogicIdsString, isTargetEntityEnabled]);

  
  let currentTargetEntityIdForPicker: string | undefined = undefined;
  if (action.operation?.callHAService?.target?.type === 'standard_object_target') {
    currentTargetEntityIdForPicker = action.operation.callHAService.target.target_details.entity_id;
  }

  const formFieldStyle: React.CSSProperties = { marginBottom: '16px' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '4px', fontWeight: '500' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const smallTextStyle: React.CSSProperties = { fontSize: '0.8em', color: '#666', marginTop: '4px', display: 'block' };
  const textAreaStyle: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{initialAction ? 'Edit Action' : 'Add New Action'}</h3>

      {/* Action Name */}
      <div style={formFieldStyle}>
        <label style={labelStyle} htmlFor="actionName">Action Name</label>
        <input
          type="text"
          id="actionName"
          style={inputStyle}
          value={action.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., Turn On Light, Order More Stock"
        />
      </div>

      {/* Trigger Configuration */}
      <h4 style={{ marginBottom: '8px', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Trigger</h4>
      <div style={formFieldStyle}>
        <label style={labelStyle} htmlFor="triggerType">Trigger Type</label>
        <select 
            id="triggerType" 
            style={inputStyle} 
            value={currentTriggerType} 
            onChange={handleTriggerTypeChange}
        >
          <option value="ui_button">UI Button</option>
          <option value="ui_thumbnail_click">UI Thumbnail Click</option>
        </select>
      </div>
      {currentTriggerType === 'ui_button' && (
        <>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="buttonLabel">Button Label Template (Optional)</label>
            <input
              type="text"
              id="buttonLabel"
              style={inputStyle}
              value={action.trigger?.ui?.labelTemplate || ''}
              onChange={(e) => handleInputChange('trigger.ui.labelTemplate', e.target.value)}
              placeholder="e.g., Turn On, Print %%context.part.name%% Label"
            />
            <small style={smallTextStyle}>Templateable. E.g. `%%context.part.name%%`.</small>
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="buttonIcon">Button Icon (Optional)</label>
            <input
              type="text"
              id="buttonIcon"
              style={inputStyle}
              value={action.trigger?.ui?.icon || ''}
              onChange={(e) => handleInputChange('trigger.ui.icon', e.target.value)}
              placeholder="mdi:lightbulb"
            />
            <small style={smallTextStyle}>MDI Icon. E.g., `mdi:lightbulb`.</small>
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="buttonPlacement">Button Placement</label>
            <select
                id="buttonPlacement"
                style={inputStyle}
                value={action.trigger?.ui?.placement || 'part_footer'}
                onChange={(e) => handleInputChange('trigger.ui.placement', e.target.value as ActionUITriggerConfig['placement'])}
            >
                <option value="part_footer">Part Footer</option>
                <option value="global_header">Global Header</option>
            </select>
          </div>
        </>
      )}
      {currentTriggerType === 'ui_thumbnail_click' && (
        <div style={{ ...formFieldStyle, padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
           <p style={{ margin: 0, fontSize: '0.9em', color: '#333' }}>
            This action will be triggered when a part thumbnail is clicked. 
            No further UI configuration is typically needed for this trigger type here, but ensure the `placement` and `partIdContext` 
            are handled correctly by the components rendering the thumbnails if advanced control is desired.
           </p>
        </div>
      )}
      
      {/* Operation Configuration */}
      <h4 style={{ marginBottom: '8px', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Operation</h4>
      <div style={formFieldStyle}>
        <label style={labelStyle} htmlFor="operationType">Operation Type</label>
        <select 
            id="operationType" 
            style={inputStyle} 
            value={currentOperationType} 
            onChange={handleOperationTypeChange}
        >
          <option value="call_ha_service">Call Home Assistant Service</option>
          <option value="update_inventree_parameter">Update InvenTree Parameter</option>
          <option value="dispatch_redux_action">Dispatch Redux Action</option>
          <option value="trigger_conditional_logic">Trigger Conditional Logic</option>
        </select>
      </div>

      {currentOperationType === 'call_ha_service' && (
        <>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="serviceCall">Service Call</label>
            <input
              type="text"
              id="serviceCall"
              style={inputStyle}
              value={action.operation?.callHAService?.service || ''}
              onChange={(e) => handleInputChange('operation.callHAService.service', e.target.value)}
              placeholder="e.g., light.turn_on, script.my_script"
            />
            <small style={smallTextStyle}>Format: `domain.service`.</small>
          </div>
          <div style={formFieldStyle}> 
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={isTargetEntityEnabled}
                onChange={handleTargetEntityCheckboxChange}
                style={{ marginRight: '8px' }}
              />
              Set Target Entity ID
            </label>
          </div>

          {isTargetEntityEnabled && ( 
            <div style={formFieldStyle}>
              <label style={labelStyle} htmlFor="targetEntityId">Target Entity ID</label>
              <CustomEntityPicker
                  hass={hass}
                  value={currentTargetEntityIdForPicker}
                  label="Target Entity"
                  onValueChanged={(value: string | undefined) => handleInputChange('operation.callHAService.target.target_details.entity_id', value)}
              />
              <small style={smallTextStyle}>Templateable. E.g., `sensor.%%context.part.name%%_status` or `%%context.hassStates['input_select.my_selector'].state%%`.</small>
            </div>
          )}
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="serviceData">Service Data (JSON Template, Optional)</label>
            <textarea
              id="serviceData"
              style={textAreaStyle}
              value={serviceDataString}
              onChange={handleServiceDataChange}
              placeholder='{
  "brightness_pct": 80,
  "message": "Part %%context.part.name%% needs attention"
}'
            />
            <small style={smallTextStyle}>JSON object. Values can be templates.</small>
          </div>
        </>
      )}

      {currentOperationType === 'update_inventree_parameter' && (
        <>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="paramPartIdContext">Part ID Context</label>
            <input
              type="text"
              id="paramPartIdContext"
              style={inputStyle}
              value={action.operation?.updateInvenTreeParameter?.partIdContext || 'current'}
              onChange={(e) => handleInputChange('operation.updateInvenTreeParameter.partIdContext', e.target.value)}
              placeholder="e.g., current, 123, or %%context.anotherPart.pk%%"
            />
            <small style={smallTextStyle}>'current', a specific Part PK, or a template resolving to a PK.</small>
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="paramName">Parameter Name</label>
            <input
              type="text"
              id="paramName"
              style={inputStyle}
              value={action.operation?.updateInvenTreeParameter?.parameterName || ''}
              onChange={(e) => handleInputChange('operation.updateInvenTreeParameter.parameterName', e.target.value)}
              placeholder="e.g., Status, Location"
            />
            <small style={smallTextStyle}>The name of the InvenTree parameter to update.</small>
          </div>
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="paramValueTemplate">Value Template</label>
            <input
              type="text"
              id="paramValueTemplate"
              style={inputStyle}
              value={action.operation?.updateInvenTreeParameter?.valueTemplate || ''}
              onChange={(e) => handleInputChange('operation.updateInvenTreeParameter.valueTemplate', e.target.value)}
              placeholder="e.g., %%context.hassStates['input_text.new_status'].state%%"
            />
            <small style={smallTextStyle}>Templateable. The new value for the parameter.</small>
          </div>
        </>
      )}

      {currentOperationType === 'dispatch_redux_action' && (
        <>
            <div style={formFieldStyle}>
                <label style={labelStyle} htmlFor="reduxActionType">Redux Action Type</label>
                <input
                type="text"
                id="reduxActionType"
                style={inputStyle}
                value={action.operation?.dispatchReduxAction?.actionType || ''}
                onChange={(e) => handleInputChange('operation.dispatchReduxAction.actionType', e.target.value)}
                placeholder="e.g., parts/updatePartStock"
                />
                <small style={smallTextStyle}>The `type` string of the Redux action to dispatch.</small>
            </div>
            <div style={formFieldStyle}>
                <label style={labelStyle} htmlFor="reduxPayloadTemplate">Payload Template (JSON, Optional)</label>
                <textarea
                id="reduxPayloadTemplate"
                style={textAreaStyle}
                value={reduxPayloadString}
                onChange={handleReduxPayloadChange}
                placeholder={"{\n  \"partId\": \"%%context.part.pk%%\",\n  \"newStock\": \"%%context.hassStates['input_number.adjustment_amount'].state%%\"\n}"} 
                />
                <small style={smallTextStyle}>JSON object. Values can be templates. This will be the action's payload.</small>
            </div>
        </>
      )}

      {currentOperationType === 'trigger_conditional_logic' && (
          <div style={formFieldStyle}>
            <label style={labelStyle} htmlFor="logicIdToTrigger">Conditional Logic ID</label>
            <input
              type="text"
              id="logicIdToTrigger"
              style={inputStyle}
              value={action.operation?.triggerConditionalLogic?.logicIdToTrigger || ''}
              onChange={(e) => handleInputChange('operation.triggerConditionalLogic.logicIdToTrigger', e.target.value)}
              placeholder="Enter the ID of the ConditionalLogicItem"
            />
            <small style={smallTextStyle}>The unique ID of a defined Conditional Logic item to re-evaluate.</small>
          </div>
      )}


      {/* Other common action fields */}
      <h4 style={{ marginBottom: '8px', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Advanced Options</h4>
      <div style={formFieldStyle}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isConfirmationEnabled}
            onChange={handleConfirmationToggle}
            style={{ marginRight: '8px' }}
          />
          Require Confirmation
        </label>
        {isConfirmationEnabled && (
          <input
            type="text"
            style={{...inputStyle, marginTop: '4px'}}
            value={confirmationText}
            onChange={handleConfirmationTextChange}
            placeholder="Confirmation message (templateable)"
          />
        )}
      </div>

      <div style={formFieldStyle}>
        <label style={labelStyle} htmlFor="isEnabledExpressionId">Is Enabled Expression ID (Optional)</label>
        <input
          type="text"
          id="isEnabledExpressionId"
          style={inputStyle}
          value={action.isEnabledExpressionId || ''}
          onChange={(e) => handleInputChange('isEnabledExpressionId', e.target.value)}
          placeholder="ID of an expression from Expression Engine"
        />
        <small style={smallTextStyle}>If provided, the action is enabled only if this expression evaluates to true.</small>
      </div>

      <div style={formFieldStyle}>
        <label style={labelStyle} htmlFor="postEvaluationLogicIds">Post-Evaluation Logic IDs (Optional, Comma-separated)</label>
        <input
          type="text"
          id="postEvaluationLogicIds"
          style={inputStyle}
          value={postEvaluationLogicIdsString}
          onChange={(e) => setPostEvaluationLogicIdsString(e.target.value)}
          placeholder="logic_id_1, logic_id_2"
        />
        <small style={smallTextStyle}>Comma-separated IDs of Conditional Logic items to re-evaluate after this action executes.</small>
      </div>


      {/* Save/Cancel Buttons */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ marginRight: '8px' }}>Cancel</button>
        <button type="button" onClick={handleSave} style={{ fontWeight: 'bold' }}>Save Action</button>
      </div>
    </div>
  );
};

export default ActionEditorForm; 