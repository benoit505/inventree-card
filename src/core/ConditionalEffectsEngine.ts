import { RootState } from '../store';
import { ParameterDetail, InventreeItem, ParameterOperator, ParameterActionType, ProcessedCondition, ConditionRuleDefinition, EffectDefinition } from '../types';
import { VisualEffect } from '../store/slices/visualEffectsSlice';
import { selectProcessedConditions as selectProcessedConditionsFromLogic } from '../store/slices/conditionalLogicSlice';
import {
    selectGenericHaEntityState,
    selectGenericHaEntityActualState,
    selectGenericHaEntityAttribute
} from '../store/slices/genericHaStateSlice';
import { Logger } from '../utils/logger';
import { setVisualEffectsBatch } from '../store/slices/visualEffectsSlice';
import { AppDispatch } from '../store';
import { inventreeApi } from '../store/apis/inventreeApi';

const logger = Logger.getInstance();

// Helper function to map styleProperty from EffectDefinition to VisualEffect keys
const mapStylePropertyToVisualEffectKey = (styleProperty: string): keyof VisualEffect | null => {
    const lowerCaseProp = styleProperty.toLowerCase();
    switch (lowerCaseProp) {
        case 'highlight':
        case 'backgroundcolor':
            return 'highlight';
        case 'textcolor':
        case 'color':
            return 'textColor';
        case 'border':
            return 'border';
        case 'icon':
            return 'icon';
        case 'badge':
            return 'badge';
        case 'opacity':
            return 'opacity';
        case 'priority':
            return 'priority';
        // Add other direct mappings here if VisualEffect has more specific keys
        // For example, if customClasses becomes a direct string property:
        // case 'customclasses':
        // return 'customClasses';
        default:
            // Check if it's a direct match to a VisualEffect key (for less common ones)
            const directMatch = styleProperty as keyof VisualEffect;
            const sampleVisualEffect: VisualEffect = { isVisible: true }; // Dummy object to check keys
            if (Object.keys(sampleVisualEffect).includes(directMatch)) {
                return directMatch;
            }
            return null;
    }
};

export class ConditionalEffectsEngine {
    private dispatch: AppDispatch;
    private getState: () => RootState;

    constructor(dispatch: AppDispatch, getState: () => RootState) {
        this.dispatch = dispatch;
        this.getState = getState;
        logger.log('ConditionalEffectsEngine', 'Engine initialized.');
    }

