import { HomeAssistant } from 'custom-card-helpers';
import { ActionExecutionContext } from '../types';
export declare class ActionEngine {
    private static instance;
    private dispatch;
    private hass;
    private isExecuting;
    private constructor();
    static getInstance(): ActionEngine;
    /**
     * Evaluate a conditional logic expression to determine if an action should be enabled.
     * Uses the unified evaluation engine from utils/evaluateExpression.
     *
     * @param expressionId - The ID of the conditional logic item to evaluate
     * @param context - The execution context (part, hass, etc.)
     * @param cardInstanceId - The card instance ID
     * @returns true if the expression evaluates to true, false otherwise
     */
    evaluateExpression(expressionId: string, context: ActionExecutionContext, cardInstanceId: string): boolean;
    executeAction(actionId: string, context: ActionExecutionContext, cardInstanceId: string): void;
    private handleOperation;
    private handleCallHAService;
    private handleUpdateInvenTreeParameter;
    private handleDispatchReduxAction;
    private handleTriggerConditionalLogic;
    private handleSetCardState;
    private handleAdjustStock;
    private processTemplate;
    setHomeAssistant(hass: HomeAssistant | null): void;
}
export declare const actionEngine: ActionEngine;
