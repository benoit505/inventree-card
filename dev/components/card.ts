import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard } from "custom-card-helpers";
import { InventreeCardConfig, InventreeItem } from "../types/types";
import { cardStyles } from "../styles/card";

export const CARD_NAME = "inventree-card";

export class InventreeCard extends LitElement implements LovelaceCard {
    static styles = cardStyles;
    
    @property({ attribute: false }) public hass!: HomeAssistant;
    @state() private _config?: InventreeCardConfig;

    private getStockClass(item: InventreeItem): string {
        if (item.in_stock <= 0) return 'out-of-stock';
        if (item.in_stock < item.minimum_stock) return 'low-stock';
        return 'good-stock';
    }

    private sortItems(items: InventreeItem[]): InventreeItem[] {
        if (!this._config) return items;

        const { sort_by = 'name', sort_direction = 'asc' } = this._config;
        
        return [...items].sort((a, b) => {
            let comparison = 0;
            
            switch (sort_by) {
                case 'stock':
                    comparison = a.in_stock - b.in_stock;
                    break;
                case 'minimum':
                    comparison = a.minimum_stock - b.minimum_stock;
                    break;
                case 'name':
                default:
                    comparison = a.name.localeCompare(b.name);
                    break;
            }
            
            return sort_direction === 'asc' ? comparison : -comparison;
        });
    }

    private _handleItemClick(item: InventreeItem): void {
        console.log('Item clicked:', item);
    }

    public getCardSize(): number | Promise<number> {
        if (!this._config) return 1;
        let size = this._config.show_header ? 1 : 0;
        const itemCount = this.hass?.states[this._config.entity]?.state 
            ? JSON.parse(this.hass.states[this._config.entity].state).length 
            : 0;
        const columns = this._config.columns || 2;
        const rows = Math.ceil(itemCount / columns);
        size += rows * 2;
        return size;
    }

    public static getStubConfig(): InventreeCardConfig {
        return {
            type: `custom:${CARD_NAME}`,
            entity: "",
            show_header: true,
            show_low_stock: true
        };
    }

    public setConfig(config: InventreeCardConfig): void {
        if (!config.entity) {
            throw new Error("Please define an entity");
        }
        this._config = config;
        this.requestUpdate();
    }

    protected render() {
        if (!this._config || !this.hass) {
            return html`<div>Invalid configuration</div>`;
        }

        const state = this.hass.states[this._config.entity];
        if (!state) {
            return html`<div>Entity not found: ${this._config.entity}</div>`;
        }

        // Get grid spacing and item height from config with defaults
        const gridSpacing = this._config.grid_spacing ?? 16;
        const itemHeight = this._config.item_height ?? 64;

        console.log('Card render: State retrieved', {
            entityId: state.entity_id,
            state: state,
            parsedState: JSON.parse(state.state)
        });

        let items: InventreeItem[];
        try {
            items = JSON.parse(state.state);
            if (!Array.isArray(items)) {
                console.error('State is not an array:', items);
                return html`<div>Invalid state format</div>`;
            }
        } catch (e) {
            console.error('Failed to parse state:', e);
            return html`<div>Invalid state format</div>`;
        }

        const sortedItems = this.sortItems(items);

        return html`
            <ha-card>
                ${this._config.show_header ? html`
                    <div class="card-header">
                        ${this._config.title || 'Inventory'}
                    </div>
                ` : ''}
                <div class="grid" 
                    style="
                        --grid-spacing: ${gridSpacing}px;
                        --item-height: ${itemHeight}px;
                    "
                >
                    ${sortedItems.map((item: InventreeItem) => html`
                        <div class="item-frame">
                            <div class="main-box ${this.getStockClass(item)}">
                                <div class="name">${item.name}</div>
                                <div class="stock">
                                    In Stock: ${item.in_stock}
                                </div>
                                ${this._config?.show_minimum ? html`
                                    <div class="minimum">Minimum: ${item.minimum_stock}</div>
                                ` : ''}
                            </div>
                        </div>
                    `)}
                </div>
            </ha-card>
        `;
    }
}

customElements.define(CARD_NAME, InventreeCard);
