import { InventreeCardConfig } from "../types";

// Core settings schema
export const SETTINGS_SCHEMA = {
    core: {
        entity: true,
        title: true,
        view_type: true,
    },
    parts: {
        selected_entities: true,  // Add this for parts view
        show_stock: true,
        show_description: true,
        show_category: true,
    },
    display: {
        show_header: true,
        show_image: true,
        show_name: true,
        show_stock: true,
        show_description: true,
        show_parameters: true,
        show_buttons: true,
        show_actions: true,
        show_stock_indicators: true,
        image_only: true,
        show_stock_status_border: true,
        show_stock_status_colors: true,
        show_related_parts: true,
        show_part_details_component: true,
        show_stock_status_border_for_templates: true,
        show_buttons_for_variants: true,
        show_part_details_component_for_variants: true,
        show_image_for_variants: true,
    },
    layout: {
        columns: true,
        grid_spacing: true,
        item_height: true,
        min_height: true,
        max_height: true,
        transparent: true
    },
    stock: {
        show_low_stock: true,
        show_minimum: true,
        show_history: true,
        enable_quick_add: true,
        show_stock_warning: true
    },
    style: {
        background: true,
        spacing: true,
        image_size: true
    },
    thumbnails: {
        mode: true,
        custom_path: true,
        local_path: true,
        enable_bulk_import: true
    },
    variants: {
        show_variants: true,
        auto_detect: true,
        view_type: true
    },
    buttons: {
        preset: true,
        custom_buttons: true
    },
    parameters: {
        enabled: true,
        show_section: true,
        collapsed_by_default: true,
        layout: true,
        conditions: true,
        actions: true
    },
    services: {
        wled: {
            enabled: true,
            entity_id: true,
            ip_address: true,
            parameter_name: true,
            effect: true,
            intensity: true,
            palette: true,
            speed: true,
            segment_id: true,
            reverse: true
        },
        print: {
            enabled: true,
            template_id: true,
            plugin: true
        }
    },
    debugging: {
        debug: true,
        debug_api: true,
        debug_parameters: true,
        debug_websocket: true,
        debug_layouts: true,
        debug_rendering: true
    },
    direct_api: {
        enabled: true,
        url: true,
        api_key: true,
        method: true,
        websocket_url: true,
        idle_render_time: true,
        performance: {
            api: {
                throttle: true,
                cacheLifetime: true,
                batchSize: true,
                failedRequestRetryDelaySeconds: true
            },
            websocket: {
                reconnectInterval: true,
                messageDebounce: true
            }
        }
    },
    performance: {
        rendering: {
            debounceTime: true,
            idleRenderInterval: true,
            maxRenderFrequency: true
        },
        parameters: {
            updateFrequency: true,
            conditionEvalFrequency: true
        }
    }
} as const;

