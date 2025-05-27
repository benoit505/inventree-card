import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { ConditionRuleDefinition, ParameterOperator, ParameterActionType, ProcessedCondition } from '../../types';
import { Logger } from '../../utils/logger';
import {
    setRawRuleDefinitions,
    setProcessedConditions as setProcessedConditionsInLogicSlice, // Alias to avoid conflict if we import the one from parametersSlice later
} from '../slices/conditionalLogicSlice';

const logger = Logger.getInstance();

// Helper to parse the universal source string from ConditionRuleDefinition.parameter
const parseSourceString = (sourceString: string): {
  sourceType: ProcessedCondition['sourceType'];
  partId?: number;
  parameterName?: string;
  attributeName?: string;
  entityId?: string;
  haAttributeName?: string;
} => {
  if (sourceString.startsWith('part:')) {
    const parts = sourceString.split(':');
    if (parts.length === 3) {
      const pk = parseInt(parts[1], 10);
      if (!isNaN(pk)) {
        // If parts[2] matches a known InventreeItem attribute, it's an attribute, otherwise a parameter
        // This is a simplification; a more robust check against InventreeItem keys might be needed.
        // For now, assume common attributes. If not one of these, assume it's a parameter name.
        const commonAttributes = ['name', 'description', 'IPN', 'in_stock', 'on_order', 'category_name', 'status_label'];
        if (commonAttributes.includes(parts[2])) {
          return { sourceType: 'inventree_attribute', partId: pk, attributeName: parts[2] };
        }
        return { sourceType: 'inventree_parameter', partId: pk, parameterName: parts[2] };
      }
    }
  } else if (sourceString.startsWith('entity:')) {
    const parts = sourceString.split(':');
    if (parts.length === 2) { // e.g., entity:sensor.temperature
      return { sourceType: 'ha_entity_state', entityId: parts[1] };
    } else if (parts.length === 3) { // e.g., entity:sensor.weather:temperature (attribute)
      return { sourceType: 'ha_entity_attribute', entityId: parts[1], haAttributeName: parts[2] };
    }
  }
  // Add other parsing logic for different source types (e.g., 'binding:') if needed in the future
  logger.warn('conditionalLogicThunks.parseSourceString', `Unknown or malformed source string: ${sourceString}. Defaulting to 'unknown' sourceType.`);
  return { sourceType: 'unknown' };
};

// Thunk to initialize rule definitions from the configuration
export const initializeRuleDefinitionsThunk = createAsyncThunk<
  void,                             // Return type
  ConditionRuleDefinition[],        // Argument type: raw rule definitions from config
  { state: RootState; rejectValue: string }
>(
  'conditionalLogic/initializeDefinitions',
  async (ruleDefs, { dispatch, getState, rejectWithValue }) => {
    logger.log('conditionalLogicThunks', `Initializing rule definitions from ${ruleDefs.length} ConditionRuleDefinition(s)...`);

    dispatch(setRawRuleDefinitions(ruleDefs));

    if (!ruleDefs || ruleDefs.length === 0) {
      logger.log('conditionalLogicThunks', 'No ConditionRuleDefinitions provided. Clearing processed conditions in conditionalLogicSlice.');
      dispatch(setProcessedConditionsInLogicSlice([])); 
      return;
    }

    const processedConditions: ProcessedCondition[] = [];

    for (let i = 0; i < ruleDefs.length; i++) {
      const def = ruleDefs[i];
      const parsedSource = parseSourceString(def.parameter);

      // Ensure all necessary fields for a ConditionRuleDefinition are present before processing
      if (def.operator && def.action && def.action_value !== undefined && def.value !== undefined) { 
        processedConditions.push({
          id: def.name || `pcond-${Date.now()}-${i}`, // Use rule name for ID if available, else generate
          originalRule: def,
          ...parsedSource, // Spread the parsed source details
        });
      } else {
        logger.warn('conditionalLogicThunks', 'Skipping ConditionRuleDefinition for ProcessedConditions due to missing operator, action, action_value, or value in originalRule', { definition: def }); 
      }
    }

    dispatch(setProcessedConditionsInLogicSlice(processedConditions));
    logger.log('conditionalLogicThunks', `Processed ${processedConditions.length} rule definitions into ProcessedConditions and stored in conditionalLogicSlice.`);
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

// Placeholder for evaluateAndApplyEffectsThunk - will be added next 