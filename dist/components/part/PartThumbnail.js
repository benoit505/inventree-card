import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
const PartThumbnail = ({ partData, config, layout: propLayout, icon, badge }) => {
    if (!partData) {
        return null;
    }
    // Determine layout: prop > config.view_type > default ('grid')
    const layout = propLayout || (config === null || config === void 0 ? void 0 : config.view_type) || 'grid';
    const wrapperBaseStyle = {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        // background: 'var(--secondary-background-color)', // Assuming var() isn't directly usable here, use a fallback or handle themes differently
        backgroundColor: '#f5f5f5', // Fallback color
        borderRadius: '8px',
    };
    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transition: 'transform 0.2s ease-in-out',
    };
    const placeholderStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // color: 'var(--secondary-text-color)', // Fallback color
        color: '#757575', // Fallback color
        fontSize: '1.5em', // Example size for placeholder text
        fontWeight: 'bold',
    };
    let layoutSpecificWrapperStyle = {};
    switch (layout) {
        case 'grid':
            layoutSpecificWrapperStyle = {
                aspectRatio: '1 / 1', // More modern way for aspect ratio
                maxHeight: '150px',
            };
            break;
        case 'list':
            layoutSpecificWrapperStyle = {
                width: '60px',
                height: '60px',
            };
            break;
        case 'detail':
            layoutSpecificWrapperStyle = {
                maxHeight: '200px',
            };
            break;
    }
    const combinedWrapperStyle = Object.assign(Object.assign({}, wrapperBaseStyle), layoutSpecificWrapperStyle);
    // Simple hover effect using state for demonstration if not using CSS classes
    const [isHovered, setIsHovered] = React.useState(false);
    const dynamicImageStyle = Object.assign(Object.assign({}, imageStyle), { transform: isHovered ? 'scale(1.05)' : 'scale(1)' });
    const iconStyle = {
        position: 'absolute',
        top: '4px',
        left: '4px',
        // Example: Material Design Icon size
        fontSize: layout === 'list' ? '16px' : '20px',
        color: 'white', // Default color, can be themed
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '50%',
        padding: '2px',
        zIndex: 1,
    };
    const badgeStyle = {
        position: 'absolute',
        top: '4px',
        right: '4px',
        backgroundColor: 'var(--primary-color, #3498db)', // Use theme color with fallback
        color: 'white',
        borderRadius: '50%',
        padding: layout === 'list' ? '1px 4px' : '2px 6px',
        fontSize: layout === 'list' ? '0.7em' : '0.8em',
        fontWeight: 'bold',
        minWidth: layout === 'list' ? '12px' : '16px',
        textAlign: 'center',
        boxShadow: '0px 0px 3px rgba(0,0,0,0.3)',
        zIndex: 1,
    };
    return (_jsxs("div", { style: combinedWrapperStyle, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), children: [icon && (_jsx("span", { className: "thumbnail-icon", style: iconStyle, children: icon.startsWith('mdi:') ? _jsx("ha-icon", { icon: icon }) : _jsx("span", { dangerouslySetInnerHTML: { __html: icon } }) })), badge && _jsx("span", { className: "thumbnail-badge", style: badgeStyle, children: badge }), partData.thumbnail ? (_jsx("img", { style: dynamicImageStyle, src: partData.thumbnail, alt: partData.name })) : (_jsx("div", { style: placeholderStyle, children: _jsx("span", { children: partData.name.substring(0, 2).toUpperCase() }) }))] }));
};
export default PartThumbnail;
//# sourceMappingURL=PartThumbnail.js.map