// Default values
export const DEFAULT_CONFIG: Partial<InventreeCardConfig> = {
    // Core fields initialized by getStubConfig: type, name
    // 'entity' is also handled by getStubConfig for initial data_sources population

    view_type: 'detail', // Default view

    // NEW: data_sources - matches structure in types.d.ts and editor
    data_sources: {
        inventree_hass_sensors: [], // Populated by getStubConfig if an entity is found
        ha_entities: [],
        inventree_pks: [],
        inventree_parameters: [],
        inventree_parameters_to_fetch: [],
        inventree_pk_thumbnail_overrides: [], // Initialize new field
        // api config is under direct_api
    },

    // NEW: layout_options - replaces top-level layout fields
    layout_options: {
        columns: 3,
        grid_spacing: 8,
        item_height: 170,
        // min_height, max_height, transparent are part of InventreeCardLayout,
        // which is not directly part of InventreeCardConfig.
        // If needed for a specific layout, they should be within its specific options object.
    },

    // UPDATED: display - align with getStubConfig and ensure all DisplayConfig fields are present
    display: {
        show_header: true,
        show_image: true,
        show_name: true,
        show_stock: true,
        show_description: false,
        show_category: false,
        show_ipn: false,
        show_location: false,
        show_supplier: false,
        show_manufacturer: false,
        show_notes: false,
        show_buttons: true, // Corresponds to interactions.buttons area
        show_stock_status_border: true,
        show_stock_status_colors: true,
        show_related_parts: false,
        show_parameters: true, // Toggle for a dedicated parameters display section
        show_part_details_component: true,
        // Fields for variants (if variants view is used)
        show_stock_status_border_for_templates: false, // Example, adjust as needed
        show_buttons_for_variants: true,
        show_part_details_component_for_variants: true,
        show_image_for_variants: true,
        show_stock_for_variants: true,
        show_name_for_variants: true,
    },

    // UPDATED: direct_api - keep as is from previous DEFAULT_CONFIG, ensure it matches DirectApiConfig
    direct_api: {
        enabled: false,
        url: '',
        api_key: '',
        method: 'websocket', // Default method
        websocket_url: '',   // Default empty
        idle_render_time: 60,
        // performance sub-config for direct_api specific overrides
        performance: { // This is DirectApiConfig.performance
            api: { // Matches PerformanceConfig.api
                throttle: 0.2, // Default API throttle (seconds)
                cacheLifetime: 60, // Default API cache lifetime (seconds)
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30,
            },
            websocket: { // Matches PerformanceConfig.websocket
                reconnectInterval: 5000,
                messageDebounce: 50,
            },
            // No rendering or parameters sub-sections here for direct_api.performance
        }
    },

    // UPDATED: parameters - for the display section, not conditional logic rules
    parameters: { // This is ParameterConfig from types.d.ts
        enabled: true, // Whether the "Parameters" display section is enabled at all
        show_section: true, // If enabled, should it be shown (can be overridden by conditional logic)
        collapsed_by_default: false,
        group_parameters: false,
        // conditions and actions are REMOVED (moved to conditional_logic and interactions)
        filter_fallback_mode: 'all',
    },

    // NEW: conditional_logic - for React Query Builder rules
    conditional_logic: { // This is ConditionalLogicConfig from types.d.ts
        definedLogics: [], // Initialize with no defined logic blocks
    },
    
    // UPDATED: style - align with getStubConfig and StyleConfig
    style: {
        background: 'var(--ha-card-background, var(--card-background-color, white))',
        spacing: 8,
        image_size: 50
    },

    // NEW: interactions - replaces top-level 'buttons' and 'services'
    interactions: { // This is InteractionsConfig from types.d.ts
        buttons: [] // Initialize with no custom actions
    },
    
    // REMOVED: filters (top-level FilterConfig[]) - if needed, should be part of conditional_logic or a new transformation section

    // UPDATED: performance - main performance settings for the card
    performance: { // This is PerformanceConfig from types.d.ts
        rendering: {
            debounceTime: 50,
            idleRenderInterval: 5000,
            maxRenderFrequency: 10
        },
        api: { // General API settings (can be overridden by direct_api.performance.api)
            throttle: 0.2, // Default API throttle (seconds)
            cacheLifetime: 60, // Default API cache lifetime (seconds)
            batchSize: 20,
            failedRequestRetryDelaySeconds: 30,
        },
        websocket: { // General WebSocket settings (can be overridden by direct_api.performance.websocket)
            reconnectInterval: 5000,
            messageDebounce: 50
        },
        parameters: { // For parameter data fetching and condition evaluation engine
            updateFrequency: 1000,
            conditionEvalFrequency: 1000
        }
    },

    // Debug flags
    debug: false,
    debug_verbose: false,
    // debug_hierarchical is not included in stub, initialized on first use if needed by logger
    show_debug: false, // For the debug UI panel

    // Legacy fields to be explicitly REMOVED from DEFAULT_CONFIG:
    // selected_entities: [], // Now under data_sources.inventree_hass_sensors or ha_entities
    // columns: 3, // Now under layout_options
    // grid_spacing: 8, // Now under layout_options
    // item_height: 170, // Now under layout_options
    // parts_config: {}, // Legacy
    // thumbnails: {}, // Legacy, or needs re-evaluation for new structure
    // buttons: {}, // Legacy (top-level), replaced by interactions
    // services: {}, // Legacy, replaced by interactions
    // variant_view_type: 'grid', // Should be part of a specific layout's config if needed, or general display
    // auto_detect_variants: true, // Logic for this should be handled by data processing or variant layout
    // variant_groups: [], // Legacy

    // Ensure any other InventreeCardConfig fields from types.d.ts have defaults if not covered by getStubConfig
    // custom_view: undefined, // Example, if custom_view had a default
};

// Validation helper
export const validateSetting = (setting: string): boolean => {
    return Object.values(SETTINGS_SCHEMA).some(group => setting in group);
};

// Get setting group
export const getSettingGroup = (setting: string): string | null => {
    for (const [groupName, groupSettings] of Object.entries(SETTINGS_SCHEMA)) {
        if (setting in groupSettings) {
            return groupName;
        }
    }
    return null;
}; 