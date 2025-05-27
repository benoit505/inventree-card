import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import HaEntityPickerWrapper from './HaEntityPickerWrapper'; // Updated path
import { Logger } from '../../utils/logger'; // Adjusted path
const logger = Logger.getInstance();
const InventreeHassSensorsSection = ({ hass, selectedSensors, onSensorsChanged, }) => {
    const handleAddSensor = useCallback((entityId) => {
        if (entityId && !selectedSensors.includes(entityId)) {
            const newSensors = [...selectedSensors, entityId];
            onSensorsChanged(newSensors);
            logger.log('Editor:HassSensors', `Added InvenTree HASS sensor: ${entityId}`, { newSensors });
        }
    }, [selectedSensors, onSensorsChanged]);
    const handleRemoveSensor = useCallback((entityIdToRemove) => {
        const newSensors = selectedSensors.filter(id => id !== entityIdToRemove);
        onSensorsChanged(newSensors);
        logger.log('Editor:HassSensors', `Removed InvenTree HASS sensor: ${entityIdToRemove}`, { newSensors });
    }, [selectedSensors, onSensorsChanged]);
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "InvenTree HASS Sensors" }), _jsx("div", { className: "helper-text", children: "Select Home Assistant sensor entities that represent InvenTree parts or provide InvenTree-related data." }), _jsx(HaEntityPickerWrapper, { hass: hass, label: "Add InvenTree Sensor Entity", onValueChanged: handleAddSensor, includeDomains: ["sensor"], 
                // We might want to filter further based on attributes if possible, or provide a hint
                value: '', allowCustomEntity: false }), selectedSensors.length > 0 && (_jsxs("div", { className: "selected-entities-list", style: { marginTop: '16px' }, children: [_jsx("h5", { children: "Selected Sensors:" }), selectedSensors.map(entityId => {
                        var _a;
                        return (_jsxs("div", { className: "selected-entity-item", style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 0',
                                borderBottom: '1px solid var(--divider-color)'
                            }, children: [_jsx("span", { children: ((_a = hass.states[entityId]) === null || _a === void 0 ? void 0 : _a.attributes.friendly_name) || entityId }), _jsx("button", { onClick: () => handleRemoveSensor(entityId), style: { color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer' }, children: "Remove" })] }, entityId));
                    })] }))] }));
};
export default InventreeHassSensorsSection;
//# sourceMappingURL=InventreeHassSensorsSection.js.map