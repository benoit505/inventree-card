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
    // REMOVED: setConditionalLayoutEffect - dead action, now using unified setConditionalCellEffect
    setConditionalCellEffect,
    clearConditionalCellEffectsForCard
} from '../store/slices/visualEffectsSlice';
import { selectAllGenericHaStates } from '../store/slices/genericHaStateSlice';
import { evaluateExpression } from '../utils/evaluateExpression';
import { selectAllPartsForInstance } from '../store/slices/partsSlice';
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
        cardInstanceId: string,
        contextPartPk?: number
    ) {
        for (const effect of effects) {
            // --- NEW: Cell-specific effects are handled and dispatched immediately ---
            // FIXED: Support both targetCellId (new) AND styleTarget (legacy) for backward compatibility
            const cellId = effect.targetCellId || (effect as any).styleTarget;
            
            if (((effect.type === 'animate_style' || effect.type === 'set_style') && cellId) || (effect.type === 'set_visibility' && cellId)) {
                let effectPayload: Partial<VisualEffect> = {};

                if (effect.type === 'animate_style') {
                    const presetKey = effect.preset?.toLowerCase();
                    if (presetKey && presetKey !== 'none' && ANIMATION_PRESETS[presetKey]) {
                        effectPayload = { animation: ANIMATION_PRESETS[presetKey].animation };
                    } else if (effect.animation) {
                        effectPayload = { animation: effect.animation };
                    }
                }
                
                if (effect.type === 'set_style') {
                    effectPayload = { cellStyles: { [cellId]: { [effect.styleProperty]: effect.styleValue } } };
                }

                if (effect.type === 'set_visibility') {
                    effectPayload = { isVisible: effect.isVisible };
                }

                this.dispatch(setConditionalCellEffect({
                    cardInstanceId,
                    cellId: cellId,
                    effect: effectPayload
                }));
                continue; // This effect is handled, move to the next one
            }

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
                // FIXED: Apply to NO parts (safe default) instead of ALL parts (aggressive default)
                // If user wants "all parts", they should explicitly specify targetPartPks
                targetPksForThisEffect = [];
                logger.warn('applyEffectsToTargets', 
                    'Effect has no targetPartPks and no context part. Applying to no parts. ' +
                    'If you want this effect to apply to specific parts, set targetPartPks explicitly.',
                    { effect }
                );
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
                            // DEPRECATED LOGIC: This styles a cell via the Part's visual effect, which is indirect.
                            // The new logic above handles direct cell styling via `targetCellId`.
                            // This block is kept for backward compatibility for now.
                            const columnId = effect.styleTarget;
                            if (columnId && effect.styleProperty && effect.styleValue !== undefined) {
                                if (!currentPartVisualEffects.cellStyles) currentPartVisualEffects.cellStyles = {};
                                if (!currentPartVisualEffects.cellStyles[columnId]) currentPartVisualEffects.cellStyles[columnId] = {};
                                (currentPartVisualEffects.cellStyles[columnId] as any)[effect.styleProperty] = effect.styleValue;
                            }
                        }
                        break;
                    case 'animate_style':
                        // DEPRECATED LOGIC: This applies animation to an entire Part.
                        // The new logic above handles direct cell animation via `targetCellId`.
                        // This block is kept for backward compatibility for now.
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
        // 🚀 CRITICAL FIX: Clear all previous effects at the start of evaluation.
        // This ensures that only the effects from rules that are currently true are applied.
        this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
        this.dispatch(clearConditionalCellEffectsForCard({ cardInstanceId }));
        
        const state = this.getState();
        
        if (!logicItemsToEvaluate || logicItemsToEvaluate.length === 0) {
            this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
            return;
        }

        const effectsToApply: Record<number, VisualEffect> = {};
        const allParts = selectAllPartsForInstance(state, cardInstanceId);
        const haStates = selectAllGenericHaStates(state);

        // 🚀 PERFORMANCE: Pre-filter logic items by type to avoid checking in inner loops
        const genericLogicPairs: Array<{ logicItem: ConditionalLogicItem, pair: LogicPair }> = [];
        const partSpecificLogicPairs: Array<{ logicItem: ConditionalLogicItem, pair: LogicPair }> = [];
        
        for (const logicItem of logicItemsToEvaluate) {
            // 🚀 EARLY EXIT: Skip logic items with no pairs
            if (!logicItem.logicPairs || logicItem.logicPairs.length === 0) continue;
            
            for (const pair of logicItem.logicPairs) {
                // 🚀 EARLY EXIT: Skip pairs with no effects
                if (!pair.effects || pair.effects.length === 0) continue;
                
                if (isRuleGroupGeneric(pair.conditionRules)) {
                    genericLogicPairs.push({ logicItem, pair });
                } else {
                    partSpecificLogicPairs.push({ logicItem, pair });
                }
            }
        }

        // --- PHASE 1: Evaluate Generic Rules (once, not per-part) ---
        for (const { logicItem, pair } of genericLogicPairs) {
            try {
                const result = evaluateExpression(pair.conditionRules, null, state, logger, cardInstanceId, this.dispatch);
                
                // 🚀 EARLY EXIT: Skip if rule doesn't match
                if (!result) continue;
                
                const nonLayoutEffects = pair.effects.filter(e => e.type !== 'set_layout') as Exclude<EffectDefinition, { type: 'set_layout' }>[];
                this.applyEffectsToTargets(nonLayoutEffects, effectsToApply, allParts, cardInstanceId);
                
                // FIXED: Unified cell effects - use setConditionalCellEffect for layout effects too
                for (const effect of pair.effects) {
                    if (effect.type === 'set_layout') {
                        this.dispatch(setConditionalCellEffect({
                            cardInstanceId,
                            cellId: effect.targetCellId,
                            effect: { cellStyles: { [effect.targetCellId]: { [effect.layoutProperty]: effect.layoutValue } } },
                        }));
                    }
                }
            } catch (e: any) {
                logger.error('evaluateAndApplyEffects', `[Generic] ERROR evaluating condition for pair ${pair.id}: ${e.message}`);
            }
        }

        // 🚀 EARLY EXIT: Skip part-specific evaluation if no part-specific pairs
        if (partSpecificLogicPairs.length === 0) {
            logger.debug('evaluateAndApplyEffects', 'No part-specific logic pairs, skipping part evaluation');
            this.dispatch(setConditionalPartEffectsBatch({ cardInstanceId: cardInstanceId, effectsMap: effectsToApply }));
            return;
        }

        // --- PHASE 2: Evaluate Part-Specific Rules ---
        // 🚀 PERFORMANCE: Create part PK set for faster lookups
        const allPartPks = new Set(allParts.map(p => p.pk));
        
        for (const part of allParts) {
            let hasAnyEffectForThisPart = false;
            
            for (const { logicItem, pair } of partSpecificLogicPairs) {
                try {
                    const result = evaluateExpression(pair.conditionRules, part, state, logger, cardInstanceId, this.dispatch);
                    
                    // 🚀 EARLY EXIT: Skip if rule doesn't match
                    if (!result) continue;
                    
                    hasAnyEffectForThisPart = true;
                    const nonLayoutEffects = pair.effects.filter(e => e.type !== 'set_layout') as Exclude<EffectDefinition, { type: 'set_layout' }>[];
                    this.applyEffectsToTargets(nonLayoutEffects, effectsToApply, allParts, cardInstanceId, part.pk);

                    // FIXED: Unified cell effects - use setConditionalCellEffect for layout effects too
                    for (const effect of pair.effects) {
                        if (effect.type === 'set_layout') {
                            const templatedCellId = effect.targetCellId.replace('%%part.pk%%', String(part.pk));
                            this.dispatch(setConditionalCellEffect({
                                cardInstanceId,
                                cellId: templatedCellId,
                                effect: { cellStyles: { [templatedCellId]: { [effect.layoutProperty]: effect.layoutValue } } },
                            }));
                        }
                    }
                } catch (e: any) {
                    logger.error('evaluateAndApplyEffects', `[Part ${part.pk}] ERROR evaluating condition for pair ${pair.id}: ${e.message}`);
                }
            }
            
            // 🚀 OPTIMIZATION: Log parts that had no matching rules (for debugging)
            if (!hasAnyEffectForThisPart) {
                logger.debug('evaluateAndApplyEffects', `Part ${part.pk} had no matching rules in this evaluation`);
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