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
    name: string;
    in_stock: number;
    minimum_stock: number;
    image?: string;
    thumbnail?: string;
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
}

export interface FormSchema {
    name: string;
    label: string;
    selector: {
        entity?: { domain: string };
        text?: Record<string, never>;
        boolean?: Record<string, never>;
        number?: { min: number; max: number; step: number };
        select?: {
            options: Array<{ value: string; label: string }>;
        };
    };
}
