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

const isRuleGroupGeneric = (ruleGroup?: RuleGroupType): boolean => {
    if (!ruleGroup || !ruleGroup.rules) return true;
    for (const ruleOrGroup of ruleGroup.rules) {
        if ('combinator' in ruleOrGroup) {
            if (!isRuleGroupGeneric(ruleOrGroup as RuleGroupType)) return false;
        } else {
            if (ruleOrGroup.field?.startsWith('part_') || ruleOrGroup.field?.startsWith('inv_param_')) {
                return false;
            }
        }
    }
    return true;
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

    private applyEffectsToTargets(
        effects: EffectDefinition[],
        effectsToApply: Record<number, VisualEffect>,
        allParts: InventreeItem[],
        contextPartPk?: number
    ) {
        for (const effect of effects) {
            let targetPksForThisEffect: number[] = [];

            if (effect.targetPartPks && Array.isArray(effect.targetPartPks)) {
                targetPksForThisEffect = effect.targetPartPks;
            } else if (effect.targetPartPks === 'all_loaded') {
                targetPksForThisEffect = allParts.map(p => p.pk);
            } else if (contextPartPk) {
                targetPksForThisEffect = [contextPartPk];
            }

            for (const pk of targetPksForThisEffect) {
                if (!effectsToApply[pk]) effectsToApply[pk] = {};
                const currentPartVisualEffects = effectsToApply[pk];

                switch (effect.type) {
                    case 'set_visibility':
                        currentPartVisualEffects.isVisible = effect.isVisible;
                        break;
                    case 'set_style':
                        if (effect.styleTarget === 'Row') {
                            const visualEffectKey = mapStylePropertyToVisualEffectKey(effect.styleProperty);
                            if (visualEffectKey && effect.styleValue !== undefined) {
                                (currentPartVisualEffects as any)[visualEffectKey] = effect.styleValue;
                            }
                        } else {
                            const columnId = effect.styleTarget;
                            if (columnId && effect.styleProperty && effect.styleValue !== undefined) {
                                if (!currentPartVisualEffects.cellStyles) currentPartVisualEffects.cellStyles = {};
                                if (!currentPartVisualEffects.cellStyles[columnId]) currentPartVisualEffects.cellStyles[columnId] = {};
                                (currentPartVisualEffects.cellStyles[columnId] as any)[effect.styleProperty] = effect.styleValue;
                            }
                        }
                        break;
                    case 'animate_style':
                        const presetKey = effect.preset?.toLowerCase(); // Make the check case-insensitive
                        if (presetKey === 'none') {
                            delete currentPartVisualEffects.animation;
                        } else if (presetKey && ANIMATION_PRESETS[presetKey]) {
                            currentPartVisualEffects.animation = {
                                ...(currentPartVisualEffects.animation || {}),
                                ...ANIMATION_PRESETS[presetKey].animation,
                            };
                        } else if (effect.animation) { 
                            currentPartVisualEffects.animation = {
                                ...(currentPartVisualEffects.animation || {}),
                                ...(effect.animation as any),
                            };
                        }
                        break;
                    case 'set_thumbnail_style':
                        if (!currentPartVisualEffects.thumbnailStyle) currentPartVisualEffects.thumbnailStyle = {};
                        if (effect.thumbnailFilter) currentPartVisualEffects.thumbnailStyle.filter = effect.thumbnailFilter;
                        if (typeof effect.thumbnailOpacity === 'number') currentPartVisualEffects.thumbnailStyle.opacity = effect.thumbnailOpacity;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    public async evaluateAndApplyEffects(
        cardInstanceId: string, 
        forceReevaluation: boolean = false, 
        logicItemsToEvaluate?: ConditionalLogicItem[]  
    ): Promise<void> {
        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects CALLED (two-pass). cardInstanceId: ${cardInstanceId}, LogicItems provided: ${!!logicItemsToEvaluate}`);
        const state = this.getState();
        
        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects for cardInstanceId: ${cardInstanceId}`, {
            data: {
                logicItems: logicItemsToEvaluate,
                configExists: !!state.config.configsByInstance[cardInstanceId],
                level: 'debug'
            }
        });

        if (!logicItemsToEvaluate || logicItemsToEvaluate.length === 0) {
            this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
            return;
        }

        const effectsToApply: Record<number, VisualEffect> = {};
        const allParts = selectCombinedParts(state, cardInstanceId);
        const haStates = selectAllGenericHaStates(state);
        const globalContext: GlobalContext = { ha_states: haStates };

        // --- Pass 1: Evaluate Generic Conditions ---
        for (const logicItem of logicItemsToEvaluate) {
            for (const pair of logicItem.logicPairs) {
                if (isRuleGroupGeneric(pair.conditionRules)) {
                    try {
                        if (evaluateExpression(pair.conditionRules, null, state, this.logger, cardInstanceId)) {
                            this.applyEffectsToTargets(pair.effects, effectsToApply, allParts);
                        }
                    } catch (e: any) {
                        this.logger.error('ConditionalEffectsEngine', `[Generic] ERROR evaluating condition for pair ${pair.id}: ${e.message}`);
                    }
                }
            }
        }

        // --- Pass 2: Evaluate Part-Specific Conditions ---
        for (const part of allParts) {
            for (const logicItem of logicItemsToEvaluate) {
                for (const pair of logicItem.logicPairs) {
                    if (!isRuleGroupGeneric(pair.conditionRules)) {
                        try {
                            if (evaluateExpression(pair.conditionRules, part, state, this.logger, cardInstanceId)) {
                                this.applyEffectsToTargets(pair.effects, effectsToApply, allParts, part.pk);
                            }
                        } catch (e: any) {
                            this.logger.error('ConditionalEffectsEngine', `[Part ${part.pk}] ERROR evaluating condition for pair ${pair.id}: ${e.message}`);
                        }
                    }
                }
            }
        }

        this.logger.log('ConditionalEffectsEngine', `[DEBUG] effectsToApply before dispatch for card ${cardInstanceId}:`, { data: { effectsToApply, level: 'silly' } });
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