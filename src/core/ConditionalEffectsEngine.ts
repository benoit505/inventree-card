import { RootState } from '../store';
import { ParameterDetail, InventreeItem, ParameterOperator, ProcessedCondition, ConditionRuleDefinition, EffectDefinition, ActionExecutionContext } from '../types';
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
import { actionEngine } from '../services/ActionEngine';
import { HomeAssistant } from 'custom-card-helpers';

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

    public async evaluateAndApplyEffects(): Promise<void> {
        const state = this.getState();
        const conditions = selectProcessedConditionsFromLogic(state);
        const allPartsById = state.parts.partsById;
        const config = state.config;
        const hass = config.hass as HomeAssistant | undefined;
        const genericHaStates = state.genericHaStates as Record<string, any>;

        logger.log('[ConditionalEffectsEngine]', 'evaluateAndApplyEffects - START.', {
            processedConditionsCount: conditions.length,
        });

        if (!conditions || conditions.length === 0) {
            this.dispatch(setVisualEffectsBatch({}));
            return;
        }

        const newEffectsToApplyToParts: Record<number, VisualEffect> = {};

        const mergeVisualEffect = (partId: number, visualEffect: Partial<VisualEffect>) => {
            newEffectsToApplyToParts[partId] = { 
                ...(newEffectsToApplyToParts[partId] || {}), 
                ...visualEffect 
            } as VisualEffect;
        };

        for (const processedCond of conditions) {
            let conditionResult = false;
            const rule = processedCond.originalRule;
            let valueToEvaluateAgainst: any;

            let baseTargetPartPks: number[] = [];
            if (rule.targetPartIds === '*') {
                baseTargetPartPks = Object.keys(allPartsById).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
            } else if (Array.isArray(rule.targetPartIds)) {
                baseTargetPartPks = rule.targetPartIds.filter((id: any): id is number => typeof id === 'number' && !isNaN(id));
            } else if (typeof processedCond.partId === 'number') {
                baseTargetPartPks = [processedCond.partId];
            }

            if ((processedCond.sourceType === 'inventree_parameter' || processedCond.sourceType === 'inventree_attribute') && typeof processedCond.partId !== 'number') {
                logger.warn('CEE', `Skipping part-specific condition (ID: ${processedCond.id}) due to missing partId.`, { rule });
                continue;
            }

            switch (processedCond.sourceType) {
                case 'inventree_parameter':
                    if (typeof processedCond.partId === 'number' && processedCond.parameterName) {
                        const params = inventreeApi.endpoints.getPartParameters.select(processedCond.partId)(state)?.data;
                        valueToEvaluateAgainst = params?.find(p => p.template_detail?.name === processedCond.parameterName)?.data;
                    }
                    break;
                case 'inventree_attribute':
                    if (typeof processedCond.partId === 'number' && processedCond.attributeName) {
                        valueToEvaluateAgainst = allPartsById[processedCond.partId]?.[processedCond.attributeName];
                    }
                    break;
                case 'ha_entity_state':
                    if (processedCond.entityId) valueToEvaluateAgainst = selectGenericHaEntityActualState(state, processedCond.entityId);
                    break;
                case 'ha_entity_attribute':
                    if (processedCond.entityId && processedCond.haAttributeName) valueToEvaluateAgainst = selectGenericHaEntityAttribute(state, processedCond.entityId, processedCond.haAttributeName);
                    break;
                default: valueToEvaluateAgainst = undefined; break;
            }

            const opStr = String(rule.operator);
            let normalizedOp: ParameterOperator | string = opStr;
            if (opStr === '=') normalizedOp = 'equals';
            else if (opStr === '!=') normalizedOp = 'not_equals';
            else if (opStr === '>') normalizedOp = 'greater_than';
            else if (opStr === '<') normalizedOp = 'less_than';

            if (valueToEvaluateAgainst === undefined || valueToEvaluateAgainst === null) {
                switch (normalizedOp) {
                    case 'exists': conditionResult = false; break;
                    case 'is_empty': conditionResult = true; break;
                    default: conditionResult = (normalizedOp === 'equals' && (rule.value === null || rule.value === '')) || 
                                           (normalizedOp === 'not_equals' && (rule.value !== null && rule.value !== '')); break;
                }
            } else {
                switch (normalizedOp as ParameterOperator) {
                    case 'equals': conditionResult = String(valueToEvaluateAgainst) === String(rule.value); break;
                    case 'not_equals': conditionResult = String(valueToEvaluateAgainst) !== String(rule.value); break;
                    case 'contains': conditionResult = String(valueToEvaluateAgainst).includes(String(rule.value)); break;
                    case 'exists': conditionResult = String(valueToEvaluateAgainst).trim() !== ''; break;
                    case 'is_empty': conditionResult = String(valueToEvaluateAgainst).trim() === ''; break;
                    case 'greater_than': const vGt = parseFloat(String(valueToEvaluateAgainst)), rGt = parseFloat(String(rule.value)); conditionResult = !isNaN(vGt) && !isNaN(rGt) && vGt > rGt; break;
                    case 'less_than': const vLt = parseFloat(String(valueToEvaluateAgainst)), rLt = parseFloat(String(rule.value)); conditionResult = !isNaN(vLt) && !isNaN(rLt) && vLt < rLt; break;
                    default: 
                        logger.warn('CEE', `Unhandled operator '${normalizedOp}' for rule.`, { rule });
                        conditionResult = false;
                }
            }

            if (conditionResult) {
                logger.log('CEE', `Condition TRUE (ID: ${processedCond.id}, RuleParam: ${rule.parameter}). Applying effects.`, { baseTargetPartPks });

                if (processedCond.effects && Array.isArray(processedCond.effects)) {
                    for (const effect of processedCond.effects) {
                        let currentEffectTargetPks: number[] = baseTargetPartPks;
                        if (effect.targetPartPks) {
                            if (effect.targetPartPks === 'all_loaded') {
                                currentEffectTargetPks = Object.keys(allPartsById).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
                            } else if (Array.isArray(effect.targetPartPks)){
                                currentEffectTargetPks = effect.targetPartPks.filter((id: any): id is number => typeof id === 'number' && !isNaN(id));
                            } else if (typeof effect.targetPartPks === 'string') { 
                                currentEffectTargetPks = effect.targetPartPks.split(',').map(pk => parseInt(pk.trim(),10)).filter(pk => !isNaN(pk));
                            }
                        }

                        for (const pk of currentEffectTargetPks) {
                            if (typeof pk !== 'number' || isNaN(pk)) continue;

                            const currentPartForContext = allPartsById[pk];
                            if (!currentPartForContext && (effect.type === 'trigger_custom_action' || effect.type === 'set_style' || effect.type === 'set_visibility')) {
                                logger.warn('CEE', `Part PK ${pk} not found. Skipping effect.`, {effectType: effect.type});
                                continue;
                            }

                            switch (effect.type) {
                                case 'set_style':
                                    if (effect.styleProperty && effect.styleValue !== undefined) {
                                        const visualEffectKey = mapStylePropertyToVisualEffectKey(effect.styleProperty);
                                        if (visualEffectKey) {
                                            mergeVisualEffect(pk, { [visualEffectKey]: effect.styleValue });
                                        }
                                    }
                                    break;
                                case 'set_visibility':
                                    if (typeof effect.isVisible === 'boolean') { 
                                        mergeVisualEffect(pk, { isVisible: effect.isVisible });
                                    } else {
                                        logger.warn('CEE', `Effect 'set_visibility' for PK ${pk} used non-boolean isVisible. EffectDef:`, {effect});
                                        mergeVisualEffect(pk, { isVisible: (effect as any).value === 'show' }); 
                                    }
                                    break;
                                case 'trigger_custom_action':
                                    if (effect.customActionId) {
                                        logger.log('CEE', `Triggering custom action ID: ${effect.customActionId} for part PK: ${pk}`);
                                        const executionContext: ActionExecutionContext & { hass?: HomeAssistant } = {
                                            part: currentPartForContext,
                                            hass: hass,
                                            hassStates: genericHaStates,
                                        };
                                        actionEngine.executeAction(effect.customActionId, executionContext)
                                          .catch(actionError => {
                                                logger.error('CEE', `Error executing action ${effect.customActionId} from condition`, {pk, actionError});
                                          });
                                    }
                                    break;
                                default:
                                    logger.warn('CEE', `Unknown effect type: ${(effect as any).type}`, { effect });
                                    break;
                            }
                        }
                    }
                }
            }
        }
        this.dispatch(setVisualEffectsBatch(newEffectsToApplyToParts));
        logger.log('[ConditionalEffectsEngine]', 'evaluateAndApplyEffects - END.', { appliedEffectsCount: Object.keys(newEffectsToApplyToParts).length });
    }
}

// Example of how it might be instantiated and used (e.g., in a thunk or middleware)
//
// import { store } from '../store'; // Or get dispatch/getState from thunkAPI
//
// const effectsEngine = new ConditionalEffectsEngine(store.dispatch, store.getState);
// effectsEngine.evaluateAndApplyEffects(); 