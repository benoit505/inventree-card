import { html, TemplateResult } from "lit";
import { HomeAssistant } from "custom-card-helpers";
import { InventreeCardConfig, InventreeItem } from "../core/types";
import { renderInventreeItem } from "./item";
import { parseState } from "../utils/helpers";
import { styleMap } from "lit/directives/style-map.js";  // Note the .js extension

export const renderInventreeCard = (
    hass: HomeAssistant,
    config: InventreeCardConfig
): TemplateResult => {
    const layout = config.layout || {};
    
    console.debug('Card render - Layout settings:', {
        layout,
        transparent: layout.transparent,
        fullConfig: config
    });

    const state = hass.states[config.entity];
    if (!state) {
        return html`<div>Entity not found: ${config.entity}</div>`;
    }

    const gridSpacing = config.grid_spacing ?? 16;
    const itemHeight = config.item_height ?? 64;

    // Get items and ensure it's an array
    let items = parseState(hass, config.entity);
    console.debug('🎴 Card: Parsed items:', items);

    // Sort items if needed
    if (config.sort_by) {
        items = [...items].sort((a, b) => {
            let comparison = 0;
            
            switch (config.sort_by) {
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
            
            return config.sort_direction === 'asc' ? comparison : -comparison;
        });
    }

    return html`
        <ha-card style=${styleMap({
            background: layout.transparent ? 'transparent !important' : null
        })}>
            ${config.show_header ? html`
                <div class="card-header">
                    ${config.title || 'Inventory'}
                </div>
            ` : ''}
            <div class="grid" 
                style=${styleMap({
                    '--columns': config.columns || 2,
                    '--grid-spacing': `${gridSpacing}px`,
                    '--item-height': `${itemHeight}px`
                })}
            >
                ${items.length > 0 
                    ? items.map(item => renderInventreeItem(item, hass, config))
                    : html`<div>No items to display</div>`
                }
            </div>
        </ha-card>
    `;
};
