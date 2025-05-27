import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useSelector } from 'react-redux';
import { selectPartById } from '../../store/slices/partsSlice';
import { Logger } from '../../utils/logger';
// Import child React components
import PartThumbnail from './PartThumbnail';
import PartDetails from './PartDetails';
import PartButtons from './PartButtons';
const PartView = ({ partId, config, hass }) => {
    var _a, _b;
    const logger = React.useMemo(() => Logger.getInstance(), []);
    const partData = useSelector((state) => partId ? selectPartById(state, partId) : undefined);
    React.useEffect(() => {
        if (partData) {
            logger.log('PartView React', 'Received part data from Redux:', {
                partId: partData === null || partData === void 0 ? void 0 : partData.pk,
                partName: partData === null || partData === void 0 ? void 0 : partData.name,
                // partSource: partData?.source, // source might not be on InventreeItem
                hasPartData: !!partData,
            });
        }
    }, [partData, logger]);
    const getStockStatus = React.useCallback(() => {
        if (!partData || typeof partData.in_stock !== 'number')
            return 'none';
        if (partData.in_stock <= 0)
            return 'none';
        if (partData.minimum_stock && partData.in_stock <= partData.minimum_stock)
            return 'low';
        return 'good';
    }, [partData]);
    const getStockColor = React.useCallback((status) => {
        switch (status) {
            case 'none': return '#f44336'; // var(--error-color)
            case 'low': return '#ff9800'; // var(--warning-color)
            case 'good': return '#4caf50'; // var(--success-color)
            default: return 'transparent';
        }
    }, []);
    if (!partData || !config) {
        // logger.log('PartView React', 'Rendering null: No partData or config');
        return null; // Or a loading/error state
    }
    const display = config.display || {};
    const stockStatus = getStockStatus();
    const stockIndicatorColor = getStockColor(stockStatus);
    // Basic styles - these would ideally come from a shared theme or CSS modules
    const partContainerStyle = {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        borderRadius: '4px', // var(--ha-card-border-radius, 4px)
        background: 'white', // var(--ha-card-background, var(--card-background-color, white))
        // For the top border indicator:
        borderTop: display.show_stock_status_border ? `3px solid ${stockIndicatorColor}` : undefined,
    };
    const partNameStyle = {
        fontWeight: 'bold',
        fontSize: '1.1em',
    };
    const stockValueStyle = {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.9em',
        backgroundColor: ((_a = config.display) === null || _a === void 0 ? void 0 : _a.show_stock_status_colors) ? stockIndicatorColor : 'transparent',
        color: ((_b = config.display) === null || _b === void 0 ? void 0 : _b.show_stock_status_colors) ? 'white' : 'inherit',
    };
    const partContentStyle = {
        display: 'flex',
        // flexDirection: 'column', // Default, can be row if thumbnail is beside details
        gap: '0.5rem',
    };
    const detailsWrapperStyle = {
        flexGrow: 1,
    };
    // logger.log('PartView React', 'Rendering PartView for:', { partId: partData.pk, name: partData.name });
    return (_jsxs("div", { style: partContainerStyle, children: [display.show_header !== false && (_jsxs("div", { className: "part-header", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [display.show_name !== false && _jsx("div", { style: partNameStyle, children: partData.name }), display.show_stock !== false && (_jsxs("span", { style: stockValueStyle, children: [partData.in_stock, " ", partData.units || ''] }))] })), _jsxs("div", { style: partContentStyle, children: [display.show_image !== false && partData.thumbnail && (_jsx("div", { className: "part-thumbnail-wrapper", style: { width: '100px', height: '100px' /* Example size */ }, children: _jsx(PartThumbnail, { partData: partData, config: config, layout: "detail" }) })), _jsx("div", { style: detailsWrapperStyle, children: _jsx(PartDetails, { partId: partData.pk, config: config }) })] }), display.show_buttons !== false && (_jsx("div", { className: "part-buttons-wrapper", style: { marginTop: '0.5rem' }, children: _jsx(PartButtons, { partItem: partData, config: config, hass: hass }) }))] }));
};
export default PartView;
//# sourceMappingURL=PartView.js.map