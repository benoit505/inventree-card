import { HomeAssistant } from 'custom-card-helpers';
import { ActionExecutionContext } from '../types';
export declare class ActionEngine {
    private static instance;
    private dispatch;
    private constructor();
    static getInstance(): ActionEngine;
    executeAction(actionId: string, initialContext: ActionExecutionContext & {
        hass?: HomeAssistant;
    }): Promise<void>;
    private handleCallHAService;
    private handleUpdateInvenTreeParameter;
    private handleDispatchReduxAction;
    private handleTriggerConditionalLogic;
    private handleSetCardState;
}
export declare const actionEngine: ActionEngine;
