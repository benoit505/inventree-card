import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const InventreeParametersSection = ({ hass, selectedParameters, onParametersChanged, }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);
    const validateParameterString = (paramStr) => {
        const parts = paramStr.split(':');
        if (parts.length !== 3)
            return false;
        if (parts[0].toLowerCase() !== 'part')
            return false;
        if (isNaN(parseInt(parts[1], 10)))
            return false;
        if (!parts[2] || parts[2].trim() === '')
            return false; // Parameter name should not be empty
        return true;
    };
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        if (error)
            setError(null);
    };
    const handleAddParameters = useCallback(() => {
        if (!inputValue.trim())
            return;
        const paramStrings = inputValue.split(',').map(s => s.trim()).filter(s => s !== '');
        const newParamsToAdd = [];
        let foundInvalid = false;
        for (const paramStr of paramStrings) {
            if (!validateParameterString(paramStr)) {
                foundInvalid = true;
                break;
            }
            if (!selectedParameters.includes(paramStr) && !newParamsToAdd.includes(paramStr)) {
                newParamsToAdd.push(paramStr);
            }
        }
        if (foundInvalid) {
            setError('Invalid format: Use comma-separated strings like \'part:ID:PARAM_NAME\' (e.g., part:123:color, part:456:size).');
            return;
        }
        if (newParamsToAdd.length > 0) {
            const combinedParams = [...selectedParameters, ...newParamsToAdd].sort(); // Keep sorted
            onParametersChanged(combinedParams);
            logger.log('Editor:InventreeParams', `Added InvenTree Parameters: ${newParamsToAdd.join(', ')}`, { newParams: combinedParams });
        }
        setInputValue('');
        setError(null);
    }, [inputValue, selectedParameters, onParametersChanged]);
    const handleRemoveParameter = useCallback((paramToRemove) => {
        const newParams = selectedParameters.filter(param => param !== paramToRemove);
        onParametersChanged(newParams);
        logger.log('Editor:InventreeParams', `Removed InvenTree Parameter: ${paramToRemove}`, { newParams });
    }, [selectedParameters, onParametersChanged]);
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "InvenTree Parameters (Direct API)" }), _jsxs("div", { className: "helper-text", children: ["Enter comma-separated parameter strings in the format ", _jsx("code", { children: "part:ID:PARAMETER_NAME" }), ". These will be fetched directly via the InvenTree API."] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: "e.g., part:145:microwavables, part:101:length_cm", style: { flexGrow: 1, padding: '8px', border: error ? '1px solid red' : '1px solid var(--divider-color)' } }), _jsx("button", { onClick: handleAddParameters, style: { padding: '8px 12px' }, children: "Add Parameters" })] }), error && _jsx("div", { style: { color: 'red', fontSize: '0.9em', marginBottom: '8px' }, children: error }), selectedParameters.length > 0 && (_jsxs("div", { className: "selected-parameters-list", style: { marginTop: '16px' }, children: [_jsx("h5", { children: "Selected Parameters:" }), selectedParameters.map(param => (_jsxs("div", { className: "selected-parameter-item", style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                            borderBottom: '1px solid var(--divider-color)'
                        }, children: [_jsx("span", { children: param }), _jsx("button", { onClick: () => handleRemoveParameter(param), style: { color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer' }, children: "Remove" })] }, param)))] }))] }));
};
export default InventreeParametersSection;
//# sourceMappingURL=InventreeParametersSection.js.map