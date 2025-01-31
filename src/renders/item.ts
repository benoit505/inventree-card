import { html, TemplateResult } from "lit";
import { HomeAssistant } from "custom-card-helpers";
import { InventreeItem, InventreeCardConfig } from "../types";

export const getStockClass = (item: InventreeItem): string => {
    if (item.in_stock <= 0) return 'out-of-stock';
    if (item.in_stock < item.minimum_stock) return 'low-stock';
    return 'good-stock';
};

export const renderInventreeItem = (
    item: InventreeItem,
    hass: HomeAssistant,
    config: InventreeCardConfig
): TemplateResult => {
    const isLowStock = item.in_stock < item.minimum_stock;
    
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
        <div class="item-frame ${isLowStock && config.show_low_stock ? 'low-stock' : ''} ${config.compact_view ? 'compact' : ''}">
            <div class="main-box ${getStockClass(item)}">
                <div class="content">
                    ${item.thumbnail ? html`
                        <div class="image-container">
                            <img 
                                src="${item.thumbnail}" 
                                alt="${item.name}"
                                loading="lazy"
                                @error=${(e: Event) => {
                                    // Hide broken images
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ` : ''}
                    <div class="name">${item.full_name || item.name}</div>
                    ${item.description ? html`
                        <div class="description">${item.description}</div>
                    ` : ''}
                    <div class="stock-info">
                        <div class="stock">In Stock: ${item.in_stock}</div>
                        ${item.allocated_to_build_orders > 0 ? html`
                            <div class="allocated">Allocated: ${item.allocated_to_build_orders}</div>
                        ` : ''}
                        ${item.ordering > 0 ? html`
                            <div class="ordering">On Order: ${item.ordering}</div>
                        ` : ''}
                    </div>
                    ${config.show_minimum ? html`
                        <div class="minimum">Minimum: ${item.minimum_stock}</div>
                    ` : ''}
                    <div class="badges">
                        ${item.purchaseable ? html`<span class="badge purchaseable">Purchaseable</span>` : ''}
                        ${item.salable ? html`<span class="badge salable">Salable</span>` : ''}
                        ${!item.active ? html`<span class="badge inactive">Inactive</span>` : ''}
                    </div>
                </div>
            </div>
            ${(config.enable_quick_add || config.enable_print_labels) ? html`
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
                        <button class="adjust-button print" @click=${handlePrint}>
                            🖨️
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
};
