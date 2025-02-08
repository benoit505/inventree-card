import { html, TemplateResult } from "lit";
import { HomeAssistant } from "custom-card-helpers";
import { InventreeItem, InventreeCardConfig, InventreeParameter } from "../core/types";
import { styleMap } from "lit/directives/style-map.js";
import { DEFAULT_CONFIG } from "../core/settings";
import { ThumbnailService, StateService } from "../services";

export const getStockClass = (item: InventreeItem): string => {
    if (item.in_stock <= 0) return 'out-of-stock';
    if (item.in_stock < item.minimum_stock) return 'low-stock';
    return 'good-stock';
};

export const getThumbnailPath = (item: InventreeItem, config: InventreeCardConfig): string => {
    const thumbnails = {
        ...DEFAULT_CONFIG.thumbnails,
        ...(config.thumbnails || {})
    };
    
    if (thumbnails.mode === 'manual' && thumbnails.custom_path) {
        return `${thumbnails.custom_path}/part_${item.pk}.png`;
    }
    
    return `${thumbnails.local_path}/part_${item.pk}.png`;
};

export const renderInventreeItem = (
    item: InventreeItem,
    hass: HomeAssistant,
    config: InventreeCardConfig
): TemplateResult => {
    const display = config.display || {};
    const style = config.style || {};
    const layout = config.layout || {};
    
    console.debug('Item render - Layout settings:', {
        layout,
        transparent: layout.transparent,
        item: item.name
    });

    // Use ThumbnailService instead of direct path construction
    const thumbnailPath = ThumbnailService.getThumbnailPath(item, config);
    
    // Use StateService for stock class
    const stockClass = StateService.getStockClass(item);
    
    // If image_only is true, render just the image
    if (display.image_only) {
        return html`
            <div class="item-frame image-only" 
                style=${styleMap({
                    background: style.background || 'transparent',
                    padding: '0'
                })}
            >
                ${item.thumbnail && display.show_image ? html`
                    <div class="image-container" 
                        style=${styleMap({
                            height: `${style.image_size || 50}px`,
                            width: `${style.image_size || 50}px`
                        })}
                    >
                        <img src="${thumbnailPath}" alt="${item.name}" loading="lazy" />
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Regular item render with configurable elements
    const isLowStock = item.in_stock < item.minimum_stock;
    const transparentClass = layout.transparent ? 'transparent' : '';
    
    const handleAdjust = async (amount: number) => {
        console.debug('Adjusting stock:', { item: item.name, amount });
        try {
            await hass.callService('inventree', 'adjust_stock', {
                name: item.name,
                quantity: amount
            });
        } catch (e) {
            console.error('Failed to adjust stock:', e);
        }
    };
    
    const handlePrint = async () => {
        console.debug('Printing label:', { item_id: item.pk, name: item.name });
        try {
            await hass.callService('inventree', 'print_label', {
                item_id: item.pk,
                template_id: 2,  // Using default template ID
                plugin: 'zebra'
            });
        } catch (e) {
            console.error('Failed to print label:', e);
        }
    };
    
    return html`
        <div class="item-frame ${isLowStock && config.show_low_stock ? 'low-stock' : ''} 
                               ${config.compact_view ? 'compact' : ''} 
                               ${transparentClass}"
            style=${styleMap({
                background: layout.transparent ? 'transparent !important' : null,
                gap: `${style.spacing || 10}px`
            })}
        >
            <div class="main-box ${stockClass}"
                style=${styleMap({
                    background: layout.transparent ? 'transparent !important' : null
                })}
            >
                <div class="content">
                    ${item.thumbnail && display.show_image ? html`
                        <div class="image-container">
                            <img src="${thumbnailPath}" alt="${item.name}" loading="lazy" />
                        </div>
                    ` : ''}
                    
                    ${display.show_name ? html`
                        <div class="name">${item.full_name || item.name}</div>
                    ` : ''}

                    ${display.show_description && item.description ? html`
                        <div class="description">${item.description}</div>
                    ` : ''}

                    ${display.show_stock ? html`
                        <div class="stock-info">
                            <div class="stock">In Stock: ${item.in_stock}</div>
                            ${item.allocated_to_build_orders > 0 ? html`
                                <div class="allocated">Allocated: ${item.allocated_to_build_orders}</div>
                            ` : ''}
                            ${item.ordering > 0 ? html`
                                <div class="ordering">On Order: ${item.ordering}</div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${display.show_parameters && item.parameters ? html`
                        <div class="parameters">
                            ${item.parameters.map((param: InventreeParameter) => html`
                                <div class="parameter">
                                    ${param.template_detail.name}: ${param.template_detail.data || ''}
                                </div>
                            `)}
                        </div>
                    ` : ''}
                </div>
            </div>

            ${display.show_buttons ? html`
                <div class="button-container">
                    ${config.enable_quick_add ? html`
                        <button class="adjust-button minus" @click=${() => handleAdjust(-1)}>-1</button>
                        <div class="quick-add">
                            ${[1, 5, 10].map(amount => html`
                                <button class="adjust-button plus" @click=${() => handleAdjust(amount)}>
                                    +${amount}
                                </button>
                            `)}
                        </div>
                    ` : ''}
                    ${config.enable_print_labels ? html`
                        <button class="adjust-button print" @click=${handlePrint}>🖨️</button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
};
