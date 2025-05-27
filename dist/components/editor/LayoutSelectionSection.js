import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const ALL_VIEW_TYPES = ['detail', 'grid', 'list', 'parts', 'variants', 'base', 'debug', 'custom'];
const LayoutSelectionSection = ({ viewType = 'detail', // Default view type
layoutOptions = {}, onLayoutConfigChanged, }) => {
    const handleViewTypeChange = useCallback((event) => {
        const newViewType = event.target.value;
        // When view type changes, we might want to reset or adjust layoutOptions
        // For now, just pass the current layoutOptions, or an empty object if it makes sense
        const newOptionsForViewType = {}; // Or some default based on newViewType
        onLayoutConfigChanged(newViewType, newOptionsForViewType);
        logger.log('Editor:LayoutSection', `View type changed to: ${newViewType}`);
    }, [onLayoutConfigChanged]); // Removed layoutOptions from dependency array for reset behavior
    const handleLayoutOptionChange = useCallback((event) => {
        const { name, value } = event.target;
        let processedValue = undefined;
        if (value === '') {
            processedValue = undefined; // Explicitly set to undefined if input is cleared
        }
        else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                processedValue = numValue;
            }
            // If still NaN (e.g., invalid characters), it remains undefined, or you could add error handling
        }
        const newLayoutOptions = Object.assign(Object.assign({}, layoutOptions), { [name]: processedValue });
        // Filter out undefined values before calling back, if desired by parent
        // Or allow undefined to signify deletion/reset of an option
        const cleanedLayoutOptions = Object.entries(newLayoutOptions).reduce((acc, [key, val]) => {
            if (val !== undefined) {
                acc[key] = val; // Cast val to number as undefined is filtered
            }
            return acc;
        }, {});
        onLayoutConfigChanged(viewType, cleanedLayoutOptions); // Send cleaned options
        logger.log('Editor:LayoutSection', `Layout option changed: ${name} = ${processedValue}`, { newLayoutOptions: cleanedLayoutOptions });
    }, [viewType, layoutOptions, onLayoutConfigChanged]);
    const renderGridOptions = () => {
        if (viewType === 'grid') {
            return (_jsxs("div", { className: "grid-options", style: { marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }, children: [_jsx("h5", { style: { marginBottom: '8px' }, children: "Grid Layout Options:" }), _jsxs("div", { className: "config-item", style: { marginBottom: '8px' }, children: [_jsx("label", { htmlFor: "layout_columns", children: "Columns:" }), _jsx("input", { type: "number", id: "layout_columns", name: "columns", value: layoutOptions.columns === undefined ? '' : layoutOptions.columns, onChange: handleLayoutOptionChange, min: "1", max: "6", style: { width: '60px', marginLeft: '8px', padding: '6px' } })] }), _jsxs("div", { className: "config-item", style: { marginBottom: '8px' }, children: [_jsx("label", { htmlFor: "layout_grid_spacing", children: "Grid Spacing (px):" }), _jsx("input", { type: "number", id: "layout_grid_spacing", name: "grid_spacing", value: layoutOptions.grid_spacing === undefined ? '' : layoutOptions.grid_spacing, onChange: handleLayoutOptionChange, min: "0", max: "32", style: { width: '60px', marginLeft: '8px', padding: '6px' } })] }), _jsxs("div", { className: "config-item", style: { marginBottom: '8px' }, children: [_jsx("label", { htmlFor: "layout_item_height", children: "Item Height (px):" }), _jsx("input", { type: "number", id: "layout_item_height", name: "item_height", value: layoutOptions.item_height === undefined ? '' : layoutOptions.item_height, onChange: handleLayoutOptionChange, min: "50", max: "500", style: { width: '70px', marginLeft: '8px', padding: '6px' } })] })] }));
        }
        return null;
    };
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "Layout Configuration" }), _jsxs("div", { className: "config-item", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "view_type_select", children: "View Type:" }), _jsx("select", { id: "view_type_select", name: "view_type", value: viewType, onChange: handleViewTypeChange, style: { marginLeft: '8px', padding: '8px', minWidth: '150px' }, children: ALL_VIEW_TYPES.map(vt => (_jsxs("option", { value: vt, children: [vt.charAt(0).toUpperCase() + vt.slice(1), " "] }, vt))) })] }), renderGridOptions()] }));
};
export default LayoutSelectionSection;
//# sourceMappingURL=LayoutSelectionSection.js.map