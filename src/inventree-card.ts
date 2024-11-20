declare global {
  interface Window {
      customCards: Array<{
          type: string;
          name: string;
          description: string;
      }>;
  }
}

console.info('InvenTree Card: Starting initialization');

import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "custom-card-helpers";

interface InventreeCardConfig extends LovelaceCardConfig {
entity: string;
show_low_stock?: boolean;
show_minimum?: boolean;
columns?: number;
}

console.info('InvenTree Card: Imports loaded');

interface InventoryItem {
name: string;
in_stock: number;
minimum_stock: number;
}

@customElement('inventree-card')
export class InventreeCard extends LitElement implements LovelaceCard {
@property({ attribute: false }) 
public hass?: HomeAssistant;

@state() 
private config?: InventreeCardConfig;

@state()
private items: InventoryItem[] = [];

static override styles = css`
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
  }

  .item-frame {
    background: var(--card-background-color);
    border-radius: 12px;
    border: 1px solid var(--divider-color);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .main-box {
    background: var(--secondary-background-color);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  .main-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .adjust-button {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease-in-out;
  }

  .adjust-button:active {
    transform: scale(0.9);
    background: var(--secondary-background-color);
  }

  .adjust-button.minus {
    color: var(--error-color);
  }

  .adjust-button.plus {
    color: var(--success-color);
  }

  .adjust-button:hover {
    background: var(--secondary-background-color);
  }

  .name {
    font-size: 1.1em;
    font-weight: 500;
  }

  .stock {
    font-weight: 500;
    margin: 8px 0;
  }

  .minimum {
    font-size: 0.9em;
    opacity: 0.8;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }

  .item-frame.low-stock .stock {
    color: var(--error-color);
  }

  .item-frame.low-stock {
    border-color: var(--error-color);
    box-shadow: 0 0 0 1px var(--error-color);
  }
`;

constructor() {
  super();
  console.info('InvenTree Card: Constructor called');
}

public static getStubConfig(): object {
  return {
    type: "custom:inventree-card",
    entity: "",
    show_low_stock: true,
    show_minimum: true,
    columns: 3
  };
}

setConfig(config: InventreeCardConfig): void {
  if (!config.entity) {
    throw new Error("Please define an entity");
  }
  this.config = {
    show_low_stock: true,
    show_minimum: true,
    columns: 3,
    ...config
  };
}

getCardSize(): number {
  return 3;
}

protected shouldUpdate(changedProps: Map<string | number | symbol, unknown>): boolean {
  if (changedProps.has('hass')) {
    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    const newState = this.hass?.states[this.config?.entity || ''];
    const oldState = oldHass?.states[this.config?.entity || ''];
    
    return JSON.stringify(newState) !== JSON.stringify(oldState);
  }
  return true;
}

private _renderItem(item: InventoryItem): TemplateResult {
  const isLowStock = item.in_stock <= item.minimum_stock;
  
  return html`
    <div class="item-frame ${isLowStock ? 'low-stock' : ''}">
      <div class="main-box">
        <div class="name">${item.name}</div>
        <div class="stock">In Stock: ${item.in_stock}</div>
        ${this.config?.show_minimum ? html`
          <div class="minimum">Minimum: ${item.minimum_stock}</div>
        ` : ''}
      </div>
      <div class="button-container">
        <button class="adjust-button minus"
                @click=${(e: Event) => this._handleStockAdjust(e, item.name, -1)}>
          -
        </button>
        <button class="adjust-button plus"
                @click=${(e: Event) => this._handleStockAdjust(e, item.name, 1)}>
          +
        </button>
      </div>
    </div>
  `;
}

private async _handleStockAdjust(e: Event, itemName: string, quantity: number): Promise<void> {
  e.stopPropagation();
  if (this.hass) {
    try {
      await this.hass.callService('inventree', 'adjust_stock', {
        name: itemName,
        quantity: quantity
      });
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  }
}

protected render(): TemplateResult {
  console.debug('=== RENDER START ===');
  console.debug('Component state:', {
      hass: !!this.hass,
      config: this.config,
      entity: this.config?.entity
  });

  if (!this.hass || !this.config || !this.config.entity) {
      console.warn('Missing required properties:', {
          hass: !!this.hass,
          config: !!this.config,
          entity: this.config?.entity
      });
      return html`<div>Please configure card entity</div>`;
  }

  const state = this.config.entity in this.hass.states 
      ? this.hass.states[this.config.entity] 
      : undefined;

  console.debug('Entity state:', state);
  console.debug('Entity attributes:', state?.attributes);

  if (!state) {
      console.warn(`Entity ${this.config.entity} not found in hass.states`);
      return html`<div>Entity not found: ${this.config.entity}</div>`;
  }

  const items: InventoryItem[] = state.attributes?.items || [];
  console.debug('Parsed items:', items);
  console.debug('=== RENDER END ===');

  return html`
  <div class="grid">
    ${Array.isArray(items) 
      ? items.map((item: InventoryItem) => this._renderItem(item))
      : html`<div>No items found</div>`
    }
  </div>
`;
}
}

console.info('InvenTree Card: Class defined');

if (!window.customCards) {
  console.info('InvenTree Card: Initializing customCards array');
  window.customCards = [];
}

window.customCards.push({
  type: "custom:inventree-card",
  name: "InvenTree Card",
  description: "Display and manage InvenTree inventory"
});

console.info('InvenTree Card: Registration complete');