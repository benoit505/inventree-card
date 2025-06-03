import { RootState, AppDispatch } from '../store';
import { Logger } from './logger';
import { 
    ConditionalLogicItem, 
    RuleGroupType, 
    RuleType, 
    EffectDefinition, 
    InventreeItem, 
    ParameterDetail 
} from '../types';
import { 
    VisualEffect,
    setConditionalPartEffectsBatch, 
    clearConditionalPartEffectsForCard
} from '../store/slices/visualEffectsSlice';
import { 
    selectAllGenericHaStates
} from '../store/slices/genericHaStateSlice';
import { selectApiConfig } from '../store/slices/apiSlice';
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
        forceReevaluation: boolean = false, 
        logicItems?: ConditionalLogicItem[]  
    ): Promise<void> {
        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects CALLED. cardInstanceId: ${cardInstanceId}, LogicItems provided: ${!!logicItems}, Count: ${logicItems?.length}`);

        const state = this.getState();

        if (!logicItems || logicItems.length === 0) {
            this.logger.log('ConditionalEffectsEngine', `No logic items provided for card ${cardInstanceId}. Clearing its visual effects.`);
            this.dispatch(clearConditionalPartEffectsForCard({ cardInstanceId }));
            return;
        }

        const effectsToApply: Record<number, VisualEffect> = {};

        const mergeVisualEffect = (partId: number, visualEffect: Partial<VisualEffect>) => {
            if (!effectsToApply[partId]) {
                effectsToApply[partId] = {};
            }
            effectsToApply[partId] = { ...effectsToApply[partId], ...visualEffect };
        };

        const allPartsById = state.parts.partsById; 
        const allHaEntities = selectAllGenericHaStates(state);
        const allInventreeParametersByPartId = state.parameters.parametersByPartId;

        const globalContextForEval = {
            haEntities: allHaEntities,
            parameters: { parameterValues: allInventreeParametersByPartId } 
        };

        for (const logicItem of logicItems) {
            this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Processing logic item: ${logicItem.id} (${logicItem.name || 'Unnamed'})`, { data: logicItem });

            const relevantPartsForLogicItemEffectSet = new Set<number>();
            logicItem.effects.forEach(effect => {
                if (effect.targetPartPks === 'all_loaded') {
                    Object.keys(allPartsById).forEach(pkStr => relevantPartsForLogicItemEffectSet.add(Number(pkStr)));
                } else if (Array.isArray(effect.targetPartPks)) {
                    effect.targetPartPks.forEach(pk => relevantPartsForLogicItemEffectSet.add(Number(pk)));
                } else if (typeof effect.targetPartPks === 'string' && effect.targetPartPks.length > 0) {
                    effect.targetPartPks.split(',').forEach(pkStr => {
                        const numPk = Number(pkStr.trim());
                        if (!isNaN(numPk)) relevantPartsForLogicItemEffectSet.add(numPk);
                    });
                }
            });
            const relevantPartsArray = Array.from(relevantPartsForLogicItemEffectSet);
            
            this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] LogicItem ${logicItem.id} - Relevant part PKs for *effects*: ${relevantPartsArray.join(', ') || 'None defined'}`);

            let conditionResult = false;
            try {
                this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] PRE-EVALUATE EXPRESSION for LogicItem ${logicItem.id}.`, {data: {ruleGroup: logicItem.conditionRules, partContext: null}});
                conditionResult = evaluateExpression(logicItem.conditionRules, null, state, this.logger);
                this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] POST-EVALUATE EXPRESSION for LogicItem ${logicItem.id}. Result: ${conditionResult}`);
            } catch (e: any) {
                this.logger.error('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] ERROR during evaluateExpression for LogicItem ${logicItem.id}: ${e.message}`, {data: {stack: e.stack, ruleGroup: logicItem.conditionRules}});
                conditionResult = false; 
            }

            if (conditionResult) {
                 this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Condition MET for logic item: ${logicItem.id}. Applying ${logicItem.effects.length} effects.`);
                for (const effect of logicItem.effects) {
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
                        this.logger.warn('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Effect in LogicItem ${logicItem.id} has no targetPartPks. Skipping part-specific application.`, {data: effect});
                        continue; 
                    }

                    if (targetPks.size === 0) {
                        this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] No specific target PKs resolved for effect in ${logicItem.id}, skipping this effect application.`, {data: effect});
                        continue;
                    }
                    
                    targetPks.forEach(partId => {
                        if (!effectsToApply[partId]) {
                            effectsToApply[partId] = {};
                        }
                        const currentPartEffects = effectsToApply[partId];

                        switch (effect.type) {
                            case 'set_visibility':
                                currentPartEffects.isVisible = effect.isVisible;
                                break;
                            case 'set_style':
                                if (effect.styleProperty && effect.styleValue !== undefined) {
                                    const visualEffectKey = mapStylePropertyToVisualEffectKey(effect.styleProperty);
                                    if (visualEffectKey) {
                                        (currentPartEffects as any)[visualEffectKey] = effect.styleValue;
                                    } else {
                                        this.logger.warn('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Unhandled styleProperty: ${effect.styleProperty} in LogicItem ${logicItem.id}`);
                                    }
                                }
                                break;
                            default:
                                this.logger.warn('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Unhandled effect type: ${effect.type} in LogicItem ${logicItem.id}`);
                                break;
                        }
                        this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Effect applied for part ${partId} from logicItem ${logicItem.id}.`, {data: {effect, currentPartEffects: JSON.parse(JSON.stringify(currentPartEffects))}});
                    });
                }
            } else {
                this.logger.debug('ConditionalEffectsEngine', `[CEE ${cardInstanceId}] Condition NOT MET for logic item: ${logicItem.id}`);
            }
        }

        this.logger.debug('ConditionalEffectsEngine', `[DEBUG] effectsToApply before dispatch for card ${cardInstanceId}:`, {
            data: JSON.parse(JSON.stringify(effectsToApply)) 
        });
        const hasEffectsToApply = Object.keys(effectsToApply).length > 0;
        this.logger.debug('ConditionalEffectsEngine', `[DEBUG] hasEffectsToApply for card ${cardInstanceId}: ${hasEffectsToApply}`);

        this.logger.log('ConditionalEffectsEngine', `Dispatching setConditionalPartEffectsBatch for card ${cardInstanceId}`, {
            data: { effectsCount: Object.keys(effectsToApply).length }
        });

        if (hasEffectsToApply) { 
            this.dispatch(setConditionalPartEffectsBatch({ cardInstanceId: cardInstanceId, effectsMap: effectsToApply }));
        } else {
            this.logger.debug('ConditionalEffectsEngine', `No new visual effects to apply for card ${cardInstanceId}. Existing effects (if any) for this card instance will persist unless cleared by empty logicItems.`);
        }

        this.logger.log('ConditionalEffectsEngine', `evaluateAndApplyEffects END for cardInstanceId: ${cardInstanceId}`);
    }
}

// Example of how it might be instantiated and used (e.g., in a thunk or middleware)
//
// import { store } from '../store'; // Or get dispatch/getState from thunkAPI
//
// const effectsEngine = new ConditionalEffectsEngine(store.dispatch, store.getState);
// effectsEngine.evaluateAndApplyEffects('someCardInstanceId', false, []); 