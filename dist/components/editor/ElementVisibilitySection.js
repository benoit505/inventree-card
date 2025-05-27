import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
// Helper to create a more readable label from a camelCase key
const makeLabel = (key) => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};
const ElementVisibilitySection = ({ displayConfig = {}, // Default to empty object
onDisplayConfigChanged, }) => {
    const handleCheckboxChange = useCallback((event) => {
        const { name, checked } = event.target;
        const newDisplayConfig = Object.assign(Object.assign({}, displayConfig), { [name]: checked }); // Assert to full DisplayConfig after update
        onDisplayConfigChanged(newDisplayConfig);
        logger.log('Editor:VisibilitySection', `Display option changed: ${name} = ${checked}`, { newDisplayConfig });
    }, [displayConfig, onDisplayConfigChanged]);
    // Define which keys from DisplayConfig we want to expose as checkboxes.
    // This allows us to add new DisplayConfig options without them automatically appearing.
    const visibleFlags = [
        'show_header',
        'show_image',
        'show_name',
        'show_stock',
        'show_description',
        'show_category',
        'show_ipn',
        'show_location',
        'show_supplier',
        'show_manufacturer',
        'show_notes',
        'show_buttons',
        'show_parameters',
        'show_stock_status_border',
        'show_stock_status_colors',
        'show_related_parts',
        'show_part_details_component',
        // Variant specific (can be conditionally shown if needed based on view_type elsewhere)
        'show_stock_status_border_for_templates',
        'show_buttons_for_variants',
        'show_part_details_component_for_variants',
        'show_image_for_variants',
        'show_stock_for_variants',
        'show_name_for_variants',
    ];
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "Element Visibility" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }, children: visibleFlags.map(key => (_jsx("div", { className: "config-item", children: _jsxs("label", { htmlFor: `display_${key}`, style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", id: `display_${key}`, name: key, checked: !!displayConfig[key], onChange: handleCheckboxChange, style: { marginRight: '8px' } }), makeLabel(key).replace(/^Show /, ''), " "] }) }, key))) })] }));
};
export default ElementVisibilitySection;
//# sourceMappingURL=ElementVisibilitySection.js.map