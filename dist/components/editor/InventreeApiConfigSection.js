import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const InventreeApiConfigSection = ({ hass, directApiConfig = { enabled: false, url: '', api_key: '' }, // Default to prevent undefined errors
onDirectApiConfigChanged, }) => {
    const handleInputChange = useCallback((event) => {
        const { name, value, type } = event.target;
        let processedValue = value;
        if (type === 'checkbox') {
            processedValue = event.target.checked;
        }
        else if (type === 'number') {
            processedValue = parseFloat(value);
            if (isNaN(processedValue)) {
                // Handle or log error for non-numeric input if necessary, or allow it to be empty
                // For now, let's assume parseFloat will handle it or it becomes NaN which can be checked later
            }
        }
        const newConfig = Object.assign(Object.assign({}, directApiConfig), { [name]: processedValue });
        onDirectApiConfigChanged(newConfig);
        logger.log('Editor:ApiConfig', `API Config changed: ${name} = ${processedValue}`, { newConfig });
    }, [directApiConfig, onDirectApiConfigChanged]);
    return (_jsxs("div", { className: "sub-section-container", children: [_jsx("h4", { className: "sub-section-title", children: "InvenTree API Configuration" }), _jsx("div", { className: "config-item", style: { marginBottom: '16px' }, children: _jsxs("label", { htmlFor: "direct_api_enabled", style: { display: 'flex', alignItems: 'center' }, children: [_jsx("input", { type: "checkbox", id: "direct_api_enabled", name: "enabled", checked: directApiConfig.enabled, onChange: handleInputChange, style: { marginRight: '8px' } }), "Enable Direct API Communication"] }) }), directApiConfig.enabled && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "config-item", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "direct_api_url", children: "InvenTree API URL:" }), _jsx("input", { type: "text", id: "direct_api_url", name: "url", value: directApiConfig.url || '', onChange: handleInputChange, placeholder: "e.g., http://inventree.local:8000", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } })] }), _jsxs("div", { className: "config-item", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "direct_api_key", children: "API Key:" }), _jsx("input", { type: "password" // Use password type for API keys
                                , id: "direct_api_key", name: "api_key", value: directApiConfig.api_key || '', onChange: handleInputChange, placeholder: "Enter your InvenTree API Key", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } })] }), _jsxs("div", { className: "config-item", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "direct_api_websocket_url", children: "WebSocket URL (Optional):" }), _jsx("input", { type: "text", id: "direct_api_websocket_url", name: "websocket_url", value: directApiConfig.websocket_url || '', onChange: handleInputChange, placeholder: "e.g., ws://inventree.local:8000/ws/api", style: { width: '100%', padding: '8px', boxSizing: 'border-box' } }), _jsx("div", { className: "helper-text", style: { fontSize: '0.9em', color: 'var(--secondary-text-color)' }, children: "Leave blank to auto-derive from API URL. Needed for reverse proxies or custom setups." })] }), _jsxs("div", { className: "config-item", style: { marginBottom: '12px' }, children: [_jsx("label", { htmlFor: "direct_api_idle_render_time", children: "Idle Render Time (seconds):" }), _jsx("input", { type: "number", id: "direct_api_idle_render_time", name: "idle_render_time", value: directApiConfig.idle_render_time === undefined ? 60 : directApiConfig.idle_render_time, onChange: handleInputChange, min: "10", max: "600", style: { width: '100px', padding: '8px' } }), _jsx("div", { className: "helper-text", style: { fontSize: '0.9em', color: 'var(--secondary-text-color)' }, children: "How often to refresh when no changes are detected (10-600s). Set in API performance settings if not here." })] })] }))] }));
};
export default InventreeApiConfigSection;
//# sourceMappingURL=InventreeApiConfigSection.js.map