import { RootState, AppDispatch } from '../store';
import { Logger } from './logger';
import { 
    ConditionalLogicItem, 
    RuleGroupType, 
    // RuleType, // No longer directly needed for top-level iteration if evaluateExpression handles RuleGroupType
    EffectDefinition, 
    InventreeItem,
    GlobalContext,
    LogicPair,
    // ParameterDetail // No longer directly needed here
} from '../types';
import { 
    VisualEffect,
    setConditionalPartEffectsBatch, 
    clearConditionalPartEffectsForCard
} from '../store/slices/visualEffectsSlice';
import { selectAllGenericHaStates } from '../store/slices/genericHaStateSlice';
// import { selectApiConfig } from '../store/slices/apiSlice'; // No longer directly needed here
import { evaluateExpression } from '../utils/evaluateExpression';
import { selectCombinedParts } from '../store/slices/partsSlice';
import { ANIMATION_PRESETS } from './constants'; // Import presets

// Re-added comment to force re-evaluation of types
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
        forceReevaluation: boolean = false, // Not used in this implementation, but kept for API consistency
        logicItemsToEvaluate?: ConditionalLogicItem[]  
    ): Promise<void> {
        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects CALLED (part-first). cardInstanceId: ${cardInstanceId}, LogicItems provided: ${!!logicItemsToEvaluate}, Count: ${logicItemsToEvaluate?.length}`);
        console.log(`[ConditionalEffectsEngine] Starting evaluation for card: ${cardInstanceId}`);

        const state = this.getState();

        if (!logicItemsToEvaluate || logicItemsToEvaluate.length === 0) {
            this.logger.log('ConditionalEffectsEngine', `No logic items provided for card ${cardInstanceId}. Clearing its visual effects.`);
            this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
            return;
        }

        const effectsToApply: Record<number, VisualEffect> = {};
        const allParts = selectCombinedParts(state);
        const haStates = selectAllGenericHaStates(state);
        const globalContext: GlobalContext = { ha_states: haStates };

        console.log('[ConditionalEffectsEngine] Evaluation context:', {
            partCount: allParts.length,
            logicItemCount: logicItemsToEvaluate.length,
        });

        // --- "Part-First" Architecture ---
        // 1. Iterate through each part.
        for (const part of allParts) {
            effectsToApply[part.pk] = {}; // Initialize an empty effects object for the part.
            
            // 2. For each part, iterate through all logic rules.
            for (const logicItem of logicItemsToEvaluate) {
                for (const pair of logicItem.logicPairs) {
                    let conditionResult = false;
                    try {
                        // --- NEW LOGIC: Check for part-specific rules ---
                        let isRulePartSpecific = false;
                        let specificPartId = -1;

                        const findSpecificPartId = (rules: any) => {
                            for (const rule of rules) {
                                if (rule.field && typeof rule.field === 'string') {
                                    const match = rule.field.match(/^part_(\d+)_/);
                                    if (match && match[1]) {
                                        isRulePartSpecific = true;
                                        specificPartId = parseInt(match[1], 10);
                                        return; // Found it, stop searching
                                    }
                                }
                                if (rule.rules) {
                                    findSpecificPartId(rule.rules);
                                    if (isRulePartSpecific) return; // Propagate the find
                                }
                            }
                        };
                        
                        if (pair.conditionRules?.rules) {
                           findSpecificPartId(pair.conditionRules.rules);
                        }

                        // If the rule is for a specific part, and it's not the current part, skip evaluation.
                        if (isRulePartSpecific && specificPartId !== part.pk) {
                            conditionResult = false;
                        } else {
                            // 3. Evaluate the condition WITH the current part as context. This fixes the "partContext Lie".
                            conditionResult = evaluateExpression(pair.conditionRules, part, state, this.logger);
                        }
                    } catch (e: any) {
                        this.logger.error('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] ERROR evaluating condition for pair ${pair.id} on part ${part.pk}: ${e.message}`, {data: {stack: e.stack, ruleGroup: pair.conditionRules}});
                        conditionResult = false;
                    }

                    // 4. If the condition is true for this part, apply the effects.
                    if (conditionResult) {
                        this.logger.log('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Condition MET for pair ${pair.id} on part ${part.pk}. Applying ${pair.effects.length} effects.`);
                        console.log(`[ConditionalEffectsEngine] Part ${part.pk} met condition for logic pair ${pair.id}`);

                        for (const effect of pair.effects) {
                            // The targetPartPks check is now redundant for part-specific visual effects, as we are already in a part's loop.
                            // However, we can keep it as an additional filter if needed, or for non-visual effects that might still target other parts.
                            // For simplicity in this refactor, we assume the effect applies to the current `part`.

                            const currentPartVisualEffects = effectsToApply[part.pk];

                            switch (effect.type) {
                                case 'set_visibility':
                                    currentPartVisualEffects.isVisible = effect.isVisible;
                                    break;
                                case 'set_style':
                                    if (effect.styleProperty && effect.styleValue !== undefined) {
                                        const visualEffectKey = mapStylePropertyToVisualEffectKey(effect.styleProperty);
                                        if (visualEffectKey) {
                                            (currentPartVisualEffects as any)[visualEffectKey] = effect.styleValue;
                                        }
                                    }
                                    break;
                                case 'animate_style':
                                    // NEW: Handle presets first
                                    if (effect.preset && ANIMATION_PRESETS[effect.preset]) {
                                        currentPartVisualEffects.animation = {
                                            ...(currentPartVisualEffects.animation || {}),
                                            ...ANIMATION_PRESETS[effect.preset].animation,
                                        };
                                    } 
                                    // Keep support for legacy raw animation for now
                                    else if (effect.animation) { 
                                        currentPartVisualEffects.animation = {
                                            ...(currentPartVisualEffects.animation || {}),
                                            ...(effect.animation as any),
                                        };
                                    }
                                    break;
                                case 'set_thumbnail_style':
                                    if (!currentPartVisualEffects.thumbnailStyle) {
                                        currentPartVisualEffects.thumbnailStyle = {};
                                    }
                                    if (effect.thumbnailFilter) {
                                        currentPartVisualEffects.thumbnailStyle.filter = effect.thumbnailFilter;
                                    }
                                    if (typeof effect.thumbnailOpacity === 'number') {
                                        currentPartVisualEffects.thumbnailStyle.opacity = effect.thumbnailOpacity;
                                    }
                                    break;
                                default:
                                    // Non-visual effects would be handled here or in a separate engine.
                                    break;
                            }
                        }
                    } // End if (conditionResult)
                } // End loop logicPairs
            } // End loop logicItems
        } // End loop allParts

        this.logger.debug('ConditionalEffectsEngine', `[DEBUG] effectsToApply before dispatch for card ${cardInstanceId}:`, effectsToApply);

        console.log(`[ConditionalEffectsEngine] Evaluation complete for card ${cardInstanceId}. Final effects to apply:`, effectsToApply);
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