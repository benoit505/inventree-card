import { InventreeCardConfig } from "../types";
export declare const SETTINGS_SCHEMA: {
    readonly core: {
        readonly entity: true;
        readonly title: true;
        readonly view_type: true;
    };
    readonly parts: {
        readonly selected_entities: true;
        readonly show_stock: true;
        readonly show_description: true;
        readonly show_category: true;
    };
    readonly display: {
        readonly show_header: true;
        readonly show_image: true;
        readonly show_name: true;
        readonly show_stock: true;
        readonly show_description: true;
        readonly show_parameters: true;
        readonly show_buttons: true;
        readonly show_actions: true;
        readonly show_stock_indicators: true;
        readonly image_only: true;
        readonly show_stock_status_border: true;
        readonly show_stock_status_colors: true;
        readonly show_related_parts: true;
        readonly show_part_details_component: true;
        readonly show_stock_status_border_for_templates: true;
        readonly show_buttons_for_variants: true;
        readonly show_part_details_component_for_variants: true;
        readonly show_image_for_variants: true;
    };
    readonly layout: {
        readonly columns: true;
        readonly grid_spacing: true;
        readonly item_height: true;
        readonly min_height: true;
        readonly max_height: true;
        readonly transparent: true;
    };
    readonly stock: {
        readonly show_low_stock: true;
        readonly show_minimum: true;
        readonly show_history: true;
        readonly enable_quick_add: true;
        readonly show_stock_warning: true;
    };
    readonly style: {
        readonly background: true;
        readonly spacing: true;
        readonly image_size: true;
    };
    readonly thumbnails: {
        readonly mode: true;
        readonly custom_path: true;
        readonly local_path: true;
        readonly enable_bulk_import: true;
    };
    readonly variants: {
        readonly show_variants: true;
        readonly auto_detect: true;
        readonly view_type: true;
    };
    readonly buttons: {
        readonly preset: true;
        readonly custom_buttons: true;
    };
    readonly parameters: {
        readonly enabled: true;
        readonly show_section: true;
        readonly collapsed_by_default: true;
        readonly layout: true;
        readonly conditions: true;
        readonly actions: true;
    };
    readonly services: {
        readonly wled: {
            readonly enabled: true;
            readonly entity_id: true;
            readonly ip_address: true;
            readonly parameter_name: true;
            readonly effect: true;
            readonly intensity: true;
            readonly palette: true;
            readonly speed: true;
            readonly segment_id: true;
            readonly reverse: true;
        };
        readonly print: {
            readonly enabled: true;
            readonly template_id: true;
            readonly plugin: true;
        };
    };
    readonly debugging: {
        readonly debug: true;
        readonly debug_api: true;
        readonly debug_parameters: true;
        readonly debug_websocket: true;
        readonly debug_layouts: true;
        readonly debug_rendering: true;
    };
    readonly direct_api: {
        readonly enabled: true;
        readonly url: true;
        readonly api_key: true;
        readonly method: true;
        readonly websocket_url: true;
        readonly idle_render_time: true;
        readonly performance: {
            readonly api: {
                readonly throttle: true;
                readonly cacheLifetime: true;
                readonly batchSize: true;
                readonly failedRequestRetryDelaySeconds: true;
            };
            readonly websocket: {
                readonly reconnectInterval: true;
                readonly messageDebounce: true;
            };
        };
    };
    readonly performance: {
        readonly rendering: {
            readonly debounceTime: true;
            readonly idleRenderInterval: true;
            readonly maxRenderFrequency: true;
        };
        readonly parameters: {
            readonly updateFrequency: true;
            readonly conditionEvalFrequency: true;
        };
    };
};
export declare const DEFAULT_CONFIG: Partial<InventreeCardConfig>;
export declare const validateSetting: (setting: string) => boolean;
export declare const getSettingGroup: (setting: string) => string | null;
