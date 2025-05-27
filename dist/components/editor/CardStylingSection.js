import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const CardStylingSection = ({ styleConfig = {}, onStyleConfigChanged, }) => {
    const handleInputChange = useCallback((event) => {
        const { name, value, type } = event.target;
        let processedValue = value;
        if (type === 'number') {
            if (value === '') {
                processedValue = undefined; // Allow clearing number inputs
            }
            else {
                const num = parseFloat(value);
                processedValue = isNaN(num) ? undefined : num; // Keep undefined if not a valid number
            }
        }
        const newStyleConfig = Object.assign(Object.assign({}, styleConfig), { [name]: processedValue });
        onStyleConfigChanged(newStyleConfig);
        logger.log('Editor:StylingSection', `Style option changed: ${name} = ${processedValue}`, { newStyleConfig });
    }, [styleConfig, onStyleConfigChanged]);
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "Overall Card Styling" }), _jsxs("div", { className: "config-grid", style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }, children: [_jsxs("div", { className: "config-item", children: [_jsx("label", { htmlFor: "style_background", children: "Background CSS:" }), _jsx("input", { type: "text", id: "style_background", name: "background", value: (styleConfig === null || styleConfig === void 0 ? void 0 : styleConfig.background) || '', onChange: handleInputChange, placeholder: "e.g., #f0f0f0, var(--ha-card-background)", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } }), _jsx("small", { children: "CSS value for card background (color, image, etc.)" })] }), _jsxs("div", { className: "config-item", children: [_jsx("label", { htmlFor: "style_spacing", children: "Overall Spacing (px):" }), _jsx("input", { type: "number", id: "style_spacing", name: "spacing", value: (styleConfig === null || styleConfig === void 0 ? void 0 : styleConfig.spacing) === undefined ? '' : styleConfig.spacing, onChange: handleInputChange, placeholder: "e.g., 16", min: "0", style: { width: '100px', padding: '8px' } }), _jsx("small", { children: "Default spacing/padding unit." })] }), _jsxs("div", { className: "config-item", children: [_jsx("label", { htmlFor: "style_image_size", children: "Default Image Size (px):" }), _jsx("input", { type: "number", id: "style_image_size", name: "image_size", value: (styleConfig === null || styleConfig === void 0 ? void 0 : styleConfig.image_size) === undefined ? '' : styleConfig.image_size, onChange: handleInputChange, placeholder: "e.g., 50", min: "10", max: "300", style: { width: '100px', padding: '8px' } }), _jsx("small", { children: "Default size for thumbnails/images." })] })] })] }));
};
export default CardStylingSection;
//# sourceMappingURL=CardStylingSection.js.map