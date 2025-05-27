import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { selectConditionalEffectForPart } from '../../store/slices/parametersSlice';
import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';
// Helper functions (can be co-located or imported if used elsewhere)
const getGridItemContainerStyle = (modifiers, config) => {
    const styles = {
        border: '1px solid #eee', // Default border
        padding: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        height: (config === null || config === void 0 ? void 0 : config.item_height) ? `${config.item_height}px` : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    };
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.highlight)
        styles.backgroundColor = modifiers.highlight;
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.border)
        styles.border = modifiers.border; // Directly use the border string
    return styles;
};
const getGridItemTextStyle = (modifiers) => {
    if (!modifiers || !modifiers.textColor)
        return {};
    return { color: modifiers.textColor };
};
const GridItem = ({ part, config, hass, isCurrentlyLocating, parameterActions, handleLocateGridItem, handleParameterActionClick, }) => {
    const partId = part.pk;
    const visualModifiers = useSelector((state) => selectConditionalEffectForPart(state, partId));
    const displayConfig = config.display || {};
    const actualModifiers = visualModifiers || {};
    const itemContainerStyle = getGridItemContainerStyle(actualModifiers, config);
    const itemTextStyle = getGridItemTextStyle(actualModifiers);
    const itemClasses = [
        'part-container',
        isCurrentlyLocating ? 'locating' : '',
        (actualModifiers === null || actualModifiers === void 0 ? void 0 : actualModifiers.priority) ? `priority-${actualModifiers.priority}` : ''
    ].filter(Boolean).join(' ');
    if (actualModifiers.isVisible === false) {
        return null;
    }
    return (_jsxs("div", { className: itemClasses, style: itemContainerStyle, onClick: () => handleLocateGridItem(partId), children: [displayConfig.show_image && (_jsx("div", { className: "part-thumbnail", style: { marginBottom: '8px' }, children: _jsx(PartThumbnail, { partData: part, config: config, layout: "grid", icon: actualModifiers === null || actualModifiers === void 0 ? void 0 : actualModifiers.icon, badge: actualModifiers === null || actualModifiers === void 0 ? void 0 : actualModifiers.badge }) })), _jsxs("div", { className: "part-info", style: Object.assign(Object.assign({}, itemTextStyle), { flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }), children: [displayConfig.show_name && _jsx("div", { className: "part-name", style: { fontWeight: 'bold' }, children: part.name }), displayConfig.show_stock && (_jsxs("div", { className: "part-stock", children: ["Stock: ", part.in_stock, " ", part.units || ''] })), displayConfig.show_description && part.description && (_jsx("p", { className: "part-description", style: { fontSize: '0.8em', margin: '4px 0' }, children: part.description }))] }), _jsxs("div", { className: "part-actions-footer", style: { marginTop: 'auto' }, children: [displayConfig.show_buttons && hass && config && (_jsx("div", { style: { fontSize: 'small', color: 'gray', padding: '4px 0' }, children: _jsx(PartButtons, { partItem: part, config: config, hass: hass }) })), parameterActions.length > 0 && (_jsx("div", { className: "action-buttons", style: { display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }, children: parameterActions.map((action) => (_jsx("button", { className: "param-action-button", onClick: (e) => { e.stopPropagation(); handleParameterActionClick(partId, action); }, title: action.label, style: { fontSize: '0.75em', padding: '2px 5px' }, children: action.icon ? _jsxs("span", { children: ["(", action.icon, ")"] }) : action.label }, `${partId}-${action.label}`))) }))] }), isCurrentlyLocating && _jsx("div", { className: "locating-indicator", children: "Locating..." })] }, partId));
};
export default GridItem;
//# sourceMappingURL=GridItem.js.map