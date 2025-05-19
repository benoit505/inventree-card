---
aliases: [variant-service.ts]
tags: [service, services]
---

# variant-service.ts

**Path:** `services/variant-service.ts`  
**Line Count:** 300  
**Functions:** 15  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getTemplateKey`
- `getVariants`
- `groupVariants`
- `processVariants`
- `getTotalStock`
- `isVariant`
- `isTemplate`
- `getVariants`
- `detectVariantGroups`
- `processVariantGroups`
- `getTotalStock`
- `getVariantData`
- `detectVariantGroups` - Detect variant groups from a list of parts
- `getTotalStock` - Calculate the total stock for a template part and its variants
- `processConfiguredVariants` - Process variant groups from configuration

## Service Interface

```mermaid
classDiagram
    class variant-service {
        +string getTemplateKey(item: InventreeItem)
        +Record<string, InventreeItem[]> getVariants(items: InventreeItem[])
        +Record<number, InventreeItem[]> groupVariants(items: InventreeItem[], config: InventreeCardConfig)
        +InventreeItem[] processVariants(items: InventreeItem[], config: InventreeCardConfig)
        +number getTotalStock(template: InventreeItem, variants: InventreeItem[])
        +boolean isVariant(item: InventreeItem)
        +boolean isTemplate(item: InventreeItem)
        +Promise<VariantGroup[]> getVariants(config: InventreeCardConfig)
        +VariantGroup[] detectVariantGroups(parts: InventreeItem[])
        +InventreeItem[] processVariantGroups(parts: InventreeItem[], variantGroups: VariantGroup[])
        +number getTotalStock(template: InventreeItem, variants: InventreeItem[])
        +Promise<InventreeItem[]> getVariantData(entityId: string)
        +number[][] detectVariantGroups(parts: InventreeItem[])
        +number getTotalStock(template: InventreeItem, variants: InventreeItem[])
        +void processConfiguredVariants(items: InventreeItem[], variantGroups: VariantGroup[])
    }
```

## Service Usage

- **[[variant-service|variant-service]]** uses:
  - `getTemplateKey`
  - `getTotalStock`
  - `groupVariants`

## Detailed Documentation

For full implementation details, see the [variant-service.ts](../files/variant-service.md) file documentation.

