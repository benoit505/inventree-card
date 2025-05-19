---
aliases: [state.ts]
tags: [service, services]
---

# state.ts

**Path:** `services/state.ts`  
**Line Count:** 144  
**Functions:** 11  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `setHass`
- `getFilteredParts`
- `getAllParts`
- `findEntityForPart`
- `updateEntityParts`
- `subscribe`
- `shouldShowPart`
- `checkConditionForPart`
- `getActionButtons`

## Service Interface

```mermaid
classDiagram
    class state {
        +InventTreeState getInstance()
        +void setHass(hass: HomeAssistant)
        +InventreeItem[] getFilteredParts(entityId: string)
        +InventreeItem[] getAllParts(entityId: string)
        +string | undefined findEntityForPart(partId: number)
        +void updateEntityParts(entityId: string, parts: InventreeItem[])
        +() => void subscribe(entityId: string, callback: () => void)
        +boolean shouldShowPart(part: InventreeItem, paramName: string, operator: string, value: string)
        +boolean checkConditionForPart(part: InventreeItem, condition: ParameterCondition)
        +any[] getActionButtons(part: any, actions: any[])
    }
```

## Service Usage

- **[[grid-layout|grid-layout]]** uses:
  - `getActionButtons`
- **[[list-layout|list-layout]]** uses:
  - `getActionButtons`
- **[[card-controller|card-controller]]** uses:
  - `setHass`
- **[[parameter-service|parameter-service]]** uses:
  - `findEntityForPart`
- **[[state|state]]** uses:
  - `_getParameterService`
  - `checkConditionForPart`

## Detailed Documentation

For full implementation details, see the [state.ts](../files/state.md) file documentation.

