import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";

export interface InventreeItem {
    name: string;
    in_stock: number;
    minimum_stock: number;
}

export interface InventreeCardConfig {
    type: string;
    entity: string;
    title?: string;
    show_header?: boolean;
    show_low_stock?: boolean;
    show_minimum?: boolean;
    columns?: number;
    compact_view?: boolean;
    sort_by?: 'name' | 'stock' | 'minimum';
    sort_direction?: 'asc' | 'desc';
    grid_spacing?: number;
    item_height?: number;
    enable_quick_add?: boolean;
    show_history?: boolean;
    show_stock_warning?: boolean;
}

export type InventreeCardConfigKey = keyof InventreeCardConfig;
export type SettingGroup = 'required' | 'display' | 'behavior' | 'other'; 