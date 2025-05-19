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
    view_type: 'detail',
    selected_entities: [],
    columns: 3,
    grid_spacing: 8,
    item_height: 170,
    parts_config: {
        entities: [],  // Required empty array for entities
        show_stock: true,
        show_description: false,
        show_category: false
    },
    style: {
        background: "var(--card-background-color)",
        spacing: 8,
        image_size: 50
    },
    thumbnails: {
        mode: "auto",
        custom_path: "/local/inventree_thumbs",
        local_path: "/local/inventree_thumbs",
        enable_bulk_import: false
    },
    buttons: {
        preset: 'default',
        custom_buttons: []
    },
    parameters: {
        enabled: false,
        show_section: true,
        collapsed_by_default: false,
        group_parameters: false,
        conditions: [],
        actions: []
    },
    services: {
        wled: {
            enabled: false,
            entity_id: 'light.wled_inventory',
            ip_address: '',
            parameter_name: 'led_xaxis',
            effect: 'Scan',
            intensity: 128,
            palette: 'Red',
            speed: 128,
            segment_id: 0,
            reverse: false
        },
        print: {
            enabled: false,
            template_id: 2,
            plugin: 'zebra'
        }
    },
    display: {
        show_header: true,
        show_image: true,
        show_name: true,
        show_stock: true,
        show_description: false,
        show_category: false,
        show_stock_status_border: true,
        show_stock_status_colors: true,
        show_parameters: false,
        show_buttons: true
    },
    variant_view_type: 'grid',
    auto_detect_variants: true,
    variant_groups: [],
    debug: false,
    debug_api: false,
    debug_parameters: false,
    debug_websocket: false,
    debug_layouts: false,
    debug_rendering: false,
    direct_api: {
        enabled: false,
        url: '',
        api_key: '',
        method: 'websocket',
        websocket_url: '',
        idle_render_time: 60,
        performance: {
            api: {
                throttle: 0.2,
                cacheLifetime: 60,
                batchSize: 20,
                failedRequestRetryDelaySeconds: 30
            },
            websocket: {
                reconnectInterval: 5000,
                messageDebounce: 50
            }
        }
    },
    performance: {
        rendering: {
            debounceTime: 50,
            idleRenderInterval: 5000,
            maxRenderFrequency: 10
        },
        parameters: {
            updateFrequency: 1000,
            conditionEvalFrequency: 1000
        }
    }
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