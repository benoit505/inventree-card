// src/editor.ts
import { LitElement, html, css, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { InventreeCardConfig } from './types';

@customElement('inventree-card-editor')
export class InventreeCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: InventreeCardConfig;
  @state() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: InventreeCardConfig): void {
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }
    return true;
  }

  protected render() {
    return html`
      <ha-form
        .schema=${[
          {
            name: 'entity',
            selector: {
              entity: {
                domain: 'sensor',
                filter: (entityId: string) => entityId.startsWith('sensor.inventree_')
              }
            }
          },
          {
            name: 'show_low_stock',
            selector: { boolean: {} }
          },
          {
            name: 'show_minimum',
            selector: { boolean: {} }
          }
        ]}
      ></ha-form>
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) return;

    const target = ev.target as any;
    const value = target.value ?? target.checked;
    const configValue = target.configValue;

    if (configValue) {
      if (value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
    .card-config {
      padding: 16px;
    }
    ha-formfield {
      display: block;
      margin: 8px 0;
    }
    ha-switch {
      margin-right: 8px;
    }
    ha-entity-picker {
      display: block;
      margin-bottom: 16px;
    }
  `;
}