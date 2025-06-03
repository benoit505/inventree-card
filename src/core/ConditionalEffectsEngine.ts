import { RootState, AppDispatch } from '../store';
import { Logger } from './logger';
import { 
    ConditionalLogicItem, 
    RuleGroupType, 
    // RuleType, // No longer directly needed for top-level iteration if evaluateExpression handles RuleGroupType
    EffectDefinition, 
    // InventreeItem, // No longer directly needed here
    // ParameterDetail // No longer directly needed here
} from '../types';
import { 
    VisualEffect,
    setConditionalPartEffectsBatch, 
    clearConditionalPartEffectsForCard
} from '../store/slices/visualEffectsSlice';
// import { 
//     selectAllGenericHaStates // No longer directly needed here, evaluateExpression handles context
// } from '../store/slices/genericHaStateSlice';
// import { selectApiConfig } from '../store/slices/apiSlice'; // No longer directly needed here
import { evaluateExpression } from '../utils/evaluateExpression';

const logger = Logger.getInstance();

// Helper to map styleProperty from EffectDefinition to VisualEffect keys
const mapStylePropertyToVisualEffectKey = (styleProperty: string): keyof VisualEffect | null => {
    switch (styleProperty) {
        case 'backgroundColor':
        case 'highlight': return 'highlight';
        case 'color':
        case 'textColor': return 'textColor';
        case 'border': return 'border';
        case 'opacity': return 'opacity';
        case 'icon': return 'icon';
        case 'badge': return 'badge';
        // Add other mappings as necessary
        default: return null;
    }
};

export class ConditionalEffectsEngine {
    private dispatch: AppDispatch;
    private getState: () => RootState;
    private logger: Logger;

    constructor(dispatch: AppDispatch, getState: () => RootState) {
        this.dispatch = dispatch;
        this.getState = getState;
        this.logger = Logger.getInstance();
        this.logger.log('ConditionalEffectsEngine', 'CONSTRUCTOR CALLED. Instance created.');
    }

    public async evaluateAndApplyEffects(
        cardInstanceId: string, 
        forceReevaluation: boolean = false, // forceReevaluation might be used for cache busting in evaluateExpression if implemented
        logicItemsToEvaluate?: ConditionalLogicItem[]  
    ): Promise<void> {
        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects CALLED. cardInstanceId: ${cardInstanceId}, LogicItems provided: ${!!logicItemsToEvaluate}, Count: ${logicItemsToEvaluate?.length}`);

        const state = this.getState();

        if (!logicItemsToEvaluate || logicItemsToEvaluate.length === 0) {
            this.logger.log('ConditionalEffectsEngine', `No logic items provided for card ${cardInstanceId}. Clearing its visual effects.`);
            this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
            return;
        }

        const effectsToApply: Record<number, VisualEffect> = {};
        const allPartsById = state.parts.partsById; // For resolving 'all_loaded' targetPartPks

        for (const logicItem of logicItemsToEvaluate) {
            this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Processing logic item: ${logicItem.id} (${logicItem.name || 'Unnamed'})`, { data: logicItem });

