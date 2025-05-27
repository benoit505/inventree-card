// src/editor.ts
import { LitElement, html, css, nothing, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardEditor, fireEvent } from "custom-card-helpers";
import type { HassEntity } from "home-assistant-js-websocket";
import { 
    InventreeCardConfig, 
    ViewType, 
    VariantViewType, 
    FilterConfig, 
    ParameterOperator, 
    ParameterActionType,
    ParameterCondition,
    ParameterAction,
    HaEntityPickerEntity,
    DebugConfig
} from '../types'; // Changed import path
import { CARD_NAME } from "../core/constants";
import { editorStyles } from "../styles/editor";
import { mdiDelete } from '@mdi/js';
import { Logger } from '../utils/logger';

@customElement('inventree-card-editor')
export class InventreeCardEditor extends LitElement implements LovelaceCardEditor {
    static styles = [
        editorStyles,
        css`
            :host {
                --primary-color: var(--primary-text-color);
                --secondary-color: var(--secondary-text-color);
                --primary-background-color: var(--card-background-color);
                --secondary-background-color: var(--secondary-background-color);
                --border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
                --mdc-dialog-heading-ink-color: var(--primary-text-color);
                --mdc-dialog-content-ink-color: var(--primary-text-color);
                --dialog-background-color: var(--card-background-color);
                --dialog-text-color: var(--primary-text-color);
                --dialog-border-color: var(--divider-color);
                --button-primary-color: var(--primary-color);
                --button-primary-text-color: var(--text-primary-color);
                --button-secondary-color: var(--secondary-background-color);
                --button-secondary-text-color: var(--primary-text-color);
            }
            
            /* Feature flag styles */
            .feature-flag-row {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .feature-flag-row input[type="checkbox"] {
                margin-right: 8px;
                width: auto;
                margin-bottom: 0;
            }
            
            .feature-flag-row label {
                margin-bottom: 0;
                cursor: pointer;
            }
            
            /* Redux migration section styles */
            .card-config-panel {
                margin-top: 16px;
                padding: 16px;
                border-radius: 8px;
                background-color: var(--secondary-background-color, rgba(0,0,0,0.05));
            }
            
            .category {
                font-size: 18px;
                font-weight: 500;
                margin-bottom: 16px;
                color: var(--primary-text-color);
                border-bottom: 1px solid var(--divider-color);
                padding-bottom: 8px;
            }
            
            .sub-category {
                margin-bottom: 16px;
            }
            
            .sub-category-title {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--secondary-text-color);
            }
            
            .sub-category-content {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 8px;
                background-color: var(--card-background-color);
                border-radius: 4px;
            }
            
            .sub-category-content button {
                padding: 6px 12px;
                border-radius: 4px;
                background-color: var(--secondary-background-color);
                color: var(--primary-text-color);
                border: 1px solid var(--divider-color);
                cursor: pointer;
                font-size: 12px;
                margin-right: 8px;
                margin-bottom: 8px;
                transition: all 0.2s ease-in-out;
            }
            
            .sub-category-content button:hover {
                background-color: var(--primary-color);
                color: var(--text-primary-color);
            }
            
            .phase-buttons {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .phase-buttons button {
                width: 100%;
                text-align: left;
                position: relative;
                padding-left: 16px;
            }
            
            .phase-buttons button.active {
                background-color: var(--primary-color);
                color: var(--text-primary-color);
                font-weight: bold;
            }
            
            .phase-buttons button.active::before {
                content: '✓';
                position: absolute;
                left: 5px;
                top: 50%;
                transform: translateY(-50%);
            }
            /* End Redux migration section styles */
            
            .grid-2 {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            
            .section {
                padding: 16px;
                border-bottom: 1px solid var(--divider-color);
            }
            
            .section-header {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 16px;
                color: var(--primary-text-color);
            }

            .basic-settings {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 8px;
                align-items: center;
            }

            .select-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            select {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
                margin-bottom: 8px;
            }
            
            label {
                color: var(--primary-text-color);
                font-size: 0.9rem;
            }

            .grid-settings {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 8px;
            }

            .subsection {
                margin-top: 16px;
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
            }
            
            .subsection-header {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--secondary-text-color);
            }

            .input-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            input {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
            }

            paper-dropdown-menu {
                width: 100%;
            }
            
            paper-listbox {
                padding: 0;
                background: var(--paper-card-background-color);
            }
            
            paper-item {
                cursor: pointer;
                min-height: 35px;
            }
            
            paper-item:hover::before,
            .iron-selected:before {
                position: var(--layout-fit_-_position);
                top: var(--layout-fit_-_top);
                right: var(--layout-fit_-_right);
                bottom: var(--layout-fit_-_bottom);
                left: var(--layout-fit_-_left);
                background: currentColor;
                content: '';
                opacity: var(--dark-divider-opacity);
                pointer-events: none;
            }

            .entity-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                margin: 4px 0;
            }
            
            .entity-name {
                flex-grow: 1;
                margin-right: 8px;
            }

            .delete-button {
                padding: 4px 8px;
                border-radius: 4px;
                background-color: var(--error-color);
                color: white;
                border: none;
                cursor: pointer;
            }

            .add-button {
                padding: 6px 12px;
                border-radius: 4px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                cursor: pointer;
                margin-bottom: 12px;
            }

            .edit-button {
                padding: 4px 8px;
                border-radius: 4px;
                background-color: var(--info-color);
                color: white;
                border: none;
                cursor: pointer;
                margin-right: 4px;
            }

            select, input {
                width: 100%;
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color);
                background: var(--card-background-color);
                color: var(--primary-text-color);
                margin-bottom: 8px;
            }
            
            .filter-controls {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr auto;
                gap: 8px;
                width: 100%;
            }
            
            .section-subheader {
                font-size: 16px;
                font-weight: 500;
                margin-top: 16px;
                margin-bottom: 8px;
            }

            .parameter-filter-config {
                background: var(--secondary-background-color, rgba(0,0,0,0.05));
                padding: 16px;
                border-radius: 4px;
                margin-top: 8px;
                margin-bottom: 16px;
            }
            
            .parameter-filter-form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 8px;
            }
            
            .parameter-filter-form .input-container:last-of-type {
                grid-column: 1 / -1;
                display: flex;
                justify-content: flex-end;
            }
            
            .filter-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                margin: 4px 0;
                background: var(--card-background-color);
            }
            
            .active-filters {
                margin-top: 16px;
            }

            .condition-row, .action-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                margin: 8px 0;
                background: var(--card-background-color);
            }

            .condition-summary, .action-summary {
                flex-grow: 1;
                margin-right: 8px;
            }

            .conditions-list, .actions-list {
                margin-top: 12px;
            }

            .dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .dialog-container {
                background-color: var(--dialog-background-color);
                color: var(--dialog-text-color);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }

            .dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid var(--dialog-border-color);
            }

            .dialog-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }

            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--dialog-text-color);
                padding: 0;
                margin: 0;
                line-height: 1;
            }

            .dialog-content {
                padding: 16px;
                overflow-y: auto;
                flex: 1;
            }

            .dialog-buttons {
                display: flex;
                justify-content: flex-end;
                padding: 16px;
                border-top: 1px solid var(--dialog-border-color);
                gap: 8px;
            }

            .form-field {
                margin-bottom: 16px;
            }

            .form-field label {
                display: block;
                margin-bottom: 4px;
                font-weight: 500;
            }

            .form-field input[type="text"],
            .form-field select {
                width: 100%;
                padding: 8px;
                border: 1px solid var(--dialog-border-color);
                border-radius: 4px;
                background-color: var(--primary-background-color);
                color: var(--dialog-text-color);
            }

            .form-field input[type="color"] {
                width: 100%;
                height: 40px;
                border: 1px solid var(--dialog-border-color);
                border-radius: 4px;
                padding: 0;
                cursor: pointer;
            }

            .checkbox-field {
                display: flex;
                align-items: center;
            }
            
            .checkbox-field label {
                margin-right: 8px;
                margin-bottom: 0;
            }
            
            .helper-text {
                font-size: 12px;
                color: var(--secondary-color);
                margin-top: 4px;
            }
            
            .save-button,
            .cancel-button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-weight: 500;
            }
            
            .save-button {
                background-color: var(--button-primary-color);
                color: var(--button-primary-text-color);
            }
            
            .save-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .cancel-button {
                background-color: var(--button-secondary-color);
                color: var(--button-secondary-text-color);
            }
            
            .conditions-list,
            .actions-list {
                margin-top: 16px;
            }
            
            .condition-item,
            .action-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                margin-bottom: 8px;
                background-color: var(--secondary-background-color);
                border-radius: 4px;
            }
            
            .condition-details,
            .action-details {
                flex: 1;
            }
            
            .condition-actions,
            .action-actions {
                display: flex;
                gap: 8px;
            }
            
            .edit-button,
            .delete-button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .edit-button {
                color: var(--primary-color);
            }
            
            .delete-button {
                color: var(--error-color);
            }
            
            /* Fix for dropdown issues */
            ha-select::part(listbox) {
                z-index: 10000;
            }
            
            ha-select::part(combobox) {
                z-index: 10000;
            }
            
            ha-list-item {
                z-index: 10000;
            }

            .section {
                border: 1px solid var(--divider-color, #e0e0e0);
                border-radius: 8px;
                margin-bottom: 16px;
                overflow: hidden;
            }

            .section-header {
                background-color: var(--secondary-background-color, #f7f7f7);
                padding: 8px 16px;
                font-weight: 500;
                border-bottom: 1px solid var(--divider-color, #e0e0e0);
            }

            .subsection {
                border-top: 1px solid var(--divider-color, #e0e0e0);
                margin-top: 8px;
                padding-top: 8px;
            }

            .subsection-header {
                font-weight: 500;
                margin: 8px 16px;
            }

            .helper-text {
                font-size: 0.9em;
                margin: 4px 16px 8px;
                color: var(--secondary-text-color, #9e9e9e);
            }

            .grid-2 {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 8px;
                padding: 8px 16px;
            }

            label {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            /* Hierarchical debugging styles */
            .debug-category {
                margin-bottom: 8px;
                padding: 8px;
                border-radius: 4px;
                background-color: var(--secondary-background-color, #f7f7f7);
            }

            .main-category {
                font-weight: 500;
            }

            .subsystem-checkboxes {
                margin-left: 24px;
                margin-top: 4px;
                padding-top: 4px;
                padding-left: 8px;
                border-left: 1px dashed var(--divider-color, #e0e0e0);
            }

            .subsystem {
                font-size: 0.9em;
                margin-bottom: 4px;
            }

            /* Performance settings styles */
            .performance-group {
                padding: 0 16px 16px;
            }

            .performance-category {
                margin-bottom: 16px;
                padding: 8px;
                border-radius: 4px;
                background-color: var(--secondary-background-color, #f7f7f7);
            }

            .category-header {
                font-weight: 500;
                margin-bottom: 8px;
            }

            .slider-group {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .slider-group input[type="range"] {
                flex: 1;
            }

            .slider-group span:first-child {
                width: 150px;
            }

            .slider-group span:last-child {
                width: 60px;
                text-align: right;
            }
        `
    ];
    
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private _config?: InventreeCardConfig;
    
