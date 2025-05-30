import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { 
    ConditionRuleDefinition, // Keep for constructing originalRule, or adapt if RuleType is sufficient
    ParameterOperator, 
    ParameterActionType, 
    ProcessedCondition,
    ConditionalLogicItem, // NEW: For thunk argument
    RuleGroupType,        // NEW: For parsing
    RuleType,             // NEW: For parsing
    EffectDefinition      // NEW: For attaching to ProcessedCondition
} from '../../types';
import { Logger } from '../../utils/logger';
import {
    setRawRuleDefinitions, // This might become irrelevant or store ConditionalLogicItem[]
    setProcessedConditions as setProcessedConditionsInLogicSlice,
} from '../slices/conditionalLogicSlice';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs if needed

const logger = Logger.getInstance();

// Helper to parse the universal source string (remains useful for RuleType.field)
const parseSourceString = (sourceString: string): {
  sourceType: ProcessedCondition['sourceType'];
  partId?: number;
  parameterName?: string;
  attributeName?: string;
  entityId?: string;
  haAttributeName?: string;
} => {
  logger.log('conditionalLogicThunks.parseSourceString', `Parsing source string: ${sourceString}`);

  const invParamPrefix = "inv_param_";
  const partAttrPrefix = "part_"; // For general part attributes like name, stock
  const haEntityStatePrefix = "ha_entity_state_";
  const haEntityAttrPrefix = "ha_entity_attr_";

  if (sourceString.startsWith(invParamPrefix)) {
    const remaining = sourceString.substring(invParamPrefix.length);
    const parts = remaining.split('_'); // Expecting PK_PARAMNAME
    if (parts.length >= 2) {
      const pk = parseInt(parts[0], 10);
      const paramName = parts.slice(1).join('_'); // Handle param names with underscores
      if (!isNaN(pk)) {
        logger.log('conditionalLogicThunks.parseSourceString', `Parsed as InvenTree Parameter: partId=${pk}, parameterName=${paramName}`);
        return { sourceType: 'inventree_parameter', partId: pk, parameterName: paramName };
      }
    }
  } else if (sourceString.startsWith(partAttrPrefix)) {
    const remaining = sourceString.substring(partAttrPrefix.length);
    const parts = remaining.split('_'); // Expecting PK_ATTRIBUTENAME
    if (parts.length >= 2) {
      const pk = parseInt(parts[0], 10);
      const attrName = parts.slice(1).join('_'); // Handle attribute names with underscores
      if (!isNaN(pk)) {
        // Define known part attributes to distinguish from parameters if necessary, though context implies attribute here
        // For simplicity, if it starts with "part_PK_", assume it's a direct attribute.
        logger.log('conditionalLogicThunks.parseSourceString', `Parsed as InvenTree Attribute: partId=${pk}, attributeName=${attrName}`);
        return { sourceType: 'inventree_attribute', partId: pk, attributeName: attrName };
      }
    }
  } else if (sourceString.startsWith(haEntityAttrPrefix)) {
    const remaining = sourceString.substring(haEntityAttrPrefix.length);
    // Expecting ENTITYID_ATTRNAME, where ENTITYID can contain dots and ATTRNAME might be simple
    // This parsing might need to be more robust if entity IDs or attribute names can have underscores
    const lastUnderscoreIndex = remaining.lastIndexOf('_');
    if (lastUnderscoreIndex > 0 && lastUnderscoreIndex < remaining.length - 1) {
      const entityId = remaining.substring(0, lastUnderscoreIndex);
      const attrName = remaining.substring(lastUnderscoreIndex + 1);
      logger.log('conditionalLogicThunks.parseSourceString', `Parsed as HA Entity Attribute: entityId=${entityId}, haAttributeName=${attrName}`);
      return { sourceType: 'ha_entity_attribute', entityId: entityId, haAttributeName: attrName };
    }
  } else if (sourceString.startsWith(haEntityStatePrefix)) {
    const entityId = sourceString.substring(haEntityStatePrefix.length);
    logger.log('conditionalLogicThunks.parseSourceString', `Parsed as HA Entity State: entityId=${entityId}`);
    return { sourceType: 'ha_entity_state', entityId: entityId };
  }

  // Fallback for older formats or direct entity IDs (less specific)
  if (sourceString.startsWith('part:')) {
    const parts = sourceString.split(':');
    if (parts.length === 3) {
      const pk = parseInt(parts[1], 10);
      if (!isNaN(pk)) {
        const commonAttributes = ['name', 'description', 'IPN', 'in_stock', 'on_order', 'category_name', 'status_label']; // Add more as needed
        if (commonAttributes.includes(parts[2])) {
          logger.log('conditionalLogicThunks.parseSourceString', `Fallback: Parsed as InvenTree Attribute: partId=${pk}, attributeName=${parts[2]}`);
          return { sourceType: 'inventree_attribute', partId: pk, attributeName: parts[2] };
        }
        logger.log('conditionalLogicThunks.parseSourceString', `Fallback: Parsed as InvenTree Parameter: partId=${pk}, parameterName=${parts[2]}`);
        return { sourceType: 'inventree_parameter', partId: pk, parameterName: parts[2] };
      }
    }
  } else if (sourceString.includes(':') && sourceString.startsWith('entity:')) {
    const parts = sourceString.split(':');
    if (parts.length === 2) { // entity:id
        logger.log('conditionalLogicThunks.parseSourceString', `Fallback: Parsed as HA Entity State: entityId=${parts[1]}`);
        return { sourceType: 'ha_entity_state', entityId: parts[1] };
    } else if (parts.length === 3) { // entity:id:attribute
        logger.log('conditionalLogicThunks.parseSourceString', `Fallback: Parsed as HA Entity Attribute: entityId=${parts[1]}, haAttributeName=${parts[2]}`);
        return { sourceType: 'ha_entity_attribute', entityId: parts[1], haAttributeName: parts[2] };
    }
  }

  const entityIdRegex = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (entityIdRegex.test(sourceString)) { // Plain entity ID like 'sun.sun'
    logger.log('conditionalLogicThunks.parseSourceString', `Fallback: Parsed as HA Entity State (direct match): entityId=${sourceString}`);
    return { sourceType: 'ha_entity_state', entityId: sourceString };
  }

  logger.warn('conditionalLogicThunks.parseSourceString', `Unknown or malformed source string: ${sourceString}. Defaulting to 'unknown' sourceType.`);
  return { sourceType: 'unknown' };
};

