import { html, TemplateResult } from "lit";
import { HomeAssistant } from "custom-card-helpers";
import { InventreeCardConfig, InventreeItem } from "inventree-card/core/types";
import { 
    renderInventreeItem, 
    processVariants, 
    renderVariantGrid, 
    renderVariantList, 
    renderVariantTree,
    ProcessedVariant
} from "./item";
import { parseState } from "inventree-card/utils/helpers";
import { styleMap } from "lit/directives/style-map.js";  // Note the .js extension
import { ParameterService } from "inventree-card/services/parameter-service";
import { Logger } from "inventree-card/utils/logger";

// Add type for variant display modes
type VariantDisplayMode = 'grid' | 'list' | 'tree';

/**
 * @deprecated This render function is no longer used. Use the component-based architecture instead.
 */
export const renderCard = (config: InventreeCardConfig, hass: HomeAssistant): TemplateResult => {
    if (!config || !config.entity) {
        return html`<hui-warning>Entity not specified</hui-warning>`;
    }
    
    const state = hass.states?.[config.entity];
    if (!state) {
        return html`<hui-warning>Entity ${config.entity} not found</hui-warning>`;
    }
    
    // Use non-null assertion since we've checked config.entity is not undefined
    let items = parseState(hass, config.entity);
    
    const layout = config.layout || {};
    
    console.debug('Card render - Layout settings:', {
        layout,
        transparent: layout.transparent,
        fullConfig: config
    });

    const gridSpacing = config.grid_spacing ?? 16;
    const itemHeight = config.item_height ?? 64;

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

    if (config.variants?.show_variants) {
        const variantGroups = processVariants(items, config);
        
        if (variantGroups.length > 0) {
            const displayMode = config.variants.view_type || 'grid';
            const renderMethod = {
                'grid': renderVariantGrid,
                'list': renderVariantList,
                'tree': renderVariantTree
            }[displayMode];

            return html`
                <ha-card style=${styleMap({
                    background: layout.transparent ? 'transparent !important' : null
                })}>
                    ${config.show_header ? html`
                        <div class="card-header">
                            ${config.title || 'Inventory'}
                        </div>
                    ` : ''}
                    <div class="card-content">
                        ${variantGroups.map((group: ProcessedVariant) => renderMethod(group, hass, config))}
                    </div>
                </ha-card>
            `;
        }
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
