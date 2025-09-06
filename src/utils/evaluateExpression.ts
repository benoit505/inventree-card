import { RuleGroupType, RuleType, ParameterOperator } from "../types";
import { RootState, AppDispatch } from "../store";
import { selectGenericHaEntityActualState, selectGenericHaEntityAttribute } from "../store/slices/genericHaStateSlice";
import { selectPartById } from "../store/slices/partsSlice";
import { InventreeItem } from "../types"; // For partContext
import { inventreeApi } from "../store/apis/inventreeApi"; // Import the API slice
import memoizeOne from 'memoize-one';

/**
 * Placeholder for a sophisticated expression evaluation engine.
 * This function will take a set of rules (RuleGroupType from react-querybuilder)
 * and evaluate them against the provided context (part data, HA states, etc.).
 *
 * @param ruleGroup The group of rules to evaluate.
 * @param partContext Optional: The current InvenTree part item to evaluate against.
 * @param globalContext Full Redux state for accessing HA states, other parameters, etc.
 * @param logger Logger instance.
 * @param cardInstanceId The ID of the card instance.
 * @returns boolean - True if the conditions are met, false otherwise.
 */
export const evaluateExpression = (
    ruleGroup: RuleGroupType,
    partContext: InventreeItem | null,
    globalContext: RootState,
    logger: any,
    cardInstanceId: string,
    dispatch?: AppDispatch
): boolean => {
    if (!ruleGroup || !ruleGroup.rules || ruleGroup.rules.length === 0) {
        logger.warn('evaluateExpression', 'Empty or invalid rule group provided. ID: ' + (ruleGroup?.id || 'undefined'));
        return false; // Or true, depending on desired behavior for empty group
    }

    const results: boolean[] = [];
    for (const ruleOrGroup of ruleGroup.rules) {
        if ('combinator' in ruleOrGroup) { // It's a nested RuleGroupType
            const nestedResult = evaluateExpression(ruleOrGroup as RuleGroupType, partContext, globalContext, logger, cardInstanceId, dispatch);
            results.push(nestedResult);
        } else { // It's a RuleType
            const ruleResult = evaluateRule(ruleOrGroup as RuleType, partContext, globalContext, logger, cardInstanceId, dispatch);
            results.push(ruleResult);
        }
    }

    let combinedResult: boolean;
    if (ruleGroup.combinator === 'and') {
        combinedResult = results.every(r => r === true);
    } else { // 'or'
        combinedResult = results.some(r => r === true);
    }

    const resultBeforeNot = combinedResult;
    if (ruleGroup.not) {
        combinedResult = !combinedResult;
    }
    
    return combinedResult;
};

// Helper to get the actual value based on rule.field
const getActualValue = (
    field: string, 
    partContext: InventreeItem | null, 
    globalContext: RootState,
    logger: any,
    cardInstanceId: string,
    dispatch?: AppDispatch
): any => {
    let valueToReturn: any = undefined;

    // --- NEW, REORDERED LOGIC ---
    // 1. Prioritize partContext if it exists. This is the most common and efficient case.
    if (partContext) {
        if (field.startsWith('part_')) {
            const attributeName = field.substring('part_'.length);
            if (attributeName in partContext) {
                return (partContext as any)[attributeName];
            }
        }
        if (field.startsWith('param_')) {
            const parameterName = field.substring('param_'.length);
            const param = partContext.parameters?.find(p => p.template_detail?.name === parameterName);
            return param?.data;
        }
    }

    // 2. Handle fields that require a specific part PK lookup.
    const partPkAndAttributeMatch = field.match(/^part_(\d+)_(.+)$/);
    if (partPkAndAttributeMatch) {
        const pk = parseInt(partPkAndAttributeMatch[1], 10);
        let attribute = partPkAndAttributeMatch[2];
        
        // Handle shorthand name for stock
        if (attribute === 'stock') {
            attribute = 'in_stock';
        }

        // --- NEW LOGIC: Check RTK Query Cache first ---
        const rtkQueryState = inventreeApi.endpoints.getPart.select({ pk, cardInstanceId })(globalContext);
        if (rtkQueryState.data && attribute in rtkQueryState.data) {
            return (rtkQueryState.data as any)[attribute];
        }

        // --- FALLBACK: Check old partsById slice ---
        const part = selectPartById(globalContext, cardInstanceId, pk);
        if (part && attribute in part) {
            return (part as any)[attribute];
        }

        // --- 🚀 SMART AUTO-FETCHING: If data is missing, auto-fetch it! ---
        if (dispatch && (rtkQueryState.status === 'uninitialized' || (!rtkQueryState.data && rtkQueryState.status !== 'rejected'))) {
            logger.info('getActualValue', `🚀 Auto-fetching missing part ${pk} for rule evaluation (field: ${field})`);
            
            // Trigger the fetch - this will populate the cache for next evaluation
            dispatch(inventreeApi.endpoints.getPart.initiate({ pk, cardInstanceId }));
            
            // For now, return undefined but log that we triggered a fetch
            logger.debug('getActualValue', `Part ${pk} fetch initiated, will be available on next evaluation cycle`);
        }

        // --- If not found in either, log current status ---
        const partStatus = rtkQueryState.status;
        logger.debug('getActualValue', `Part with PK ${pk} not found in RTK Query cache (status: ${partStatus}) or partsSlice, or attribute '${attribute}' does not exist.`);
        return undefined;
    }

    // 3. Handle HA entities (which are always global).
    // HA Entity State: ha_entity_state_media_player.denon_avr_x2600h
    if (field.startsWith('ha_entity_state_')) {
        const entityId = field.substring('ha_entity_state_'.length);
        const selectedState = selectGenericHaEntityActualState(globalContext, entityId);
        valueToReturn = selectedState;
    }
    // HA Entity Attribute: ha_entity_attr_media_player.denon_avr_x2600h:::source
    else if (field.startsWith('ha_entity_attr_')) {
        const content = field.substring('ha_entity_attr_'.length);
        const parts = content.split(':::');
        if (parts.length === 2) {
            const entityId = parts[0]; // Entity ID with dots, e.g., remote.shield
            const attributeName = parts[1]; // Attribute name, e.g., current_activity
            valueToReturn = selectGenericHaEntityAttribute(globalContext, entityId, attributeName);
        } else {
            logger.warn('getActualValue', 'Could not parse HA attribute field (expected 2 parts after splitting by :::): ' + field, {data: {field, content, partsCount: parts.length}});
        }
    }
    // Part Attribute: e.g., part_in_stock, part_name (assuming partContext is provided)
    else if (field.startsWith('part_') && partContext) {
        const attributeName = field.substring('part_'.length);
        if (attributeName in partContext) {
            valueToReturn = (partContext as any)[attributeName];
        } else {
            logger.warn('getActualValue', 'Part attribute ' + attributeName + ' not found in partContext for PK ' + (partContext?.pk || 'undefined'));
        }
    }
    // Part Parameter: e.g., param_color (assuming partContext is provided)
    else if (field.startsWith('param_') && partContext) {
        const parameterName = field.substring('param_'.length);
        // SLAY THE HYDRA: Get parameters from the partContext, which is populated by RTK Query.
        const param = partContext.parameters?.find(p => p.template_detail?.name === parameterName);
        valueToReturn = param?.data;
    }
    else {
        logger.warn('getActualValue', 'Unknown field format or context missing for field: ' + field);
    }
    
    return valueToReturn;
};

