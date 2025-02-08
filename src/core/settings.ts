import { InventreeCardConfig } from "./types";

// Core settings schema
export const SETTINGS_SCHEMA = {
    core: {
        type: true,
        entity: true,
        title: true
    },
    display: {
        show_header: true,
        compact_view: true,
        sort_by: true,
        sort_direction: true,
        grid_spacing: true,
        item_height: true,
        show_image: true,
        show_name: true,
        show_stock: true,
        show_description: true,
        show_parameters: true,
        show_buttons: true,
        image_only: true
    },
    layout: {
        columns: true,
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
        image_size: true,
        spacing: true
    },
    thumbnails: {
        mode: true,
        custom_path: true,
        local_path: true,
        enable_bulk_import: true
    }
} as const;

// Default values
export const DEFAULT_CONFIG: Partial<InventreeCardConfig> = {
    show_header: true,
    show_low_stock: true,
    show_minimum: true,
    columns: 2,
    sort_by: 'name',
    sort_direction: 'asc',
    compact_view: false,
    enable_quick_add: false,
    show_history: false,
    grid_spacing: 16,
    item_height: 64,
    layout: {
        min_height: 50,
        max_height: 500,
        transparent: false
    },
    display: {
        show_image: true,
        show_name: true,
        show_stock: true,
        show_description: false,
        show_parameters: false,
        show_buttons: true,
        image_only: false
    },
    style: {
        background: undefined,
        image_size: 50,
        spacing: 10
    },
    thumbnails: {
        mode: 'auto',
        custom_path: '',
        local_path: '/local/inventree_thumbs',
        enable_bulk_import: false
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