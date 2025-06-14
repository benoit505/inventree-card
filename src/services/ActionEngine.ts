import { HomeAssistant } from 'custom-card-helpers';
import {
  ActionDefinition,
  ActionExecutionContext,
  ActionCallHAServiceOperation,
  ActionOperationType,
  InventreeItem,
  ActionUpdateInvenTreeParameterOperation,
  ActionDispatchReduxActionOperation,
  ActionTriggerConditionalLogicOperation,
  ActionSetCardStateOperation
} from '../types';
import { store, RootState, AppDispatch } from '../store';
import {
  updateActionRuntimeState,
  selectActionDefinition,
} from '../store/slices/actionsSlice';
import { Logger } from '../utils/logger';
import { evaluateAndApplyEffectsThunk } from '../store/thunks/conditionalLogicThunks';
import { inventreeApi } from '../store/apis/inventreeApi';

// SLAY THE HYDRA: Import the safe, user-exposable action creators
import { setActiveView, setSelectedPart, toggleDebugPanel } from '../store/slices/uiSlice';
import { setLocatingPartId } from '../store/slices/partsSlice';
import { selectActiveCardInstanceIds } from '../store/slices/componentSlice';

const logger = Logger.getInstance();
const UNDEFINED_TEMPLATE_MARKER = '[TEMPLATE_VALUE_NOT_FOUND]';

// SLAY THE HYDRA: Define the manifest of safe actions users can dispatch
const actionManifest = {
  'ui.setActiveView': setActiveView,
  'ui.setSelectedPart': setSelectedPart,
  'ui.toggleDebugPanel': toggleDebugPanel,
  'parts.setLocatingPartId': setLocatingPartId,
  // Add other safe actions here in the future
};