// NEW: Helper function to recursively extract individual rules from a RuleGroupType
const extractRulesFromGroup = (ruleGroup: RuleGroupType): RuleType[] => {
    let individualRules: RuleType[] = [];
    for (const ruleOrGroup of ruleGroup.rules) {
        if ('rules' in ruleOrGroup) { // It's a nested RuleGroupType
            individualRules = individualRules.concat(extractRulesFromGroup(ruleOrGroup as RuleGroupType));
        } else { // It's a RuleType
            individualRules.push(ruleOrGroup as RuleType);
        }
    }
    return individualRules;
};


// Thunk to initialize rule definitions from the configuration
export const initializeRuleDefinitionsThunk = createAsyncThunk<
  void,                             // Return type
  ConditionalLogicItem[],           // MODIFIED: Argument type is now ConditionalLogicItem[]
  { state: RootState; rejectValue: string }
>(
  'conditionalLogic/initializeDefinitions',
  async (logicItems, { dispatch, getState, rejectWithValue }) => { // MODIFIED: param name to logicItems
    logger.log('conditionalLogicThunks', `Initializing rule definitions from ${logicItems.length} ConditionalLogicItem(s)...`);

    // Store the raw ConditionalLogicItem[] if useful for debugging or re-editing
    // For now, setRawRuleDefinitions might need adjustment if it expected ConditionRuleDefinition[]
    // dispatch(setRawRuleDefinitions(logicItems)); // TODO: Decide if/how to store raw logicItems

    if (!logicItems || logicItems.length === 0) {
      logger.log('conditionalLogicThunks', 'No ConditionalLogicItems provided. Clearing processed conditions in conditionalLogicSlice.');
      dispatch(setProcessedConditionsInLogicSlice([])); 
      return;
    }

    const processedConditions: ProcessedCondition[] = [];
    let pCondIndex = 0; // For unique ID generation

    for (const item of logicItems) {
        const individualRules = extractRulesFromGroup(item.conditionRules);
        
        for (const rule of individualRules) {
            const parsedSource = parseSourceString(rule.field);

            // Construct an OriginalRule-like object from the RuleType for ProcessedCondition
            // The 'action' and 'action_value' fields on ConditionRuleDefinition were for the OLD single-action model.
            // They are not directly present on RuleType from react-querybuilder and not strictly needed
            // if effects are handled by the item.effects array.
            // We still need targetPartIds if that was part of the original design, but that's on ConditionRuleDefinition, not RuleType.
            // For now, let's assume ConditionRuleDefinition as the 'originalRule' structure might need adaptation
            // or we simply populate what's available from 'rule' (RuleType).
            
            // Let's create a 'minimal' originalRule based on RuleType
            // and acknowledge that targetPartIds for rules usually comes from the ConditionLogicItem/EffectDefinition level in new model.
            // However, the existing ProcessedCondition type expects an originalRule: ConditionRuleDefinition.
            // We'll need to bridge this. For now, we assume 'targetPartIds' might still be on a ConditionRuleDefinition if we used that.
            // Given the new structure, 'targetPartIds' for an effect is more naturally part of the EffectDefinition or the overall ConditionalLogicItem.
            // The ConditionRuleDefinition.targetPartIds was for a single action tied to a single rule.

            // Let's assume for now that the `rule.field` contains enough info for condition evaluation,
            // and the `item.effects` will have their own targeting.
            // We still need to satisfy the ProcessedCondition.originalRule type.

            const dummyOriginalRule: ConditionRuleDefinition = {
                parameter: rule.field,
                operator: rule.operator as ParameterOperator,
                value: rule.value,
                action: 'highlight', // Placeholder, effects are separate
                action_value: 'none', // Placeholder
                targetPartIds: '*',   // MODIFIED: Default to all parts for now
            };
            
            // Ensure operator, value are present from the RuleType
            if (rule.operator && rule.value !== undefined) { 
              processedConditions.push({
                id: rule.id || item.id + `-rule-${pCondIndex++}` || `pcond-${Date.now()}-${pCondIndex++}`,
                originalRule: dummyOriginalRule, 
                ...parsedSource,                 
                effects: item.effects || []      
              });
            } else {
              logger.warn('conditionalLogicThunks', 'Skipping RuleType for ProcessedConditions due to missing operator or value', { ruleData: rule, parentItemId: item.id }); 
            }
        }
    }

    dispatch(setProcessedConditionsInLogicSlice(processedConditions));
    logger.log('conditionalLogicThunks', `Processed ${logicItems.length} ConditionalLogicItems into ${processedConditions.length} ProcessedConditions and stored in conditionalLogicSlice.`);
  }
);

// Thunk to evaluate rules and apply their effects using the ConditionalEffectsEngine
export const evaluateAndApplyEffectsThunk = createAsyncThunk<
  void, // Return type
  void, // Argument type (none for this thunk)
  { state: RootState; rejectValue: string }
>(
  'conditionalLogic/evaluateAndApplyEffects',
  async (_, thunkAPI) => {
    logger.log('conditionalLogicThunks', 'evaluateAndApplyEffectsThunk invoked, delegating to ConditionalEffectsEngine...');
    
    const { ConditionalEffectsEngine } = await import('../../core/ConditionalEffectsEngine'); 

    const engine = new ConditionalEffectsEngine(thunkAPI.dispatch, thunkAPI.getState);
    engine.evaluateAndApplyEffects();

    logger.log('conditionalLogicThunks', 'ConditionalEffectsEngine finished. evaluateAndApplyEffectsThunk complete.');
  }
);