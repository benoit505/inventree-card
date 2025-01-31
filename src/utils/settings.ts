import { InventreeCardConfig } from "../types";

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
        item_height: true
    },
    layout: {
        columns: true
    },
    stock: {
        show_low_stock: true,
        show_minimum: true,
        show_history: true,
        enable_quick_add: true,
        show_stock_warning: true
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
    item_height: 64
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