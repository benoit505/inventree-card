import { VariantService } from '../../services/variant-service';
import { Logger } from '../../utils/logger';
// Module-scoped logger for static methods if preferred, or use Logger.getInstance() directly.
const moduleLogger = Logger.getInstance();
export class VariantHandler {
    constructor(hass) {
        this.hass = hass;
        this.variantService = new VariantService(hass);
        this.logger = Logger.getInstance();
    }
    static processItems(items, config) {
        var _a, _b;
        moduleLogger.log('VariantHandler', 'Processing items with config:', {
            data: {
                auto_detect: config.auto_detect_variants,
                variant_view_type: config.variant_view_type,
                variants_config: config.variants
            },
            subsystem: 'processItems'
        });
        // const logger = Logger.getInstance(); // Removed local logger instance
        // Safety check - if no items, return empty array
        if (!items || items.length === 0) {
            return [];
        }
        // Always return the original items if variants are disabled
        if (!((_a = config.variants) === null || _a === void 0 ? void 0 : _a.show_variants)) {
            return items;
        }
        try {
            // Create a copy of items to track which ones have been processed
            const allItems = [...items];
            const processedItems = [];
            const processedPks = new Set();
            // If auto-detect is enabled, detect variant groups manually
            if (config.variants.auto_detect) {
                moduleLogger.log('VariantHandler', `Auto-detecting variants from ${items.length} items`, { subsystem: 'processItems' });
                // Find all parts with variant_of set
                const variantParts = allItems.filter(part => part.variant_of !== null);
                moduleLogger.log('VariantHandler', `Found ${variantParts.length} parts with variant_of set`, { subsystem: 'processItems' });
                // Group variants by their parent part
                const variantGroups = {};
                variantParts.forEach(part => {
                    if (part.variant_of) {
                        if (!variantGroups[part.variant_of]) {
                            variantGroups[part.variant_of] = [];
                        }
                        variantGroups[part.variant_of].push(part);
                    }
                });
                // Process each variant group
                Object.keys(variantGroups).forEach(parentIdStr => {
                    const parentId = Number(parentIdStr);
                    const variants = variantGroups[parentId];
                    const template = allItems.find(part => part.pk === parentId);
                    if (template) {
                        // Create a processed variant
                        processedItems.push({
                            pk: template.pk,
                            name: template.name,
                            template,
                            variants,
                            totalStock: VariantHandler.calculateTotalStock(template, variants)
                        });
                        // Mark all parts in this group as processed
                        processedPks.add(template.pk);
                        variants.forEach(p => processedPks.add(p.pk));
                    }
                });
                moduleLogger.log('VariantHandler', `Created ${processedItems.length} variant groups`, { subsystem: 'processItems' });
            }
            // Otherwise use the configured variant groups
            else if ((_b = config.variants.variant_groups) === null || _b === void 0 ? void 0 : _b.length) {
                moduleLogger.log('VariantHandler', `Processing ${config.variants.variant_groups.length} configured variant groups`, { subsystem: 'processItems' });
                // Process each configured variant group
                config.variants.variant_groups.forEach((group) => {
                    const templatePk = group.templatePk;
                    const variantPks = group.variantPks || [];
                    if (templatePk && variantPks.length) {
                        // Find the template part
                        const template = allItems.find(p => p.pk === templatePk);
                        if (template) {
                            // Find all variant parts
                            const variants = allItems.filter(p => variantPks.includes(p.pk));
                            if (variants.length > 0) {
                                // Create a processed variant
                                processedItems.push({
                                    pk: template.pk,
                                    name: group.name || template.name,
                                    template,
                                    variants,
                                    totalStock: VariantHandler.calculateTotalStock(template, variants)
                                });
                                // Mark all parts in this group as processed
                                processedPks.add(template.pk);
                                variants.forEach(p => processedPks.add(p.pk));
                            }
                        }
                    }
                });
            }
            // Add all unprocessed items
            const regularItems = allItems.filter(p => !processedPks.has(p.pk));
            // Combine processed variants and regular items
            const result = [...processedItems, ...regularItems];
            moduleLogger.log('VariantHandler', `Processed ${processedItems.length} variant groups and ${regularItems.length} regular items`, { subsystem: 'processItems' });
            return result;
        }
        catch (error) {
            Logger.getInstance().error('VariantHandler', 'Error processing variants:', { data: error, subsystem: 'processItems' });
            return items; // Return original items on error
        }
    }
    static isVariant(item) {
        return item.template !== undefined &&
            item.variants !== undefined &&
            Array.isArray(item.variants);
    }
    static calculateTotalStock(template, variants) {
        let totalStock = template.in_stock || 0;
        variants.forEach(variant => {
            totalStock += variant.in_stock || 0;
        });
        return totalStock;
    }
    processVariants(items, config) {
        var _a;
        if (!((_a = config === null || config === void 0 ? void 0 : config.variants) === null || _a === void 0 ? void 0 : _a.show_variants)) {
            return items;
        }
        // Get variant groups
        let variantGroups = [];
        if (config.variants.auto_detect) {
            variantGroups = this.variantService.detectVariantGroups(items);
        }
        else if (config.variants.variant_groups && config.variants.variant_groups.length > 0) {
            variantGroups = config.variants.variant_groups;
        }
        // Process the variant groups
        return this.variantService.processVariantGroups(items, variantGroups);
    }
    getTotalStock(template, variants) {
        return VariantHandler.calculateTotalStock(template, variants);
    }
}
//# sourceMappingURL=variant-handler.js.map