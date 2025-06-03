import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { 
    ConditionalLogicItem,
    ParameterOperator,
    ProcessedCondition,
    RuleGroupType,
    RuleType
} from '../../types';
import { Logger } from '../../core/logger';
import { generateSimpleId } from '../../utils/generateSimpleId';
import {
  setDefinedLogicItems,
  setProcessedConditions,
} from '../slices/conditionalLogicSlice';
import { ConditionalEffectsEngine } from '../../core/ConditionalEffectsEngine';

const logger = Logger.getInstance();

const parseSourceString = (sourceString: string): {
  sourceType: ProcessedCondition['sourceType'];
  partId?: number;
  parameterName?: string;
  attributeName?: string;
  entityId?: string;
  haAttributeName?: string;
} => {
  logger.debug('parseSourceString', `Parsing: ${sourceString}`, {data: {sourceString}});

  if (sourceString.startsWith('ha_entity_state_')) {
    return { sourceType: 'ha_entity_state', entityId: sourceString.substring('ha_entity_state_'.length) };
  }
  if (sourceString.startsWith('ha_entity_attr_')) {
    const content = sourceString.substring('ha_entity_attr_'.length);
    const parts = content.split(':::');
    if (parts.length === 2) {
      const entityId = parts[0];
      const haAttributeName = parts[1];
      return { sourceType: 'ha_entity_attribute', entityId, haAttributeName };
    } else {
      logger.warn('parseSourceString', `Malformed ha_entity_attr string (expected 2 parts after splitting by :::): ${sourceString}` , {data: {sourceString, content, partsCount: parts.length}});
      return { sourceType: 'unknown' }; // Or handle error appropriately
    }
  }
  if (sourceString.startsWith('part_')) {
    return { sourceType: 'inventree_attribute', attributeName: sourceString.substring('part_'.length) };
  }
  if (sourceString.startsWith('param_')) {
    return { sourceType: 'inventree_parameter', parameterName: sourceString.substring('param_'.length) };
  }
  const pkMatch = sourceString.match(/^part:(\d+):(.+)$/);
  if (pkMatch) {
    const partId = parseInt(pkMatch[1], 10);
    const paramOrAttrName = pkMatch[2];
    logger.warn('parseSourceString', `Ambiguous format 'part:PK:name' for ${sourceString}. Assuming parameter if not a known attribute.`);
    const knownAttributes = ['name', 'IPN', 'description', 'category_name', 'in_stock', 'on_order'];
    if (knownAttributes.includes(paramOrAttrName)) {
      return { sourceType: 'inventree_attribute', partId, attributeName: paramOrAttrName };
    }
    return { sourceType: 'inventree_parameter', partId, parameterName: paramOrAttrName };
  }

  logger.warn('parseSourceString', `Unknown source string format: ${sourceString}`);
  return { sourceType: 'unknown' };
};

const extractAllRules = (ruleGroup: RuleGroupType): RuleType[] => {
  let rules: RuleType[] = [];
  for (const ruleOrGroup of ruleGroup.rules) {
    if ('combinator' in ruleOrGroup) {
      rules = rules.concat(extractAllRules(ruleOrGroup as RuleGroupType));
    } else {
      rules.push(ruleOrGroup as RuleType);
    }
  }
  return rules;
};

export const evaluateAndApplyEffectsThunk = createAsyncThunk<
  void,
  { cardInstanceId?: string; forceReevaluation?: boolean; logicItems?: ConditionalLogicItem[] },
  { state: RootState; dispatch: AppDispatch }
>('conditionalLogic/evaluateAndApplyEffects', async ({ cardInstanceId, forceReevaluation = false, logicItems }, { dispatch, getState }) => {
  const cardId = cardInstanceId || 'undefined_card';
  logger.debug('evaluateAndApplyEffectsThunk', `START for cardInstanceId: ${cardId}`, { data: { logicItems } });
  const engine = new ConditionalEffectsEngine(dispatch, getState);
  await engine.evaluateAndApplyEffects(cardId, forceReevaluation, logicItems);
  logger.debug('evaluateAndApplyEffectsThunk', `END for cardInstanceId: ${cardId}`);
});

export const initializeRuleDefinitionsThunk = createAsyncThunk<
  void,
  ConditionalLogicItem[],
  { dispatch: AppDispatch; state: RootState }
>('conditionalLogic/initializeRuleDefinitions', async (logicItems, { dispatch, getState }) => {
  logger.debug('initializeRuleDefinitionsThunk', 'Initializing rule definitions...', { data: logicItems });
  
  dispatch(setDefinedLogicItems(logicItems || []));

  const allProcessedConditions: ProcessedCondition[] = [];
  (logicItems || []).forEach(item => {
    const rules = extractAllRules(item.conditionRules);
    rules.forEach(rule => {
      const parsedSource = parseSourceString(rule.field);
      
      allProcessedConditions.push({
        id: rule.id || generateSimpleId(),
        originalRule: {
          name: rule.id || rule.field,
          parameter: rule.field,
          operator: rule.operator as any,
          value: rule.value,
          action: 'filter',
          action_value: 'show',
        },
        ...parsedSource,
        effects: item.effects
      });
    });
  });

  dispatch(setProcessedConditions(allProcessedConditions));
  logger.debug('initializeRuleDefinitionsThunk', `Processed ${allProcessedConditions.length} conditions from ${logicItems?.length || 0} logic items.`);
});