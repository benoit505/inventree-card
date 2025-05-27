import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { CustomAction } from '../../types';
interface ActionEditorFormProps {
    hass: HomeAssistant;
    initialAction?: CustomAction;
    onSave: (action: CustomAction) => void;
    onCancel: () => void;
}
declare const ActionEditorForm: React.FC<ActionEditorFormProps>;
export default ActionEditorForm;