            for (const pair of logicItem.logicPairs) {
                this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}]   Processing pair: ${pair.id} (${pair.name || 'Unnamed'}) within logic item ${logicItem.id}`, { data: pair });
                let conditionResult = false;
                try {
                    // evaluateExpression now takes the ruleGroup, a potential part context (null for global/non-part-specific rules), the full state, and logger.
                    // The part context is null here because we are evaluating the rule group for the pair, 
                    // and then applying effects to potentially many parts.
                    // If a rule within the group is part-specific (e.g. `part.name === "Resistor"`), evaluateExpression should handle it.
                    conditionResult = evaluateExpression(pair.conditionRules, null, state, this.logger);
                    this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}]     Pair ${pair.id} condition result: ${conditionResult}`);
                } catch (e: any) {
                    this.logger.error('ConditionalEffectsEngine', `[CEE ${cardInstanceId}]     ERROR evaluating condition for pair ${pair.id}: ${e.message}`, {data: {stack: e.stack, ruleGroup: pair.conditionRules}});
                    conditionResult = false; 
                }

                if (conditionResult) {
                    this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}]     Condition MET for pair: ${pair.id}. Applying ${pair.effects.length} effects.`);
                    for (const effect of pair.effects) {
                        const targetPks = new Set<number>();
                        if (effect.targetPartPks === 'all_loaded') {
                            Object.keys(allPartsById).forEach(pkStr => targetPks.add(Number(pkStr)));
                        } else if (Array.isArray(effect.targetPartPks)) {
                            effect.targetPartPks.forEach(pk => targetPks.add(Number(pk)));
                        } else if (typeof effect.targetPartPks === 'string' && effect.targetPartPks.length > 0) {
                            effect.targetPartPks.split(',').forEach(pkStr => {
                                const numPk = Number(pkStr.trim());
                                if (!isNaN(numPk)) targetPks.add(numPk);
                            });
                        } else {
                            // If an effect has no specific targetPartPks, it might be a global effect (e.g., calling an HA service not tied to a part).
                            // For visual effects on parts, targetPartPks would usually be defined.
                            // If it's a visual effect without targetPartPks, it effectively targets nothing in this loop.
                            this.logger.warn('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Effect in pair ${pair.id} (logic item ${logicItem.id}) has no targetPartPks. Visual effects will not be applied to specific parts unless target is defined.`, {data: effect});
                            // For non-visual effects like 'call_ha_service', this might be fine.
                            // TODO: Handle non-part-specific effects if effect.type demands it (e.g. call_ha_service, trigger_custom_action without targetPartPks)
                            if (effect.type === 'set_style' || effect.type === 'set_visibility') {
                                if (!effect.targetPartPks) continue; // Skip visual effects if no parts targeted
                            }
                        }

                        if (targetPks.size === 0 && (effect.type === 'set_style' || effect.type === 'set_visibility')) {
                            this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] No specific target PKs resolved for visual effect in pair ${pair.id}. Skipping.`, {data: effect});
                            continue;
                        }
                        
                        targetPks.forEach(partId => {
                            if (!effectsToApply[partId]) {
                                effectsToApply[partId] = {};
                            }
                            const currentPartVisualEffects = effectsToApply[partId];

                            switch (effect.type) {
                                case 'set_visibility':
                                    currentPartVisualEffects.isVisible = effect.isVisible;
                                    break;
                                case 'set_style':
                                    if (effect.styleProperty && effect.styleValue !== undefined) {
                                        const visualEffectKey = mapStylePropertyToVisualEffectKey(effect.styleProperty);
                                        if (visualEffectKey) {
                                            (currentPartVisualEffects as any)[visualEffectKey] = effect.styleValue;
                                        } else {
                                            this.logger.warn('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Unhandled styleProperty: ${effect.styleProperty} in pair ${pair.id}`);
                                        }
                                    }
                                    break;
                                // TODO: Handle other effect types like 'call_ha_service', 'trigger_custom_action' here if they are to be triggered by this engine.
                                // For now, this engine focuses on visual effects on parts.
                                default:
                                    this.logger.warn('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Unhandled effect type for visual application: ${effect.type} in pair ${pair.id}`);
                                    break;
                            }
                            this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Visual effect applied for part ${partId} from pair ${pair.id}.`, {data: {effect, currentPartEffects: JSON.parse(JSON.stringify(currentPartVisualEffects))}});
                        });
                    }
                } // End of if (conditionResult)
            } // End of loop over logicItem.logicPairs
        } // End of loop over logicItemsToEvaluate

        this.logger.debug('ConditionalEffectsEngine', `[DEBUG] effectsToApply before dispatch for card ${cardInstanceId}:`, {
            data: JSON.parse(JSON.stringify(effectsToApply)) 
        });
        const hasEffectsToApply = Object.keys(effectsToApply).length > 0;
        this.logger.debug('ConditionalEffectsEngine', `[DEBUG] hasEffectsToApply for card ${cardInstanceId}: ${hasEffectsToApply}`);

        this.logger.log('ConditionalEffectsEngine', `Dispatching setConditionalPartEffectsBatch for card ${cardInstanceId}`, {
            data: { effectsCount: Object.keys(effectsToApply).length }
        });

        // Always dispatch, even if empty, to clear previous effects if no conditions are met this time.
        this.dispatch(setConditionalPartEffectsBatch({ cardInstanceId: cardInstanceId, effectsMap: effectsToApply }));
        
        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects END for cardInstanceId: ${cardInstanceId}`);
    }
}

// Example of how it might be instantiated and used (e.g., in a thunk or middleware)
//
// import { store } from '../store'; // Or get dispatch/getState from thunkAPI
//
// const effectsEngine = new ConditionalEffectsEngine(store.dispatch, store.getState);
// effectsEngine.evaluateAndApplyEffects('someCardInstanceId', false, []); 