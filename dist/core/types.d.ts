import { LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
export interface CustomCardEntry {
    type: string;
    name: string;
    description: string;
    preview: boolean;
    documentationURL?: string;
}
declare global {
    interface HTMLElementTagNameMap {
        'inventree-card-editor': LovelaceCardEditor;
        'inventree-card': LovelaceCard;
        'hui-error-card': LovelaceCard;
    }
    interface Window {
        customCards: CustomCardEntry[];
    }
    interface HASSDomEvents {
        'adjust-stock': {
            pk: number;
            amount: number;
        };
        'inventree-parameter-changed': {
            entityId: string;
            parameter: string;
            value?: any;
            source?: string;
        };
        'inventree-entity-updated': {
            entityId: string;
            partId?: number;
            parameter?: string;
            value?: any;
            source?: string;
        };
        'inventree-parameter-updated': {
            part_id?: number;
            parameter_name?: string;
            value?: any;
            source?: string;
        };
    }
    interface WindowEventMap {
        'inventree-parameter-changed': CustomEvent<{
            entityId: string;
            parameter: string;
            value?: any;
            source?: string;
        }>;
        'inventree-entity-updated': CustomEvent<{
            entityId: string;
            partId?: number;
            parameter?: string;
            value?: any;
            source?: string;
        }>;
        'inventree-parameter-updated': CustomEvent<{
            part_id?: number;
            parameter_name?: string;
            value?: any;
            source?: string;
        }>;
    }
}
export type ViewType = 'detail' | 'grid' | 'list' | 'parts' | 'variants' | 'base' | 'debug' | 'custom';
export type VariantViewType = 'dropdown' | 'tabs' | 'grid' | 'list' | 'tree';
export interface InventreeItem {
    pk: number;
    name: string;
    in_stock: number;
    minimum_stock?: number;
    thumbnail?: string;
    description?: string;
    variant_of?: number | null;
    is_template?: boolean;
    parameters?: ParameterData[];
    source?: string;
    [key: string]: any;
}
export interface ProcessedVariant {
    pk: number;
    name: string;
    template: InventreeItem;
    variants: InventreeItem[];
    totalStock: number;
    thumbnail?: string;
    category_name?: string;
    in_stock?: number;
}
export interface ParameterData {
    pk: number;
    part: number;
    template: number;
    template_detail?: {
        pk: number;
        name: string;
        units: string;
        description: string;
        checkbox: boolean;
        choices: string;
        selectionlist: any;
    };
    data: string;
    data_numeric: number | null;
}
export interface InventreeCardLayout {
    min_height?: number;
    max_height?: number;
    transparent?: boolean;
}
export interface VariantGroup {
    main_pk: number;
    templatePk?: number;
    variantPks?: number[];
    template_id: number;
    parameter_id?: number;
    name?: string;
    parts?: number[];
}
export interface PartsConfig {
    show_variants: boolean;
    variant_groups: VariantGroup[];
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
export interface ButtonsConfig {
    preset?: 'default' | 'bulk' | 'precise' | 'full' | 'custom';
    custom_buttons?: ButtonConfig[];
}
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
export interface WLEDConfig {
    enabled: boolean;
    entity_id?: string;
    ip_address?: string;
    parameter_name?: string;
    effect?: string;
    intensity?: number;
    palette?: string;
    speed?: number;
    segment_id?: number;
    reverse?: boolean;
}
export interface PrintConfig {
    enabled?: boolean;
    template_id?: number;
    plugin?: string;
}
export interface StockConfig {
}
export interface ServiceConfig {
    wled?: WLEDConfig;
    print?: PrintConfig;
    stock?: StockConfig;
}
export interface PartConfig {
    entity: string;
    name?: string;
}
export interface DirectApiConfig {
    enabled: boolean;
    url: string;
    api_key: string;
    method?: 'websocket' | 'polling' | 'hass';
    websocket_url?: string;
    idle_render_time?: number;
    performance?: {
        rendering?: {
            idleRenderInterval?: number;
            maxRenderFrequency?: number;
            debounceTime?: number;
        };
        websocket?: {
            reconnectInterval?: number;
            messageDebounce?: number;
        };
    };
}
export interface InventreeCardConfig {
    type: string;
    entity?: string;
    name?: string;
    view_type?: string;
    selected_entities?: string[];
    display?: DisplayConfig;
    custom_view?: {
        tag: string;
        properties?: Record<string, any>;
    };
    direct_api?: {
        enabled: boolean;
        url: string;
        api_key: string;
        method?: 'websocket' | 'polling' | 'hass';
        websocket_url?: string;
        idle_render_time?: number;
        performance?: {
            rendering?: {
                idleRenderInterval?: number;
                maxRenderFrequency?: number;
                debounceTime?: number;
            };
            websocket?: {
                reconnectInterval?: number;
                messageDebounce?: number;
            };
        };
    };
    debug?: boolean;
    debug_api?: boolean;
    debug_parameters?: boolean;
    debug_websocket?: boolean;
    debug_layouts?: boolean;
    debug_rendering?: boolean;
    debug_cache?: boolean;
    debug_card?: boolean;
    debug_diagnostics?: boolean;
    debug_verbose?: boolean;
    debug_hierarchical?: {
        [key: string]: {
            enabled: boolean;
            subsystems: {
                [key: string]: boolean;
            };
        };
    };
    show_debug?: boolean;
    parameters?: ParameterConfig;
    variant_view_type?: 'grid' | 'list' | 'tabs' | 'dropdown' | 'tree';
    auto_detect_variants?: boolean;
    columns?: number;
    grid_spacing?: number;
    item_height?: number;
    style?: {
        background?: string;
        image_size?: number;
        spacing?: number;
    };
    services?: {
        wled?: WLEDConfig;
        print?: {
            enabled: boolean;
            template_id?: number;
            plugin?: string;
        };
    };
    buttons?: {
        preset?: 'default' | 'bulk' | 'precise' | 'full' | 'custom';
        custom_buttons?: ButtonConfig[];
    };
    filters?: FilterConfig[];
    [key: string]: any;
}
export interface FilterConfig {
    attribute: string;
    operator: 'eq' | 'contains' | 'gt' | 'lt';
    value: string;
    parameter_id?: string | number;
}
export type PartData = InventreeItem;
export type InvenTreePart = InventreeItem;
export interface FormSchemaItem {
    name: string;
    label: string;
    description?: string;
    selector?: {
        entity?: {
            domain: string;
        };
        text?: Record<string, never>;
        boolean?: Record<string, never>;
        number?: {
            min: number;
            max: number;
            step: number;
        };
        select?: {
            options: Array<{
                value: string;
                label: string;
            }>;
        };
    };
    type?: string;
    schema?: FormSchemaItem[];
}
export interface FormSchema extends FormSchemaItem {
}
export interface InventreeParameter {
    template_detail: {
        name: string;
        data?: string | number;
    };
}
export type ButtonType = 'increment' | 'decrement' | 'locate' | 'print' | 'custom';
export interface ButtonConfig {
    preset?: 'default' | 'bulk' | 'precise' | 'full' | 'custom';
    custom_buttons?: CustomButton[];
    type?: string;
    value?: number;
    service?: string;
    service_data?: Record<string, any>;
    style?: string;
    color?: string;
    icon?: string;
    label?: string;
}
export interface CustomButton {
    type: string;
    value?: number;
    service?: string;
    service_data?: Record<string, any>;
    style?: string;
    color?: string;
    icon?: string;
    label?: string;
}
export interface PartParameter {
    pk: number;
    part: number;
    template: number;
    template_detail?: {
        pk: number;
        name: string;
        units: string;
        description: string;
        checkbox: boolean;
        choices: string;
        selectionlist: any;
    };
    data: string;
    data_numeric: number;
}
export interface VariantsConfig {
    show_variants?: boolean;
    auto_detect?: boolean;
    view_type?: VariantViewType;
    variant_groups?: VariantGroup[];
}
export type ParameterOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'is_empty';
export type ParameterActionType = 'highlight' | 'text_color' | 'border' | 'icon' | 'badge' | 'sort' | 'filter' | 'show_section' | 'priority';
export interface ParameterCondition {
    parameter: string;
    operator: ParameterOperator;
    value?: string;
    action: ParameterActionType;
    action_value: string;
    id?: string;
    entityId?: string;
}
export interface ParameterAction {
    label: string;
    icon?: string;
    parameter: string;
    value: string;
    confirmation?: boolean;
    confirmation_text?: string;
    id?: string;
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
}
export interface HierarchicalDebugConfig {
    api?: SystemDebugConfig;
    parameters?: SystemDebugConfig;
    websocket?: SystemDebugConfig;
    layouts?: SystemDebugConfig;
    rendering?: SystemDebugConfig;
    cache?: SystemDebugConfig;
    card?: SystemDebugConfig;
    diagnostics?: SystemDebugConfig;
    [system: string]: SystemDebugConfig | undefined;
}
export interface SystemDebugConfig {
    enabled?: boolean;
    subsystems?: {
        [subsystem: string]: boolean;
    };
}
export interface PerformanceConfig {
    rendering?: {
        debounceTime?: number;
        idleRenderInterval?: number;
        maxRenderFrequency?: number;
    };
    websocket?: {
        reconnectInterval?: number;
        messageDebounce?: number;
    };
    api?: {
        throttle?: number;
        cacheLifetime?: number;
        batchSize?: number;
    };
    parameters?: {
        updateFrequency?: number;
        conditionEvalFrequency?: number;
    };
}
export interface HaEntityPickerEntity {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name?: string;
        items?: any[];
    };
}
export interface DebugConfig {
    [key: string]: {
        enabled: boolean;
        subsystems: {
            [key: string]: boolean;
        };
    };
}
/**
 * Parameter condition operation
 */
export type ParameterConditionOperator = 'equals' | 'not_equals' | 'contains' | 'exists' | 'is_empty' | 'greater_than' | 'less_than';
