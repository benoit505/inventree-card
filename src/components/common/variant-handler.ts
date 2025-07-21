import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig, ProcessedVariant, VariantGroup } from '../../types';
import { VariantService } from '../../services/variant-service';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('VariantHandler');
ConditionalLoggerEngine.getInstance().registerCategory('VariantHandler', { enabled: false, level: 'info' });

export class VariantHandler {
    private variantService: VariantService;
    
    constructor(private hass: HomeAssistant) {
        this.variantService = new VariantService(hass);
    }
    
    static processItems(items: InventreeItem[], config: InventreeCardConfig): (InventreeItem | ProcessedVariant)[] {
        logger.debug('processItems', 'Processing items with config:', {
            auto_detect: config.auto_detect_variants,
            variant_view_type: config.variant_view_type,
            variants_config: config.variants
        });
        
        if (!items || items.length === 0) {
            return [];
        }
        
        if (!config.variants?.show_variants) {
            return items;
        }

        try {
            const allItems = [...items];
            const processedItems: (InventreeItem | ProcessedVariant)[] = [];
            const processedPks = new Set<number>();
            
            if (config.variants.auto_detect) {
                logger.debug('processItems', `Auto-detecting variants from ${items.length} items`);
                
                const variantParts = allItems.filter(part => part.variant_of !== null);
                logger.debug('processItems', `Found ${variantParts.length} parts with variant_of set`);
                
                const variantGroups: { [key: number]: InventreeItem[] } = {};
                
                variantParts.forEach(part => {
                    if (part.variant_of) {
                        if (!variantGroups[part.variant_of]) {
                            variantGroups[part.variant_of] = [];
                        }
                        variantGroups[part.variant_of].push(part);
                    }
                });
                
                Object.keys(variantGroups).forEach(parentIdStr => {
                    const parentId = Number(parentIdStr);
                    const variants = variantGroups[parentId];
                    const template = allItems.find(part => part.pk === parentId);
                    
                    if (template) {
                        processedItems.push({
                            pk: template.pk,
                            name: template.name,
                            template,
                            variants,
                            totalStock: VariantHandler.calculateTotalStock(template, variants)
                        });
                        
                        processedPks.add(template.pk);
                        variants.forEach(p => processedPks.add(p.pk));
                    }
                });
                
                logger.debug('processItems', `Created ${processedItems.length} variant groups`);
            } 
            else if (config.variants.variant_groups?.length) {
                logger.debug('processItems', `Processing ${config.variants.variant_groups.length} configured variant groups`);
                
                config.variants.variant_groups.forEach((group: VariantGroup) => {
                    const templatePk = group.templatePk;
                    const variantPks = group.variantPks || [];
                    
                    if (templatePk && variantPks.length) {
                        const template = allItems.find(p => p.pk === templatePk);
                        
                        if (template) {
                            const variants = allItems.filter(p => variantPks.includes(p.pk));
                            
                            if (variants.length > 0) {
                                processedItems.push({
                                    pk: template.pk,
                                    name: group.name || template.name,
                                    template,
                                    variants,
                                    totalStock: VariantHandler.calculateTotalStock(template, variants)
                                });
                                
                                processedPks.add(template.pk);
                                variants.forEach(p => processedPks.add(p.pk));
                            }
                        }
                    }
                });
            }
            
            const regularItems = allItems.filter(p => !processedPks.has(p.pk));
            
            const result = [...processedItems, ...regularItems];
            logger.debug('processItems', `Processed ${processedItems.length} variant groups and ${regularItems.length} regular items`);
            
            return result;
        } catch (error) {
            logger.error('processItems', 'Error processing variants:', error as Error);
            return items; // Return original items on error
        }
    }
    
    static isVariant(item: InventreeItem | ProcessedVariant): item is ProcessedVariant {
        return (item as ProcessedVariant).template !== undefined &&
               (item as ProcessedVariant).variants !== undefined &&
               Array.isArray((item as ProcessedVariant).variants);
    }
    
    static calculateTotalStock(template: InventreeItem, variants: InventreeItem[]): number {
        let totalStock = template.in_stock || 0;
        variants.forEach(variant => {
            totalStock += variant.in_stock || 0;
        });
        return totalStock;
    }

    processVariants(items: InventreeItem[], config?: InventreeCardConfig): InventreeItem[] {
        if (!config?.variants?.show_variants) {
            return items;
        }
        
        let variantGroups: VariantGroup[] = [];
        
        if (config.variants.auto_detect) {
            variantGroups = this.variantService.detectVariantGroups(items);
        } else if (config.variants.variant_groups && config.variants.variant_groups.length > 0) {
            variantGroups = config.variants.variant_groups;
        }
        
        return this.variantService.processVariantGroups(items, variantGroups);
    }

    getTotalStock(template: InventreeItem, variants: InventreeItem[]): number {
        return VariantHandler.calculateTotalStock(template, variants);
    }
} 