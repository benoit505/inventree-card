import { LitElement } from 'lit';
import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

// Export the interface
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
        customCards: CustomCardEntry[];  // Use the interface here
    }
}

export interface InventreeItem {
    pk: number;
    name: string;
    in_stock: number;
    minimum_stock: number;
    image?: string;
    thumbnail?: string;
    active: boolean;
    assembly: boolean;
    category: number;
    category_name: string;
    component: boolean;
    description: string;
    full_name: string;
    IPN: string;
    purchaseable: boolean;
    salable: boolean;
    total_in_stock: number;
    unallocated_stock: number;
    allocated_to_build_orders: number;
    allocated_to_sales_orders: number;
    building: number;
    ordering: number;
    parameters?: InventreeParameter[];
}

export interface InventreeCardLayout {
    min_height?: number;
    max_height?: number;
    transparent?: boolean;
}

export interface InventreeCardDisplay {
    show_image?: boolean;
    show_name?: boolean;
    show_stock?: boolean;
    show_description?: boolean;
    show_parameters?: boolean;
    show_buttons?: boolean;
    image_only?: boolean;
}

export interface InventreeCardStyle {
    background?: string;
    image_size?: number;
    spacing?: number;
}

export interface ThumbnailConfig {
    mode: 'auto' | 'manual';  // Remove optional flag
    custom_path: string;      // Required for consistency
    local_path: string;       // Required for consistency
    enable_bulk_import: boolean; // Required for consistency
}

export interface InventreeCardConfig extends LovelaceCardConfig {
    type: string;
    entity: string;
    title?: string;
    show_header?: boolean;
    show_minimum?: boolean;
    show_low_stock?: boolean;
    columns?: number;
    compact_view?: boolean;
    sort_by?: 'name' | 'stock' | 'minimum';
    sort_direction?: 'asc' | 'desc';
    grid_spacing?: number;
    item_height?: number;
    enable_quick_add?: boolean;
    show_history?: boolean;
    show_stock_warning?: boolean;
    layout?: InventreeCardLayout;
    display?: InventreeCardDisplay;
    style?: InventreeCardStyle;
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
        select?: {
            options: Array<{ value: string; label: string }>;
        };
    };
    type?: string;
    schema?: FormSchemaItem[];
}

export interface FormSchema extends FormSchemaItem {}

export interface InventreeParameter {
    template_detail: {
        name: string;
        data?: string | number;
    };
}
