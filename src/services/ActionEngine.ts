import { HomeAssistant } from 'custom-card-helpers';
import {
  ActionDefinition,
  ActionExecutionContext,
  ActionCallHAServiceOperation,
  ActionUpdateInvenTreeParameterOperation,
  ActionDispatchReduxActionOperation,
  ActionTriggerConditionalLogicOperation,
  ActionSetCardStateOperation,
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
import { updateParameterValue } from '../store/thunks/parameterThunks';
import { get } from 'lodash';

const logger = ConditionalLoggerEngine.getInstance().getLogger('ActionEngine');
ConditionalLoggerEngine.getInstance().registerCategory('ActionEngine', { enabled: true, level: 'info' });

const UNDEFINED_TEMPLATE_MARKER = '[TEMPLATE_VALUE_NOT_FOUND]';

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

function processTemplate(template: any, context: ActionExecutionContext): any {
  if (typeof template === 'string') {
    let processedString = template;
    const combinedRegex = /%(\w+)%|%%context\.([^%]+)%%/g;
    const matches = Array.from(template.matchAll(combinedRegex));
    for (const match of matches) {
      const isSimpleFormat = match[1] !== undefined;
      const path = isSimpleFormat ? `part.${match[1]}` : match[2];
      const templateString = match[0];
      try {
        const value = getPathValue(context, path);
        if (value !== undefined && value !== null) {
          processedString = processedString.split(templateString).join(String(value)); 
        } else {
          processedString = processedString.split(templateString).join(UNDEFINED_TEMPLATE_MARKER);
          logger.warn('processTemplate', `Template path '${templateString}' was undefined or null.`);
        }
      } catch (e: any) {
        logger.error('processTemplate', `Template processing error for path '${templateString}'`, e as Error);
        processedString = processedString.split(templateString).join(UNDEFINED_TEMPLATE_MARKER);
      }
    }
    return processedString;
  } else if (typeof template === 'object' && template !== null) {
    if (Array.isArray(template)) {
      return template.map(item => processTemplate(item, context));
    } else {
      const processedObject: Record<string, any> = {};
      for (const key in template) {
        if (Object.prototype.hasOwnProperty.call(template, key)) {
          processedObject[key] = processTemplate(template[key], context);
        }
      }
      return processedObject;
    }
  }
  return template;
}

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

  public evaluateExpression(expressionId: string, context: ActionExecutionContext, cardInstanceId: string): boolean {
    const state = store.getState();
    const definedLogics = selectConditionalLogic(state, cardInstanceId); // 🚀 Use correct selector
    const logic = definedLogics.find(l => l.id === expressionId);

    if (!logic) {
      logger.warn('evaluateExpression', `Could not find defined logic with ID: ${expressionId}`);
      return true; // Default to true if expression not found
    }

    // This is a simplified, synchronous version of the logic in evaluateAndApplyEffectsThunk
    // It only checks the 'condition' part.
    const checkCondition = (condition: RuleType): boolean => {
      // In your system, the 'field' property holds the entity_id
      const { field: entity_id, operator, value } = condition;
      if (!entity_id) return false;

      // The 'attribute' is parsed from the entity_id string if it contains a '.'
      const parts = entity_id.split('.');
      const entityIdOnly = parts.length > 1 ? `${parts[0]}.${parts[1]}` : entity_id;
      const attribute = parts.length > 2 ? parts.slice(2).join('.') : undefined;
      
      const entityState = (state as any).genericHaStates.entities[entityIdOnly];
      if (!entityState) return false;

      const actualValue = attribute ? get(entityState.attributes, attribute) : entityState.state;

      switch (operator) {
        case '==': return actualValue == value;
        case '!=': return actualValue != value;
        case '>': return actualValue > value;
        case '<': return actualValue < value;
        case '>=': return actualValue >= value;
        case '<=': return actualValue <= value;
        case 'in': return String(value).includes(actualValue);
        case 'not in': return !String(value).includes(actualValue);
        default: return false;
      }
    };
    
    const evaluateGroup = (group: RuleGroupType): boolean => {
      const results = group.rules.map((rule) => {
        if ('combinator' in rule) { // It's a nested group
          return evaluateGroup(rule as RuleGroupType);
        }
        return checkCondition(rule as RuleType);
      });

      if (group.combinator === 'and') {
        return results.every(Boolean);
      } else {
        return results.some(Boolean);
      }
    };

    // A single ConditionalLogicItem can have multiple pairs. We assume for now that if ANY pair's condition is met, the expression is true.
    return logic.logicPairs.some(pair => evaluateGroup(pair.conditionRules));
  }

  public executeAction(actionId: string, context: ActionExecutionContext, cardInstanceId: string): void {
    console.log(`%c[ActionEngine] executeAction called for actionId: ${actionId}`, 'color: #8E44AD; font-weight: bold;', { context, cardInstanceId });
    if (this.isExecuting.has(actionId)) {
      logger.warn('executeAction', `Action '${actionId}' is already executing. Skipping to prevent infinite loops.`);
      return;
    }

    const allActions: ActionDefinition[] = selectAllActionDefinitionsForInstance(store.getState(), cardInstanceId);
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

      this.handleOperation(actionDef.operation, context, cardInstanceId);

    } catch (error) {
      logger.error('executeAction', `Error executing action '${actionId}':`, error as Error);
    } finally {
      this.isExecuting.delete(actionId);
      logger.verbose('executeAction', `Finished execution for action: '${actionId}'.`);
      
      // Post-evaluation logic
      if (actionDef.postEvaluationLogicIds && actionDef.postEvaluationLogicIds.length > 0) {
        logger.debug('executeAction', `Triggering post-evaluation logic for action '${actionId}'.`);
        const activeInstances = selectActiveCardInstanceIds(store.getState());
        activeInstances.forEach(id => {
          store.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: id }));
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

    const newValue = this.processTemplate(valueTemplate, context);

    logger.debug('handleUpdateInvenTreeParameter', `Dispatching update for partId: ${targetPartId}, param: ${parameterName}, value: ${newValue}`);

    store.dispatch(updateParameterValue({
      cardInstanceId,
      partId: targetPartId,
      paramName: parameterName,
      value: newValue,
    }));
  }

  private handleDispatchReduxAction(operation: ActionDispatchReduxActionOperation, context: ActionExecutionContext, cardInstanceId: string): void {
    if (!(operation.actionType in actionManifest)) throw new Error(`Redux action '${operation.actionType}' is not whitelisted.`);
    const actionCreator = (actionManifest as any)[operation.actionType];
    const payload = this.processTemplate(operation.payloadTemplate, context);
    this.dispatch(actionCreator(payload));
  }

  private handleTriggerConditionalLogic(operation: ActionTriggerConditionalLogicOperation, context: ActionExecutionContext): void {
    logger.debug('handleTriggerConditionalLogic', `Triggering logic for ID: ${operation.logicIdToTrigger}`);
    const activeCardIds = selectActiveCardInstanceIds(store.getState());
    for (const cardId of activeCardIds) {
      store.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: cardId }));
    }
  }

  private handleSetCardState(operation: ActionSetCardStateOperation, context: ActionExecutionContext): void {
    logger.warn('handleSetCardState', `'set_card_state' is not yet fully implemented. State was not persisted.`);
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
      for (const match of matches) {
        const path = match[1];
        const templateString = match[0];
        try {
          const value = getPathValue(context, path);
          if (value !== undefined && value !== null) {
            processedString = processedString.split(templateString).join(String(value)); 
          } else {
            logger.warn('processTemplate', `Template path '${templateString}' was undefined or null.`);
          }
        } catch (e: any) {
          logger.error('processTemplate', `Template processing error for path '${templateString}'`, e as Error);
        }
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