import { LitElement, TemplateResult } from "lit";
import { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { InventreeCardConfig } from '../types';
export declare class InventreeCardEditor extends LitElement implements LovelaceCardEditor {
    static styles: import("lit").CSSResult[];
    hass?: HomeAssistant;
    private _config?;
    private logger;
    private _showConditionDialog;
    private _editingConditionIndex;
    private _conditionParameter;
    private _conditionOperator;
    private _conditionValue;
    private _conditionAction;
    private _conditionActionValue;
    private _conditionTargetPartIds;
    private _showActionDialog;
    private _editingActionIndex;
    private _actionLabel;
    private _actionIcon;
    private _actionParameter;
    private _actionValue;
    private _actionConfirmation;
    private _actionConfirmationText;
    private _conditionParameterType;
    private _conditionPartId;
    private _conditionParamName;
    constructor();
    disconnectedCallback(): void;
    setConfig(config: InventreeCardConfig): void;
    private _updateConfig;
    render(): TemplateResult<1>;
    private _renderPartsConfig;
    private _entitySelected;
    private _removeEntity;
    private _valueChanged;
    static getConfigForm(): Promise<any>;
    static getStubConfig(hass: HomeAssistant): InventreeCardConfig;
    private _filterAttribute;
    private _filterOperator;
    private _filterValue;
    private _parameterName;
    private _parameterValue;
    private _getOperatorLabel;
    private _addFilter;
    private _removeFilter;
    private _showParameterFilterDialog;
    private _addParameterFilter;
    private _getActionLabel;
    private _addCondition;
    private _editCondition;
    private _closeConditionDialog;
    private _saveCondition;
    private _removeCondition;
    private _addAction;
    private _editAction;
    private _closeActionDialog;
    private _saveAction;
    private _removeAction;
    private _renderConditionDialog;
    private _renderActionValueInput;
    private _renderActionDialog;
    private _renderDirectApiConfig;
    private _renderDebuggingSection;
    /**
     * Get subsystem debug state
     */
    private _getSubsystem;
    /**
     * Update subsystem debug state
     */
    private _updateSubsystem;
    /**
     * Format subsystem name for display
     */
    private _formatSubsystemName;
    /**
     * Get method description
     */
    private _getMethodDescription;
    /**
     * Render scheduled jobs list
     */
    private _renderScheduledJobs;
    /**
     * Show dialog to add a new scheduled job
     */
    private _showAddJobDialog;
    /**
     * Get performance setting with fallback
     */
    private _getPerformanceSetting;
    /**
     * Update performance setting
     */
    private _updatePerformanceSetting;
    private _parameterTypeChanged;
    /**
     * Handle debug checkbox change
     */
    private _valueChangedDebug;
    private _renderPerformanceSettings;
}
