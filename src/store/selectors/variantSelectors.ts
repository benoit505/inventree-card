import { createSelector } from 'reselect';
import { RootState } from '../index';
import { InventreeItem, InventreeCardConfig, ProcessedVariant } from '../../types';
import { selectCombinedParts } from '../slices/partsSlice';

// Helper function to group variants (can be adapted from VariantHandler or existing layout)
const groupVariants = (parts: InventreeItem[], config: InventreeCardConfig | null): ProcessedVariant[] => {
    if (!parts || parts.length === 0) {
        return [];
    }

    const templatesMap: Map<number, ProcessedVariant> = new Map();
    const variantsMap: Map<number, InventreeItem> = new Map();

    // Define a helper for safe stock access
    const getStock = (part: InventreeItem): number => part.in_stock ?? 0;

    // First pass: identify templates and variants
    parts.forEach(part => {
        if (part.is_template) {
            const stock = getStock(part); // Use helper
            templatesMap.set(part.pk, {
                pk: part.pk,
                name: part.name,
                template: part,
                variants: [],
                thumbnail: part.thumbnail,
                in_stock: stock, // Use safe value
                category_name: part.category_name,
                totalStock: stock, // Initialize total stock with safe template stock
            });
        } else if (part.variant_of) {
            variantsMap.set(part.pk, part);
        }
    });

    // Second pass: assign variants to their templates
    variantsMap.forEach(variant => {
        const templateId = variant.variant_of;
        if (templateId && templatesMap.has(templateId)) {
            const group = templatesMap.get(templateId)!;
            group.variants.push(variant);
            // Use helper for variant stock and ensure group.totalStock is initialized
            group.totalStock = (group.totalStock ?? 0) + getStock(variant); 
        }
        // TODO: Handle variants whose templates aren't in the current parts list?
    });

    // Add standalone parts (non-templates, non-variants)
    parts.forEach(part => {
        if (!part.is_template && !part.variant_of && !templatesMap.has(part.pk)) {
             const stock = getStock(part); // Use helper
             // Treat standalone parts as their own "group" for consistency
             templatesMap.set(part.pk, {
                pk: part.pk,
                name: part.name,
                template: part, // The part itself acts as the template
                variants: [], // No variants for standalone
                thumbnail: part.thumbnail,
                in_stock: stock, // Use safe value
                category_name: part.category_name,
                totalStock: stock, // Use safe value
            });
        }
    });

    // TODO: Implement custom grouping logic from config.variant_groups if needed

    return Array.from(templatesMap.values());
};

export const selectProcessedVariants = createSelector(
    [
        (state: RootState): InventreeItem[] => selectCombinedParts(state), // Correct: Pass state to selectCombinedParts
    ],
    (allParts: InventreeItem[]): ProcessedVariant[] => {
        // Add default return value for empty parts
        if (!allParts || allParts.length === 0) {
            return [];
        }
        // Use the helper function to process variants
        return groupVariants(allParts, null);
    }
);

// Example selector - might need adjustment based on actual variant logic needs
// This assumes we need the config for some variant processing, which might not be the case.
// If config is needed, it must be passed as an argument or derived differently.
export const selectVariantGroups = createSelector(
    [selectCombinedParts], // Removed selectCardConfig from input selectors
    (parts) => { // Removed config from result function arguments
        // Group parts by variant_of or is_template status
        const groups: Record<string, InventreeItem[]> = {};
        const templates: InventreeItem[] = [];

        parts.forEach((part: InventreeItem) => {
            if (part.is_template) {
                templates.push(part);
            } else if (part.variant_of !== null) {
                const templateId = String(part.variant_of);
                if (!groups[templateId]) {
                    groups[templateId] = [];
                }
                groups[templateId].push(part);
            } else {
                // Standalone parts (not templates, not variants)
                // Decide how to handle these - maybe a separate group?
                // For now, they are ignored in this grouping logic.
            }
        });

        // You might need config here to filter or modify groups
        // e.g., if (config?.variant_options?.show_empty_templates) { ... }
        // Since config is removed, this logic needs adaptation or removal.

        return {
            groups,
            templates
        };
    }
); 