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
                    <div class="name">${item.name}</div>
                    <div class="stock">
                        In Stock: ${item.in_stock}
                    </div>
                    ${config.show_minimum ? html`
                        <div class="minimum">Minimum: ${item.minimum_stock}</div>
                    ` : ''}
                    ${config.show_history ? html`
                        <div class="history">
                            📊 History placeholder
                        </div>
                    ` : ''}
                </div>
            </div>
            ${config.enable_quick_add ? html`
                <div class="button-container">
                    <button class="adjust-button minus" @click=${() => handleAdjust(-1)}>-1</button>
                    <div class="quick-add">
                        ${[1, 5, 10].map(amount => html`
                            <button class="adjust-button plus" @click=${() => handleAdjust(amount)}>
                                +${amount}
                            </button>
                        `)}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};
