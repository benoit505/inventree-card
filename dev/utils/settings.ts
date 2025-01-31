import { InventreeCardConfig, InventreeCardConfigKey, SettingGroup } from "../types/types";

export function validateSetting(setting: InventreeCardConfigKey, value: any): boolean {
    switch (setting) {
        case 'entity':
            return typeof value === 'string' && value.length > 0;
        case 'title':
            return typeof value === 'string';
        case 'show_header':
        case 'show_low_stock':
        case 'show_minimum':
        case 'compact_view':
        case 'enable_quick_add':
        case 'show_history':
        case 'show_stock_warning':
            return typeof value === 'boolean';
        case 'columns':
        case 'grid_spacing':
        case 'item_height':
            return typeof value === 'number' && value > 0;
        case 'sort_by':
            return ['name', 'stock', 'minimum'].includes(value);
        case 'sort_direction':
            return ['asc', 'desc'].includes(value);
        case 'type':
            return typeof value === 'string' && value.startsWith('custom:');
        default:
            return true;
    }
}

export function getSettingGroup(setting: InventreeCardConfigKey): SettingGroup {
    const groups: Record<InventreeCardConfigKey, SettingGroup> = {
        type: 'other',
        entity: 'required',
        title: 'display',
        show_header: 'display',
        show_low_stock: 'behavior',
        show_minimum: 'display',
        columns: 'display',
        compact_view: 'display',
        sort_by: 'behavior',
        sort_direction: 'behavior',
        grid_spacing: 'display',
        item_height: 'display',
        enable_quick_add: 'behavior',
        show_history: 'behavior',
        show_stock_warning: 'behavior'
    };
    return groups[setting];
} 