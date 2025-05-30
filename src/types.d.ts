// Declaration file to fix missing module errors

// --- Types Moved from core/types.ts ---

// Helper Interfaces
export interface CustomCardEntry {
    type: string;
    name: string;
    description: string;
    preview: boolean;
    documentationURL?: string;
}

export interface ProcessedVariant {
    pk: number;
    name: string;
    template: InventreeItem; // Uses the InventreeItem defined below
    variants: InventreeItem[];
    totalStock: number;
    thumbnail?: string | null;
    category_name?: string | null;
    in_stock?: number; // Keep compatible with consolidated InventreeItem
}

export interface VariantGroup {
    main_pk: number;
    templatePk?: number;
    variantPks?: number[];
    template_id: number;  // The ID of the template part (e.g., 60 for Rice)
    parameter_id?: number;  // Optional parameter ID to use for grouping
    name?: string;  // Optional name for the group
    parts?: number[];  // Optional list of part IDs in this group
}

// Layout/Config Interfaces
export interface InventreeCardLayout {
    min_height?: number;
    max_height?: number;
    transparent?: boolean;
}

export interface DisplayConfig {
    show_header?: boolean;
    show_image?: boolean;
    show_name?: boolean;
    show_stock?: boolean;
    show_description?: boolean;
    show_category?: boolean;
    show_ipn?: boolean;
    show_location?: boolean;
    show_supplier?: boolean;
    show_manufacturer?: boolean;
    show_notes?: boolean;
    show_buttons?: boolean;
    show_stock_status_border?: boolean;
    show_stock_status_colors?: boolean;
    show_related_parts?: boolean; 
    show_parameters?: boolean;
    show_part_details_component?: boolean; 
    show_stock_status_border_for_templates?: boolean;
    show_buttons_for_variants?: boolean;
    show_part_details_component_for_variants?: boolean;
    show_image_for_variants?: boolean;
    show_stock_for_variants?: boolean;
    show_name_for_variants?: boolean;
}

// Renamed from CustomButton to CustomAction, added confirmation fields
export interface CustomAction {
    id?: string; // Optional unique ID for list management
    label: string;
    icon?: string;
    type: 'ha-service' | 'navigate' | 'internal-function'; // Action type
    
    // For ha-service
    service?: string; // e.g., light.turn_on
    service_data?: Record<string, any>; // Data for the service call
    target_entity_id?: string; // Optional target entity for the service

    // For navigate
    navigation_path?: string; // e.g., /lovelace/my-dashboard

    // For internal-function (details TBD)
    function_name?: string;
    function_args?: Record<string, any>;

    // Styling & Confirmation
    style?: string; // Custom CSS for the button
    color?: string; // Button color
    confirmation?: boolean;
    confirmation_text?: string;
}

// Updated to use CustomAction
export interface InteractionsConfig {
    buttons?: CustomAction[];
}

// OLD ButtonConfig - to be phased out or merged if necessary
// export interface ButtonConfig {
// preset?: 'default' | 'bulk' | 'precise' | 'full' | 'custom';
// custom_buttons?: CustomButton[]; // This would become CustomAction[]
// type?: string; // Used internally?
// value?: number; // Used internally?
// }

export interface StyleConfig {
    background?: string;
    spacing?: number;
    image_size?: number;
}

export interface ThumbnailConfig {
    mode?: 'auto' | 'custom' | 'local';
    custom_path?: string;
    local_path?: string;
    enable_bulk_import?: boolean;
}

export interface PrintConfig {
    enabled?: boolean;
    template_id?: number;
    plugin?: string;
}

export interface StockConfig {
    // No configuration needed for stock service
}

export interface ServiceConfig {
    wled?: WLEDConfig; // WLEDConfig defined below
    print?: PrintConfig;
    stock?: StockConfig;
}

export interface PartConfig {
    entity: string;
    name?: string;
}

export interface PerformanceConfig {
    rendering?: {
        debounceTime?: number;       // ms to wait before rendering
        idleRenderInterval?: number; // ms between renders when idle
        maxRenderFrequency?: number; // max renders per second
    };
    websocket?: {
        reconnectInterval?: number;  // ms between reconnect attempts
        messageDebounce?: number;    // minimum ms between handling similar messages
    };
    api?: {
        throttle?: number;           // ms between API calls
        cacheLifetime?: number;      // ms before cache invalidation
        batchSize?: number;          // number of items to process in a batch
        failedRequestRetryDelaySeconds?: number; // NEW: seconds to wait after a failed API request before any retry
    };
    parameters?: {
        updateFrequency?: number;    // ms between parameter updates
        conditionEvalFrequency?: number; // ms between condition evaluations
    };
}

