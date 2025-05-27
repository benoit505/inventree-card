import { Logger } from '../utils/logger';
const logger = Logger.getInstance();
export class VariantService {
    constructor(hass) {
        this.logger = Logger.getInstance();
        this.hass = hass;
    }
    static getTemplateKey(item) {
        const params = item.parameters || [];
        if (params.length > 0) {
            const templateParam = params.find(p => {
                var _a, _b, _c;
                return ((_a = p.template_detail) === null || _a === void 0 ? void 0 : _a.name) === 'Food_State' ||
                    ((_b = p.template_detail) === null || _b === void 0 ? void 0 : _b.name) === 'Color' ||
                    ((_c = p.template_detail) === null || _c === void 0 ? void 0 : _c.name) === 'Size';
            });
            if (templateParam) {
                return item.name.split(' ')[0];
            }
        }
        return item.name;
    }
    static getVariants(items) {
        const groups = {};
        items.forEach(item => {
            const template = this.getTemplateKey(item);
            if (!groups[template])
                groups[template] = [];
            groups[template].push(item);
        });
        return groups;
    }
    static groupVariants(items, config) {
        var _a, _b;
        const groups = {};
        if (!((_a = config.variants) === null || _a === void 0 ? void 0 : _a.show_variants)) {
            return groups;
        }
        const variantGroups = ((_b = config.variants) === null || _b === void 0 ? void 0 : _b.variant_groups) || [];
        variantGroups.forEach((group) => {
            const mainItem = items.find(i => i.pk === group.main_pk);
            if (mainItem) {
                groups[mainItem.pk] = [
                    mainItem,
                    ...items.filter(i => (group.variantPks || []).includes(i.pk))
                ];
            }
        });
        return groups;
    }
    static processVariants(items, config) {
        var _a;
        if (!((_a = config.variants) === null || _a === void 0 ? void 0 : _a.show_variants)) {
            return items;
        }
        try {
            const variantGroups = this.groupVariants(items, config);
            return items;
        }
        catch (error) {
            Logger.getInstance().error('VariantService', 'Failed to process variants:', error);
            return items;
        }
    }
    static getTotalStock(template, variants) {
        const templateStock = template.in_stock || 0;
        const variantsStock = variants.reduce((sum, variant) => sum + (variant.in_stock || 0), 0);
        return templateStock + variantsStock;
    }
    static isVariant(item) {
        return !!item.variant_of;
    }
    static isTemplate(item) {
        return !!item.is_template && !item.variant_of;
    }
    async getVariants(config) {
        var _a;
        if (!((_a = config.variants) === null || _a === void 0 ? void 0 : _a.show_variants)) {
            return [];
        }
        try {
            return config.variants.variant_groups || [];
        }
        catch (error) {
            this.logger.error('VariantService', 'Failed to get variants:', error);
            return [];
        }
    }
    detectVariantGroups(parts) {
        this.logger.log('VariantService', `Detecting variant groups from ${parts.length} parts`, { subsystem: 'detectVariantGroupsFn' });
        const templateParts = parts.filter(part => part.is_template);
        const variantParts = parts.filter(part => part.variant_of !== null);
        const variantGroups = {};
        variantParts.forEach(part => {
            if (part.variant_of) {
                if (!variantGroups[part.variant_of]) {
                    variantGroups[part.variant_of] = [];
                }
                variantGroups[part.variant_of].push(part);
            }
        });
        const result = Object.keys(variantGroups).map(parentIdStr => {
            const parentId = Number(parentIdStr);
            const variants = variantGroups[parentId];
            const parentPart = parts.find(part => part.pk === parentId);
            return {
                main_pk: parentId,
                templatePk: parentId,
                variantPks: variants.map(part => part.pk),
                template_id: parentId,
                name: (parentPart === null || parentPart === void 0 ? void 0 : parentPart.name) || `Group ${parentId}`,
                parts: variants.map(part => part.pk)
            };
        });
        this.logger.log('VariantService', `Detected ${result.length} variant groups`, { subsystem: 'detectVariantGroupsFn' });
        return result;
    }
    processVariantGroups(parts, variantGroups) {
        const partMap = {};
        parts.forEach(part => {
            partMap[part.pk] = part;
        });
        const processedGroups = variantGroups.map(group => {
            const templatePart = partMap[group.template_id];
            if (!templatePart) {
                this.logger.warn('VariantService', `Template part not found for group ${group.template_id}`);
                return null;
            }
            const variantParts = (group.parts || [])
                .map(partId => partMap[partId])
                .filter(part => part !== undefined);
            const totalStock = this.getTotalStock(templatePart, variantParts);
            return Object.assign(Object.assign({}, templatePart), { variants: variantParts, is_variant_group: true, totalStock: totalStock });
        }).filter(group => group !== null);
        const usedPartIds = new Set();
        processedGroups.forEach(group => {
            usedPartIds.add(group.pk);
            if (group.variants) {
                group.variants.forEach((variant) => {
                    usedPartIds.add(variant.pk);
                });
            }
        });
        const regularParts = parts.filter(part => !usedPartIds.has(part.pk));
        return [...processedGroups, ...regularParts];
    }
    getTotalStock(template, variants) {
        let totalStock = template.in_stock || 0;
        variants.forEach(variant => {
            totalStock += variant.in_stock || 0;
        });
        return totalStock;
    }
    async getVariantData(entityId) {
        try {
            if (!this.hass || !entityId) {
                return [];
            }
            const state = this.hass.states[entityId];
            if (!state || !state.attributes || !state.attributes.items) {
                return [];
            }
            return state.attributes.items;
        }
        catch (error) {
            this.logger.error('VariantService', 'Failed to get variant data:', error);
            return [];
        }
    }
}
/**
 * Detect variant groups from a list of parts
 * @param parts List of parts to analyze
 * @returns Array of arrays, each containing PKs of parts in a variant group
 */