    public evaluateAndApplyEffects(): void {
        const state = this.getState();
        const conditions = selectProcessedConditionsFromLogic(state);
        const allParametersByPartId = state.parameters.parameterValues;
        const allPartsById = state.parts.partsById;

        // TEMP LOG 1: Log processedConditions
        // console.log('[TEMP LOG CEE] Initial processedConditions:', JSON.parse(JSON.stringify(conditions || [])));

        logger.log('[ConditionalEffectsEngine]', 'evaluateAndApplyEffects - START.', {
            level: 'debug',
            processedConditionsCount: conditions.length,
            parameterValuesKeys: Object.keys(allParametersByPartId).length
        });

        if (!conditions || conditions.length === 0) {
            logger.log('ConditionalEffectsEngine', 'No processed conditions to evaluate. Clearing existing effects.');
            this.dispatch(setVisualEffectsBatch({}));
            return;
        }

        const newEffects: Record<number, VisualEffect> = {};

        const mergeEffect = (partId: number, effect: Partial<VisualEffect>) => {
            if (!newEffects[partId]) {
                newEffects[partId] = {} as VisualEffect;
            }
            newEffects[partId] = { ...newEffects[partId], ...effect };
        };

        for (const processedCond of conditions) {
            let conditionResult = false;
            const rule = processedCond.originalRule;

            let targetPartPks: number[] = [];
            if (rule.targetPartIds === '*') {
                targetPartPks = Object.keys(allPartsById).map((id: string) => parseInt(id, 10)).filter(id => !isNaN(id));
            } else if (Array.isArray(rule.targetPartIds)) {
                targetPartPks = rule.targetPartIds.filter((id: any) => typeof id === 'number' && !isNaN(id));
            }

            let valueToEvaluateAgainst: any;
            let sourceDescription = `Condition ID: ${processedCond.id}, Source: ${rule.parameter}`;

            switch (processedCond.sourceType) {
                case 'inventree_parameter':
                    if (processedCond.partId !== undefined && processedCond.parameterName) {
                        const selectGetPartParametersQuery = inventreeApi.endpoints.getPartParameters.select(processedCond.partId);
                        const queryResult = selectGetPartParametersQuery(state);

                        if (queryResult?.status === 'fulfilled' && queryResult.data) {
                            const parameters: ParameterDetail[] = queryResult.data;
                            const targetParameter = parameters.find(p => p.template_detail?.name === processedCond.parameterName);
                            valueToEvaluateAgainst = targetParameter?.data;
                            logger.log('[ConditionalEffectsEngine]', `Read from RTK Query: Part ${processedCond.partId}, Param ${processedCond.parameterName}, Value: ${valueToEvaluateAgainst}`, {level: 'debug'});
                        } else {
                            logger.warn('ConditionalEffectsEngine', `Parameters for part ${processedCond.partId} not fulfilled in RTK Query cache. Status: ${queryResult?.status}. Param: ${processedCond.parameterName}`, { queryStatus: queryResult?.status });
                            valueToEvaluateAgainst = undefined; 
                        }
                        sourceDescription += ` (Part PK: ${processedCond.partId}, Param: ${processedCond.parameterName})`;
                    } else {
                        logger.warn('ConditionalEffectsEngine', `Missing partId or parameterName for inventree_parameter type.`, { processedCond });
                    }
                    break;
                case 'inventree_attribute':
                    if (processedCond.partId !== undefined && processedCond.attributeName) {
                        const partData = allPartsById[processedCond.partId];
                        valueToEvaluateAgainst = partData?.[processedCond.attributeName];
                        sourceDescription += ` (Part PK: ${processedCond.partId}, Attribute: ${processedCond.attributeName})`;
                    } else {
                        logger.warn('ConditionalEffectsEngine', `Missing partId or attributeName for inventree_attribute type.`, { processedCond });
                    }
                    break;
                case 'ha_entity_state':
                    if (processedCond.entityId) {
                        // TEMP LOG 2a: Log entityId for ha_entity_state
                        // console.log(`[TEMP LOG CEE] ha_entity_state: processing entityId: ${processedCond.entityId}`);
                        valueToEvaluateAgainst = selectGenericHaEntityActualState(state, processedCond.entityId);
                        // TEMP LOG 2b: Log valueToEvaluateAgainst for ha_entity_state
                        // console.log(`[TEMP LOG CEE] ha_entity_state: valueToEvaluateAgainst for ${processedCond.entityId}:`, valueToEvaluateAgainst);
                        sourceDescription += ` (Entity: ${processedCond.entityId}, State)`;
                    } else {
                        logger.warn('ConditionalEffectsEngine', `Missing entityId for ha_entity_state type.`, { processedCond });
                    }
                    break;
                case 'ha_entity_attribute':
                    if (processedCond.entityId && processedCond.haAttributeName) {
                        valueToEvaluateAgainst = selectGenericHaEntityAttribute(state, processedCond.entityId, processedCond.haAttributeName);
                        sourceDescription += ` (Entity: ${processedCond.entityId}, Attribute: ${processedCond.haAttributeName})`;
                    } else {
                        logger.warn('ConditionalEffectsEngine', `Missing entityId or haAttributeName for ha_entity_attribute type.`, { processedCond });
                    }
                    break;
                case 'unknown':
                default:
                    logger.warn('ConditionalEffectsEngine', `Unhandled or unknown sourceType: ${processedCond.sourceType}`, { processedCond });
                    valueToEvaluateAgainst = undefined;
                    break;
            }
            
            // TEMP LOG 3: Log before operator switch
            // console.log(`[TEMP LOG CEE] Before operator switch for rule on '${rule.parameter}': valueToEvaluateAgainst:`, valueToEvaluateAgainst, `operator: ${rule.operator}, rule.value:`, rule.value);

            if (valueToEvaluateAgainst === undefined || valueToEvaluateAgainst === null) {
                switch (rule.operator) {
                    case 'exists': conditionResult = false; break;
                    case 'is_empty': conditionResult = true; break;
                    default:
                        if (rule.operator === 'equals' && (rule.value === null || rule.value === '')) {
                            conditionResult = true;
                        } else if (rule.operator === 'not_equals' && (rule.value !== null && rule.value !== '')) {
                            conditionResult = true;
                        } else {
                            conditionResult = false;
                        }
                        break;
                }
            } else {
                // Normalize the operator before the switch
                let normalizedOperator: ParameterOperator = rule.operator; // Initially assume it might be a valid ParameterOperator string literal

                // Check if rule.operator is a symbol and needs normalization
                // Cast to string for the symbolic check, as rule.operator is typed ParameterOperator
                const currentOperatorSymbol = String(rule.operator);
                switch (currentOperatorSymbol) { 
                    case '=': 
                        normalizedOperator = 'equals'; 
                        break;
                    case '!=': 
                        normalizedOperator = 'not_equals'; 
                        break;
                    case '>': 
                        normalizedOperator = 'greater_than'; 
                        break;
                    case '<': 
                        normalizedOperator = 'less_than'; 
                        break;
                    // If rule.operator was already 'equals', 'contains', etc., it will pass through here
                    // and be assigned to normalizedOperator correctly in the initial declaration. 
                    // Or, if it was a symbol not mapped above, it remains as is from initial assignment.
                }

                // If after potential normalization, it's still not a valid ParameterOperator type
                // (e.g. a symbol we didn't map, or an invalid string from the start),
                // we might need a final check or the switch default will catch it.
                // For now, the switch on normalizedOperator will ensure type safety for its cases.

                switch (normalizedOperator) { // Switch on the normalized operator
                    case 'equals': 
                        const valStr = String(valueToEvaluateAgainst);
                        const ruleValStr = String(rule.value);
                        conditionResult = valStr === ruleValStr;
                        // console.log(`[TEMP LOG CEE] 'equals' operator: (Normalized from '${rule.operator}') '${valStr}' === '${ruleValStr}' -> ${conditionResult}`);
                        break;
                    case 'not_equals': 
                        conditionResult = String(valueToEvaluateAgainst) !== String(rule.value); 
                        // console.log(`[TEMP LOG CEE] 'not_equals' operator: (Normalized from '${rule.operator}') '${String(valueToEvaluateAgainst)}' !== '${String(rule.value)}' -> ${conditionResult}`);
                        break;
                    case 'contains': 
                        conditionResult = String(valueToEvaluateAgainst).includes(String(rule.value)); 
                        // console.log(`[TEMP LOG CEE] 'contains' operator: (Normalized from '${rule.operator}') '${String(valueToEvaluateAgainst)}'.includes('${String(rule.value)}') -> ${conditionResult}`);
                        break;
                    case 'exists': 
                        conditionResult = String(valueToEvaluateAgainst).trim() !== ''; 
                        // console.log(`[TEMP LOG CEE] 'exists' operator: (Normalized from '${rule.operator}') '${String(valueToEvaluateAgainst)}'.trim() !== '' -> ${conditionResult}`);
                        break; 
                    case 'is_empty': 
                        conditionResult = String(valueToEvaluateAgainst).trim() === ''; 
                        // console.log(`[TEMP LOG CEE] 'is_empty' operator: (Normalized from '${rule.operator}') '${String(valueToEvaluateAgainst)}'.trim() === '' -> ${conditionResult}`);
                        break; 
                    case 'greater_than':
                        const numParamValGt = parseFloat(String(valueToEvaluateAgainst));
                        const numValToCompareGt = parseFloat(String(rule.value));
                        conditionResult = !isNaN(numParamValGt) && !isNaN(numValToCompareGt) && numParamValGt > numValToCompareGt;
                        // console.log(`[TEMP LOG CEE] 'greater_than' operator: (Normalized from '${rule.operator}') ${numParamValGt} > ${numValToCompareGt} -> ${conditionResult}`);
                        break;
                    case 'less_than':
                        const numParamValLt = parseFloat(String(valueToEvaluateAgainst));
                        const numValToCompareLt = parseFloat(String(rule.value));
                        conditionResult = !isNaN(numParamValLt) && !isNaN(numValToCompareLt) && numParamValLt < numValToCompareLt;
                        // console.log(`[TEMP LOG CEE] 'less_than' operator: (Normalized from '${rule.operator}') ${numParamValLt} < ${numValToCompareLt} -> ${conditionResult}`);
                        break;
                    default:
                        // This default case should ideally not be reached if all operators are handled/normalized
                        logger.warn('ConditionalEffectsEngine', `Unknown or unnormalized operator: ${normalizedOperator} (original: ${rule.operator})`, { rule, valueToEvaluateAgainst });
                        conditionResult = false;
                }
            }

            if (conditionResult) {
                // TEMP LOG 5a: Log condition MET
                // console.log(`[TEMP LOG CEE] Condition MET for rule on '${rule.parameter}'`, { rule_id: processedCond.id, value_evaluated: valueToEvaluateAgainst, targetPartPks });

                logger.log('ConditionalEffectsEngine', `Condition MET: ${sourceDescription}`, {
                    level: 'debug',
                    conditionId: processedCond.id,
                    originalRule: rule,
                    valueEvaluated: valueToEvaluateAgainst,
                    targetPartPks
                });

                if (processedCond.effects && Array.isArray(processedCond.effects)) {
                    for (const effectDef of processedCond.effects) {
                        // console.log(`[TEMP LOG CEE] Processing effectDef:`, JSON.parse(JSON.stringify(effectDef)));
                        let effectToApply: Partial<VisualEffect> = {};
                        let currentTargetPartPks: number[] = [];

                        // Log the effectDef being processed
                        // logger.log('CEE_EFFECT_DEBUG', 'Processing effectDef:', { data: effectDef });

                        // Determine target part PKs for this specific effect
                        if (effectDef.targetPartPks) {
                            if (typeof effectDef.targetPartPks === 'string') {
                                if (effectDef.targetPartPks.toLowerCase() === 'all_loaded') {
                                    currentTargetPartPks = targetPartPks;
                                } else {
                                    // Assuming comma-separated string of PKs
                                    currentTargetPartPks = effectDef.targetPartPks.split(',').map(pk => parseInt(pk.trim(), 10)).filter(pk => !isNaN(pk));
                                }
                            } else if (Array.isArray(effectDef.targetPartPks)) {
                                currentTargetPartPks = effectDef.targetPartPks;
                            }
                        } else if (targetPartPks && targetPartPks.length > 0) {
                            // Fallback to rule-level targetPartPks if effect-specific one is not defined
                            currentTargetPartPks = targetPartPks;
                        } else if (processedCond.partId !== undefined) { // Check if partId is defined
                            // Fallback to the partId from the condition if it's a part-specific condition
                            currentTargetPartPks = [processedCond.partId];
                        }

                        // Log resolved currentTargetPartPks
                        // logger.log('CEE_EFFECT_DEBUG', 'Resolved currentTargetPartPks:', { data: currentTargetPartPks });

                        if (currentTargetPartPks.length === 0 && (effectDef.type === 'set_style' || effectDef.type === 'set_visibility')) {
                            logger.warn('CEE', `No target part PKs resolved for effect type '${effectDef.type}' and no fallback. Effect for rule '${rule.name || processedCond.id}' might not apply as expected. Effect ID: ${effectDef.id}`);
                        }

                        switch (effectDef.type) {
                            case 'set_visibility':
                                if (typeof effectDef.isVisible === 'boolean') {
                                    effectToApply.isVisible = effectDef.isVisible;
                                }
                                break;
                            case 'set_style':
                                if (effectDef.styleProperty && effectDef.styleValue !== undefined) {
                                    // Map editor-friendly styleProperty to VisualEffect keys
                                    const visualEffectKey = mapStylePropertyToVisualEffectKey(effectDef.styleProperty); // Removed cast
                                    if (visualEffectKey) {
                                        // Special handling for opacity as it needs to be a number
                                        if (visualEffectKey === 'opacity') {
                                            const opacityVal = parseFloat(effectDef.styleValue);
                                            if (!isNaN(opacityVal)) {
                                                (effectToApply as any)[visualEffectKey] = opacityVal;
                                            } else {
                                                logger.warn('CEE', `Invalid opacity value: ${effectDef.styleValue} for effect ID: ${effectDef.id}. Must be a number.`);
                                            }
                                        } else {
                                            (effectToApply as any)[visualEffectKey] = effectDef.styleValue;
                                        }
                                    } else {
                                        logger.warn('CEE', `Unknown styleProperty: ${effectDef.styleProperty} in effect ID: ${effectDef.id}`);
                                    }
                                }
                                break;
                            default:
                                logger.warn('ConditionalEffectsEngine', `Unknown effect type: ${effectDef.type}`, { effectDef });
                        }

                        // console.log(`[TEMP LOG CEE] Constructed effectToApply:`, JSON.parse(JSON.stringify(effectToApply)), `for targetPartPks:`, targetPartPks);
                        if (Object.keys(effectToApply).length > 0 && currentTargetPartPks.length > 0) {
                            // Log effectToApply and currentTargetPartPks before mergeEffect
                            // logger.log('CEE_EFFECT_DEBUG', 'Applying effect:', { data: { effectToApply, pks: currentTargetPartPks } });
                            for (const pk of currentTargetPartPks) {
                                mergeEffect(pk, effectToApply);
                            }
                        } else {
                            logger.warn('[ConditionalEffectsEngine]', 'effectToApply was empty for an effectDef, no effect merged.', {
                                level: 'debug',
                                conditionId: processedCond.id,
                                effectDef,
                                targetPartPks
                            });
                        }
                    }
                } else {
                     logger.warn('[ConditionalEffectsEngine]', 'Condition met, but processedCond.effects is missing or not an array.', {
                        level: 'debug',
                        conditionId: processedCond.id,
                        originalRule: rule
                    });
                }
            } else {
                 logger.log('ConditionalEffectsEngine', 'Condition NOT MET', {
                    level: 'silly', 
                    conditionId: processedCond.id, originalRuleParameter: rule.parameter, evaluatedValue: valueToEvaluateAgainst, comparedTo: rule.value, operator: rule.operator
                });
            }
        }

        // TEMP LOG 6: Log final newEffects
        // console.log('[TEMP LOG CEE] Final newEffects before dispatch:', JSON.parse(JSON.stringify(newEffects)));

        logger.log('[ConditionalEffectsEngine]', 'Final newEffects before dispatching setVisualEffectsBatch', {level: 'debug', newEffects: newEffects });
        this.dispatch(setVisualEffectsBatch(newEffects));
        logger.log('ConditionalEffectsEngine', 'Finished evaluating conditions and dispatched effects batch.', { newEffectsCount: Object.keys(newEffects).length });
    }
}

// Example of how it might be instantiated and used (e.g., in a thunk or middleware)
//
// import { store } from '../store'; // Or get dispatch/getState from thunkAPI
//
// const effectsEngine = new ConditionalEffectsEngine(store.dispatch, store.getState);
// effectsEngine.evaluateAndApplyEffects(); 