export interface DirectApiConfig {
    enabled: boolean;
    url: string;
    api_key: string;
    method?: 'websocket' | 'polling' | 'hass'; // Make method optional
    websocket_url?: string; // Make it string | undefined (was string | null | undefined)
    idle_render_time?: number; // In seconds, how often to refresh when idle
    performance?: PerformanceConfig;
}

export interface FilterConfig {
    attribute: string;
    operator: 'eq' | 'contains' | 'gt' | 'lt';
    value: string;
    parameter_id?: string | number; // For parameter filters
}

export interface ParameterCondition {
    parameter: string; // Expected format "part:ID:PARAMETER_NAME"
    operator: ParameterOperator; // Defined below
    value?: string;
    action: ParameterActionType; // Defined below
    action_value: string;
    targetPartIds?: number[] | string; // UPDATED: Array of part PKs or a wildcard string (e.g., "*")
    id?: string; // Unique identifier for the condition
    entityId?: string; // For cross-entity parameter references - may become less relevant if parameter string always has part ID
}

export interface ParameterAction {
    label: string;
    icon?: string;
    parameter: string;
    value: string;
    confirmation?: boolean;
    confirmation_text?: string;
    id?: string; // Unique identifier for the action
}

// --- Data Source Config (for react-querybuilder integration) ---
// This will hold the arrays of selected entities/strings from the Data Sources section
export interface DataSourceConfig {
  inventree_hass_sensors?: string[];
  ha_entities?: string[];
  inventree_pks?: number[]; // Changed from string[] to number[]
  inventree_parameters?: string[]; // Strings like "part:ID:PARAMETER_NAME"
  // We might add direct_api_config here if its presence implies available fields
  inventreeParametersToFetch?: InventreeParameterFetchConfig[];
}

export interface InventreeParameterFetchConfig {
  targetPartIds: number[] | 'all_loaded';
  parameterNames: string[] | '*'; 
  fetchOnlyIfUsed?: boolean;      
}

export interface ParameterConfig {
    enabled?: boolean;
    show_section?: boolean;
    collapsed_by_default?: boolean;
    group_parameters?: boolean;
    conditions?: ParameterCondition[];
    actions?: ParameterAction[];
    filter_fallback_mode?: 'all' | 'empty';
}

// Renamed to SubsystemDebugConfig
export interface SubsystemDebugConfig {
    enabled?: boolean; // General toggle for this specific subsystem
    // Potentially add more granular flags within a subsystem if needed later, e.g., verbose_logging?: boolean for just this one
    // For now, keeping it simple with just an enabled flag.
    // If a subsystem has sub-subsystems, it could nest another Record<string, SubsystemDebugConfig>
    // For HierarchicalDebugConfig, specific subsystems will be explicitly listed.
}

export interface HierarchicalDebugConfig {
    api?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    parameters?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    websocket?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    layouts?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    rendering?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    cache?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    card?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    diagnostics?: SubsystemDebugConfig; // Changed from SystemDebugConfig
    // Allow other ad-hoc subsystems if necessary, though explicit is better
    [system: string]: SubsystemDebugConfig | undefined; 
}

// New comprehensive SystemDebugConfig for the card
export interface SystemDebugConfig { 
    enabled?: boolean;      // Global debug toggle (maps to InventreeCardConfig.debug)
    verbose?: boolean;      // Global verbose toggle (maps to InventreeCardConfig.debug_verbose)
    hierarchical?: HierarchicalDebugConfig; // Maps to InventreeCardConfig.debug_hierarchical
}

export interface DebugConfig { // Simpler debug config for direct use by Logger instance if needed
    [key: string]: boolean; // e.g., debug_api: true
}