function getPathValue(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;

  const segments = path.split('.');
  let current: any = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;

    // Try propName:Identifier for named item in array (e.g., parameters:MyParamName)
    const namedItemMatch = segment.match(/^(\w+):(.+)$/);
    if (namedItemMatch) {
      const arrayPropName = namedItemMatch[1];
      const itemName = namedItemMatch[2];
      if (typeof current !== 'object' || !(arrayPropName in current) || !Array.isArray(current[arrayPropName])) {
        return undefined;
      }
      const arr = current[arrayPropName] as any[];
      current = arr.find(item => 
        (item.template_detail && item.template_detail.name === itemName) || 
        (item.name === itemName) 
      );
      continue;
    }

    // Try propName[index] for array index access
    const arrayIndexMatch = segment.match(/^(\w+)\[(\d+)\]$/);
    if (arrayIndexMatch) {
      const arrayPropName = arrayIndexMatch[1];
      const index = parseInt(arrayIndexMatch[2], 10);
      if (typeof current !== 'object' || !(arrayPropName in current) || !Array.isArray(current[arrayPropName])) {
        return undefined;
      }
      current = current[arrayPropName][index];
      continue;
    }

    // Standard property access
    if (typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function processTemplate(template: any, context: ActionExecutionContext): any {
  if (typeof template === 'string') {
    let processedString = template;

    // New combined regex to find both formats
    const combinedRegex = /%(\w+)%|%%context\.([^%]+)%%/g;
    
    const matches = Array.from(template.matchAll(combinedRegex));

    for (const match of matches) {
      // If match[1] is not undefined, it's the simple format (e.g., %pk%)
      // If match[2] is not undefined, it's the context format (e.g., %%context.part.pk%%)
      const isSimpleFormat = match[1] !== undefined;
      const path = isSimpleFormat ? `part.${match[1]}` : match[2];
      const templateString = match[0];

      try {
        const value = getPathValue(context, path);

        if (value !== undefined && value !== null) {
          processedString = processedString.split(templateString).join(String(value)); 
        } else {
          processedString = processedString.split(templateString).join(UNDEFINED_TEMPLATE_MARKER);
          logger.warn('ActionEngine', `Template path '${templateString}' (resolved to 'context.${path}') was undefined or null.`);
        }
      } catch (e: any) {
        logger.error('ActionEngine', `Template processing error for path '${templateString}'`, { errorMessage: e.message, errorStack: e.stack });
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

  private constructor() {
    this.dispatch = store.dispatch as AppDispatch;
    logger.log('ActionEngine', 'ActionEngine initialized');
  }

  public static getInstance(): ActionEngine {
    if (!ActionEngine.instance) {
      ActionEngine.instance = new ActionEngine();
    }
    return ActionEngine.instance;
  }

  public async executeAction(
    actionId: string,
    initialContext: ActionExecutionContext & { hass?: HomeAssistant } 
  ): Promise<void> {
    const state = store.getState() as RootState;
    const actionDef = selectActionDefinition(state, actionId);

    if (!actionDef) {
      logger.error('ActionEngine', `ActionDefinition not found for ID: ${actionId}`);
      this.dispatch(updateActionRuntimeState({actionId, runtimeState: { status: 'error', error: 'Definition not found' }}));
      return;
    }
    
    const enrichedContext: ActionExecutionContext & { hass?: HomeAssistant } = {
        ...initialContext,
        hassStates: initialContext.hassStates || (initialContext.hass ? initialContext.hass.states : {}),
    };

    logger.log('ActionEngine', `Executing action: ${actionDef.name} (ID: ${actionId})`, { context: enrichedContext });
    this.dispatch(updateActionRuntimeState({ 
      actionId, 
      runtimeState: { 
        status: 'pending', 
        lastRun: Date.now(),
        actionName: actionDef.name
      } 
    }));

    try {
      // Phase 5.3: Check if action is enabled via isEnabledExpressionId
      if (actionDef.isEnabledExpressionId) {
        // Placeholder for actual expression evaluation
        // const expressionResult = ExpressionEngine.evaluate(actionDef.isEnabledExpressionId, enrichedContext);
        // For now, we'll simulate that if the ID exists, we need it to be true.
        // This part needs to be integrated with a real ExpressionEngine evaluation.
        const isEnabled = false; // Simulate a non-true result for now if an ID is present
        logger.warn('ActionEngine', `isEnabledExpressionId '${actionDef.isEnabledExpressionId}' found for action '${actionDef.name}'. Actual evaluation pending ExpressionEngine integration.`);
        
        if (!isEnabled) { // In a real scenario: if (expressionResult !== true)
          logger.log('ActionEngine', `Action '${actionDef.name}' is disabled by expression '${actionDef.isEnabledExpressionId}'. Skipping execution.`);
          this.dispatch(updateActionRuntimeState({ actionId, runtimeState: { status: 'idle', error: 'Action disabled by conditional expression' } }));
          return; // Stop execution
        }
      }

      if (actionDef.confirmation && actionDef.confirmation.textTemplate) {
        const confirmationMessage = processTemplate(actionDef.confirmation.textTemplate, enrichedContext);
        if (!window.confirm(confirmationMessage)) {
          logger.log('ActionEngine', `Action ${actionDef.name} cancelled by user.`);
          this.dispatch(updateActionRuntimeState({actionId, runtimeState: { status: 'idle', error: 'User cancelled' }}));
          return;
        }
      }

      switch (actionDef.operation.type) {
        case 'call_ha_service':
          await this.handleCallHAService(actionDef, enrichedContext);
          break;
        case 'update_inventree_parameter':
          await this.handleUpdateInvenTreeParameter(actionDef, enrichedContext);
          break;
        case 'dispatch_redux_action':
          await this.handleDispatchReduxAction(actionDef, enrichedContext);
          break;
        case 'trigger_conditional_logic':
          await this.handleTriggerConditionalLogic(actionDef, enrichedContext);
          break;
        case 'set_card_state':
          await this.handleSetCardState(actionDef, enrichedContext);
          break;
        default:
          throw new Error(`Unsupported action operation type: ${actionDef.operation.type}`);
      }

      this.dispatch(updateActionRuntimeState({ 
        actionId, 
        runtimeState: { 
          status: 'success', 
          lastRun: Date.now(), 
          error: undefined,
          actionName: actionDef.name
        }
      }));
      logger.log('ActionEngine', `Action ${actionId} executed successfully.`);

      // Phase 4.2: Trigger post-evaluation conditional logic
      if (actionDef.postEvaluationLogicIds && actionDef.postEvaluationLogicIds.length > 0) {
        logger.log('ActionEngine', `Action ${actionId} has postEvaluationLogicIds. Dispatching evaluateAndApplyEffectsThunk for all active cards.`);
        try {
          // Since the ActionEngine is global, it doesn't have a single cardInstanceId.
          // The correct approach is to get all active card instances and dispatch the thunk for each.
          const activeCardIds = selectActiveCardInstanceIds(store.getState());
          for (const cardId of activeCardIds) {
            await this.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: cardId }));
          }
          logger.log('ActionEngine', `Finished dispatching evaluateAndApplyEffectsThunk for action ${actionId} on cards:`, { ids: activeCardIds });
        } catch (evalError) {
          logger.error('ActionEngine', `Error dispatching or executing evaluateAndApplyEffectsThunk after action ${actionId}:`, { error: evalError });
        }
      }

    } catch (error: any) {
      logger.error('ActionEngine', `Error executing action ${actionDef.name}:`, { errorMessage: error.message, errorStack: error.stack });
      this.dispatch(updateActionRuntimeState({ 
        actionId, 
        runtimeState: { 
          status: 'error', 
          error: error.message || 'Unknown execution error', 
          lastRun: Date.now(),
          actionName: actionDef.name
        }
      }));
    }
  }

  private async handleCallHAService(
    actionDef: ActionDefinition,
    context: ActionExecutionContext & { hass?: HomeAssistant }
  ): Promise<void> {
    const operationConfig = actionDef.operation.callHAService;
    if (!operationConfig) throw new Error('call_ha_service operation configuration is missing.');
    if (!context.hass) throw new Error('HomeAssistant object (hass) not found in execution context.');

    const serviceParts = operationConfig.service.split('.');
    if (serviceParts.length !== 2) throw new Error(`Invalid service name: ${operationConfig.service}`);
    const [domain, service] = serviceParts;

    const serviceData = operationConfig.dataTemplate 
      ? processTemplate(operationConfig.dataTemplate, context) 
      : {};

    let finalTargetForHA: any = undefined;
    if (operationConfig.target) {
      const processedTarget = processTemplate(operationConfig.target, context);
      if (processedTarget) {
        if (processedTarget.type === 'direct_entity' && processedTarget.entity_id) {
          finalTargetForHA = { entity_id: processedTarget.entity_id };
        } else if (processedTarget.type === 'standard_object_target' && processedTarget.target_details) {
          finalTargetForHA = processedTarget.target_details;
          if (finalTargetForHA && Object.keys(finalTargetForHA).length === 0) {
            finalTargetForHA = undefined;
          }
        } else if (processedTarget.entity_id) {
          finalTargetForHA = { entity_id: processedTarget.entity_id };
          logger.warn('ActionEngine', 'Processed target had entity_id at top level without a type. Using it directly. Consider updating action config.', { processedTarget });
        } else {
          logger.warn('ActionEngine', 'Processed target did not match expected structure or was empty. No target will be sent.', { processedTarget });
        }
      }
    }

    let callData = { ...serviceData };
    if (finalTargetForHA) {
      if (Object.keys(finalTargetForHA).length === 1 && finalTargetForHA.entity_id) {
        // If finalTargetForHA only contains entity_id, merge it directly
        callData = { ...callData, entity_id: finalTargetForHA.entity_id };
      } else {
        // Otherwise, nest it under the 'target' key
        callData = { ...callData, target: finalTargetForHA };
      }
    }

    logger.log('ActionEngine', `Calling HA service ${domain}.${service} with data:`, { data: callData });
    await context.hass.callService(domain, service, callData);
  }

  private async handleUpdateInvenTreeParameter(
    actionDef: ActionDefinition,
    context: ActionExecutionContext
  ): Promise<void> {
    const operationConfig = actionDef.operation.updateInvenTreeParameter;
    if (!operationConfig) throw new Error('update_inventree_parameter operation configuration is missing.');

    let resolvedPartId: number | undefined;

    if (typeof operationConfig.partIdContext === 'number') {
      resolvedPartId = operationConfig.partIdContext;
    } else if (operationConfig.partIdContext === 'current') {
      resolvedPartId = context.part?.pk;
    } else if (typeof operationConfig.partIdContext === 'string') {
      const templatedPartId = processTemplate(operationConfig.partIdContext, context);
      if (templatedPartId && !isNaN(Number(templatedPartId))) {
        resolvedPartId = Number(templatedPartId);
      } else {
        logger.error('ActionEngine:handleUpdateInvenTreeParameter', `Templated partIdContext resolved to invalid number: ${templatedPartId}`);
      }
    }

    if (resolvedPartId === undefined) {
      throw new Error('Could not resolve partId for update_inventree_parameter operation.');
    }

    const newValue = processTemplate(operationConfig.valueTemplate, context);
    if (newValue === UNDEFINED_TEMPLATE_MARKER) {
        throw new Error(`Value template resolved to not found for parameter ${operationConfig.parameterName} on part ${resolvedPartId}.`);
    }

    // Get parameterPk from RTK Query cache
    const state = store.getState() as RootState;
    // Correctly use the partId argument for the select call
    const partParametersQueryState = inventreeApi.endpoints.getPartParameters.select(resolvedPartId)(state);

    if (!partParametersQueryState || partParametersQueryState.status !== 'fulfilled' || !partParametersQueryState.data) {
        logger.error('ActionEngine:handleUpdateInvenTreeParameter', `Parameters for part ${resolvedPartId} not found in RTK Query cache or not yet fetched. Cannot determine parameter PK for '${operationConfig.parameterName}'.`);
        throw new Error(`Parameters for part ${resolvedPartId} not available in cache. Cannot update ${operationConfig.parameterName}.`);
    }

    const parameterToUpdate = partParametersQueryState.data.find(p => p.template_detail?.name === operationConfig.parameterName);

    if (!parameterToUpdate) {
        logger.error('ActionEngine:handleUpdateInvenTreeParameter', `Parameter '${operationConfig.parameterName}' not found for part ${resolvedPartId} in cached data. Cannot get PK for update.`);
        throw new Error(`Parameter '${operationConfig.parameterName}' not found for part ${resolvedPartId}.`);
    }

    const parameterPk = parameterToUpdate.pk;

    logger.log('ActionEngine:handleUpdateInvenTreeParameter', `Attempting to update param PK ${parameterPk} ('${operationConfig.parameterName}') for part ${resolvedPartId} to '${newValue}'.`);

    try {
      await this.dispatch(
        inventreeApi.endpoints.updatePartParameter.initiate({ partId: resolvedPartId, parameterPk, value: String(newValue) })
      ).unwrap(); // Use unwrap to get the actual result or throw an error
      logger.log('ActionEngine:handleUpdateInvenTreeParameter', `Successfully updated parameter ${operationConfig.parameterName} for part ${resolvedPartId}.`);
    } catch (error: any) {
      logger.error('ActionEngine:handleUpdateInvenTreeParameter', `Failed to update parameter ${operationConfig.parameterName} for part ${resolvedPartId}:`, { error });
      // Re-throw the error to be caught by the main executeAction error handler
      throw new Error(`Failed to update InvenTree parameter: ${error.message || error.data?.detail || 'Unknown API error'}`);
    }
  }

  private async handleDispatchReduxAction(
    actionDef: ActionDefinition,
    context: ActionExecutionContext
  ): Promise<void> {
    const operationConfig = actionDef.operation.dispatchReduxAction;
    if (!operationConfig) throw new Error('dispatch_redux_action operation configuration is missing.');

    // The user now provides an 'actionName' which must be in our manifest.
    const actionName = (operationConfig as any).actionName; 
    if (!actionName || typeof actionName !== 'string' || !actionManifest.hasOwnProperty(actionName)) {
      throw new Error(`Invalid or missing actionName: '${actionName}'. It must be one of [${Object.keys(actionManifest).join(', ')}].`);
    }

    // Get the actual action creator function from our manifest.
    const actionCreator = actionManifest[actionName as keyof typeof actionManifest];

    let resolvedPayload: any = {};
    if (operationConfig.payloadTemplate) {
      resolvedPayload = processTemplate(operationConfig.payloadTemplate, context);
      if (resolvedPayload === UNDEFINED_TEMPLATE_MARKER && Object.keys(operationConfig.payloadTemplate).length > 0) {
        logger.warn('ActionEngine:handleDispatchReduxAction', `Payload template for actionName ${actionName} resolved to UNDEFINED_TEMPLATE_MARKER. This might indicate missing context variables.`);
      }
    }

    logger.log('ActionEngine:handleDispatchReduxAction', `Dispatching supervised Redux action:`, { actionName, payload: resolvedPayload });

    try {
      // Dispatch the action by calling the type-safe action creator from the manifest.
      // We use 'as any' here because TypeScript cannot infer the correct payload type for the dynamically chosen action creator.
      // This is a safe and necessary assertion in this dynamic dispatch context.
      this.dispatch((actionCreator as any)(resolvedPayload));
      logger.log('ActionEngine:handleDispatchReduxAction', `Successfully dispatched Redux action ${actionName}.`);
    } catch (error: any) {
      logger.error('ActionEngine:handleDispatchReduxAction', `Error dispatching Redux action ${actionName}:`, { error });
      throw new Error(`Failed to dispatch Redux action: ${error.message || 'Unknown error'}`);
    }
  }

  private async handleTriggerConditionalLogic(
    actionDef: ActionDefinition,
    context: ActionExecutionContext
  ): Promise<void> {
    const operation = actionDef.operation.triggerConditionalLogic;
    if (!operation) {
      throw new Error('trigger_conditional_logic operation details are missing.');
    }
    const logicId = processTemplate(operation.logicIdToTrigger, context);

    logger.log('ActionEngine', `Triggering conditional logic evaluation for logic ID: ${logicId}.`);
    
    // As in the post-evaluation logic, we dispatch for all active cards
    const activeCardIds = selectActiveCardInstanceIds(store.getState());
    for (const cardId of activeCardIds) {
      // Here, we might want a more targeted thunk in the future that can take a specific logicId
      await this.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: cardId }));
    }
  }

  private async handleSetCardState(
    actionDef: ActionDefinition,
    context: ActionExecutionContext
  ): Promise<void> {
    const operationConfig = actionDef.operation.setCardState;
    if (!operationConfig) throw new Error('set_card_state operation configuration is missing.');

    const statePath = operationConfig.statePath;
    const valueTemplate = operationConfig.valueTemplate;
    const resolvedValue = processTemplate(valueTemplate, context);

    logger.warn('ActionEngine:handleSetCardState', 
      `Operation type 'set_card_state' is not fully implemented in ActionEngine due to architectural constraints. ` +
      `Attempted to set state for path '${statePath}' with value:`, { resolvedValue, context });
    logger.warn('ActionEngine:handleSetCardState', 
      `Consider using Redux (via 'dispatch_redux_action') or local component state for managing UI states.`);
    
    // This operation currently does nothing beyond logging.
    // A full implementation would require an event bus or other mechanism for React components to subscribe to such state changes,
    // or for this engine to interact with a dedicated UI state slice in Redux.
    await Promise.resolve(); // Fulfill the async promise
  }
}

export const actionEngine = ActionEngine.getInstance(); 