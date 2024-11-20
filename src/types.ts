import { LitElement } from 'lit';
import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'inventree-card-editor': LovelaceCardEditor;
    'inventree-card': LovelaceCard;
    'hui-error-card': LovelaceCard;
  }
  interface Window {
    customCards: Array<{
      type: string;
      name: string;
      description: string;
    }>;
  }
}

export interface InventreeItem {
  name: string;
  in_stock: number;
  minimum_stock: number;
}

export interface InventreeCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  entity: string;
  show_warning?: boolean;
  show_error?: boolean;
  show_low_stock?: boolean;
  show_minimum?: boolean;
  columns?: number;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