export interface InventreeCardConfig {
    type: string;
    entity?: string;
    name?: string;
    view_type?: ViewType; // Use ViewType alias
    selected_entities?: string[];
    display?: DisplayConfig;
    custom_view?: { tag: string; };
    direct_api?: DirectApiConfig;
    debug?: boolean; // Simple debug flag
    debug_verbose?: boolean;
    debug_hierarchical?: HierarchicalDebugConfig; // Hierarchical debug flags
    show_debug?: boolean; // Toggle visibility of debug UI
    parameters?: ParameterConfig;
    variant_view_type?: VariantViewType; // Use VariantViewType alias
    auto_detect_variants?: boolean;
    columns?: number;
    grid_spacing?: number;
    item_height?: number;
    style?: StyleConfig;
    services?: ServiceConfig;
    buttons?: ButtonConfig;
    interactions?: InteractionsConfig;
    conditional_logic?: ConditionalLogicConfig;
    filters?: FilterConfig[];
    performance?: PerformanceConfig; // Add performance config
    // Allow dynamic debug properties like debug_api, debug_websocket etc.
    [key: string]: any; 
}

export interface FormSchemaItem {
    name: string;
    label: string;
    description?: string;
    selector?: {
        entity?: { domain: string };
        text?: Record<string, never>;
        boolean?: Record<string, never>;
        number?: { min: number; max: number; step: number };
        select?: { options: Array<{ value: string; label: string }> };
    };
    type?: string;
    schema?: FormSchemaItem[];
}

export interface FormSchema extends FormSchemaItem {}

export interface VisualModifiers {
    highlight?: string;
    textColor?: string;
    border?: string;
    icon?: string;
    badge?: string;
    sort?: 'top' | 'bottom';
    filter?: 'show' | 'hide';
    showSection?: 'show' | 'hide';
    priority?: 'high' | 'medium' | 'low';
    isVisible?: boolean;
}

export interface HaEntityPickerEntity {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name?: string;
        items?: any[];
    };
}

// Enums / Type Aliases
export type ViewType = 'detail' | 'grid' | 'list' | 'parts' | 'variants' | 'base' | 'debug' | 'custom';
export type VariantViewType = 'dropdown' | 'tabs' | 'grid' | 'list' | 'tree';
export type ButtonType = 'increment' | 'decrement' | 'locate' | 'print' | 'custom';
export type ParameterOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'is_empty';
export type ParameterActionType = 
    'highlight' | 
    'text_color' | 
    'border' | 
    'icon' | 
    'badge' | 
    'sort' | 
    'filter' | 
    'show_section' | 
    'priority';
export type ParameterConditionOperator = 'equals' | 'not_equals' | 'contains' | 'exists' | 'is_empty' | 'greater_than' | 'less_than';

// --- User-Defined Condition Rule (for config) ---
export interface ConditionRuleDefinition {
  name?: string; // Optional user-friendly name for the rule (for editor UI)
  parameter: string; // Universal source string, e.g., "part:123:status", "entity:sensor.temperature:state"
  operator: ParameterOperator;
  value: string | number | boolean; // The value to compare against
  action: ParameterActionType;
  action_value: string; // The value for the action (e.g., color name, 'show'/'hide')
  targetPartIds?: number[] | string; // Which parts this rule's action applies to (e.g., "*", specific PKs)
}

// --- Processed Condition (for runtime engine) ---
export interface ProcessedCondition {
  id: string; // Unique ID for the processed condition instance
  originalRule: ConditionRuleDefinition; // The rule it was derived from

  // Source identification (parsed from originalRule.parameter)
  sourceType: 'inventree_parameter' | 'inventree_attribute' | 'ha_entity_state' | 'ha_entity_attribute' | 'unknown';
  partId?: number;        // For sourceType 'inventree_parameter' or 'inventree_attribute'
  parameterName?: string; // For sourceType 'inventree_parameter'
  attributeName?: string; // For sourceType 'inventree_attribute'
  entityId?: string;      // For sourceType 'ha_entity_state' or 'ha_entity_attribute'
  haAttributeName?: string; // For sourceType 'ha_entity_attribute'

  // Effects to apply if this specific condition (or the group it belongs to) is met
  effects?: EffectDefinition[];

  // Fields from originalRule (operator, value, action, action_value, targetPartIds) are directly accessible via originalRule
  // or can be duplicated here if preferred for direct access by the engine.
  // For simplicity, let's assume the engine accesses them via originalRule for now.

  // Optional: Store the last evaluated result if needed for caching/debugging, though not strictly necessary for the type itself
  // lastResult?: boolean;
}

