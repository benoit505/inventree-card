import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
// Assuming InventreeCardConfig is not directly needed here, but types might be shared elsewhere
// import { InventreeCardConfig } from '../../types'; 
import HaEntityPickerWrapper from './HaEntityPickerWrapper'; // Updated path
import { Logger } from '../../utils/logger'; // Correct path
const logger = Logger.getInstance();
const HaEntitiesSection = ({ hass, selectedEntities, onEntitiesChanged, }) => {
    const handleAddEntity = useCallback((entityId) => {
        if (entityId && !selectedEntities.includes(entityId)) {
            const newEntities = [...selectedEntities, entityId];
            onEntitiesChanged(newEntities);
            logger.log('Editor:HaEntities', `Added HA entity: ${entityId}`, { newEntities });
        }
    }, [selectedEntities, onEntitiesChanged]);
    const handleRemoveEntity = useCallback((entityIdToRemove) => {
        const newEntities = selectedEntities.filter(id => id !== entityIdToRemove);
        onEntitiesChanged(newEntities);
        logger.log('Editor:HaEntities', `Removed HA entity: ${entityIdToRemove}`, { newEntities });
    }, [selectedEntities, onEntitiesChanged]);
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "Home Assistant Entities (Other)" }), _jsx("div", { className: "helper-text", children: "Select any Home Assistant entities whose states or attributes you want to use in conditional logic." }), _jsx(HaEntityPickerWrapper, { hass: hass, label: "Add Home Assistant Entity", onValueChanged: handleAddEntity, 
                // No includeDomains filter by default, to allow any entity type
                // includeDomains={["sensor", "binary_sensor", "switch", "light"]} // Example if filtering is desired
                value: '', allowCustomEntity: true }), selectedEntities.length > 0 && (_jsxs("div", { className: "selected-entities-list", style: { marginTop: '16px' }, children: [_jsx("h5", { children: "Selected Entities:" }), selectedEntities.map(entityId => {
                        var _a;
                        return (_jsxs("div", { className: "selected-entity-item", style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 0',
                                borderBottom: '1px solid var(--divider-color)'
                            }, children: [_jsx("span", { children: ((_a = hass.states[entityId]) === null || _a === void 0 ? void 0 : _a.attributes.friendly_name) || entityId }), _jsx("button", { onClick: () => handleRemoveEntity(entityId), style: { color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer' }, children: "Remove" })] }, entityId));
                    })] }))] }));
};
export default HaEntitiesSection;
//# sourceMappingURL=HaEntitiesSection.js.map