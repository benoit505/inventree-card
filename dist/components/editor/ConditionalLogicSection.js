import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { Logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
const logger = Logger.getInstance();
const getParameterInputType = (paramDetail) => {
    if (!paramDetail || !paramDetail.template_detail)
        return 'text';
    if (paramDetail.template_detail.checkbox)
        return 'boolean';
    if (paramDetail.template_detail.units || typeof paramDetail.data_numeric === 'number')
        return 'number';
    return 'text';
};
const generateFieldsFromDataSources = (dataSources, hass, directApiConfig, allParameterValues) => {
    const fields = [];
    if (!dataSources)
        return [
            { name: 'default_field', label: 'Default Field (No Data Sources)' }
        ];
    (dataSources.inventree_hass_sensors || []).forEach((entityId) => {
        const entity = hass === null || hass === void 0 ? void 0 : hass.states[entityId];
        const entityName = (entity === null || entity === void 0 ? void 0 : entity.attributes.friendly_name) || entityId;
        fields.push({ name: `inv_sensor_state_${entityId}`, label: `InvSensor: ${entityName} State` });
    });
    (dataSources.ha_entities || []).forEach((entityId) => {
        const entity = hass === null || hass === void 0 ? void 0 : hass.states[entityId];
        const entityName = (entity === null || entity === void 0 ? void 0 : entity.attributes.friendly_name) || entityId;
        fields.push({ name: `ha_entity_state_${entityId}`, label: `HA: ${entityName} State` });
        if (entity === null || entity === void 0 ? void 0 : entity.attributes.temperature) {
            fields.push({ name: `ha_entity_attr_${entityId}_temperature`, label: `HA: ${entityName} Temperature`, inputType: 'number' });
        }
    });
    (dataSources.inventree_pks || []).forEach((pk) => {
        if (isNaN(pk))
            return;
        fields.push({ name: `part_${pk}_name`, label: `Part ${pk}: Name`, inputType: 'text' });
        fields.push({ name: `part_${pk}_IPN`, label: `Part ${pk}: IPN`, inputType: 'text' });
        fields.push({ name: `part_${pk}_description`, label: `Part ${pk}: Description`, inputType: 'text' });
        fields.push({ name: `part_${pk}_category_name`, label: `Part ${pk}: Category`, inputType: 'text' });
        fields.push({ name: `part_${pk}_stock`, label: `Part ${pk}: Stock`, inputType: 'number' });
        fields.push({ name: `part_${pk}_is_template`, label: `Part ${pk}: Is Template`, inputType: 'boolean' });
        fields.push({ name: `part_${pk}_assembly`, label: `Part ${pk}: Is Assembly`, inputType: 'boolean' });
        fields.push({ name: `part_${pk}_virtual`, label: `Part ${pk}: Is Virtual`, inputType: 'boolean' });
    });
    (dataSources.inventree_parameters || []).forEach((paramString) => {
        const parts = paramString.split(':');
        if (parts.length === 3 && parts[0] === 'part') {
            const pkStr = parts[1];
            const paramName = parts[2];
            const pk = parseInt(pkStr, 10);
            if (!isNaN(pk)) {
                let inputType = 'text';
                if ((directApiConfig === null || directApiConfig === void 0 ? void 0 : directApiConfig.enabled) && allParameterValues && allParameterValues[pk] && allParameterValues[pk][paramName]) {
                    inputType = getParameterInputType(allParameterValues[pk][paramName]);
                }
                fields.push({
                    name: `inv_param_${pk}_${paramName}`,
                    label: `InvParam: ${paramName} (Part ${pk})`,
                    inputType: inputType
                });
            }
            else {
                fields.push({ name: `inv_param_raw_${paramString.replace(/[^a-zA-Z0-9_]/g, '_')}`, label: `InvParam: ${paramString} (Invalid PK)` });
            }
        }
        else {
            fields.push({ name: `inv_param_raw_${paramString.replace(/[^a-zA-Z0-9_]/g, '_')}`, label: `InvParam: ${paramString} (Malformed)` });
        }
    });
    if (fields.length === 0) {
        fields.push({ name: 'generic_part_name', label: 'Part Name (Any)' }, { name: 'generic_stock_level', label: 'Stock Level (Any)', inputType: 'number' });
    }
    logger.log("ConditionalLogicSection", "Generated fields for QueryBuilder", { count: fields.length });
    return fields;
};
// This is our internal RuleGroupType for initialization
const initialInternalRuleGroup = {
    id: uuidv4(),
    combinator: 'and',
    rules: [],
    not: false,
};
// Function to transform RQBRuleGroupType to our internal RuleGroupType
const transformToInternalRuleGroup = (rqbGroup) => {
    return {
        id: rqbGroup.id || uuidv4(),
        combinator: rqbGroup.combinator || 'and', // Ensure valid combinator
        rules: rqbGroup.rules.map(ruleOrGroup => {
            if ('combinator' in ruleOrGroup) {
                // It's a nested group, recurse
                return transformToInternalRuleGroup(ruleOrGroup);
            }
            // It's a RuleType, ensure it matches our internal RuleType if necessary
            // For now, assume direct compatibility or that RuleType from RQB is compatible
            return ruleOrGroup;
        }),
        not: rqbGroup.not || false,
    };
};
const ConditionalLogicSection = ({ conditionalLogicConfig, onConfigChanged, configuredDataSources, hass, directApiConfig, allParameterValues }) => {
    const [definedLogics, setDefinedLogics] = useState((conditionalLogicConfig === null || conditionalLogicConfig === void 0 ? void 0 : conditionalLogicConfig.definedLogics) || []);
    const dynamicFields = useMemo(() => generateFieldsFromDataSources(configuredDataSources, hass, directApiConfig, allParameterValues), [configuredDataSources, hass, directApiConfig, allParameterValues]);
    useEffect(() => {
        // Update state if the prop changes from editor (e.g. loaded config)
        setDefinedLogics((conditionalLogicConfig === null || conditionalLogicConfig === void 0 ? void 0 : conditionalLogicConfig.definedLogics) || []);
    }, [conditionalLogicConfig === null || conditionalLogicConfig === void 0 ? void 0 : conditionalLogicConfig.definedLogics]);
    const handleAddLogicBlock = () => {
        const newLogicItem = {
            id: uuidv4(),
            name: `New Logic Block ${definedLogics.length + 1}`,
            conditionRules: Object.assign(Object.assign({}, initialInternalRuleGroup), { id: uuidv4() }),
            effects: [],
        };
        const newDefinedLogics = [...definedLogics, newLogicItem];
        setDefinedLogics(newDefinedLogics);
        onConfigChanged({ definedLogics: newDefinedLogics });
        logger.log('ConditionalLogicSection', 'Added new logic block', { newLogicItem });
    };
    const handleLogicItemNameChange = (id, newName) => {
        const newDefinedLogics = definedLogics.map(item => item.id === id ? Object.assign(Object.assign({}, item), { name: newName }) : item);
        setDefinedLogics(newDefinedLogics);
        onConfigChanged({ definedLogics: newDefinedLogics });
    };
    const handleQueryChange = (logicItemId, queryFromBuilder) => {
        const internalQuery = transformToInternalRuleGroup(queryFromBuilder);
        const newDefinedLogics = definedLogics.map(item => item.id === logicItemId ? Object.assign(Object.assign({}, item), { conditionRules: internalQuery }) : item);
        setDefinedLogics(newDefinedLogics);
        onConfigChanged({ definedLogics: newDefinedLogics });
        logger.log('ConditionalLogicSection', 'Query changed for logic block', { logicItemId, internalQuery });
    };
    const handleRemoveLogicBlock = (id) => {
        const newDefinedLogics = definedLogics.filter(item => item.id !== id);
        setDefinedLogics(newDefinedLogics);
        onConfigChanged({ definedLogics: newDefinedLogics });
        logger.log('ConditionalLogicSection', 'Removed logic block', { id });
    };
    // TODO: UI for defining effects for each logic block
    return (_jsxs("div", { className: "conditional-logic-section", children: [_jsx("h4", { children: "Conditional Logic Blocks" }), _jsx("p", { style: { fontSize: '0.9em', color: 'gray', marginBottom: '15px' }, children: "Define sets of conditions (logic blocks). Each block can have its own rules and associated effects (effects UI coming soon)." }), _jsx("button", { onClick: handleAddLogicBlock, style: { marginBottom: '15px' }, children: "+ Add New Logic Block" }), definedLogics.map((logicItem, index) => (_jsxs("div", { style: { border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '4px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("input", { type: "text", value: logicItem.name, onChange: (e) => handleLogicItemNameChange(logicItem.id, e.target.value), placeholder: "Logic Block Name", style: { fontSize: '1.1em', fontWeight: 'bold', border: 'none', borderBottom: '1px solid #eee', padding: '5px' } }), _jsx("button", { onClick: () => handleRemoveLogicBlock(logicItem.id), style: { color: 'red', background: 'none', border: 'none', cursor: 'pointer' }, children: "Remove Block" })] }), _jsx("h5", { children: "Conditions (IF...):" }), _jsx(QueryBuilder, { fields: dynamicFields, query: logicItem.conditionRules, onQueryChange: (query) => handleQueryChange(logicItem.id, query) }), _jsxs("div", { style: { marginTop: '10px' }, children: [_jsx("h5", { children: "Actions/Effects (THEN...):" }), _jsx("p", { style: { fontSize: '0.8em', color: 'gray' }, children: _jsxs("em", { children: ["UI for defining effects (e.g., show/hide, change style, call service) for this block will be here. Currently, ", logicItem.effects.length, " effects defined."] }) })] }), _jsxs("details", { style: { marginTop: '10px' }, children: [_jsx("summary", { children: "Debug: Logic Item JSON" }), _jsx("pre", { style: { fontSize: '0.8em', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, children: JSON.stringify(logicItem, null, 2) })] })] }, logicItem.id))), definedLogics.length === 0 && _jsx("p", { children: "No logic blocks defined yet." })] }));
};
export default ConditionalLogicSection;
//# sourceMappingURL=ConditionalLogicSection.js.map