// --- Conditional Logic Structures ---
export interface EffectDefinition {
  id: string; // Unique ID for this specific effect
  type: 'set_visibility' | 'set_style' | 'call_ha_service' | 'trigger_custom_action';
  targetElement?: string; // CSS selector or predefined element key (e.g., 'part_image', 'part_name_text')
  targetPartPks?: number[] | string; // NEW: Which parts this specific effect applies to (e.g., [1,2], "all_loaded", "1,2,3")
  // For set_visibility
  isVisible?: boolean;
  // For set_style
  styleProperty?: string; // e.g., 'backgroundColor', 'border', 'color'
  styleValue?: string;
  // For call_ha_service
  service?: string;
  service_data?: Record<string, any>;
  // For trigger_custom_action
  customActionId?: string; // ID of a CustomAction defined in the Interactions section
}

export interface ConditionalLogicItem {
  id: string; // Unique ID for this logic block
  name?: string; // User-friendly name for the logic block in the UI
  conditionRules: RuleGroupType; // The "IF" part from React QueryBuilder
  effects: EffectDefinition[]; // The "THEN" part - an array of effects
}

// --- Conditional Logic Config (for react-querybuilder integration) ---
export interface ConditionalLogicConfig {
  // rules: RuleGroupType; // This will be replaced by definedLogics which uses ConditionRuleDefinition
  definedLogics: ConditionalLogicItem[]; // This holds a more structured logic block with effects
  rules?: ConditionRuleDefinition[]; // ADDED: For simpler, direct rule definitions if not using full definedLogics blocks initially
}

// --- React Query Builder type re-exports (if not already globally available or to be more explicit) ---
// These are typically part of the 'react-querybuilder' package.
// If you have it installed, you might prefer to import them directly in files that need them.
// For now, defining them here for clarity if they aren't easily imported elsewhere in the project.
export type RuleType = {
  id?: string;
  field: string;
  operator: string;
  value: any;
  // valueSource?: 'value' | 'field'; // if you allow comparing to another field
  // path?: number[]; // internal path for react-querybuilder
};

export type RuleGroupType = {
  id?: string;
  combinator: 'and' | 'or';
  rules: (RuleType | RuleGroupType)[];
  not?: boolean; // If the whole group should be negated
  // path?: number[]; // internal path for react-querybuilder
};

// --- Original types from types.d.ts ---

// WebSocket Event Message Structure
export interface WebSocketEventMessage {
  type: 'event';
  event: string; 
  timestamp: number;
  data: EnhancedStockItemEventData | EnhancedParameterEventData | Record<string, any>; 
}

// Enhanced StockItem Event Data
export interface EnhancedStockItemEventData {
  id: number; 
  model: 'StockItem';
  quantity: string; 
  batch: string | null;
  serial: string | null;
  status_label: string;
  status_value: number;
  last_updated: string; 
  part_id: number;
  part_name: string;
  part_ipn: string | null;
  part_thumbnail: string | null;
  location_id: number | null;
  location_name: string | null;
  location_pathstring: string | null;
  [key: string]: any; 
}

// Enhanced Parameter Event Data
export interface EnhancedParameterEventData {
  id: number; 
  model: 'PartParameter' | 'StockItemParameter' | 'CompanyParameter' | string; 
  parameter_pk?: number; 
  parameter_name: string;
  parameter_value: string;
  parameter_units: string | null;
  part_pk?: number; 
  part_name?: string; 
  parent_id?: number; 
  parent_type?: 'Part' | 'StockItem' | 'Company' | string; 
  parent_name?: string; 
  [key: string]: any;
} 

// Basic Parameter Detail (used within InventreeItem)
export interface ParameterDetail {
  pk: number;
  part: number; // Part PK this parameter instance belongs to
  template: number; // ParameterTemplate PK
  template_detail?: { // Optional, might not always be expanded
    pk: number; // Added pk here
    name: string;
    units: string | null;
    description?: string;
    checkbox?: boolean; // Added from core/types ParameterData
    choices?: string;   // Added from core/types ParameterData
    selectionlist?: any; // Added from core/types ParameterData
  };
  data: string; // Value of the parameter for this part
  data_numeric: number | null; // Numeric value if applicable
}

