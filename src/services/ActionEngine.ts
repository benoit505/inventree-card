import { HomeAssistant } from 'custom-card-helpers';
import {
  ActionDefinition,
  ActionExecutionContext,
  ActionCallHAServiceOperation,
  ActionUpdateInvenTreeParameterOperation,
  ActionDispatchReduxActionOperation,
  ActionTriggerConditionalLogicOperation,
  ActionSetCardStateOperation,
  ActionAdjustStockOperation,
  ActionOperation,
  ActionHAStandardTarget,
  InventreeItem,
  RuleGroupType,
  RuleType,
  ConditionRuleDefinition, // 🚀 Import the correct type
} from '../types';
import { store, RootState, AppDispatch } from '../store';
import {
  updateActionRuntimeState,
  selectActionDefinitionForInstance,
  selectAllActionDefinitionsForInstance,
} from '../store/slices/actionsSlice';
import { selectConditionalLogic } from '../store/slices/configSlice'; // 🚀 Corrected import
import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';
import { evaluateAndApplyEffectsThunk } from '../store/thunks/conditionalLogicThunks';
import { inventreeApi } from '../store/apis/inventreeApi';
import { setActiveView, setSelectedPart, toggleDebugPanel } from '../store/slices/uiSlice';
import { setLocatingPartId } from '../store/slices/partsSlice';
import { selectActiveCardInstanceIds } from '../store/slices/componentSlice';
import { adjustStockDebounced } from '../store/thunks/stockThunks';
import { get } from 'lodash';
import { evaluateExpression as evaluateExpressionUtil } from '../utils/evaluateExpression';

const logger = ConditionalLoggerEngine.getInstance().getLogger('ActionEngine');
ConditionalLoggerEngine.getInstance().registerCategory('ActionEngine', { enabled: true, level: 'info' });

const actionManifest = {
  'ui.setActiveView': setActiveView,
  'ui.setSelectedPart': setSelectedPart,
  'ui.toggleDebugPanel': toggleDebugPanel,
  'parts.setLocatingPartId': setLocatingPartId,
};

function getPathValue(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;
  const segments = path.split('.');
  let current: any = obj;
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    const namedItemMatch = segment.match(/^(\w+):(.+)$/);
    if (namedItemMatch) {
      const arrayPropName = namedItemMatch[1];
      const itemName = namedItemMatch[2];
      if (typeof current !== 'object' || !(arrayPropName in current) || !Array.isArray(current[arrayPropName])) return undefined;
      current = (current[arrayPropName] as any[]).find(item => (item.template_detail && item.template_detail.name === itemName) || (item.name === itemName));
      continue;
    }
    const arrayIndexMatch = segment.match(/^(\w+)\[(\d+)\]$/);
    if (arrayIndexMatch) {
      const arrayPropName = arrayIndexMatch[1];
      const index = parseInt(arrayIndexMatch[2], 10);
      if (typeof current !== 'object' || !(arrayPropName in current) || !Array.isArray(current[arrayPropName])) return undefined;
      current = current[arrayPropName][index];
      continue;
    }
    if (typeof current !== 'object' || !(segment in current)) return undefined;
    current = current[segment];
  }
  return current;
}

// REMOVED: Dead standalone processTemplate function (replaced by class method)
// The class method below is the one actually used

export class ActionEngine {
  private static instance: ActionEngine;
  private dispatch: AppDispatch;
  private hass: HomeAssistant | null = null;
  private isExecuting: Set<string> = new Set(); // Set of action IDs currently in execution

  private constructor() {
    this.dispatch = store.dispatch as AppDispatch;
    logger.info('constructor', 'ActionEngine initialized');
  }

  public static getInstance(): ActionEngine {
    if (!ActionEngine.instance) {
      ActionEngine.instance = new ActionEngine();
    }
    return ActionEngine.instance;
  }

  /**
   * Evaluate a conditional logic expression to determine if an action should be enabled.
   * Uses the unified evaluation engine from utils/evaluateExpression.
   * 
   * @param expressionId - The ID of the conditional logic item to evaluate
   * @param context - The execution context (part, hass, etc.)
   * @param cardInstanceId - The card instance ID
   * @returns true if the expression evaluates to true, false otherwise
   */
  public evaluateExpression(expressionId: string, context: ActionExecutionContext, cardInstanceId: string): boolean {
    const state = store.getState();
    const definedLogics = selectConditionalLogic(state, cardInstanceId);
    const logic = definedLogics.find(l => l.id === expressionId);

    if (!logic) {
      logger.warn('evaluateExpression', `Could not find defined logic with ID: ${expressionId}`);
      // CHANGED: Default to false for safety (button disabled if expression not found)
      // Previously returned true, which would enable all buttons if expression was misconfigured
      return false;
    }

    // UNIFIED: Use the main evaluation engine from utils/evaluateExpression
    // This ensures consistency between action button enable/disable and conditional effects
    // The evaluateExpressionUtil supports both HA entity states AND part data
    // Note: We don't pass dispatch here because we want synchronous evaluation for button state
    
    // A ConditionalLogicItem can have multiple pairs. 
    // Return true if ANY pair's condition evaluates to true
    return logic.logicPairs.some(pair => {
      try {
        // Pass the part from context if available, otherwise null for generic rules
      const partContext = context.part || null;
      const result = evaluateExpressionUtil(
        pair.conditionRules,
        partContext,
        state as RootState,
        logger,
        cardInstanceId
        // Note: No dispatch parameter = synchronous evaluation
      );
      return result;
      } catch (error) {
        logger.error('evaluateExpression', `Error evaluating logic pair ${pair.id}: ${(error as Error).message}`);
        // On error, default to false (disable button for safety)
        return false;
      }
    });
  }

