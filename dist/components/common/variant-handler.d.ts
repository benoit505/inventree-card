import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig, ProcessedVariant } from '../../types';
export declare class VariantHandler {
    private hass;
    private variantService;
    private logger;
    constructor(hass: HomeAssistant);
    static processItems(items: InventreeItem[], config: InventreeCardConfig): (InventreeItem | ProcessedVariant)[];
    static isVariant(item: InventreeItem | ProcessedVariant): item is ProcessedVariant;
    static calculateTotalStock(template: InventreeItem, variants: InventreeItem[]): number;
    processVariants(items: InventreeItem[], config?: InventreeCardConfig): InventreeItem[];
    getTotalStock(template: InventreeItem, variants: InventreeItem[]): number;
}
