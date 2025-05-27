import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Logger } from '../../utils/logger';
import { useSelector } from 'react-redux';
// Import sections
import InventreeHassSensorsSection from './InventreeHassSensorsSection';
import HaEntitiesSection from './HaEntitiesSection';
import InventreePkSection from './InventreePkSection';
import InventreeParametersSection from './InventreeParametersSection';
import InventreeApiConfigSection from './InventreeApiConfigSection';
import LayoutSelectionSection from './LayoutSelectionSection';
import ElementVisibilitySection from './ElementVisibilitySection';
import CardStylingSection from './CardStylingSection';
import InteractionsConfigSection from './InteractionsConfigSection';
import ConditionalLogicSection from './ConditionalLogicSection';
const logger = Logger.getInstance();
const CARD_NAME = 'inventree-card';
// Default empty rule group for conditional logic initialization
const defaultRuleGroup = {
    id: 'root',
    combinator: 'and',
    rules: [],
    not: false
};
const InventreeCardEditor = ({ hass, lovelace, config: initialConfig, onConfigChanged }) => {
    var _a, _b, _c, _d;
    const [currentEditorConfig, setCurrentEditorConfig] = useState(initialConfig || {});
    // Correctly get all parameter values from the store using RootState
    const allParameterValues = useSelector((state) => state.parameters.parameterValues);
    useEffect(() => {
        logger.log('Editor:Main', 'Editor mounted or initialConfig changed', { initialConfig });
        setCurrentEditorConfig(prevConfig => {
            var _a, _b, _c, _d;
            const updatedConfig = Object.assign(Object.assign({}, prevConfig), initialConfig);
            if (!updatedConfig.data_sources) {
                updatedConfig.data_sources = {
                    inventree_hass_sensors: [],
                    ha_entities: [],
                    inventree_pks: [],
                    inventree_parameters: [],
                };
            }
            if (!updatedConfig.direct_api) {
                updatedConfig.direct_api = { enabled: false, url: '', api_key: '' };
            }
            if (!updatedConfig.layout) {
                updatedConfig.layout = { viewType: 'detail' };
            }
            if (!updatedConfig.view_type && ((_a = updatedConfig.layout) === null || _a === void 0 ? void 0 : _a.viewType)) {
                updatedConfig.view_type = updatedConfig.layout.viewType;
            }
            else if (!updatedConfig.view_type) {
                updatedConfig.view_type = 'detail';
            }
            if (!updatedConfig.columns && ((_b = updatedConfig.layout) === null || _b === void 0 ? void 0 : _b.columns))
                updatedConfig.columns = updatedConfig.layout.columns;
            if (!updatedConfig.grid_spacing && ((_c = updatedConfig.layout) === null || _c === void 0 ? void 0 : _c.grid_spacing))
                updatedConfig.grid_spacing = updatedConfig.layout.grid_spacing;
            if (!updatedConfig.item_height && ((_d = updatedConfig.layout) === null || _d === void 0 ? void 0 : _d.item_height))
                updatedConfig.item_height = updatedConfig.layout.item_height;
            if (!updatedConfig.display) {
                updatedConfig.display = { show_header: true, show_image: true, show_name: true, show_stock: true };
            }
            if (!updatedConfig.style) {
                updatedConfig.style = { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 };
            }
            if (!updatedConfig.interactions) {
                updatedConfig.interactions = { buttons: [] };
            }
            // Ensure conditional_logic and its definedLogics array are initialized
            if (!updatedConfig.conditional_logic) {
                updatedConfig.conditional_logic = { definedLogics: [] };
            }
            else if (!updatedConfig.conditional_logic.definedLogics) {
                updatedConfig.conditional_logic.definedLogics = [];
            }
            return updatedConfig;
        });
    }, [initialConfig]); // Removed logger from dependencies as it's a stable instance
    const handleConfigPartChanged = useCallback((key, value) => {
        setCurrentEditorConfig(prev => {
            const newConfig = Object.assign(Object.assign({}, prev), { [key]: value });
            onConfigChanged(newConfig);
            return newConfig;
        });
    }, [onConfigChanged]);
    const handleDataSourceSubKeyChanged = useCallback((subKey, value) => {
        setCurrentEditorConfig(prev => {
            const newConfig = Object.assign(Object.assign({}, prev), { data_sources: Object.assign(Object.assign({}, (prev.data_sources || {})), { [subKey]: value }) });
            onConfigChanged(newConfig);
            return newConfig;
        });
    }, [onConfigChanged]);
    const handleInventreeHassSensorsChanged = useCallback((newSensors) => {
        handleDataSourceSubKeyChanged('inventree_hass_sensors', newSensors);
    }, [handleDataSourceSubKeyChanged]);
    const handleHaEntitiesChanged = useCallback((newEntities) => {
        handleDataSourceSubKeyChanged('ha_entities', newEntities);
    }, [handleDataSourceSubKeyChanged]);
    const handleInventreePksChanged = useCallback((newPks) => {
        handleDataSourceSubKeyChanged('inventree_pks', newPks);
    }, [handleDataSourceSubKeyChanged]);
    const handleInventreeParametersChanged = useCallback((newParameters) => {
        handleDataSourceSubKeyChanged('inventree_parameters', newParameters);
    }, [handleDataSourceSubKeyChanged]);
    const handleDirectApiConfigChanged = useCallback((newApiConfig) => {
        handleConfigPartChanged('direct_api', newApiConfig);
    }, [handleConfigPartChanged]);
    const handleLayoutConfigChanged = useCallback((newViewType, newLayoutOptions) => {
        setCurrentEditorConfig(prev => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const updatedLayout = {
                viewType: newViewType,
                columns: (_a = newLayoutOptions.columns) !== null && _a !== void 0 ? _a : (_b = prev.layout) === null || _b === void 0 ? void 0 : _b.columns,
                grid_spacing: (_c = newLayoutOptions.grid_spacing) !== null && _c !== void 0 ? _c : (_d = prev.layout) === null || _d === void 0 ? void 0 : _d.grid_spacing,
                item_height: (_e = newLayoutOptions.item_height) !== null && _e !== void 0 ? _e : (_f = prev.layout) === null || _f === void 0 ? void 0 : _f.item_height,
            };
            const newConfig = Object.assign(Object.assign({}, prev), { view_type: newViewType, columns: (_g = newLayoutOptions.columns) !== null && _g !== void 0 ? _g : prev.columns, grid_spacing: (_h = newLayoutOptions.grid_spacing) !== null && _h !== void 0 ? _h : prev.grid_spacing, item_height: (_j = newLayoutOptions.item_height) !== null && _j !== void 0 ? _j : prev.item_height, layout: updatedLayout });
            onConfigChanged(newConfig);
            return newConfig;
        });
    }, [onConfigChanged]);
    const handleDisplayConfigChanged = useCallback((newDisplayConfig) => {
        handleConfigPartChanged('display', newDisplayConfig);
    }, [handleConfigPartChanged]);
    const handleStyleConfigChanged = useCallback((newStyleConfig) => {
        handleConfigPartChanged('style', newStyleConfig);
    }, [handleConfigPartChanged]);
    const handleInteractionsConfigChanged = useCallback((newInteractionsConfig) => {
        handleConfigPartChanged('interactions', newInteractionsConfig);
    }, [handleConfigPartChanged]);
    const handleConditionalLogicConfigChanged = useCallback((newConditionalLogicConfig) => {
        // This now expects { definedLogics: ConditionalLogicItem[] }
        handleConfigPartChanged('conditional_logic', newConditionalLogicConfig);
    }, [handleConfigPartChanged]);
    if (!hass) {
        return _jsx("p", { children: "Loading Home Assistant..." });
    }
    // Provide default values for currentEditorConfig to prevent errors during rendering if some parts are undefined
    const editorData = useMemo(() => ({
        name: currentEditorConfig.name || '',
        entity: currentEditorConfig.entity || '',
        type: currentEditorConfig.type || CARD_NAME,
        view_type: currentEditorConfig.view_type || 'detail',
        columns: currentEditorConfig.columns,
        grid_spacing: currentEditorConfig.grid_spacing,
        item_height: currentEditorConfig.item_height,
        data_sources: currentEditorConfig.data_sources || { inventree_hass_sensors: [], ha_entities: [], inventree_pks: [], inventree_parameters: [] },
        direct_api: currentEditorConfig.direct_api || { enabled: false, url: '', api_key: '' },
        layout: currentEditorConfig.layout || { viewType: 'detail' },
        display: currentEditorConfig.display || { show_header: true, show_image: true, show_name: true, show_stock: true },
        style: currentEditorConfig.style || { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 },
        interactions: currentEditorConfig.interactions || { buttons: [] },
        conditional_logic: currentEditorConfig.conditional_logic || { definedLogics: [] }, // Ensure this matches ConditionalLogicConfig structure
    }), [currentEditorConfig]);
    return (_jsxs("div", { className: "inventree-card-editor", children: [_jsx("h2", { children: "InvenTree Card Configuration (React Editor)" }), _jsxs("section", { className: "editor-section", children: [_jsx("h3", { children: "Data Sources" }), _jsx(InventreeHassSensorsSection, { hass: hass, selectedSensors: ((_a = editorData.data_sources) === null || _a === void 0 ? void 0 : _a.inventree_hass_sensors) || [], onSensorsChanged: handleInventreeHassSensorsChanged }), _jsx(HaEntitiesSection, { hass: hass, selectedEntities: ((_b = editorData.data_sources) === null || _b === void 0 ? void 0 : _b.ha_entities) || [], onEntitiesChanged: handleHaEntitiesChanged }), _jsx(InventreePkSection, { selectedPks: ((_c = editorData.data_sources) === null || _c === void 0 ? void 0 : _c.inventree_pks) || [], onPksChanged: handleInventreePksChanged }), _jsx(InventreeParametersSection, { selectedParameters: ((_d = editorData.data_sources) === null || _d === void 0 ? void 0 : _d.inventree_parameters) || [], onParametersChanged: handleInventreeParametersChanged }), _jsx(InventreeApiConfigSection, { hass: hass, directApiConfig: editorData.direct_api, onDirectApiConfigChanged: handleDirectApiConfigChanged })] }), _jsxs("section", { className: "editor-section", children: [_jsx("h3", { children: "Presentation" }), _jsx(LayoutSelectionSection, { viewType: editorData.view_type, layoutOptions: {
                            columns: editorData.columns,
                            grid_spacing: editorData.grid_spacing,
                            item_height: editorData.item_height,
                        }, onLayoutConfigChanged: handleLayoutConfigChanged }), _jsx(ElementVisibilitySection, { displayConfig: editorData.display, onDisplayConfigChanged: handleDisplayConfigChanged }), _jsx(CardStylingSection, { styleConfig: editorData.style, onStyleConfigChanged: handleStyleConfigChanged })] }), _jsxs("section", { className: "editor-section", children: [_jsx("h3", { children: "Interactions (Actions)" }), _jsx(InteractionsConfigSection, { hass: hass, interactionsConfig: editorData.interactions, onInteractionsConfigChanged: handleInteractionsConfigChanged })] }), _jsxs("section", { className: "editor-section", children: [_jsx("h3", { children: "Conditional Logic" }), _jsx(ConditionalLogicSection, { conditionalLogicConfig: editorData.conditional_logic, onConfigChanged: handleConditionalLogicConfigChanged, configuredDataSources: editorData.data_sources, hass: hass, directApiConfig: editorData.direct_api, allParameterValues: allParameterValues })] }), _jsxs("section", { className: "editor-section", children: [_jsx("h3", { children: "System Settings" }), _jsx("p", { children: "Performance, caching, and advanced debug settings will go here." })] }), _jsxs("details", { children: [_jsx("summary", { children: "Current Editor Configuration State (Debug)" }), _jsx("pre", { style: { fontSize: '0.8em', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, children: JSON.stringify(editorData, null, 2) })] })] }));
};
export default InventreeCardEditor;
//# sourceMappingURL=InventreeCardEditor.js.map