    // Add Logger instance
    private logger = Logger.getInstance();

    // Add state properties for the condition dialog
    @state() private _showConditionDialog = false;
    @state() private _editingConditionIndex: number | null = null;
    @state() private _conditionParameter = '';
    @state() private _conditionOperator: string = 'equals';
    @state() private _conditionValue = '';
    @state() private _conditionAction: string = 'highlight';
    @state() private _conditionActionValue = '';
    @state() private _conditionTargetPartIds: string = ''; // NEW state for target part IDs input

    // Add state properties for the action dialog
    @state() private _showActionDialog = false;
    @state() private _editingActionIndex: number | null = null;
    @state() private _actionLabel = '';
    @state() private _actionIcon = '';
    @state() private _actionParameter = '';
    @state() private _actionValue = '';
    @state() private _actionConfirmation = false;
    @state() private _actionConfirmationText = '';

    // Add new state properties for the parameter type
    @state() private _conditionParameterType: string = 'entity';
    @state() private _conditionPartId: string = '';
    @state() private _conditionParamName: string = '';

    constructor() {
        super();
        // First initialize critical services to prevent "undefined" errors
        this.logger = Logger.getInstance();
        this.logger.log('Editor', 'Editor constructor called');
    }

    // Ensure proper cleanup on disconnection
    disconnectedCallback() {
        super.disconnectedCallback();
    }

    setConfig(config: InventreeCardConfig): void {
        this._config = {
            ...config,
            view_type: config.view_type || 'detail'
        };
    }

    private _updateConfig(config: Partial<InventreeCardConfig>): void {
        // Create a deep copy of the current config
        const newConfig = JSON.parse(JSON.stringify(this._config || {}));
        
        // Merge the new config into the copy
        for (const [key, value] of Object.entries(config)) {
            // Special handling for arrays like filters
            if (Array.isArray(value)) {
                newConfig[key] = [...value];
            } else if (typeof value === 'object' && value !== null) {
                // For nested objects, merge them
                newConfig[key] = { ...(newConfig[key] || {}), ...value };
            } else {
                // For primitive values, just assign
                newConfig[key] = value;
            }
        }
        
        this.logger.log('Editor', 'Updated config', { category: 'editor' }, newConfig);
        
        // Fire the config-changed event with the new config
        fireEvent(this, 'config-changed', { config: newConfig });
    }

