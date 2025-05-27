import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Logger } from '../../utils/logger'; // Correct path
const logger = Logger.getInstance();
const InventreePkSection = ({ hass, selectedPks, onPksChanged, }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        if (error)
            setError(null); // Clear error on new input
    };
    const handleAddPks = useCallback(() => {
        if (!inputValue.trim())
            return; // Do nothing if input is empty or just whitespace
        const pkStrings = inputValue.split(',').map(s => s.trim()).filter(s => s !== '');
        const newPksToAdd = [];
        let foundInvalid = false;
        for (const pkStr of pkStrings) {
            const num = parseInt(pkStr, 10);
            if (isNaN(num)) {
                foundInvalid = true;
                break;
            }
            else {
                if (!selectedPks.includes(num) && !newPksToAdd.includes(num)) { // Avoid duplicates from input and existing
                    newPksToAdd.push(num);
                }
            }
        }
        if (foundInvalid) {
            setError('Invalid input: Please enter comma-separated numbers (e.g., 101, 102).');
            return;
        }
        if (newPksToAdd.length > 0) {
            const combinedPks = [...selectedPks, ...newPksToAdd].sort((a, b) => a - b); // Keep sorted
            onPksChanged(combinedPks);
            logger.log('Editor:InventreePk', `Added InvenTree PKs: ${newPksToAdd.join(', ')}`, { newPks: combinedPks });
        }
        setInputValue(''); // Clear input field
        setError(null);
    }, [inputValue, selectedPks, onPksChanged]);
    const handleRemovePk = useCallback((pkToRemove) => {
        const newPks = selectedPks.filter(pk => pk !== pkToRemove);
        onPksChanged(newPks);
        logger.log('Editor:InventreePk', `Removed InvenTree PK: ${pkToRemove}`, { newPks });
    }, [selectedPks, onPksChanged]);
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "By InvenTree Part PK" }), _jsx("div", { className: "helper-text", children: "Enter comma-separated InvenTree Part Primary Keys (PKs) to fetch their data directly via API." }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: "e.g., 101, 102, 145", style: { flexGrow: 1, padding: '8px', border: error ? '1px solid red' : '1px solid var(--divider-color)' } }), _jsx("button", { onClick: handleAddPks, style: { padding: '8px 12px' }, children: "Add PKs" })] }), error && _jsx("div", { style: { color: 'red', fontSize: '0.9em', marginBottom: '8px' }, children: error }), selectedPks.length > 0 && (_jsxs("div", { className: "selected-pks-list", style: { marginTop: '16px' }, children: [_jsx("h5", { children: "Selected Part PKs:" }), selectedPks.map(pk => (_jsxs("div", { className: "selected-pk-item", style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                            borderBottom: '1px solid var(--divider-color)'
                        }, children: [_jsxs("span", { children: ["Part PK: ", pk] }), _jsx("button", { onClick: () => handleRemovePk(pk), style: { color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer' }, children: "Remove" })] }, pk)))] }))] }));
};
export default InventreePkSection;
//# sourceMappingURL=InventreePkSection.js.map