  public executeAction(actionId: string, context: ActionExecutionContext, cardInstanceId: string): void {
    console.log(`%c[ActionEngine] executeAction called for actionId: ${actionId}`, 'color: #8E44AD; font-weight: bold;', { context, cardInstanceId });
    if (this.isExecuting.has(actionId)) {
      logger.warn('executeAction', `Action '${actionId}' is already executing. Skipping to prevent infinite loops.`);
      return;
    }

    const allActions: ActionDefinition[] = selectAllActionDefinitionsForInstance(store.getState() as RootState, cardInstanceId);
    const actionDef = allActions.find((a: ActionDefinition) => a.id === actionId);

    if (!actionDef) {
      logger.error('executeAction', `Action definition with id '${actionId}' not found for instance '${cardInstanceId}'.`);
      return;
    }

    logger.info('executeAction', `Executing action: '${actionDef.name}' (ID: ${actionId})`, { context });
    this.isExecuting.add(actionId);

    try {
      if (actionDef.confirmation) {
        // Handle confirmation dialog
        const confirmationText = this.processTemplate(actionDef.confirmation.textTemplate, context);
        if (!confirm(confirmationText)) {
          logger.info('executeAction', 'Action cancelled by user.');
          this.isExecuting.delete(actionId);
          return;
        }
      }

      // MULTIPLE OPERATIONS SUPPORT: Handle both single operation and operations array
      const operationsToExecute: ActionOperation[] = [];
      
      if (actionDef.operations && actionDef.operations.length > 0) {
        // New array format
        operationsToExecute.push(...actionDef.operations);
        logger.debug('executeAction', `Executing ${actionDef.operations.length} operations for action '${actionId}'`);
      } else if (actionDef.operation) {
        // Backward compatibility: single operation
        operationsToExecute.push(actionDef.operation);
      } else {
        logger.warn('executeAction', `Action '${actionId}' has no operations defined!`);
      }

      // Execute all operations in sequence
      for (let i = 0; i < operationsToExecute.length; i++) {
        const operation = operationsToExecute[i];
        logger.debug('executeAction', `Executing operation ${i + 1}/${operationsToExecute.length}: ${operation.type}`);
        this.handleOperation(operation, context, cardInstanceId);
      }

    } catch (error) {
      logger.error('executeAction', `Error executing action '${actionId}':`, error as Error);
    } finally {
      this.isExecuting.delete(actionId);
      logger.verbose('executeAction', `Finished execution for action: '${actionId}'.`);
      
      // Post-evaluation logic
      if (actionDef.postEvaluationLogicIds && actionDef.postEvaluationLogicIds.length > 0) {
        logger.debug('executeAction', `Triggering post-evaluation logic for action '${actionId}'.`);
        const activeInstances = selectActiveCardInstanceIds(store.getState() as RootState);
        activeInstances.forEach(id => {
          store.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: id }) as any);
        });
      }
    }
  }

  private handleOperation(operation: ActionOperation, context: ActionExecutionContext, cardInstanceId: string): void {
    console.log(`%c[ActionEngine] handleOperation called with type: ${operation.type}`, 'color: #2980B9; font-weight: bold;', { operation });
    switch (operation.type) {
      case 'call_ha_service':
        this.handleCallHAService(operation, context);
        break;
      case 'update_inventree_parameter':
        this.handleUpdateInvenTreeParameter(operation, context, cardInstanceId);
        break;
      case 'dispatch_redux_action':
        this.handleDispatchReduxAction(operation, context, cardInstanceId);
        break;
      case 'trigger_conditional_logic':
        this.handleTriggerConditionalLogic(operation, context);
        break;
      case 'set_card_state':
        this.handleSetCardState(operation, context);
        break;
      case 'adjust_stock':
        this.handleAdjustStock(operation, context, cardInstanceId);
        break;
      default:
        logger.warn('handleOperation', `Unknown operation type: ${(operation as any).type}`);
    }
  }

  private handleCallHAService(operation: ActionCallHAServiceOperation, context: ActionExecutionContext): void {
    if (!this.hass) {
      logger.error('handleCallHAService', 'Home Assistant connection is not available.');
      return;
    }

    const { service, target, dataTemplate } = operation;
    const processedData = dataTemplate ? this.processTemplate(dataTemplate, context) : {};
    
    // Process target separately
    let processedTarget = {};
    if (target) {
      if (target.type === 'direct_entity') {
        processedTarget = { entity_id: this.processTemplate(target.entity_id, context) };
      } else if (target.type === 'standard_object_target') {
        processedTarget = this.processTemplate(target.target_details, context);
      }
    }

    const [domain, serviceName] = service.split('.');
    
    logger.debug('handleCallHAService', `Calling service ${domain}.${serviceName}`, { target: processedTarget, data: processedData });
    this.hass.callService(domain, serviceName, { ...processedTarget, ...processedData });
  }

  private handleUpdateInvenTreeParameter(operation: ActionUpdateInvenTreeParameterOperation, context: ActionExecutionContext, cardInstanceId: string): void {
    const { partIdContext, parameterName, valueTemplate } = operation;
    
    let targetPartId: number | undefined;

    if (typeof partIdContext === 'number') {
      targetPartId = partIdContext;
    } else if (partIdContext === 'current' && context.part) {
      targetPartId = context.part.pk;
    } else if (typeof partIdContext === 'string') {
      const resolvedId = this.processTemplate(partIdContext, context);
      targetPartId = typeof resolvedId === 'string' ? parseInt(resolvedId, 10) : (typeof resolvedId === 'number' ? resolvedId : undefined);
    }

    if (!targetPartId || isNaN(targetPartId)) {
      logger.error('handleUpdateInvenTreeParameter', 'Could not resolve a valid target part ID.', undefined, { partIdContext: String(partIdContext) });
      return;
    }

    let newValue = this.processTemplate(valueTemplate, context);
    
    const state = store.getState() as RootState;
    const parametersResult = inventreeApi.endpoints.getPartParameters.select({ partId: targetPartId, cardInstanceId })(state);

    if (parametersResult.data) {
      const parameter = parametersResult.data.find(p => p.template_detail?.name === parameterName);
      if (parameter) {
        // TOGGLE SUPPORT: Check if value is "TOGGLE" to flip current boolean parameter value
        if (newValue === 'TOGGLE' || (typeof newValue === 'string' && newValue.toUpperCase() === 'TOGGLE')) {
          const currentValue = parameter.data;
          // Flip boolean: "True" <-> "False" (case-insensitive)
          if (currentValue && typeof currentValue === 'string') {
            newValue = currentValue.toLowerCase() === 'true' ? 'False' : 'True';
            logger.debug('handleUpdateInvenTreeParameter', `TOGGLE detected: Flipping ${currentValue} → ${newValue}`);
          } else {
            logger.warn('handleUpdateInvenTreeParameter', `TOGGLE requested but current value is not a boolean string: ${currentValue}`);
            newValue = 'True'; // Default to True if unclear
          }
        }
        
        logger.debug('handleUpdateInvenTreeParameter', `Dispatching update for partId: ${targetPartId}, param PK: ${parameter.pk}, value: ${newValue}`);
        this.dispatch(inventreeApi.endpoints.updatePartParameter.initiate({
          partId: targetPartId,
          parameterId: parameter.pk,
          data: { data: newValue },  // FIXED: InvenTree API expects 'data' field, not 'value'
        }));
      } else {
        logger.error('handleUpdateInvenTreeParameter', `Parameter '${parameterName}' not found for part ${targetPartId}. Cannot update.`);
      }
    } else {
      logger.warn('handleUpdateInvenTreeParameter', `Parameter data for part ${targetPartId} not in cache. Cannot update. It may need to be fetched first.`);
    }
  }

  private handleDispatchReduxAction(operation: ActionDispatchReduxActionOperation, context: ActionExecutionContext, cardInstanceId: string): void {
    if (!(operation.actionType in actionManifest)) throw new Error(`Redux action '${operation.actionType}' is not whitelisted.`);
    const actionCreator = (actionManifest as any)[operation.actionType];
    const payload = this.processTemplate(operation.payloadTemplate, context);
    this.dispatch(actionCreator(payload));
  }

  private handleTriggerConditionalLogic(operation: ActionTriggerConditionalLogicOperation, context: ActionExecutionContext): void {
    logger.debug('handleTriggerConditionalLogic', `Triggering SPECIFIC logic for ID: ${operation.logicIdToTrigger}`);
    
    // FIXED: Only re-evaluate the SPECIFIC logic item, not ALL logic (nuclear approach)
    // This prevents unnecessary work and improves performance dramatically
    const activeCardIds = selectActiveCardInstanceIds(store.getState() as RootState);
    for (const cardId of activeCardIds) {
      store.dispatch(evaluateAndApplyEffectsThunk({ 
        cardInstanceId: cardId,
        logicItemIds: [operation.logicIdToTrigger]  // Only this specific logic item!
      }) as any);
    }
  }

  private handleSetCardState(operation: ActionSetCardStateOperation, context: ActionExecutionContext): void {
    logger.warn('handleSetCardState', `'set_card_state' is not yet fully implemented. State was not persisted.`);
  }

  private handleAdjustStock(operation: ActionAdjustStockOperation, context: ActionExecutionContext, cardInstanceId: string): void {
    const { partIdContext, deltaTemplate } = operation;
    
    // 1️⃣ Resolve target part ID
    let targetPartId: number | undefined;

    if (typeof partIdContext === 'number') {
      targetPartId = partIdContext;
    } else if (partIdContext === 'current' && context.part) {
      targetPartId = context.part.pk;
    } else if (typeof partIdContext === 'string') {
      const resolvedId = this.processTemplate(partIdContext, context);
      targetPartId = typeof resolvedId === 'string' ? parseInt(resolvedId, 10) : (typeof resolvedId === 'number' ? resolvedId : undefined);
    }

    if (!targetPartId || isNaN(targetPartId)) {
      logger.error('handleAdjustStock', 'Could not resolve a valid target part ID.', undefined, { partIdContext: String(partIdContext) });
      return;
    }

    // 2️⃣ Resolve delta (supports templates like "{{quantity}}")
    const deltaString = this.processTemplate(deltaTemplate, context);
    const delta = typeof deltaString === 'string' ? parseFloat(deltaString) : (typeof deltaString === 'number' ? deltaString : NaN);

    if (isNaN(delta)) {
      logger.error('handleAdjustStock', `Invalid delta value: ${deltaString}`, undefined, { deltaTemplate });
      return;
    }

    // 3️⃣ Dispatch to the bus! 🚌 (uses the same system as the +/- buttons)
    logger.info('handleAdjustStock', `Adjusting stock for part ${targetPartId} by ${delta > 0 ? '+' : ''}${delta}`);
    this.dispatch(adjustStockDebounced({
      partId: targetPartId,
      delta: delta,
      cardInstanceId: cardInstanceId
    }));
  }

  // Overload for string literals, guaranteeing a string return
  private processTemplate(template: string, context: ActionExecutionContext): string;
  // Overload for other types, preserving them
  private processTemplate<T>(template: T, context: ActionExecutionContext): T;
  // Implementation (with `any` to satisfy the overloads)
  private processTemplate(template: any, context: ActionExecutionContext): any {
    if (typeof template === 'string') {
      let processedString = template;
      const combinedRegex = /%%context\.([^%]+)%%/g;
      const matches = Array.from(template.matchAll(combinedRegex));
      
      // FIXED: Track failed templates to fail loudly instead of silently
      const failedTemplates: string[] = [];
      
      for (const match of matches) {
        const path = match[1];
        const templateString = match[0];
        try {
          const value = getPathValue(context, path);
          if (value !== undefined && value !== null) {
            processedString = processedString.split(templateString).join(String(value)); 
          } else {
            // FIXED: Collect failed templates to throw error
            failedTemplates.push(`${templateString} (path: ${path}) - value was undefined or null`);
            logger.warn('processTemplate', `Template path '${templateString}' was undefined or null.`);
          }
        } catch (e: any) {
          // FIXED: Collect failed templates to throw error
          failedTemplates.push(`${templateString} (path: ${path}) - ${(e as Error).message}`);
          logger.error('processTemplate', `Template processing error for path '${templateString}'`, e as Error);
        }
      }
      
      // FIXED: Throw error if any templates failed (fail loudly, not silently!)
      if (failedTemplates.length > 0) {
        const errorMsg = `Template processing failed for ${failedTemplates.length} template(s): ${failedTemplates.join(', ')}`;
        logger.error('processTemplate', errorMsg);
        throw new Error(errorMsg);
      }
      
      return processedString;
    }

    if (typeof template !== 'object' || template === null) {
      return template;
    }

    if (Array.isArray(template)) {
      return template.map(item => this.processTemplate(item, context));
    }

    const newObj: { [key:string]: any } = {};
    for (const key in template) {
      if (Object.prototype.hasOwnProperty.call(template, key)) {
        newObj[key] = this.processTemplate((template as any)[key], context);
      }
    }
    return newObj;
  }

  public setHomeAssistant(hass: HomeAssistant | null): void {
    this.hass = hass;
  }
}

export const actionEngine = ActionEngine.getInstance(); 