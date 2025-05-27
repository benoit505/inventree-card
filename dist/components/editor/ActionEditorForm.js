import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Logger } from '../../utils/logger';
import HaEntityPickerWrapper from './HaEntityPickerWrapper'; // Import HaEntityPickerWrapper
import HaIconPickerWrapper from './HaIconPickerWrapper'; // Import HaIconPickerWrapper
const logger = Logger.getInstance();
const ACTION_TYPES = ['ha-service', 'navigate', 'internal-function'];
const ActionEditorForm = ({ hass, // Now required
initialAction, onSave, onCancel, }) => {
    const [action, setAction] = useState(initialAction || {
        label: '',
        type: 'ha-service',
        icon: '',
        confirmation: false,
        service_data: {},
    });
    const [serviceDataString, setServiceDataString] = useState('');
    useEffect(() => {
        if (initialAction) {
            setAction(initialAction);
            setServiceDataString(typeof initialAction.service_data === 'object' ? JSON.stringify(initialAction.service_data, null, 2) : initialAction.service_data || '');
        }
        else {
            const defaultAction = { label: '', type: 'ha-service', icon: '', confirmation: false, service_data: {} };
            setAction(defaultAction);
            setServiceDataString('{}');
        }
    }, [initialAction]);
    const handleChange = useCallback((event) => {
        const { name, value, type } = event.target;
        const isCheckbox = type === 'checkbox';
        setAction(prevAction => (Object.assign(Object.assign({}, prevAction), { [name]: isCheckbox ? event.target.checked : value })));
    }, []);
    const handleIconChange = useCallback((newIcon) => {
        setAction(prevAction => (Object.assign(Object.assign({}, prevAction), { icon: newIcon })));
    }, []);
    const handleTargetEntityChange = useCallback((newEntityId) => {
        setAction(prevAction => (Object.assign(Object.assign({}, prevAction), { target_entity_id: newEntityId })));
    }, []);
    const handleServiceDataChange = useCallback((event) => {
        setServiceDataString(event.target.value);
    }, []);
    const handleSave = useCallback(() => {
        if (!action.label) {
            alert('Action label is required.');
            return;
        }
        let finalAction = Object.assign({}, action);
        if (action.type === 'ha-service') {
            try {
                finalAction.service_data = serviceDataString ? JSON.parse(serviceDataString) : {};
            }
            catch (e) {
                logger.error('Editor:ActionForm', 'Invalid JSON in service_data', { serviceDataString, error: e });
                alert('Invalid JSON in Service Data. Please correct it.');
                return;
            }
        }
        onSave(finalAction);
    }, [action, onSave, serviceDataString]);
    return (_jsxs("div", { className: "action-editor-form", style: { padding: '16px', background: '#f9f9f9', borderRadius: '8px' }, children: [_jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-label", style: { display: 'block', marginBottom: '4px' }, children: "Label*:" }), _jsx("input", { type: "text", id: "action-label", name: "label", value: action.label || '', onChange: handleChange, required: true, style: { width: '100%', padding: '8px', boxSizing: 'border-box' } })] }), _jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-icon", style: { display: 'block', marginBottom: '4px' }, children: "Icon:" }), _jsx(HaIconPickerWrapper, { hass: hass, value: action.icon || '', onValueChanged: handleIconChange })] }), _jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-type", style: { display: 'block', marginBottom: '4px' }, children: "Action Type:" }), _jsx("select", { id: "action-type", name: "type", value: action.type || 'ha-service', onChange: handleChange, style: { width: '100%', padding: '8px' }, children: ACTION_TYPES.map(typeOpt => (_jsx("option", { value: typeOpt, children: typeOpt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }, typeOpt))) })] }), action.type === 'ha-service' && (_jsxs("div", { className: "service-fields", style: { border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }, children: [_jsx("h4", { children: "HA Service Details" }), _jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-service", style: { display: 'block', marginBottom: '4px' }, children: "Service Call*:" }), _jsx("input", { type: "text", id: "action-service", name: "service", value: action.service || '', onChange: handleChange, placeholder: "e.g., light.turn_on", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } })] }), _jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-target_entity_id", style: { display: 'block', marginBottom: '4px' }, children: "Target Entity ID:" }), _jsx(HaEntityPickerWrapper, { hass: hass, value: action.target_entity_id || '', onValueChanged: handleTargetEntityChange })] }), _jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-service_data", style: { display: 'block', marginBottom: '4px' }, children: "Service Data (JSON):" }), _jsx("textarea", { id: "action-service_data", name: "service_data", value: serviceDataString, onChange: handleServiceDataChange, placeholder: '{ "brightness_pct": 50 }', rows: 4, style: { width: '100%', padding: '8px', boxSizing: 'border-box' } }), _jsx("small", { children: "Enter as JSON. Will be parsed when saving." })] })] })), action.type === 'navigate' && (_jsxs("div", { className: "navigate-fields", style: { border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }, children: [_jsx("h4", { children: "Navigation Details" }), _jsxs("div", { className: "form-field", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-navigation_path", style: { display: 'block', marginBottom: '4px' }, children: "Navigation Path*:" }), _jsx("input", { type: "text", id: "action-navigation_path", name: "navigation_path", value: action.navigation_path || '', onChange: handleChange, placeholder: "e.g., /lovelace/my-view", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } })] })] })), action.type === 'internal-function' && (_jsxs("div", { className: "internal-fn-fields", style: { border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px' }, children: [_jsx("h4", { children: "Internal Function Details (Future)" }), _jsx("p", { children: "Configuration for internal card functions will go here." })] })), _jsxs("div", { className: "form-field", style: { marginTop: '16px', display: 'flex', alignItems: 'center' }, children: [_jsx("input", { type: "checkbox", id: "action-confirmation", name: "confirmation", checked: action.confirmation || false, onChange: handleChange, style: { marginRight: '8px' } }), _jsx("label", { htmlFor: "action-confirmation", children: "Require Confirmation" })] }), action.confirmation && (_jsxs("div", { className: "form-field", style: { marginTop: '8px', marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "action-confirmation_text", style: { display: 'block', marginBottom: '4px' }, children: "Confirmation Text:" }), _jsx("input", { type: "text", id: "action-confirmation_text", name: "confirmation_text", value: action.confirmation_text || '', onChange: handleChange, placeholder: "Are you sure?", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } })] })), _jsxs("div", { className: "form-buttons", style: { marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }, children: [_jsx("button", { type: "button", onClick: onCancel, style: { marginRight: '10px', padding: '8px 16px' }, children: "Cancel" }), _jsx("button", { type: "button", onClick: handleSave, style: { padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none' }, children: "Save Action" })] })] }));
};
export default ActionEditorForm;
//# sourceMappingURL=ActionEditorForm.js.map