export function detectVariantGroups(parts) {
    logger.log('VariantService', `Detecting variant groups from ${parts.length} parts`, { subsystem: 'detectVariantGroupsFn' });
    // Group parts by their variant_of property
    const variantGroups = {};
    parts.forEach(part => {
        // If this part is a variant of another part
        if (part.variant_of) {
            // Convert to number if it's a string
            const parentPk = typeof part.variant_of === 'string'
                ? parseInt(part.variant_of, 10)
                : part.variant_of;
            // Initialize the group if it doesn't exist
            if (!variantGroups[parentPk]) {
                variantGroups[parentPk] = [parentPk];
            }
            // Add this part to the group
            variantGroups[parentPk].push(part.pk);
        }
    });
    // Convert the object to an array of arrays
    const result = Object.values(variantGroups);
    logger.log('VariantService', `Detected ${result.length} variant groups`, { subsystem: 'detectVariantGroupsFn' });
    return result;
}
/**
 * Calculate the total stock for a template part and its variants
 * @param template The template part
 * @param variants Array of variant parts
 * @returns Total stock across all variants
 */
export function getTotalStock(template, variants) {
    // Start with the template's stock
    let total = template.in_stock || 0;
    // Add stock from all variants
    variants.forEach(variant => {
        total += variant.in_stock || 0;
    });
    return total;
}
/**
 * Process variant groups from configuration
 * @param items All available items
 * @param variantGroups Configured variant groups
 * @returns Processed variant groups
 */
export function processConfiguredVariants(items, variantGroups) {
    const result = [];
    for (const group of variantGroups) {
        // Find the template part
        const template = items.find(i => i.pk === group.templatePk);
        if (!template)
            continue;
        // Find all variant parts
        const variants = [];
        for (const pk of (group.variantPks || [])) {
            const variant = items.find(i => i.pk === pk);
            if (variant)
                variants.push(variant);
        }
        if (variants.length > 0) {
            result.push({
                template,
                variants,
                totalStock: getTotalStock(template, variants)
            });
        }
    }
    return result;
}
//# sourceMappingURL=variant-service.js.map