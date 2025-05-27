import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Logger } from '../utils/logger';
import InventreeHassSensorsSection from '../components/editor/InventreeHassSensorsSection';
import HaEntitiesSection from '../components/editor/HaEntitiesSection';
import InventreePkSection from '../components/editor/InventreePkSection';
import InventreeParametersSection from '../components/editor/InventreeParametersSection';
// Define the editor name, similar to how it's done in the Lit editor
// This might be useful for registering the React editor if needed, or for logging.
export const REACT_EDITOR_NAME = 'inventree-card-react-editor';
const logger = Logger.getInstance();
const InventreeCardEditor = ({ hass, config: initialConfig, onConfigChanged, }) => {
    var _a, _b, _c, _d, _e, _f;
    // Log 1: initialConfig as received
    console.log('[InventreeCardEditor] TOP: initialConfig from props:', initialConfig ? JSON.parse(JSON.stringify(initialConfig)) : 'undefined');
    console.log('[InventreeCardEditor] TOP: hass from props is defined:', !!hass);
    const [config, setConfig] = useState(initialConfig || {});
    console.log('[InventreeCardEditor] Initial internal config state (after useState):', JSON.parse(JSON.stringify(config)));
    useEffect(() => {
        if (initialConfig) {
            // Log 2: Inside useEffect for initialConfig sync
            console.log('[InventreeCardEditor] useEffect[initialConfig]: Syncing initialConfig to internal state. Current initialConfig:', JSON.parse(JSON.stringify(initialConfig)));
            setConfig(initialConfig);
            logger.log('ReactEditor', 'Internal config state updated from initialConfig prop.', { initialConfig });
        }
        else {
            console.log('[InventreeCardEditor] useEffect[initialConfig]: initialConfig is null/undefined, not syncing.');
        }
    }, [initialConfig]);
    // Log 3: Right before minimalHassForPickers computation
    console.log('[InventreeCardEditor] PRE-MEMO: hass object that will be used for minimalHassForPickers:', hass ? { statesExists: !!hass.states, localizeExists: !!hass.localize, configVersionExists: !!((_a = hass.config) === null || _a === void 0 ? void 0 : _a.version) } : 'undefined');
    const minimalHassForPickers = useMemo(() => {
        var _a, _b;
        if (!hass) {
            // Log 4: Inside useMemo, hass is undefined
            console.log('[InventreeCardEditor] MEMO: hass is undefined, minimalHassForPickers will be undefined.');
            return undefined;
        }
        // Log 5: When minimalHassForPickers is actually recomputed
        console.log('[InventreeCardEditor] MEMO: Recomputing minimalHassForPickers. Relevant HASS parts:', {
            statesExist: !!hass.states,
            localizeExists: !!hass.localize,
            configVersion: (_a = hass.config) === null || _a === void 0 ? void 0 : _a.version,
        });
        return {
            states: hass.states,
            localize: hass.localize,
            config: {
                version: (_b = hass.config) === null || _b === void 0 ? void 0 : _b.version
            },
        };
    }, [hass === null || hass === void 0 ? void 0 : hass.states, hass === null || hass === void 0 ? void 0 : hass.localize, (_b = hass === null || hass === void 0 ? void 0 : hass.config) === null || _b === void 0 ? void 0 : _b.version]);
    useEffect(() => {
        let changed = false;
        let newConfigDataSources = config.data_sources || {};
        console.log('[InventreeCardEditor] useEffect[config.data_sources]: Checking data_sources for initialization. Current config.data_sources:', JSON.parse(JSON.stringify(config.data_sources)));
        if (!config.data_sources) {
            newConfigDataSources = {};
            changed = true;
        }
        if (!newConfigDataSources.inventree_hass_sensors) {
            newConfigDataSources.inventree_hass_sensors = [];
            changed = true;
        }
        if (!newConfigDataSources.ha_entities) {
            newConfigDataSources.ha_entities = [];
            changed = true;
        }
        if (!newConfigDataSources.inventree_pks) {
            newConfigDataSources.inventree_pks = [];
            changed = true;
        }
        if (!newConfigDataSources.inventree_parameters) {
            newConfigDataSources.inventree_parameters = [];
            changed = true;
        }
        if (changed) {
            setConfig(prevConfig => (Object.assign(Object.assign({}, prevConfig), { data_sources: newConfigDataSources })));
        }
    }, [config.data_sources]);
    const handleConfigChange = useCallback((newConfig) => {
        console.log('[InventreeCardEditor] handleConfigChange: Preparing to call onConfigChanged with:', JSON.parse(JSON.stringify(newConfig)));
        setConfig(newConfig);
        onConfigChanged(newConfig);
        logger.log('ReactEditor', 'Global config updated via handleConfigChange', { newConfig });
    }, [onConfigChanged]);
    const handleTitleChange = useCallback((event) => {
        const newConfig = Object.assign(Object.assign({}, config), { name: event.target.value });
        handleConfigChange(newConfig);
    }, [config, handleConfigChange]);
    const handleInventreeHassSensorsChanged = useCallback((newSensorIds) => {
        var _a;
        console.log('[InventreeCardEditor] handleInventreeHassSensorsChanged: Called. newSensorIds: ' + JSON.stringify(newSensorIds));
        console.log('[InventreeCardEditor] handleInventreeHassSensorsChanged: Current config.entity in closure: ' + config.entity);
        console.log('[InventreeCardEditor] handleInventreeHassSensorsChanged: Current config.data_sources.inventree_hass_sensors in closure: ' + JSON.stringify((_a = config.data_sources) === null || _a === void 0 ? void 0 : _a.inventree_hass_sensors));
        const newConfig = Object.assign(Object.assign({}, config), { entity: newSensorIds.length > 0 ? newSensorIds[0] : '', selected_entities: newSensorIds.length > 1 ? newSensorIds.slice(1) : [], data_sources: Object.assign(Object.assign({}, (config.data_sources || {})), { inventree_hass_sensors: newSensorIds }) });
        handleConfigChange(newConfig);
    }, [config, handleConfigChange]);
    const handleHaEntitiesChanged = useCallback((newEntityIds) => {
        const newConfig = Object.assign(Object.assign({}, config), { data_sources: Object.assign(Object.assign({}, (config.data_sources || {})), { ha_entities: newEntityIds }) });
        handleConfigChange(newConfig);
    }, [config, handleConfigChange]);
    const handleInventreePksChanged = useCallback((newPks) => {
        const newConfig = Object.assign(Object.assign({}, config), { data_sources: Object.assign(Object.assign({}, (config.data_sources || {})), { inventree_pks: newPks }) });
        handleConfigChange(newConfig);
    }, [config, handleConfigChange]);
    const handleInventreeParametersChanged = useCallback((newParameterStrings) => {
        const newConfig = Object.assign(Object.assign({}, config), { data_sources: Object.assign(Object.assign({}, (config.data_sources || {})), { inventree_parameters: newParameterStrings }) });
        handleConfigChange(newConfig);
    }, [config, handleConfigChange]);
    const toggleSection = (section) => {
        // For future use to toggle collapsible sections
        logger.log('ReactEditor', `Toggle section: ${section}`);
    };
    if (!hass) {
        console.log('[InventreeCardEditor] RENDER: Original hass is not available. Rendering "Home Assistant object not available."');
        return _jsx("p", { children: "Home Assistant object not available." });
    }
    // Log 6: Right before returning JSX
    console.log('[InventreeCardEditor] RENDER: Final internal config state:', JSON.parse(JSON.stringify(config)));
    console.log('[InventreeCardEditor] RENDER: minimalHassForPickers is defined:', !!minimalHassForPickers);
    return (_jsxs("div", { className: "inventree-card-editor", children: [_jsx("h2", { children: "InvenTree Card React Editor" }), _jsxs("div", { className: "editor-section", children: [_jsx("label", { htmlFor: "card-title", children: "Card Title:" }), _jsx("input", { type: "text", id: "card-title", value: config.name || '', onChange: handleTitleChange })] }), _jsxs("div", { className: "editor-section collapsible-section", children: [_jsx("h3", { onClick: () => toggleSection('dataSources'), children: "Data Sources \u25BC " }), _jsxs("div", { className: "collapsible-content", children: [_jsx("p", { children: _jsx("em", { children: "Data Sources configuration will go here..." }) }), _jsxs("div", { className: "editor-subsection collapsible-subsection", children: [_jsx("h4", { onClick: () => toggleSection('inventreeHassSensors'), children: "InvenTree Hass Sensors \u25B6" }), _jsx("div", { className: "collapsible-content--nested", children: minimalHassForPickers && (_jsx(InventreeHassSensorsSection, { hass: minimalHassForPickers, selectedSensors: ((_c = config.data_sources) === null || _c === void 0 ? void 0 : _c.inventree_hass_sensors) || [], onSensorsChanged: handleInventreeHassSensorsChanged })) })] }), _jsxs("div", { className: "editor-subsection collapsible-subsection", children: [_jsx("h4", { onClick: () => toggleSection('haEntities'), children: "Home Assistant Entities (Other) \u25B6" }), _jsx("div", { className: "collapsible-content--nested", children: minimalHassForPickers && (_jsx(HaEntitiesSection, { hass: minimalHassForPickers, selectedEntities: ((_d = config.data_sources) === null || _d === void 0 ? void 0 : _d.ha_entities) || [], onEntitiesChanged: handleHaEntitiesChanged })) })] }), _jsxs("div", { className: "editor-subsection collapsible-subsection", children: [_jsx("h4", { onClick: () => toggleSection('inventreePKs'), children: "By InvenTree PK \u25B6" }), _jsx("div", { className: "collapsible-content--nested", children: hass && (_jsx(InventreePkSection, { hass: hass, selectedPks: ((_e = config.data_sources) === null || _e === void 0 ? void 0 : _e.inventree_pks) || [], onPksChanged: handleInventreePksChanged })) })] }), _jsxs("div", { className: "editor-subsection collapsible-subsection", children: [_jsx("h4", { onClick: () => toggleSection('inventreeParams'), children: "InvenTree Parameters \u25B6" }), _jsx("div", { className: "collapsible-content--nested", children: hass && (_jsx(InventreeParametersSection, { hass: hass, selectedParameters: ((_f = config.data_sources) === null || _f === void 0 ? void 0 : _f.inventree_parameters) || [], onParametersChanged: handleInventreeParametersChanged })) })] }), _jsxs("div", { className: "editor-subsection collapsible-subsection", children: [_jsx("h4", { onClick: () => toggleSection('inventreeApiConfig'), children: "InvenTree API Configuration \u25B6" }), _jsx("div", { className: "collapsible-content--nested", children: _jsx("p", { children: _jsx("em", { children: "API URL, Key, WebSocket URL..." }) }) })] })] })] }), _jsx("div", { className: "editor-section", children: _jsx("h3", { children: "Conditional Logic (Placeholder)" }) }), _jsx("div", { className: "editor-section", children: _jsx("h3", { children: "Presentation (Layout & Display) (Placeholder)" }) }), _jsx("div", { className: "editor-section", children: _jsx("h3", { children: "Interactions (Actions) (Placeholder)" }) }), _jsx("div", { className: "editor-section", children: _jsx("h3", { children: "System Settings (Performance, Debugging) (Placeholder)" }) }), _jsx("style", { children: `
        .inventree-card-editor .editor-section {
          padding: 8px;
          margin-bottom: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .inventree-card-editor .editor-subsection {
          padding: 6px;
          margin-top: 8px;
          margin-left: 16px;
          border: 1px dashed #eee;
          border-radius: 4px;
        }
        .inventree-card-editor h3, .inventree-card-editor h4 {
          cursor: pointer;
          margin-top: 0;
        }
        .inventree-card-editor .collapsible-content,
        .inventree-card-editor .collapsible-content--nested {
          // Future: Add CSS to hide/show based on state
          padding-left: 10px;
        }
      ` })] }));
};
export default InventreeCardEditor;
//# sourceMappingURL=InventreeCardEditor.js.map