    render() {
        if (!this.hass || !this._config) return html``;

        const showVariantSettings = this._config.view_type === 'variants';

        return html`
            <div class="editor">
                <!-- Basic Settings -->
                <div class="section">
                    <div class="section-header">Basic Settings</div>
                    <div class="basic-settings">
                        <ha-entity-picker
                            .hass=${this.hass}
                            .value=${this._config.entity}
                            .label=${"Entity"}
                            .includeDomains=${["sensor"]}
                            @value-changed=${this._valueChanged('entity')}
                        ></ha-entity-picker>
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="show_header"
                                .checked=${this._config.display?.show_header ?? true}
                                @change=${this._valueChanged('display.show_header')}
                            />
                            <label for="show_header">Show Header</label>
                        </div>
                    </div>
                    <input
                        type="text"
                        label="Title"
                        .value=${this._config.name || ''}
                        @input=${this._valueChanged('name')}
                    />
                </div>

                <!-- Layout -->
                <div class="section">
                    <div class="section-header">Layout</div>
                    <div class="grid-2">
                        <div class="input-group">
                            <label for="view-type">View Type</label>
                            <select
                                id="view-type"
                                .value=${this._config.view_type || 'detail'}
                                @change=${this._valueChanged('view_type')}
                            >
                                <option value="detail" ?selected=${this._config?.view_type === 'detail'}>Detail</option>
                                <option value="grid" ?selected=${this._config?.view_type === 'grid'}>Grid</option>
                                <option value="list" ?selected=${this._config?.view_type === 'list'}>List</option>
                                <option value="parts" ?selected=${this._config?.view_type === 'parts'}>Parts</option>
                                <option value="variants" ?selected=${this._config?.view_type === 'variants'}>Variants</option>
                                <option value="base" ?selected=${this._config?.view_type === 'base'}>Base Layout</option>
                                <option value="debug" ?selected=${this._config?.view_type === 'debug'}>Debug View</option>
                                <option value="custom" ?selected=${this._config?.view_type === 'custom'}>Custom</option>
                            </select>
                        </div>

                        ${this._config?.view_type === 'grid' ? html`
                            <div class="grid-settings">
                            <ha-textfield
                                type="number"
                                label="Columns"
                                min="1"
                                max="6"
                                    .value=${this._config?.columns ?? 3}
                                    @change=${(ev: Event) => {
                                        this.logger.log('Editor', 'Columns changing', { category: 'editor' });
                                        this._valueChanged('columns')(ev);
                                    }}
                            ></ha-textfield>
                                
                                <ha-textfield
                                    type="number"
                                    label="Grid Spacing"
                                    min="0"
                                    max="24"
                                    .value=${this._config?.grid_spacing ?? 8}
                                    @change=${(ev: Event) => {
                                        this.logger.log('Editor', 'Grid spacing changing', { category: 'editor' });
                                        this._valueChanged('grid_spacing')(ev);
                                    }}
                                ></ha-textfield>
                                
                                <ha-textfield
                                    type="number"
                                    label="Item Height"
                                    min="40"
                                    max="500"
                                    .value=${this._config?.item_height ?? 170}
                                    @change=${(ev: Event) => {
                                        this.logger.log('Editor', 'Item height changing', { category: 'editor' });
                                        this._valueChanged('item_height')(ev);
                                    }}
                                ></ha-textfield>
                                
                                <ha-textfield
                                    type="number"
                                    label="Thumbnail Width"
                                    min="50"
                                    max="300"
                                    .value=${this._config?.style?.image_size ?? 50}
                                    @change=${(ev: Event) => {
                                        this.logger.log('Editor', 'Thumbnail width changing', { category: 'editor' });
                                        this._valueChanged('style.image_size')(ev);
                                    }}
                            ></ha-textfield>
                            </div>
                        ` : nothing}
                    </div>
                </div>

                <!-- Display Settings -->
                <div class="section">
                    <div class="section-header">Display</div>
                    <div class="grid-2">
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_image !== false}
                                @change=${this._valueChanged('display.show_image')}
                                />
                                Show Images
                            </label>
                        </div>
                        
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_name !== false}
                                @change=${this._valueChanged('display.show_name')}
                                />
                                Show Names
                            </label>
                        </div>
                        
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_stock !== false}
                                @change=${this._valueChanged('display.show_stock')}
                                />
                                Show Stock
                            </label>
                        </div>
                        
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_description === true}
                                @change=${this._valueChanged('display.show_description')}
                                />
                                Show Description
                            </label>
                    </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_category === true}
                                    @change=${this._valueChanged('display.show_category')}
                                />
                                Show Category
                            </label>
                </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_stock_status_border !== false}
                                    @change=${this._valueChanged('display.show_stock_status_border')}
                                />
                                Show Stock Status Border
                            </label>
                        </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_stock_status_colors !== false}
                                    @change=${this._valueChanged('display.show_stock_status_colors')}
                                />
                                Show Stock Status Colors
                            </label>
                        </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_buttons !== false}
                                    @change=${this._valueChanged('display.show_buttons')}
                                />
                                Show Buttons
                            </label>
                        </div>

                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    ?checked=${this._config.display?.show_parameters === true}
                                    @change=${this._valueChanged('display.show_parameters')}
                                />
                                Show Parameters
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Parameters Tab -->
                <div class="section">
                    <div class="section-header">Parameters</div>
                    
                    <div class="checkbox-container">
                        <input
                            type="checkbox"
                            id="enable_parameters"
                            .checked=${this._config.parameters?.enabled ?? false}
                            @change=${this._valueChanged('parameters.enabled')}
                        />
                        <label for="enable_parameters">Enable Parameter Features</label>
                    </div>
                    
                    ${this._config.parameters?.enabled ? html`
                        <div class="subsection">
                            <div class="subsection-header">Parameter Display</div>
                            <div class="grid-2">
                                <div>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            ?checked=${this._config.parameters?.show_section !== false}
                                            @change=${this._valueChanged('parameters.show_section')}
                                        />
                                        Show Parameters Section
                                    </label>
                                </div>
                                
                                <div>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            ?checked=${this._config.parameters?.collapsed_by_default === true}
                                            @change=${this._valueChanged('parameters.collapsed_by_default')}
                                        />
                                        Collapsed by Default
                                    </label>
                                </div>
                                
                                <div>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            ?checked=${this._config.parameters?.group_parameters === true}
                                            @change=${this._valueChanged('parameters.group_parameters')}
                                        />
                                        Group Parameters
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="subsection">
                            <div class="subsection-header">Parameter Conditions</div>
                            <p>Create rules that change how parts are displayed based on parameter values.</p>
                            
                            <button @click=${this._addCondition} class="add-button">
                                + Add Condition
                            </button>
                            
                            <div class="conditions-list">
                                ${this._config.parameters?.conditions?.map((condition, index) => html`
                                    <div class="condition-row">
                                        <div class="condition-summary">
                                            If <strong>${condition.parameter}</strong> 
                                            ${this._getOperatorLabel(condition.operator)} 
                                            <strong>${condition.value}</strong> then
                                            ${this._getActionLabel(condition.action, condition.action_value)}
                                        </div>
                                        <div class="condition-actions">
                                            <button @click=${() => this._editCondition(index)} class="edit-button">Edit</button>
                                            <button @click=${() => this._removeCondition(index)} class="delete-button">Delete</button>
                                        </div>
                                    </div>
                                `) || ''}
                            </div>
                        </div>
                        
                        <div class="subsection">
                            <div class="subsection-header">Parameter Actions</div>
                            <p>Create custom buttons that update parameter values.</p>
                            
                            <button @click=${this._addAction} class="add-button">
                                + Add Action Button
                            </button>
                            
                            <div class="actions-list">
                                ${this._config.parameters?.actions?.map((action, index) => html`
                                    <div class="action-row">
                                        <div class="action-summary">
                                            <strong>${action.label}</strong>: Set <strong>${action.parameter}</strong> to <strong>${action.value}</strong>
                                        </div>
                                        <div class="action-buttons">
                                            <button @click=${() => this._editAction(index)} class="edit-button">Edit</button>
                                            <button @click=${() => this._removeAction(index)} class="delete-button">Delete</button>
                                        </div>
                                    </div>
                                `) || ''}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Buttons Configuration -->
                <div class="section">
                    <div class="section-header">Buttons</div>
                    <div class="grid-2">
                        <div class="select-container">
                            <label>Button Preset</label>
                            <select
                                .value=${this._config.buttons?.preset ?? 'default'}
                                @change=${this._valueChanged('buttons.preset')}
                            >
                                <option value="default">Default (+1/-1)</option>
                                <option value="precise">Precise (+0.1/-0.1)</option>
                                <option value="bulk">Bulk (+10/-10)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Services -->
                <div class="section">
                    <div class="section-header">Services</div>
                    <div class="services-settings">
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_wled"
                                .checked=${this._config.services?.wled?.enabled ?? false}
                                @change=${this._valueChanged('services.wled.enabled')}
                            />
                            <label for="enable_wled">Enable WLED Location</label>
                        </div>
                        
                        ${this._config.services?.wled?.enabled ? html`
                            <div class="grid-2">
                                <div class="input-container">
                                    <label>WLED Entity</label>
                                    <input
                                        type="text"
                                        .value=${this._config.services?.wled?.entity_id || ''}
                                        @input=${this._valueChanged('services.wled.entity_id')}
                                    />
                                </div>
                                
                                <div class="input-container">
                                    <label>Parameter Name</label>
                                    <input
                                        type="text"
                                        .value=${this._config.services?.wled?.parameter_name || 'led_xaxis'}
                                        @input=${this._valueChanged('services.wled.parameter_name')}
                                    />
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="enable_print"
                                .checked=${this._config.services?.print?.enabled ?? false}
                                @change=${this._valueChanged('services.print.enabled')}
                            />
                            <label for="enable_print">Enable Print Labels</label>
                        </div>
                        
                        ${this._config.services?.print?.enabled ? html`
                            <div class="grid-2">
                                <div class="input-container">
                                    <label>Template ID</label>
                                    <input
                                        type="number"
                                        .value=${this._config.services?.print?.template_id || 2}
                                        @input=${this._valueChanged('services.print.template_id')}
                                    />
                                </div>
                                
                                <div class="input-container">
                                    <label>Print Plugin</label>
                                    <input
                                        type="text"
                                        .value=${this._config.services?.print?.plugin || 'zebra'}
                                        @input=${this._valueChanged('services.print.plugin')}
                                    />
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Direct API Configuration -->
                ${this._renderDirectApiConfig()}

                <!-- Debugging Section -->
                ${this._renderDebuggingSection()}

                <!-- Variant Settings - ONLY SHOW ONCE when view_type is variants -->
                ${showVariantSettings ? html`
                    <div class="section">
                        <div class="section-header">Variant Settings</div>
                        <div class="input-group">
                            <label for="variant-view-type">Variant View Type</label>
                            <select
                                id="variant-view-type"
                                .value=${this._config.variant_view_type || 'grid'}
                                @change=${this._valueChanged('variant_view_type')}
                            >
                                <option value="grid">Grid</option>
                                <option value="list">List</option>
                                <option value="tree">Tree</option>
                            </select>
                        </div>
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="auto-detect-variants"
                                .checked=${this._config.auto_detect_variants !== false}
                                @change=${this._valueChanged('auto_detect_variants')}
                            />
                            <label for="auto-detect-variants">Auto-detect Variants</label>
                        </div>
                    </div>
                ` : ''}

                ${this._renderPartsConfig()}

                <!-- Condition Dialog -->
                ${this._renderConditionDialog()}
                
                <!-- Action Dialog -->
                ${this._renderActionDialog()}

                <!-- Performance Settings Section -->
                ${this._renderPerformanceSettings()}

                ${this._config?.view_type === 'custom' ? html`
                    <div class="subsection">
                        <div class="grid-2">
                            <ha-textfield
                                label="Custom Tag"
                                .value=${this._config?.custom_view?.tag || ''}
                                @change=${this._valueChanged('custom_view.tag')}
                            ></ha-textfield>
                        </div>
                        <div class="note">
                            Enter a custom HTML tag name for your view component
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderPartsConfig() {
        if (!this._config?.view_type) return html``;
        if (this._config.view_type !== 'parts') return html``;
    
        // Filter entities manually with proper null checks
        const inventreeEntities = this.hass ? 
            Object.keys(this.hass.states).filter(entityId => 
                entityId.startsWith('sensor.') && 
                this.hass?.states[entityId]?.attributes?.items !== undefined &&
                (!this._config?.selected_entities?.includes(entityId))
            ) : [];
    
        return html`
            <div class="section">
                <div class="section-header">Parts Configuration</div>
                
                <div class="values">
                    <div class="row">
                        <div class="input-container">
                            <label for="entity-select">Add InvenTree Entity:</label>
                            <select 
                                id="entity-select"
                                @change=${this._entitySelected}
                                .value=${''}
                            >
                                <option value="" disabled selected>Select an entity</option>
                                ${inventreeEntities.map(entityId => html`
                                    <option value=${entityId}>
                                        ${this.hass?.states[entityId]?.attributes?.friendly_name || entityId}
                                    </option>
                                `)}
                            </select>
                        </div>
                    </div>
    
                    <div class="selected-entities">
                        ${this._config.selected_entities?.map((entity, index) => html`
                            <div class="entity-row">
                                <span class="entity-name">
                                    ${this.hass?.states[entity]?.attributes?.friendly_name ?? entity}
                                </span>
                                <button
                                    @click=${() => this._removeEntity(index)}
                                    class="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        `)}
                    </div>
                    
                    <div class="section-subheader">Filters</div>
                    <div class="row">
                        <div class="filter-controls">
                            <select id="filter-attribute" .value=${this._filterAttribute || ''} @change=${(e: Event) => this._filterAttribute = (e.target as HTMLSelectElement).value}>
                                <option value="" disabled selected>Select attribute</option>
                                <option value="pk">Part ID (pk)</option>
                                <option value="name">Name</option>
                                <option value="in_stock">In Stock</option>
                                <option value="category_name">Category</option>
                                <option value="parameter">Parameter</option>
                            </select>
                            
                            ${this._filterAttribute !== 'parameter' ? html`
                                <select id="filter-operator" .value=${this._filterOperator || 'eq'} @change=${(e: Event) => this._filterOperator = (e.target as HTMLSelectElement).value}>
                                    <option value="eq">Equals</option>
                                    <option value="contains">Contains</option>
                                    <option value="gt">Greater than</option>
                                    <option value="lt">Less than</option>
                                </select>
                                
                                <input 
                                    type="text" 
                                    id="filter-value" 
                                    placeholder="Filter value"
                                    .value=${this._filterValue || ''}
                                    @input=${(e: Event) => this._filterValue = (e.target as HTMLInputElement).value}
                                >
                                
                                <button @click=${this._addFilter} class="add-button">Add Filter</button>
                            ` : html`
                                <button @click=${this._showParameterFilterDialog} class="add-button">Configure Parameter Filter</button>
                            `}
                        </div>
                    </div>
                    
                    ${this._filterAttribute === 'parameter' ? html`
                        <div class="subsection parameter-filter-config">
                            <div class="subsection-header">Parameter Filter</div>
                            <div class="parameter-filter-form">
                                <div class="input-container">
                                    <label for="parameter-name">Parameter Name:</label>
                                    <input 
                                        type="text" 
                                        id="parameter-name" 
                                        placeholder="e.g. color, size, material"
                                        .value=${this._parameterName || ''}
                                        @input=${(e: Event) => this._parameterName = (e.target as HTMLInputElement).value}
                                    >
                                </div>
                                
                                <div class="input-container">
                                    <label for="parameter-value">Parameter Value:</label>
                                    <input 
                                        type="text" 
                                        id="parameter-value" 
                                        placeholder="e.g. red, large, cotton"
                                        .value=${this._parameterValue || ''}
                                        @input=${(e: Event) => this._parameterValue = (e.target as HTMLInputElement).value}
                                    >
                                </div>
                                
                                <div class="input-container">
                                    <label for="parameter-operator">Operator:</label>
                                    <select 
                                        id="parameter-operator" 
                                        .value=${this._filterOperator || 'eq'} 
                                        @change=${(e: Event) => this._filterOperator = (e.target as HTMLSelectElement).value}
                                    >
                                        <option value="eq">Equals</option>
                                        <option value="contains">Contains</option>
                                    </select>
                                </div>
                                
                                <button @click=${this._addParameterFilter} class="add-button">Add Parameter Filter</button>
                            </div>
                        </div>
                ` : ''}
                    
                    <div class="active-filters">
                        ${this._config.filters?.map((filter, index) => html`
                            <div class="filter-row">
                                <span>
                                    ${filter.attribute === 'parameter' 
                                        ? `Parameter: ${filter.parameter_id || 'any'} ${this._getOperatorLabel(filter.operator)} ${filter.value}` 
                                        : `${filter.attribute} ${this._getOperatorLabel(filter.operator)} ${filter.value}`}
                                </span>
                                <button @click=${() => this._removeFilter(index)} class="delete-button">Delete</button>
                            </div>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }

    private _entitySelected(ev: Event) {
        const select = ev.target as HTMLSelectElement;
        const entityId = select.value;
        
        if (!this._config || !entityId) return;
        
        const entities = this._config.selected_entities || [];
        if (!entities.includes(entityId)) {
            this._updateConfig({
                selected_entities: [...entities, entityId]
            });
        }
        
        // Reset the dropdown to the default value
        select.value = '';
    }

    private _removeEntity(index: number) {
        if (!this._config || !this._config.selected_entities) return;
        
        const entities = [...this._config.selected_entities];
        entities.splice(index, 1);
        
        this._updateConfig({
            selected_entities: entities
        });
    }

    private _valueChanged(field: string) {
        return (ev: Event): void => {
            if (!this._config) return;

            // Handle both CustomEvent and regular Event
            const target = ev.target as HTMLInputElement | HTMLSelectElement;
            let value: any;
            
            if ('detail' in ev && (ev as CustomEvent).detail?.value !== undefined) {
                // It's a CustomEvent with detail.value
                value = (ev as CustomEvent).detail.value;
            } else if (target) {
                // It's a regular input event
                if (target.type === 'checkbox') {
                    value = (target as HTMLInputElement).checked;
            } else {
                value = target.value;
            }
            } else {
                return; // Can't determine the value
            }
            
            // Create a deep copy of the config to avoid modifying read-only properties
            const newConfig = JSON.parse(JSON.stringify(this._config));
            
            // Special handling for WLED service
            if (field === 'services.wled.enabled') {
                // If we're enabling/disabling WLED, also update the legacy wled property
                if (value === true) {
                    // Ensure services.wled exists
                    if (!newConfig.services) newConfig.services = {};
                    if (!newConfig.services.wled) {
                        // Copy from legacy wled if it exists
                        if (newConfig.wled) {
                            newConfig.services.wled = { ...newConfig.wled, enabled: true };
            } else {
                            newConfig.services.wled = { 
                                enabled: true,
                                entity_id: 'light.wled_inventory',
                                parameter_name: 'led_xaxis'
                            };
                        }
                    } else {
                        newConfig.services.wled.enabled = true;
                    }
                    
                    // Also update legacy property for backward compatibility
                    newConfig.wled = { ...newConfig.services.wled };
                } else {
                    // Just disable it
                    if (!newConfig.services) newConfig.services = {};
                    if (!newConfig.services.wled) newConfig.services.wled = {};
                    newConfig.services.wled.enabled = false;
                    
                    // Also update legacy property
                    if (newConfig.wled) newConfig.wled.enabled = false;
                }
            } else if (field.startsWith('services.wled.')) {
                // For other WLED properties, update both new and legacy
                const propName = field.split('.')[2];
                
                // Ensure services.wled exists
                if (!newConfig.services) newConfig.services = {};
                if (!newConfig.services.wled) newConfig.services.wled = { enabled: true };
                
                // Set the property
                newConfig.services.wled[propName] = value;
                
                // Also update legacy property
                if (!newConfig.wled) newConfig.wled = {};
                newConfig.wled[propName] = value;
            } else if (field.includes('.')) {
                // Normal nested property handling
                const fields = field.split('.');
                let current = newConfig;
                
                // Navigate to the nested property, creating objects as needed
                for (let i = 0; i < fields.length - 1; i++) {
                    if (!current[fields[i]] || typeof current[fields[i]] !== 'object') {
                        // If the property doesn't exist or is not an object, create a new object
                        current[fields[i]] = {};
                    }
                    current = current[fields[i]];
                }
                
                // Set the value
                current[fields[fields.length - 1]] = value;
            } else {
                // Normal property handling
                newConfig[field] = value;
            }
            
            this.logger.log('Editor', 'Updated config', { category: 'editor' }, newConfig);
            
            // Fire the config-changed event with the new config
            fireEvent(this, 'config-changed', { config: newConfig });
        };
    }

    public static async getConfigForm(): Promise<any> {
        return {
            schema: [
                {
                    name: "entities",
                    selector: {
                        entity: {
                            domain: ["sensor"],
                            multiple: true,
                            filter: {
                                attributes: {
                                    items: {}
                                }
                            }
                        }
                    }
                }
            ]
        };
    }

    static getStubConfig(hass: HomeAssistant): InventreeCardConfig {
        // Find the first available InvenTree sensor
        const entity = Object.keys(hass.states).find(eid => 
            eid.startsWith('sensor.') && 
            hass.states[eid].attributes?.items !== undefined
        );

        return {
            type: "custom:inventree-card",
            entity: entity || '',
            view_type: 'detail',
            selected_entities: [],  // Start with empty array for parts view
            display: {
                show_header: true,
                show_image: true,
                show_name: true,
                show_stock: true,
                show_description: false,
                show_category: false,
                show_stock_status_border: true,
                show_stock_status_colors: true,
                show_buttons: true,
                show_parameters: true
            }
        };
    }

    // Add these properties to the class
    private _filterAttribute: string | null = null;
    private _filterOperator: string = 'eq';
    private _filterValue: string = '';
    private _parameterName: string = '';
    private _parameterValue: string = '';

    // Add these methods to the class
    private _getOperatorLabel(operator: string): string {
        switch (operator) {
            case 'eq': 
            case 'equals': 
                return 'equals';
            case 'not_equals': 
                return 'does not equal';
            case 'contains': 
                return 'contains';
            case 'gt':
            case 'greater_than': 
                return 'is greater than';
            case 'lt':
            case 'less_than': 
                return 'is less than';
            case 'exists': 
                return 'exists';
            case 'is_empty': 
                return 'is empty';
            default: 
                return operator;
        }
    }

    private _addFilter(): void {
        if (!this._config || !this._filterAttribute || !this._filterValue) return;
        
        // Get existing filters or create an empty array
        const existingFilters = this._config.filters || [];
        
        // Create the new filter
        const newFilter = {
            attribute: this._filterAttribute,
            operator: this._filterOperator as 'eq' | 'contains' | 'gt' | 'lt',
            value: this._filterValue
        };
        
        this.logger.log('Editor', 'Adding regular filter:', { category: 'editor' }, newFilter);
        
        // Create a new array with all existing filters plus the new one
        const updatedFilters = [...existingFilters, newFilter];
        
        // Update the config with the new filters array
        this._updateConfig({
            filters: updatedFilters
        });
        
        // Reset the filter inputs
        this._filterAttribute = null;
        this._filterValue = '';
    }

    private _removeFilter(index: number): void {
        if (!this._config || !this._config.filters) return;
        
        const filters = [...this._config.filters];
        filters.splice(index, 1);
        
        this._updateConfig({
            filters: filters
        });
    }

    private _showParameterFilterDialog(): void {
        // This method is just a placeholder - the parameter filter form is already shown
        // when parameter is selected in the dropdown
    }

    private _addParameterFilter(): void {
        if (!this._config || !this._parameterName || !this._parameterValue) {
            this.logger.log('Editor', 'Cannot add parameter filter: missing config, name, or value', { category: 'editor' });
            return;
        }
        
        // Get existing filters or create an empty array
        const existingFilters = this._config.filters || [];
        
        // Create the new filter
        const newFilter: FilterConfig = {
            attribute: 'parameter',
            operator: this._filterOperator as 'eq' | 'contains',
            value: this._parameterValue,
            parameter_id: this._parameterName
        };
        
        this.logger.log('Editor', 'Adding parameter filter:', { category: 'editor' }, newFilter);
        this.logger.log('Editor', 'Existing filters:', { category: 'editor' }, existingFilters);
        
        // Create a new array with all existing filters plus the new one
        const updatedFilters = [...existingFilters, newFilter];
        
        this.logger.log('Editor', 'Updated filters array:', { category: 'editor' }, updatedFilters);
        
        // Update the config with the new filters array
        this._updateConfig({
            filters: updatedFilters
        });
        
        // Reset the parameter filter inputs
        this._parameterName = '';
        this._parameterValue = '';
    }

    // Add these methods for parameter conditions and actions
    private _getActionLabel(action: string, value: string): string {
        switch (action) {
            case 'highlight': return `highlight with color ${value}`;
            case 'text_color': return `change text color to ${value}`;
            case 'border': return `add ${value} border`;
            case 'icon': return `show ${value} icon`;
            case 'badge': return `add "${value}" badge`;
            case 'sort': return `sort to ${value}`;
            case 'filter': return value === 'show' ? 'show item' : 'hide item';
            case 'show_section': return `${value === 'show' ? 'show' : 'hide'} section`;
            case 'priority': return `set priority to ${value}`;
            default: return `${action}: ${value}`;
        }
    }

    private _addCondition(): void {
        // Reset form and show dialog
        this._conditionParameter = '';
        this._conditionOperator = 'equals';
        this._conditionValue = '';
        this._conditionAction = 'highlight';
        this._conditionActionValue = '#ff0000';
        this._editingConditionIndex = null;
        this._showConditionDialog = true;
    }

    private _editCondition(index: number): void {
        if (!this._config || !this._config.parameters?.conditions) return;
        
        const condition = this._config.parameters.conditions[index];
        
        this._editingConditionIndex = index;
        this._conditionParameter = condition.parameter;
        this._conditionOperator = condition.operator;
        this._conditionValue = condition.value || '';
        this._conditionAction = condition.action;
        this._conditionActionValue = condition.action_value;
        // Populate _conditionTargetPartIds when editing
        if (typeof condition.targetPartIds === 'string') {
            this._conditionTargetPartIds = condition.targetPartIds; // e.g., "*"
        } else if (Array.isArray(condition.targetPartIds)) {
            this._conditionTargetPartIds = condition.targetPartIds.join(', ');
        } else {
            this._conditionTargetPartIds = '';
        }
        
        this._showConditionDialog = true;
        
        // Force a re-render to ensure the dialog is properly displayed
        this.requestUpdate();
    }

    private _closeConditionDialog(): void {
        // Reset all form fields
        this._showConditionDialog = false;
        this._editingConditionIndex = null;
        this._conditionParameter = '';
        this._conditionOperator = 'equals';
        this._conditionValue = '';
        this._conditionAction = 'highlight';
        this._conditionActionValue = '';
        this._conditionTargetPartIds = ''; // Reset new state
        
        // Request UI update
        this.requestUpdate();
    }

    private _saveCondition() {
        // Validate inputs
        if (!this._conditionParameter) {
            // Show an error
            alert('Parameter is required');
            return;
        }
        
        if (this._conditionOperator !== 'exists' && 
            this._conditionOperator !== 'is_empty' && 
            !this._conditionValue) {
            // Show an error for operators that require a value
            alert('Value is required for this operator');
            return;
        }
        
        // Create the condition object
        const condition: any = {
            parameter: this._conditionParameter,
            operator: this._conditionOperator,
            action: this._conditionAction,
            action_value: this._conditionActionValue
        };
        
        // Only add value if it's required for the operator
        if (this._conditionOperator !== 'exists' && this._conditionOperator !== 'is_empty') {
            condition.value = this._conditionValue;
        }
        
        // Handle targetPartIds
        const rawTargetIds = this._conditionTargetPartIds.trim();
        if (rawTargetIds === '*') {
            condition.targetPartIds = '*';
        } else if (rawTargetIds) {
            condition.targetPartIds = rawTargetIds
                .split(',')
                .map(id => parseInt(id.trim(), 10))
                .filter(id => !isNaN(id));
            if (condition.targetPartIds.length === 0) {
                delete condition.targetPartIds; // Remove if parsing resulted in empty array (e.g. only whitespace or invalid entries)
            }
        } else {
            delete condition.targetPartIds; // Remove if input was empty
        }

        if (!this._config) return;
        
        // Create a copy of the config
        const newConfig = JSON.parse(JSON.stringify(this._config));
        
        // Make sure parameters section exists
        if (!newConfig.parameters) {
            newConfig.parameters = {
                enabled: true,
                conditions: [],
                actions: []
            };
        }
        
        // Make sure conditions array exists
        if (!newConfig.parameters.conditions) {
            newConfig.parameters.conditions = [];
        }
        
        // Update or add the condition
        if (this._editingConditionIndex !== null) {
            // Update existing condition
            newConfig.parameters.conditions[this._editingConditionIndex] = condition;
        } else {
            // Add new condition
            newConfig.parameters.conditions.push(condition);
        }
        
        // Update the config
        this._updateConfig(newConfig);
        
        // Close the dialog
        this._closeConditionDialog();
    }

    private _removeCondition(index: number): void {
        if (!this._config || !this._config.parameters?.conditions) return;
        
        const conditions = [...this._config.parameters.conditions];
        conditions.splice(index, 1);
        
        // Make sure parameters object exists
        const parameters = this._config.parameters || {};
        
        this._updateConfig({
            parameters: {
                ...parameters,
                conditions
            }
        });
    }

    private _addAction(): void {
        // Reset form and show dialog
        this._actionLabel = '';
        this._actionIcon = '';
        this._actionParameter = '';
        this._actionValue = '';
        this._actionConfirmation = false;
        this._actionConfirmationText = '';
        this._editingActionIndex = null;
        this._showActionDialog = true;
    }

    private _editAction(index: number): void {
        if (!this._config || !this._config.parameters?.actions) return;
        
        const action = this._config.parameters.actions[index];
        
        this._editingActionIndex = index;
        this._actionLabel = action.label;
        this._actionIcon = action.icon || '';
        this._actionParameter = action.parameter;
        this._actionValue = action.value;
        this._actionConfirmation = action.confirmation || false;
        this._actionConfirmationText = action.confirmation_text || '';
        
        this._showActionDialog = true;
        
        // Force a re-render to ensure the dialog is properly displayed
        this.requestUpdate();
    }

    private _closeActionDialog(): void {
        this._showActionDialog = false;
        this._editingActionIndex = null;
        this.requestUpdate();
    }

    private _saveAction(): void {
        if (!this._config) return;

        const actions = [...(this._config.parameters?.actions || [])];

        if (this._editingActionIndex !== null) {
            actions[this._editingActionIndex] = {
                label: this._actionLabel,
                icon: this._actionIcon,
                parameter: this._actionParameter,
                value: this._actionValue,
                confirmation: this._actionConfirmation,
                confirmation_text: this._actionConfirmationText
            };
        } else {
            actions.push({
                label: this._actionLabel,
                icon: this._actionIcon,
                parameter: this._actionParameter,
                value: this._actionValue,
                confirmation: this._actionConfirmation,
                confirmation_text: this._actionConfirmationText
            });
        }

        // Initialize parameters object if it doesn't exist
        if (!this._config.parameters) {
            this._config.parameters = {
                enabled: true,
                actions: []
            };
        }

        // Update the actions
        this._updateConfig({
            parameters: {
                ...this._config.parameters,
                actions
            }
        });

        this._closeActionDialog();
    }

    private _removeAction(index: number): void {
        if (!this._config || !this._config.parameters?.actions) return;
        
        const actions = [...this._config.parameters.actions];
        actions.splice(index, 1);
        
        // Make sure parameters object exists
        const parameters = this._config.parameters || {};
        
        this._updateConfig({
            parameters: {
                ...parameters,
                actions
            }
        });
    }

    private _renderConditionDialog() {
        if (!this._showConditionDialog) {
            return html``;
        }
        
        return html`
            <div class="dialog-overlay">
                <div class="dialog">
                    <div class="dialog-header">
                        <h3>${this._editingConditionIndex !== null ? 'Edit Condition' : 'Add Condition'}</h3>
                        <button class="close-button" @click=${this._closeConditionDialog}>×</button>
                    </div>
                    <div class="dialog-content">
                        <div class="input-group">
                            <label for="condition-parameter">Parameter</label>
                            <input
                                type="text"
                                id="condition-parameter"
                                .value=${this._conditionParameter}
                                @input=${(e: any) => this._conditionParameter = e.target.value}
                                placeholder="e.g. order_status or part:145:microwavables"
                            />
                            <div class="helper-text">
                                Enter parameter name or direct reference (part:id:parameter)
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="condition-operator">Operator</label>
                            <select
                                id="condition-operator"
                                .value=${this._conditionOperator}
                                @change=${(e: any) => this._conditionOperator = e.target.value}
                            >
                                <option value="equals">Equals</option>
                                <option value="not_equals">Not Equals</option>
                                <option value="contains">Contains</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                                <option value="exists">Exists</option>
                                <option value="is_empty">Is Empty</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <label for="condition-value">Value</label>
                            <input
                                type="text"
                                id="condition-value"
                                .value=${this._conditionValue}
                                @input=${(e: any) => this._conditionValue = e.target.value}
                                placeholder="e.g. True, 42, red"
                                ?disabled=${this._conditionOperator === 'exists' || this._conditionOperator === 'is_empty'}
                            />
                        </div>
                        
                        <div class="input-group">
                            <label for="condition-action">Action</label>
                            <select
                                id="condition-action"
                                .value=${this._conditionAction}
                                @change=${(e: any) => this._conditionAction = e.target.value}
                            >
                                <option value="highlight">Highlight</option>
                                <option value="text_color">Text Color</option>
                                <option value="border">Border</option>
                                <option value="icon">Icon</option>
                                <option value="badge">Badge</option>
                                <option value="sort">Sort</option>
                                <option value="filter">Filter</option>
                                <option value="show_section">Show/Hide Section</option>
                                <option value="priority">Set Priority</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            ${this._renderActionValueInput()}
                        </div>
                        <div class="input-group">
                            <label for="condition-target-part-ids">Target Part IDs (optional)</label>
                            <input
                                type="text"
                                id="condition-target-part-ids"
                                .value=${this._conditionTargetPartIds}
                                @input=${(e: any) => this._conditionTargetPartIds = e.target.value}
                                placeholder="e.g., 101, 102, 103 or * for all"
                            />
                            <div class="helper-text">
                                Comma-separated part IDs this action applies to, or '*' for all loaded parts.
                            </div>
                        </div>
                    </div>
                    <div class="dialog-actions">
                        <button @click=${this._closeConditionDialog}>Cancel</button>
                        <button @click=${this._saveCondition} class="primary">Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderActionValueInput() {
        // Set default value based on action type if none exists
        if (!this._conditionActionValue) {
            if (['highlight', 'text_color'].includes(this._conditionAction)) { // Removed 'border'
                this._conditionActionValue = '#ff0000';
            } else if (this._conditionAction === 'border') { // Added specific default for border
                this._conditionActionValue = '2px solid #ff0000';
            } else if (this._conditionAction === 'sort') {
                this._conditionActionValue = 'top';
            } else if (this._conditionAction === 'filter') {
                this._conditionActionValue = 'show';
            } else if (this._conditionAction === 'show_section') {
                this._conditionActionValue = 'show';
            } else if (this._conditionAction === 'priority') {
                this._conditionActionValue = 'medium';
            }
        }
        
        // Render different input based on action type
        switch (this._conditionAction) {
            case 'highlight':
            case 'text_color':
                return html`
                    <label for="action-value">Color</label>
                    <input
                        type="color"
                        id="action-value"
                        .value=${this._conditionActionValue || '#ff0000'}
                        @input=${(e: any) => this._conditionActionValue = e.target.value}
                    />
                `;
            case 'border': // Separated border case
                return html`
                    <label for="action-value">Border CSS</label>
                    <input
                        type="text"
                        id="action-value"
                        .value=${this._conditionActionValue || '2px solid #ff0000'}
                        @input=${(e: any) => this._conditionActionValue = e.target.value}
                        placeholder="e.g., 2px dashed blue"
                    />
                    <div class="helper-text">Enter a full CSS border string (e.g., "1px solid red").</div>
                `;
            case 'sort':
                return html`
                    <label for="action-value">Sort Position</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue || 'top'}
                        @change=${(e: any) => this._conditionActionValue = e.target.value}
                    >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                    </select>
                `;
                
            case 'filter':
                return html`
                    <label for="action-value">Filter Action</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue || 'show'}
                        @change=${(e: any) => this._conditionActionValue = e.target.value}
                    >
                        <option value="show">Show Item</option>
                        <option value="hide">Hide Item</option>
                    </select>
                `;
                
            case 'show_section':
                return html`
                    <label for="action-value">Section Visibility</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue || 'show'}
                        @change=${(e: any) => this._conditionActionValue = e.target.value}
                    >
                        <option value="show">Show Section</option>
                        <option value="hide">Hide Section</option>
                    </select>
                `;
                
            case 'priority':
                return html`
                    <label for="action-value">Priority Level</label>
                    <select
                        id="action-value"
                        .value=${this._conditionActionValue || 'medium'}
                        @change=${(e: any) => this._conditionActionValue = e.target.value}
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                `;
                
            default:
                return html`
                    <label for="action-value">Value</label>
                    <input
                        type="text"
                        id="action-value"
                        .value=${this._conditionActionValue || ''}
                        @input=${(e: any) => this._conditionActionValue = e.target.value}
                        placeholder="Enter action value"
                    />
                `;
        }
    }

    private _renderActionDialog() {
        if (!this._showActionDialog) return html``;
        
        // Create a separate overlay to prevent event bubbling
        return html`
            <div class="dialog-overlay" @click=${(e: Event) => e.stopPropagation()}>
                <div class="dialog-container">
                    <div class="dialog-header">
                        <h2>${this._editingActionIndex !== null ? "Edit Action" : "Add Action"}</h2>
                        <button class="close-button" @click=${this._closeActionDialog}>×</button>
                    </div>
                    
                    <div class="dialog-content">
                        <div class="form-field">
                            <label for="action-label">Label</label>
                            <input 
                                type="text" 
                                id="action-label" 
                                .value=${this._actionLabel}
                                @input=${(e: Event) => this._actionLabel = (e.target as HTMLInputElement).value}
                                placeholder="e.g. Turn On, Set Color"
                            />
                        </div>
                        
                        <div class="form-field">
                            <label for="action-icon">Icon (optional)</label>
                            <input 
                                type="text" 
                                id="action-icon" 
                                .value=${this._actionIcon}
                                @input=${(e: Event) => this._actionIcon = (e.target as HTMLInputElement).value}
                                placeholder="e.g. mdi:power, mdi:lightbulb"
                            />
                            <div class="helper-text">MDI icon name, e.g. 'mdi:check'</div>
                        </div>
                        
                        <div class="form-field">
                            <label for="action-parameter">Parameter</label>
                            <input 
                                type="text" 
                                id="action-parameter" 
                                .value=${this._actionParameter}
                                @input=${(e: Event) => this._actionParameter = (e.target as HTMLInputElement).value}
                                placeholder="e.g. color or sensor.inventree_microwaves_stock:mw_power_state"
                            />
                            <div class="helper-text">Parameter name or cross-entity reference (entity_id:parameter_name)</div>
                        </div>
                        
                        <div class="form-field">
                            <label for="action-value">Value</label>
                            <input 
                                type="text" 
                                id="action-value" 
                                .value=${this._actionValue}
                                @input=${(e: Event) => this._actionValue = (e.target as HTMLInputElement).value}
                                placeholder="e.g. True, 42, red"
                            />
                        </div>
                        
                        <div class="form-field checkbox-field">
                            <label for="action-confirmation">Require confirmation</label>
                            <input 
                                type="checkbox" 
                                id="action-confirmation" 
                                .checked=${this._actionConfirmation}
                                @change=${(e: Event) => {
                                    this._actionConfirmation = (e.target as HTMLInputElement).checked;
                                    this.requestUpdate();
                                }}
                            />
                        </div>
                        
                        ${this._actionConfirmation ? html`
                            <div class="form-field">
                                <label for="action-confirmation-text">Confirmation Text</label>
                                <input 
                                    type="text" 
                                    id="action-confirmation-text" 
                                    .value=${this._actionConfirmationText}
                                    @input=${(e: Event) => this._actionConfirmationText = (e.target as HTMLInputElement).value}
                                    placeholder="e.g. Are you sure you want to turn on the microwave?"
                                />
                                <div class="helper-text">Text to show in confirmation dialog</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="dialog-buttons">
                        <button 
                            class="cancel-button" 
                            @click=${this._closeActionDialog}
                        >
                            Cancel
                        </button>
                        <button 
                            class="save-button" 
                            @click=${this._saveAction}
                            .disabled=${!this._actionLabel || !this._actionParameter || !this._actionValue}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderDirectApiConfig() {
        if (!this._config) return html``;
        
        return html`
            <div class="section">
                <div class="section-header">InvenTree API Settings</div>
                
                <div class="checkbox-container">
                    <input
                        type="checkbox"
                        id="enable_direct_api"
                        .checked=${this._config.direct_api?.enabled || false}
                        @change=${this._valueChanged('direct_api.enabled')}
                    />
                    <label for="enable_direct_api">Enable Direct API</label>
                </div>
                
                ${this._config.direct_api?.enabled ? html`
                    <div class="input-group">
                        <label for="api-url">InvenTree API URL</label>
                        <input
                            type="text"
                            id="api-url"
                            .value=${this._config.direct_api?.url || ''}
                            @input=${this._valueChanged('direct_api.url')}
                            placeholder="http://your-inventree-server.com"
                        />
                    </div>
                    
                    <div class="input-group">
                        <label for="api-key">API Key</label>
                        <input
                            type="text"
                            id="api-key"
                            .value=${this._config.direct_api?.api_key || ''}
                            @input=${this._valueChanged('direct_api.api_key')}
                            placeholder="Your InvenTree API key"
                        />
                    </div>
                    
                    <!-- Remove Data Sources subsection -->
                    
                    <!-- Show WebSocket settings ONLY if direct API is enabled -->
                    <div class="input-group">
                        <label for="websocket-url">WebSocket URL (Optional)</label>
                        <input
                            type="text"
                            id="websocket-url"
                            .value=${this._config.direct_api?.websocket_url || ''}
                            @input=${this._valueChanged('direct_api.websocket_url')}
                            placeholder="ws://your-inventree-server.com/api/ws/"
                        />
                        <div class="helper-text">
                            Leave blank to auto-derive from API URL (e.g., ws://.../api/ws/). Needed if using a reverse proxy or different port.
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label for="idle-render-time">Idle Render Time (seconds)</label>
                        <input
                            type="number"
                            id="idle-render-time"
                            .value=${this._config.direct_api?.idle_render_time?.toString() || '60'}
                            @input=${this._valueChanged('direct_api.idle_render_time')}
                            min="10"
                            max="600"
                            placeholder="60"
                        />
                        <div class="helper-text">
                            How often to refresh when no changes are detected (10-600 seconds)
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Remove the _valueChangedDataSource method as it's no longer needed
    /*
    private _valueChangedDataSource(method: 'websocket' | 'polling' | 'hass') {
        // ... implementation ...
    }
    */

    private _renderDebuggingSection() {
        // Get the systems from the logger
        const systems = this.logger.getSystemsStatus();
        
        return html`
          <div class="row">
            <div class="col">
              <div class="card-header">
                <h3>Debugging</h3>
              </div>
              <div class="card-content">
                <div class="row">
                  <div class="col">
                    <input 
                      type="checkbox"
                      id="debug-checkbox"
                      ?checked=${this._config?.debug || false}
                      @change=${this._valueChangedDebug('debug')}
                    />
                    <label for="debug-checkbox">Enable Debug</label>
                  </div>
                </div>
                <div class="row">
                  <div class="col">
                    <input 
                      type="checkbox"
                      id="debug-verbose-checkbox"
                      ?checked=${this._config?.debug_verbose || false}
                      @change=${this._valueChangedDebug('debug_verbose')}
                    />
                    <label for="debug-verbose-checkbox">Verbose Logging</label>
                  </div>
                </div>
                <div class="row">
                  <h4>Debug Categories</h4>
                </div>
                ${Object.entries(systems).map(([systemName, systemInfo], systemIndex) => {
                  return html`
                    <div class="row">
                      <div class="col">
                        <input 
                          type="checkbox"
                          id="debug-system-${systemIndex}"
                          ?checked=${this._config![`debug_${systemName}`] === true}
                          @change=${this._valueChangedDebug(`debug_${systemName}`)}
                        />
                        <label for="debug-system-${systemIndex}">${systemName}</label>
                      </div>
                    </div>
                    ${Object.keys(systemInfo.subsystems || {}).map((subsystem, subsystemIndex) => {
                      return html`
                        <div class="row">
                          <div class="col" style="padding-left: 2em">
                            <input 
                              type="checkbox"
                              id="debug-subsystem-${systemIndex}-${subsystemIndex}"
                              ?checked=${this._config?.debug_hierarchical?.[systemName]?.subsystems?.[subsystem] === true}
                              @change=${this._valueChangedDebug('debug_hierarchical', systemName, subsystem)}
                            />
                            <label for="debug-subsystem-${systemIndex}-${subsystemIndex}">${subsystem}</label>
                          </div>
                        </div>
                      `;
                    })}
                  `;
                })}
              </div>
            </div>
          </div>
        `;
    }

    /**
     * Get subsystem debug state
     */
    private _getSubsystem(system: string, subsystem: string): boolean {
        const hierarchical = this._config?.debug_hierarchical;
        if (!hierarchical || !hierarchical[system] || !hierarchical[system].subsystems) {
            return false;
        }
        return hierarchical[system].subsystems[subsystem] || false;
    }

    /**
     * Update subsystem debug state
     */
    private _updateSubsystem(system: string, subsystem: string) {
        return (ev: Event) => {
            if (!this._config) return;
            
            const target = ev.target as HTMLInputElement;
            const value = target.checked;
            
            // Create a deep copy of the config
            const newConfig = JSON.parse(JSON.stringify(this._config)) as InventreeCardConfig;
            
            // Initialize hierarchical debug structure if needed
            if (!newConfig.debug_hierarchical) {
                newConfig.debug_hierarchical = {};
            }
            
            // Initialize system config if needed
            if (!newConfig.debug_hierarchical[system]) {
                newConfig.debug_hierarchical[system] = {
                    enabled: true,
                    subsystems: {}
                };
            }
            
            // Ensure the system exists
            const systemConfig = newConfig.debug_hierarchical[system];
            
            // Ensure subsystems object exists
            if (!systemConfig.subsystems) {
                systemConfig.subsystems = {};
            }
            
            // Set the subsystem value
            systemConfig.subsystems[subsystem] = value;
            
            // Check if all subsystems are disabled, if so, disable the system
            let allSubsystemsDisabled = true;
            for (const subsystemKey in systemConfig.subsystems) {
                if (systemConfig.subsystems[subsystemKey]) {
                    allSubsystemsDisabled = false;
                    break;
                }
            }
            
            // Update system enabled state based on subsystems
            systemConfig.enabled = !allSubsystemsDisabled;
            
            // Apply changes directly to the logger
            const logger = Logger.getInstance();
            logger.setSubsystemDebug(system, subsystem, value);
            
            // If all subsystems are disabled, also update the system
            if (allSubsystemsDisabled) {
                logger.setCategoryDebug(system, false);
            } else {
                logger.setCategoryDebug(system, true);
            }
            
            // Update the config
            this._updateConfig(newConfig);
        };
    }

    /**
     * Format subsystem name for display
     */
    private _formatSubsystemName(subsystem: string): string {
        return subsystem
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get method description
     */
    private _getMethodDescription(method: string): string {
        switch (method) {
            case 'websocket':
                return 'Uses WebSocket plugin for real-time updates from InvenTree. Fastest and most efficient method.';
            case 'polling':
                return 'Periodically polls the InvenTree API for updates. Reliable but less efficient.';
            case 'hass':
                return 'Uses Home Assistant sensors for updates. Slowest method, requires InvenTree integration.';
            default:
                return '';
        }
    }

    /**
     * Render scheduled jobs list
     */
    private _renderScheduledJobs(): TemplateResult {
        // Currently no jobs are stored in the config, so this is a placeholder
        return html`
            <div class="no-jobs-message">
                No scheduled jobs configured yet. Click "Add Scheduled Job" to create one.
            </div>
        `;
    }
    
    /**
     * Show dialog to add a new scheduled job
     */
    private _showAddJobDialog(): void {
        // This would typically show a modal dialog for adding a job
        // For now we'll just show a notification that this feature is coming soon
        alert("Scheduled jobs configuration interface is coming soon! This feature allows you to configure regular data refresh, cache clearing, and other maintenance tasks on a schedule.");
    }

    /**
     * Get performance setting with fallback
     */
    private _getPerformanceSetting(categoryPath: string, setting: string, defaultValue: number): number {
        if (!this._config) {
            return defaultValue;
        }

        let baseConfig: any = this._config;
        const pathParts = categoryPath.split('.'); // e.g., "direct_api.api" or "rendering"

        // Adjust logic if "direct_api.performance.api" is the actual structure for direct_api settings
        let effectivePathParts = [...pathParts];
        if (pathParts[0] === 'direct_api' && pathParts.length > 1 && pathParts[1] !== 'performance') {
            // Insert 'performance' for direct_api paths like 'direct_api.api' or 'direct_api.websocket'
            effectivePathParts.splice(1, 0, 'performance');
        } else if (pathParts[0] !== 'direct_api' && pathParts[0] !== 'performance' ) {
             // For general settings like "rendering", "parameters", they are under "performance"
            effectivePathParts.unshift('performance');
        }


        for (const part of effectivePathParts) {
            if (baseConfig && typeof baseConfig === 'object' && part in baseConfig) {
                baseConfig = baseConfig[part];
            } else {
                return defaultValue; // Path doesn't exist
            }
        }
        
        if (baseConfig && typeof baseConfig === 'object' && setting in baseConfig) {
            const value = (baseConfig as any)[setting];
            return typeof value === 'number' ? value : defaultValue;
        }
        
        return defaultValue;
    }

    /**
     * Update performance setting
     */
    private _updatePerformanceSetting(categoryPath: string, setting: string, isSecondsInput: boolean = false) {
        return (ev: Event) => {
            if (!this._config) return;
            
            const target = ev.target as HTMLInputElement;
            let value = parseFloat(target.value); 
            
            if (isNaN(value)) { 
                this.logger.warn('Editor', `Invalid numeric input for performance setting ${categoryPath}.${setting}: ${target.value}`);
                this.requestUpdate();
                return;
            }

            const newConfig = JSON.parse(JSON.stringify(this._config));
            
            let currentLevel = newConfig;
            const pathParts = categoryPath.split('.'); 

            let performancePathPrefix: string[] = [];
            let configPathWithinPerformance: string[] = [];

            if (pathParts[0] === 'direct_api') {
                 performancePathPrefix = ['direct_api', 'performance'];
                 configPathWithinPerformance = pathParts.slice(1); // e.g., ['api'] or ['websocket']
            } else {
                 performancePathPrefix = ['performance'];
                 configPathWithinPerformance = pathParts; // e.g., ['rendering'] or ['parameters']
            }

            let targetObject = currentLevel;
            for (const part of performancePathPrefix) {
                if (!targetObject[part] || typeof targetObject[part] !== 'object') {
                    targetObject[part] = {};
                }
                targetObject = targetObject[part];
            }
            
            for (const part of configPathWithinPerformance) {
                 if (!targetObject[part] || typeof targetObject[part] !== 'object') {
                    targetObject[part] = {};
                }
                targetObject = targetObject[part];
            }

            (targetObject as any)[setting] = value;
            
            this._updateConfig(newConfig);
            this.requestUpdate(); 
        };
    }

    private _parameterTypeChanged(e: any) {
        // Prevent the default event behavior which might be closing the dialog
        e.stopPropagation();
        
        this._conditionParameterType = e.target.value;
        
        // When changing type, update the parameter field
        if (this._conditionParameterType === 'direct' && this._conditionParameter) {
            // Try to parse existing parameter if it's already in cross-entity format
            const parts = this._conditionParameter.split(':');
            if (parts.length === 2) {
                this._conditionParamName = parts[1];
            }
        } else if (this._conditionParameterType === 'entity' && this._conditionPartId && this._conditionParamName) {
            // Combine part ID and param name into cross-entity format
            this._conditionParameter = `part:${this._conditionPartId}:${this._conditionParamName}`;
        }

        // Ensure we update the UI
        this.requestUpdate();
    }

    /**
     * Handle debug checkbox change
     */
    private _valueChangedDebug(property: string, system?: string, subsystem?: string) {
        return (ev: Event) => {
            if (!this._config) {
                return;
            }
            
            const target = ev.target as HTMLInputElement;
            const value = target.checked === true;
            
            // Make a deep copy of the current config
            const newConfig = JSON.parse(JSON.stringify(this._config));
            
            if (property === 'debug') {
                // Main debug toggle
                newConfig.debug = value;
                this.logger.setDebug(value);
            } else if (property === 'debug_verbose') {
                // Verbose mode toggle
                newConfig.debug_verbose = value;
                this.logger.setVerboseMode(value);
            } else if (property.startsWith('debug_')) {
                // System toggle (e.g., debug_websocket)
                const systemName = property.substring(6); // Remove 'debug_' prefix
                newConfig[property] = value;
                this.logger.setCategoryDebug(systemName, value);
            } else if (property === 'debug_hierarchical' && system && subsystem) {
                // Subsystem toggle within a system
                if (!newConfig.debug_hierarchical) {
                    newConfig.debug_hierarchical = {};
                }
                
                if (!newConfig.debug_hierarchical[system]) {
                    newConfig.debug_hierarchical[system] = { enabled: true, subsystems: {} };
                }
                
                if (!newConfig.debug_hierarchical[system].subsystems) {
                    newConfig.debug_hierarchical[system].subsystems = {};
                }
                
                // Update the subsystem value
                newConfig.debug_hierarchical[system].subsystems[subsystem] = value;
                
                // Apply the change directly to the logger
                this.logger.setSubsystemDebug(system, subsystem, value);
                
                // Check if all subsystems are disabled to update parent state
                let allDisabled = true;
                let someEnabled = false;
                
                for (const sub in newConfig.debug_hierarchical[system].subsystems) {
                    if (newConfig.debug_hierarchical[system].subsystems[sub]) {
                        someEnabled = true;
                        allDisabled = false;
                        break;
                    }
                }
                
                // Update the system enabled state
                newConfig.debug_hierarchical[system].enabled = !allDisabled;
                newConfig[`debug_${system}`] = !allDisabled;
                
                // Update the system in the logger
                this.logger.setCategoryDebug(system, !allDisabled);
            }
            
            // Update the config
            this._updateConfig(newConfig);
        };
    }

    private _renderPerformanceSettings() {
        if (!this._config) return html``;
        const directApiEnabled = this._config.direct_api?.enabled || false;

        return html`
            <div class="section">
                <div class="section-header">Performance Settings</div>
                <div class="helper-text">Fine-tune throttling and update frequencies. Lower values mean more responsive but potentially higher load. (Times in milliseconds unless specified).</div>

                <div class="subsection">
                    <div class="subsection-header">Direct API Performance</div>
                    <div class="performance-group" ?disabled=${!directApiEnabled}>
                         <div class="helper-text" ?hidden=${directApiEnabled}>Enable Direct API to configure these settings.</div>
                        <div class="slider-group">
                            <span>API Call Throttle (s)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="0.1"
                                .value=${this._getPerformanceSetting('direct_api.api', 'throttle', 0.2).toString()}
                                @input=${this._updatePerformanceSetting('direct_api.api', 'throttle', true)}
                                ?disabled=${!directApiEnabled}
                            />
                            <span>${this._getPerformanceSetting('direct_api.api', 'throttle', 0.2)} s</span>
                        </div>
                        <div class="slider-group">
                            <span>API Cache Lifetime (s)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="1"
                                .value=${this._getPerformanceSetting('direct_api.api', 'cacheLifetime', 60).toString()}
                                @input=${this._updatePerformanceSetting('direct_api.api', 'cacheLifetime', true)}
                                ?disabled=${!directApiEnabled}
                            />
                            <span>${this._getPerformanceSetting('direct_api.api', 'cacheLifetime', 60)} s</span>
                        </div>
                        <div class="slider-group">
                            <span>API Failed Retry Delay (s)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="1"
                                .value=${this._getPerformanceSetting('direct_api.api', 'failedRequestRetryDelaySeconds', 30).toString()}
                                @input=${this._updatePerformanceSetting('direct_api.api', 'failedRequestRetryDelaySeconds', true)}
                                ?disabled=${!directApiEnabled}
                            />
                            <span>${this._getPerformanceSetting('direct_api.api', 'failedRequestRetryDelaySeconds', 30)} s</span>
                        </div>
                        <div class="slider-group">
                            <span>WS Reconnect (ms)</span>
                            <input 
                                type="number" 
                                min="1000" 
                                step="1000"
                                .value=${this._getPerformanceSetting('direct_api.websocket', 'reconnectInterval', 5000).toString()}
                                @input=${this._updatePerformanceSetting('direct_api.websocket', 'reconnectInterval')}
                                ?disabled=${!directApiEnabled}
                            />
                            <span>${this._getPerformanceSetting('direct_api.websocket', 'reconnectInterval', 5000)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>WS Msg Debounce (ms)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="10"
                                .value=${this._getPerformanceSetting('direct_api.websocket', 'messageDebounce', 50).toString()}
                                @input=${this._updatePerformanceSetting('direct_api.websocket', 'messageDebounce')}
                                ?disabled=${!directApiEnabled}
                            />
                            <span>${this._getPerformanceSetting('direct_api.websocket', 'messageDebounce', 50)} ms</span>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <div class="subsection-header">General Card Performance</div>
                    <div class="performance-group">
                        <div class="slider-group">
                            <span>Render Debounce (ms)</span>
                            <input 
                                type="number" 
                                min="0" 
                                step="10"
                                .value=${this._getPerformanceSetting('rendering', 'debounceTime', 50).toString()}
                                @input=${this._updatePerformanceSetting('rendering', 'debounceTime')}
                            />
                            <span>${this._getPerformanceSetting('rendering', 'debounceTime', 50)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>Idle Render Interval (ms)</span>
                            <input 
                                type="number" 
                                min="500" 
                                step="500"
                                .value=${this._getPerformanceSetting('rendering', 'idleRenderInterval', 5000).toString()}
                                @input=${this._updatePerformanceSetting('rendering', 'idleRenderInterval')}
                            />
                            <span>${this._getPerformanceSetting('rendering', 'idleRenderInterval', 5000)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>Max Render Freq (Hz)</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="60" 
                                step="1"
                                .value=${this._getPerformanceSetting('rendering', 'maxRenderFrequency', 10).toString()}
                                @input=${this._updatePerformanceSetting('rendering', 'maxRenderFrequency')}
                            />
                            <span>${this._getPerformanceSetting('rendering', 'maxRenderFrequency', 10)} Hz</span>
                        </div>
                        <div class="slider-group">
                            <span>Param Update Freq (ms)</span>
                            <input 
                                type="number" 
                                min="100" 
                                step="100"
                                .value=${this._getPerformanceSetting('parameters', 'updateFrequency', 1000).toString()}
                                @input=${this._updatePerformanceSetting('parameters', 'updateFrequency')}
                            />
                            <span>${this._getPerformanceSetting('parameters', 'updateFrequency', 1000)} ms</span>
                        </div>
                        <div class="slider-group">
                            <span>Cond. Eval Freq (ms)</span>
                            <input 
                                type="number" 
                                min="100" 
                                step="100"
                                .value=${this._getPerformanceSetting('parameters', 'conditionEvalFrequency', 1000).toString()}
                                @input=${this._updatePerformanceSetting('parameters', 'conditionEvalFrequency')}
                            />
                            <span>${this._getPerformanceSetting('parameters', 'conditionEvalFrequency', 1000)} ms</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}


