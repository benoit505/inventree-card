import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { ActionDefinition } from '../../types';
interface ActionEditorFormProps {
    hass: HomeAssistant;
    initialAction?: ActionDefinition;
    onSave: (action: ActionDefinition) => void;
    onCancel: () => void;
}
declare const ActionEditorForm: React.FC<ActionEditorFormProps>;
export default ActionEditorForm;
