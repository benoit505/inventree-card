import { html, TemplateResult } from "lit";
import { HomeAssistant } from "custom-card-helpers";
import { InventreeItem, InventreeCardConfig, InventreeParameter } from "inventree-card/core/types";
import { styleMap } from "lit/directives/style-map.js";
import { DEFAULT_CONFIG } from "inventree-card/core/settings";

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
                        <img src="${item.thumbnail}" alt="${item.name}" loading="lazy" />
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
            <div class="main-box ${getStockClass(item)}"
                style=${styleMap({
                    background: layout.transparent ? 'transparent !important' : null
                })}
            >
                <div class="content">
                    ${item.thumbnail && display.show_image ? html`
                        <div class="image-container">
                            <img src="${item.thumbnail}" alt="${item.name}" loading="lazy" />
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
                            ${(item.allocated_to_build_orders ?? 0) > 0 ? html`
                                <div class="allocated">Allocated: ${item.allocated_to_build_orders}</div>
                            ` : ''}
                            ${(item.ordering ?? 0) > 0 ? html`
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

            ${display.show_actions ? html`
                <div class="buttons">
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

// Make ProcessedVariant exportable
export interface ProcessedVariant {
    template: InventreeItem;
    variants: InventreeItem[];
}

export const processVariants = (items: InventreeItem[], config: InventreeCardConfig): ProcessedVariant[] => {
    if (!config.variants?.show_variants) return [];

    // If auto-detect is enabled, find all templates and their variants
    if (config.variants.auto_detect) {
        return items
            .filter(item => item.is_template && !item.variant_of)
            .map(template => ({
                template,
                variants: items.filter(item => item.variant_of === template.pk)
            }));
    }

    // Otherwise, use the specified main_pk
    if (config.variants?.main_pk) {
        const template = items.find(item => item.pk === config.variants?.main_pk);
        if (template) {
            return [{
                template,
                variants: items.filter(item => item.variant_of === template.pk)
            }];
        }
    }

    return [];
};

export const renderVariantGrid = (
    variant: ProcessedVariant, 
    hass: HomeAssistant,
    config: InventreeCardConfig
): TemplateResult => {
    return html`
        <div class="variant-grid">
            <div class="template-item">
                ${renderInventreeItem(variant.template, hass, config)}
            </div>
            <div class="variants-container">
                ${variant.variants.map(item => html`
                    <div class="variant-item grid-item">
                        <img src="${item.thumbnail}" alt="${item.name}" class="variant-thumbnail">
                        <div class="variant-details">
                            <h4>${item.name}</h4>
                            <span class="stock-level">${item.in_stock} ${item.units || ''}</span>
                        </div>
                    </div>
                `)}
            </div>
        </div>
    `;
};

export const renderVariantList = (
    variant: ProcessedVariant, 
    hass: HomeAssistant,
    config: InventreeCardConfig
): TemplateResult => {
    return html`
        <div class="variant-list">
            <div class="template-item">
                <h3>${variant.template.name}</h3>
                <div class="template-details">
                    <span>Total Stock: ${variant.template.total_in_stock} ${variant.template.units || ''}</span>
                    <span>Description: ${variant.template.description || ''}</span>
                </div>
            </div>
            ${variant.variants.map(item => html`
                <div class="variant-item list-item">
                    <div class="variant-info">
                        <h4>${item.name}</h4>
                        <div class="variant-parameters">
                            <span>Stock: ${item.in_stock} ${item.units || ''}</span>
                            <span>Min Stock: ${item.minimum_stock}</span>
                            <span>Status: ${item.active ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                </div>
            `)}
        </div>
    `;
};

export const renderVariantTree = (
    variant: ProcessedVariant, 
    hass: HomeAssistant,
    config: InventreeCardConfig
): TemplateResult => {
    return html`
        <div class="variant-tree">
            <div class="template-item tree-root">
                <i class="tree-icon">📦</i>
                <div class="template-content">
                    <h3>${variant.template.name}</h3>
                    <span class="template-type">Template Part</span>
                </div>
            </div>
            <div class="variant-children">
                ${variant.variants.map(item => html`
                    <div class="variant-item tree-item">
                        <div class="tree-line"></div>
                        <i class="tree-icon">└─</i>
                        <div class="variant-content">
                            <h4>${item.name}</h4>
                            <span class="variant-stock">${item.in_stock} ${item.units || ''}</span>
                            <span class="variant-type">${item.is_template ? 'Sub-Template' : 'Variant'}</span>
                        </div>
                    </div>
                `)}
            </div>
        </div>
    `;
};
