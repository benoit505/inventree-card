import { RootState } from '../store';
import { ConditionalPartEffect, ParameterDetail, InventreeItem, ParameterOperator, ParameterActionType, ProcessedCondition, ConditionRuleDefinition } from '../types';
import { selectProcessedConditions as selectProcessedConditionsFromLogic } from '../store/slices/conditionalLogicSlice';
import {
    selectGenericHaEntityState,
    selectGenericHaEntityActualState,
    selectGenericHaEntityAttribute
} from '../store/slices/genericHaStateSlice';
import { Logger } from '../utils/logger';
import { setConditionalPartEffectsBatch } from '../store/slices/parametersSlice';
import { AppDispatch } from '../store'; // Assuming AppDispatch is exported from your store

const logger = Logger.getInstance();

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

        logger.log('[ConditionalEffectsEngine]', 'evaluateAndApplyEffects - START.', {
            level: 'debug',
            processedConditionsCount: conditions.length,
            parameterValuesKeys: Object.keys(allParametersByPartId).length
        });

        if (!conditions || conditions.length === 0) {
            logger.log('ConditionalEffectsEngine', 'No processed conditions to evaluate. Clearing existing effects.');
            this.dispatch(setConditionalPartEffectsBatch({}));
            return;
        }

        const newEffects: Record<number, ConditionalPartEffect> = {};

        const mergeEffect = (partId: number, effect: Partial<ConditionalPartEffect>) => {
            if (!newEffects[partId]) {
                newEffects[partId] = {};
            }
            newEffects[partId] = { ...newEffects[partId], ...effect };
        };

        for (const processedCond of conditions) { // Renamed to avoid confusion with 'condition' variable inside loop
            let conditionResult = false;
            const rule = processedCond.originalRule; // Access the original rule definition

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
                        const partParams = allParametersByPartId[processedCond.partId];
                        valueToEvaluateAgainst = partParams?.[processedCond.parameterName]?.data;
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
                        valueToEvaluateAgainst = selectGenericHaEntityActualState(state, processedCond.entityId);
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
                switch (rule.operator) {
                    case 'equals': conditionResult = String(valueToEvaluateAgainst) === String(rule.value); break;
                    case 'not_equals': conditionResult = String(valueToEvaluateAgainst) !== String(rule.value); break;
                    case 'contains': conditionResult = String(valueToEvaluateAgainst).includes(String(rule.value)); break;
                    case 'exists': conditionResult = String(valueToEvaluateAgainst).trim() !== ''; break; 
                    case 'is_empty': conditionResult = String(valueToEvaluateAgainst).trim() === ''; break; 
                    case 'greater_than':
                        const numParamValGt = parseFloat(String(valueToEvaluateAgainst));
                        const numValToCompareGt = parseFloat(String(rule.value));
                        conditionResult = !isNaN(numParamValGt) && !isNaN(numValToCompareGt) && numParamValGt > numValToCompareGt;
                        break;
                    case 'less_than':
                        const numParamValLt = parseFloat(String(valueToEvaluateAgainst));
                        const numValToCompareLt = parseFloat(String(rule.value));
                        conditionResult = !isNaN(numParamValLt) && !isNaN(numValToCompareLt) && numParamValLt < numValToCompareLt;
                        break;
                    default:
                        logger.warn('ConditionalEffectsEngine', `Unknown operator: ${rule.operator}`, { rule, valueToEvaluateAgainst });
                        conditionResult = false;
                }
            }

            if (conditionResult) {
                logger.log('ConditionalEffectsEngine', `Condition MET: ${sourceDescription}`, {
                    level: 'debug',
                    conditionId: processedCond.id,
                    originalRule: rule,
                    valueEvaluated: valueToEvaluateAgainst,
                    targetPartPks
                });

                for (const pk of targetPartPks) {
                    let effectToApply: Partial<ConditionalPartEffect> = {};
                    switch (rule.action) {
                        case 'filter': effectToApply.isVisible = rule.action_value === 'show'; break;
                        case 'highlight': effectToApply.highlight = rule.action_value; break;
                        case 'text_color': effectToApply.textColor = rule.action_value; break;
                        case 'border': effectToApply.border = rule.action_value; break;
                        case 'icon': effectToApply.icon = rule.action_value; break;
                        case 'badge': effectToApply.badge = rule.action_value; break;
                        case 'priority': effectToApply.priority = rule.action_value; break;
                        case 'sort':
                        case 'show_section':
                            logger.log('ConditionalEffectsEngine', `Action type '${rule.action}' requires specific handling not yet implemented.`, { rule });
                            break;
                        default: logger.warn('ConditionalEffectsEngine', `Unknown action type: ${rule.action}`, { rule });
                    }

                    if (Object.keys(effectToApply).length > 0) {
                        mergeEffect(pk, effectToApply);
                    } else {
                         logger.warn('[ConditionalEffectsEngine]', 'effectToApply is empty, no effect merged.', {
                            level: 'debug',
                            conditionId: processedCond.id, action: rule.action, actionValue: rule.action_value, targetPartPks
                        });
                    }
                }
            } else {
                 logger.log('ConditionalEffectsEngine', 'Condition NOT MET', {
                    level: 'silly', 
                    conditionId: processedCond.id, originalRuleParameter: rule.parameter, evaluatedValue: valueToEvaluateAgainst, comparedTo: rule.value, operator: rule.operator
                });
            }
        }

        logger.log('[ConditionalEffectsEngine]', 'Final newEffects before dispatching setConditionalPartEffectsBatch', {level: 'debug', newEffects });
        this.dispatch(setConditionalPartEffectsBatch(newEffects));
        logger.log('ConditionalEffectsEngine', 'Finished evaluating conditions and dispatched effects batch.', { newEffectsCount: Object.keys(newEffects).length });
    }
}

// Example of how it might be instantiated and used (e.g., in a thunk or middleware)
//
// import { store } from '../store'; // Or get dispatch/getState from thunkAPI
//
// const effectsEngine = new ConditionalEffectsEngine(store.dispatch, store.getState);
// effectsEngine.evaluateAndApplyEffects(); 