const _internalEvaluateRule = (
    rule: RuleType,
    actualValue: any,
    logger: any
): boolean => {
    const ruleValue = rule.value;

    if (actualValue === undefined) {
        if (rule.operator === 'exists') return false;
        if (rule.operator === 'does_not_exist') return true;
        if (rule.operator === 'is_empty') return true;
        if (rule.operator === 'is_not_empty') return false;
        logger.warn('evaluateRule', 'Actual value for field ' + rule.field + ' is undefined. Rule ID: ' + rule.id + ', Operator: ' + rule.operator + '. Evaluating as false for most ops.');
        return false; 
    }

    let numericActual: number | null = null;
    let numericRule: number | null = null;
    if (typeof actualValue === 'number' || (typeof actualValue === 'string' && !isNaN(parseFloat(actualValue)))) {
        numericActual = parseFloat(String(actualValue));
    }
    if (typeof ruleValue === 'number' || (typeof ruleValue === 'string' && !isNaN(parseFloat(String(ruleValue))))) {
        numericRule = parseFloat(String(ruleValue));
    }

    let result: boolean;
    switch (rule.operator as ParameterOperator | string) { 
        case '=':
        case 'equals':
            result = String(actualValue).toLowerCase() === String(ruleValue).toLowerCase(); break;
        case '!=':
        case 'not_equals':
            result = String(actualValue).toLowerCase() !== String(ruleValue).toLowerCase(); break;
        case '<':
        case 'less_than':
            result = numericActual !== null && numericRule !== null && numericActual < numericRule; break;
        case '>':
        case 'greater_than':
            result = numericActual !== null && numericRule !== null && numericActual > numericRule; break;
        case '<=':
        case 'less_than_or_equals':
            result = numericActual !== null && numericRule !== null && numericActual <= numericRule; break;
        case '>=':
        case 'greater_than_or_equals':
            result = numericActual !== null && numericRule !== null && numericActual >= numericRule; break;
        case 'contains':
            result = String(actualValue).toLowerCase().includes(String(ruleValue).toLowerCase()); break;
        case 'does_not_contain':
             result = !String(actualValue).toLowerCase().includes(String(ruleValue).toLowerCase()); break;
        case 'begins_with': 
        case 'startsWith':
            result = String(actualValue).toLowerCase().startsWith(String(ruleValue).toLowerCase()); break;
        case 'ends_with': 
        case 'endsWith':
            result = String(actualValue).toLowerCase().endsWith(String(ruleValue).toLowerCase()); break;
        case 'is_empty':
            result = actualValue === null || String(actualValue).trim() === ''; break;
        case 'is_not_empty':
            result = actualValue !== null && String(actualValue).trim() !== ''; break;
        case 'exists': 
             result = actualValue !== null && String(actualValue).trim() !== ''; break;
        case 'does_not_exist': 
             result = actualValue === null || String(actualValue).trim() === ''; break;
        default:
            logger.warn('evaluateRule', 'Rule ID: ' + rule.id + ' - Unknown operator: ' + rule.operator);
            result = false;
    }
    return result;
};

const memoizedInternalEvaluateRule = memoizeOne(_internalEvaluateRule);

const evaluateRule = (
    rule: RuleType,
    partContext: InventreeItem | null,
    globalContext: RootState,
    logger: any,
    cardInstanceId: string,
    dispatch?: AppDispatch
): boolean => {
    const actualValue = getActualValue(rule.field, partContext, globalContext, logger, cardInstanceId, dispatch);
    return memoizedInternalEvaluateRule(rule, actualValue, logger);
}; 