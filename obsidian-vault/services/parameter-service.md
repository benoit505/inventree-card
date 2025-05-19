---
aliases: [parameter-service.ts]
tags: [service, services]
---

# parameter-service.ts

**Path:** `services/parameter-service.ts`  
**Line Count:** 928  
**Functions:** 45  

## Overview

This service is part of the `services` directory.

## Public Interface

- `get`
- `set`
- `clear`
- `getInstance`
- `initialize`
- `hasInstance`
- `matchesConditionSyncVersion`
- `processConditions`
- `matchesCondition`
- `checkValueMatch`
- `compareValues`
- `applyAction`
- `getActionButtons`
- `shouldShowPart`
- `compareFilterValues`
- `diagnosticDump`
- `clearCache`
- `markParameterChanged`
- `wasRecentlyChanged`
- `getParameterValueFromPart`
- `isDirectPartReference`
- `getParameterValueWithDirectReference`
- `findEntityForPart`
- `storeOrphanedParameter`
- `isOrphanedPart`
- `getOrphanedPartIds`
- `getOrphanedPartParameters`
- `findParameterInWebSocketData`
- `findParameterInApiData`
- `findParameterInHassData`
- `findParameterInAllEntities`
- `updateHass`
- `isApiConnected`
- `setDirectApi`
- `getApiStats`
- `updateParameter`
- `fetchParameterData`
- `syncApiDataToEntityState`
- `getParameterFromEntity`
- `setConfig`
- `setStrictWebSocketMode`
- `markAsWebSocketCall`
- `clearWebSocketCallMark`
- `isWebSocketCall`
- `checkCondition`

## Service Interface

```mermaid
classDiagram
    class parameter-service {
        +T | undefined get(key: string)
        +void set(key: string, value: any, ttl: number)
        +void clear()
        +ParameterService getInstance()
        +ParameterService initialize(hass: HomeAssistant)
        +boolean hasInstance()
        +boolean matchesConditionSyncVersion(part: InventreeItem, condition: ParameterCondition)
        +VisualModifiers processConditions(part: InventreeItem, conditions: ParameterCondition[])
        +Promise<boolean> matchesCondition(part: InventreeItem, condition: ParameterCondition)
        +boolean checkValueMatch(value: string | null, condition: ParameterCondition)
        +boolean compareValues(value: string | null, expectedValue: string, operator: ParameterOperator, verbose: boolean)
        +void applyAction(modifiers: VisualModifiers, action: ParameterAction | string | undefined, value: string | undefined)
        +ParameterAction[] getActionButtons(part: string, parameter: string, actions: ParameterAction[])
        +boolean shouldShowPart(part: InventreeItem)
        +boolean compareFilterValues(value: any, filterValue: string, operator: string)
        +void diagnosticDump()
        +void clearCache()
        +void markParameterChanged(entityId: string, paramName: string)
        +boolean wasRecentlyChanged(entityId: string, paramName: string)
        +string | null getParameterValueFromPart(part: InventreeItem, paramName: string)
        +boolean isDirectPartReference(reference: string)
        +Promise<string | null> getParameterValueWithDirectReference(reference: string)
        +string | null findEntityForPart(partId: number)
        +void storeOrphanedParameter(partId: number, paramName: string, value: string)
        +boolean isOrphanedPart(partId: number)
        +number[] getOrphanedPartIds()
        +Record<string, string> | null getOrphanedPartParameters(partId: number)
        +string | null findParameterInWebSocketData(partId: number, parameterName: string)
        +string | null findParameterInApiData(partId: number, parameterName: string)
        +string | null findParameterInHassData(partId: number, parameterName: string)
        +Promise<string | null> findParameterInAllEntities(partId: number, parameterName: string)
        +void updateHass(hass: HomeAssistant)
        +boolean isApiConnected()
        +void setDirectApi(apiInstance: InvenTreeDirectAPI | null)
        +{ apiCalls: number, fallbackCalls: number } getApiStats()
        +Promise<boolean> updateParameter(part: InventreeItem, paramName: string, value: string)
        +Promise<void> fetchParameterData(partId: number, parameterName: string)
        +void syncApiDataToEntityState(partId: number, paramName: string, value: string)
        +Promise<string | null> getParameterFromEntity(entityId: string, paramName: string)
        +void setConfig(config: InventreeCardConfig | null)
        +void setStrictWebSocketMode(enabled: boolean)
        +void markAsWebSocketCall()
        +void clearWebSocketCallMark()
        +boolean isWebSocketCall()
        +Promise<boolean> checkCondition(condition: ParameterCondition, part: any)
    }
```

## Service Usage

- **[[parameter-service|parameter-service]]** uses:
  - `applyAction`
  - `checkValueMatch`
  - `compareValues`
  - `findEntityForPart`
  - `getParameterValueFromPart`
  - `getParameterValueWithDirectReference`
  - `isApiConnected`
  - `isDirectPartReference`
  - `matchesCondition`
  - `matchesConditionSyncVersion`
  - `storeOrphanedParameter`

## Detailed Documentation

For full implementation details, see the [parameter-service.ts](../files/parameter-service.md) file documentation.