// Core InvenTree Part item structure (Consolidated)
export interface InventreeItem {
  pk: number;
  name: string;
  description?: string | null;
  IPN?: string | null; // Internal Part Number
  variant_of?: number | null; // PK of parent part if this is a variant
  keywords?: string | null;
  category?: number | null;
  category_name?: string | null; 
  category_pathstring?: string | null;
  thumbnail?: string | null;
  image?: string | null; 
  active?: boolean;
  assembly?: boolean;
  component?: boolean;
  is_template?: boolean;
  purchaseable?: boolean;
  salable?: boolean;
  starred?: boolean;
  virtual?: boolean;
  units?: string | null;
  
  // Stock related fields (in_stock is now number | undefined)
  in_stock?: number; // <<< This is the critical change for compatibility
  on_order?: number;
  building?: number;
  minimum_stock?: number | null;
  total_in_stock?: number; 
  unallocated_stock?: number;
  allocated_to_build_orders?: number;
  allocated_to_sales_orders?: number;

  // Other common fields
  link?: string | null; 
  notes?: string | null;
  parameters?: ParameterDetail[] | null; // Use ParameterDetail defined above
  
  // Fields that might come from HASS sensors or be added by the card
  entity_id?: string; 
  last_updated?: string; 
  status_label?: string; 
  status_value?: number; 

  // Allow other properties
  [key: string]: any;
}

// WLED Service Configuration
export interface WLEDConfig {
  enabled: boolean;
  entity_id?: string; // Made optional as per core/types
  parameter_name?: string; // Made optional as per core/types
  // Add other optional props from core/types WLEDConfig if needed
  ip_address?: string;
  effect?: string;
  intensity?: number;
  palette?: string;
  speed?: number;
  segment_id?: number;
  reverse?: boolean;
}

// Represents a single Stock Item from InvenTree API
export interface StockItem {
  pk: number;
  part: number; 
  location?: number | null; 
  quantity: string; 
  batch?: string | null;
  serial?: string | null;
  status: number; 
  status_text?: string; 
  notes?: string | null;
  updated?: string; 
  created?: string; 
  purchase_price?: string | null;
  purchase_price_currency?: string | null;
  packaging?: string | null;
  link?: string | null; 
  barcode_hash?: string; 
  [key: string]: any;
} 

// Global declarations (ensure they remain outside any module scope)
declare global {
    interface HTMLElementTagNameMap {
        'inventree-card-react-editor-host': any; // Changed from inventree-card-editor
        'inventree-card': any; // Use 'any' or import LovelaceCard if possible
        'hui-error-card': any;
    }
    
    interface Window {
        customCards: CustomCardEntry[];
    }
    
    // Define event data structures
    interface HASSDomEvents {
        'adjust-stock': { pk: number; amount: number; };
        'inventree-parameter-changed': { entityId: string; parameter: string; value?: any; source?: string; };
        'inventree-entity-updated': { entityId: string; partId?: number; parameter?: string; value?: any; source?: string; };
        'inventree-parameter-updated': { part_id?: number; parameter_name?: string; value?: any; source?: string; };
    }
    
    // Register events in the WindowEventMap
    interface WindowEventMap {
        'inventree-parameter-changed': CustomEvent<{ entityId: string; parameter: string; value?: any; source?: string; }>;
        'inventree-entity-updated': CustomEvent<{ entityId: string; partId?: number; parameter?: string; value?: any; source?: string; }>;
        'inventree-parameter-updated': CustomEvent<{ part_id?: number; parameter_name?: string; value?: any; source?: string; }>;
    }

    // Add JSX intrinsic element for ha-icon
    namespace JSX {
      interface IntrinsicElements {
        'ha-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 
            icon?: string; 
        };
        'ha-entity-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            hass?: CustomCardHelpersHomeAssistant | any; 
            value?: string;
            label?: string;
            includeDomains?: string[];
            disabled?: boolean;
            allowCustomEntity?: boolean;
        };
        'ha-icon-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            hass?: CustomCardHelpersHomeAssistant | any;
            label?: string;
            value?: string;
            placeholder?: string;
            disabled?: boolean;
            // Add any other specific props for ha-icon-picker if known
        };
      }
    }
}

// Export empty object to treat this as a module if needed by TypeScript config, 
// BUT global declarations might fail if this is active. Remove if causing issues.
// export {}; 

// --- Layout Configuration --- 
export interface LayoutConfig { // Added export
  viewType: ViewType;
  columns?: number;
  grid_spacing?: number; // Added
  item_height?: number;  // Added
} 