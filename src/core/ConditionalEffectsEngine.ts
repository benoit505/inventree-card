import { RootState, AppDispatch } from '../store';
import { ConditionalLoggerEngine } from './logging/ConditionalLoggerEngine';
import { 
    ConditionalLogicItem, 
    RuleGroupType, 
    EffectDefinition, 
    InventreeItem,
    GlobalContext,
    LogicPair,
    VisualEffect
} from '../types';
import { CSSProperties } from 'react';
import { 
    setConditionalPartEffectsBatch, 
    clearConditionalPartEffectsForCard,
    setConditionalLayoutEffect
} from '../store/slices/visualEffectsSlice';
import { selectAllGenericHaStates } from '../store/slices/genericHaStateSlice';
import { evaluateExpression } from '../utils/evaluateExpression';
import { selectCombinedParts } from '../store/slices/partsSlice';
import { ANIMATION_PRESETS } from './constants';

const logger = ConditionalLoggerEngine.getInstance().getLogger('ConditionalEffectsEngine');
ConditionalLoggerEngine.getInstance().registerCategory('ConditionalEffectsEngine', { enabled: false, level: 'info' });

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

    constructor(dispatch: AppDispatch, getState: () => RootState) {
        this.dispatch = dispatch;
        this.getState = getState;
    }

    private applyEffectsToTargets(
        effects: Exclude<EffectDefinition, { type: 'set_layout' }>[],
        effectsToApply: Record<number, VisualEffect>,
        allParts: InventreeItem[],
        contextPartPk?: number
    ) {
        for (const effect of effects) {
            let targetPksForThisEffect: number[] = [];

            // Ensure incoming target PKs are numbers
            const specificTargetPks = effect.targetPartPks && Array.isArray(effect.targetPartPks) 
                ? effect.targetPartPks.map(pk => Number(pk)).filter(pk => !isNaN(pk)) 
                : [];

            if (specificTargetPks.length > 0) {
                // Case 1: The effect explicitly defines a list of target parts. Use ONLY these.
                targetPksForThisEffect = specificTargetPks;
            } else if (contextPartPk !== undefined) {
                // Case 2: The condition was evaluated for a specific part (context is available).
                // Apply the effect only to that part.
                targetPksForThisEffect = [contextPartPk];
            } else {
                // Case 3: A generic condition (no context part) with no specific targets.
                // Apply to all loaded parts.
                targetPksForThisEffect = allParts.map(p => p.pk);
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
                            const visualEffectKey = mapStylePropertyToVisualEffectKey(String(effect.styleProperty));
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
                        const presetKey = effect.preset?.toLowerCase();
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
        const state = this.getState();
        
        if (!logicItemsToEvaluate || logicItemsToEvaluate.length === 0) {
            this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
            return;
        }

        const effectsToApply: Record<number, VisualEffect> = {};
        const allParts = selectCombinedParts(state, cardInstanceId);
        const haStates = selectAllGenericHaStates(state);

        for (const logicItem of logicItemsToEvaluate) {
            for (const pair of logicItem.logicPairs) {
                if (isRuleGroupGeneric(pair.conditionRules)) {
                    try {
                        if (evaluateExpression(pair.conditionRules, null, state, logger, cardInstanceId)) {
                            const nonLayoutEffects = pair.effects.filter(e => e.type !== 'set_layout') as Exclude<EffectDefinition, { type: 'set_layout' }>[];
                            this.applyEffectsToTargets(nonLayoutEffects, effectsToApply, allParts);
                            
                            for (const effect of pair.effects) {
                                if (effect.type === 'set_layout') {
                                    this.dispatch(setConditionalLayoutEffect({
                                        cardInstanceId,
                                        cellId: effect.targetCellId,
                                        layout: { [effect.layoutProperty]: effect.layoutValue },
                                    }));
                                }
                            }
                        }
                    } catch (e: any) {
                        logger.error('evaluateAndApplyEffects', `[Generic] ERROR evaluating condition for pair ${pair.id}: ${e.message}`);
                    }
                }
            }
        }

        for (const part of allParts) {
            for (const logicItem of logicItemsToEvaluate) {
                for (const pair of logicItem.logicPairs) {
                    if (!isRuleGroupGeneric(pair.conditionRules)) {
                        try {
                            if (evaluateExpression(pair.conditionRules, part, state, logger, cardInstanceId)) {
                                const nonLayoutEffects = pair.effects.filter(e => e.type !== 'set_layout') as Exclude<EffectDefinition, { type: 'set_layout' }>[];
                                this.applyEffectsToTargets(nonLayoutEffects, effectsToApply, allParts, part.pk);

                                for (const effect of pair.effects) {
                                    if (effect.type === 'set_layout') {
                                        const templatedCellId = effect.targetCellId.replace('%%part.pk%%', String(part.pk));
                                        this.dispatch(setConditionalLayoutEffect({
                                            cardInstanceId,
                                            cellId: templatedCellId,
                                            layout: { [effect.layoutProperty]: effect.layoutValue },
                                        }));
                                    }
                                }
                            }
                        } catch (e: any) {
                            logger.error('evaluateAndApplyEffects', `[Part ${part.pk}] ERROR evaluating condition for pair ${pair.id}: ${e.message}`);
                        }
                    }
                }
            }
        }

        this.dispatch(setConditionalPartEffectsBatch({ cardInstanceId: cardInstanceId, effectsMap: effectsToApply }));
    }
}

// Example of how it might be instantiated and used (e.g., in a thunk or middleware)
//
// import { store } from '../store'; // Or get dispatch/getState from thunkAPI
//
// const effectsEngine = new ConditionalEffectsEngine(store.dispatch, store.getState);
// effectsEngine.evaluateAndApplyEffects('someCardInstanceId', false, []); 