import { HomeAssistant } from 'custom-card-helpers';
import { ActionExecutionContext } from '../types';
export declare class ActionEngine {
    private static instance;
    private dispatch;
    private hass;
    private isExecuting;
    private constructor();
    static getInstance(): ActionEngine;
    evaluateExpression(expressionId: string, context: ActionExecutionContext, cardInstanceId: string): boolean;
    executeAction(actionId: string, context: ActionExecutionContext, cardInstanceId: string): void;
    private handleOperation;
    private handleCallHAService;
    private handleUpdateInvenTreeParameter;
    private handleDispatchReduxAction;
    private handleTriggerConditionalLogic;
    private handleSetCardState;
    private processTemplate;
    setHomeAssistant(hass: HomeAssistant | null): void;
}
export declare const actionEngine: ActionEngine;
