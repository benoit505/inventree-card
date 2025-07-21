import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, VariantGroup, InventreeItem } from "../types";
export declare class VariantService {
    private hass;
    constructor(hass: HomeAssistant);
    private static getTemplateKey;
    static getVariants(items: InventreeItem[]): Record<string, InventreeItem[]>;
    static groupVariants(items: InventreeItem[], config: InventreeCardConfig): Record<number, InventreeItem[]>;
    static processVariants(items: InventreeItem[], config: InventreeCardConfig): InventreeItem[];
    static getTotalStock(template: InventreeItem, variants: InventreeItem[]): number;
    static isVariant(item: InventreeItem): boolean;
    static isTemplate(item: InventreeItem): boolean;
    getVariants(config: InventreeCardConfig): Promise<VariantGroup[]>;
    detectVariantGroups(parts: InventreeItem[]): VariantGroup[];
    processVariantGroups(parts: InventreeItem[], variantGroups: VariantGroup[]): InventreeItem[];
    getTotalStock(template: InventreeItem, variants: InventreeItem[]): number;
    getVariantData(entityId: string): Promise<InventreeItem[]>;
}
/**
 * Detect variant groups from a list of parts
 * @param parts List of parts to analyze
 * @returns Array of arrays, each containing PKs of parts in a variant group
 */
export declare function detectVariantGroups(parts: InventreeItem[]): number[][];
/**
 * Calculate the total stock for a template part and its variants
 * @param template The template part
 * @param variants Array of variant parts
 * @returns Total stock across all variants
 */
export declare function getTotalStock(template: InventreeItem, variants: InventreeItem[]): number;
/**
 * Process variant groups from configuration
 * @param items All available items
 * @param variantGroups Configured variant groups
 * @returns Processed variant groups
 */
export declare function processConfiguredVariants(items: InventreeItem[], variantGroups: VariantGroup[]): {
    template: InventreeItem;
    variants: InventreeItem[];
    totalStock: number;
}[];
