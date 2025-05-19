---
aliases: [card-controller.ts]
tags: [service, services]
---

# card-controller.ts

**Path:** `services/card-controller.ts`  
**Line Count:** 680  
**Functions:** 16  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `setConfig`
- `setHass`
- `initializeServices`
- `initializeApi`
- `loadEntityData`
- `getParts`
- `getParameterService`
- `getRenderingService`
- `getWebSocketService`
- `initializeWebSocketPlugin`
- `handleWebSocketMessage`
- `getWebSocketDiagnostics`
- `subscribeToEntityChanges`
- `getWebSocketPlugin`
- `resetApiFailures`

## Service Interface

```mermaid
classDiagram
    class card-controller {
        +CardController getInstance()
        +void setConfig(config: InventreeCardConfig)
        +void setHass(hass: HomeAssistant)
        +void initializeServices()
        +void initializeApi()
        +void loadEntityData(entityId: string)
        +InventreeItem[] getParts()
        +ParameterService | null getParameterService()
        +RenderingService getRenderingService()
        +WebSocketService getWebSocketService()
        +void initializeWebSocketPlugin()
        +void handleWebSocketMessage(message: any)
        +any getWebSocketDiagnostics()
        +() => void subscribeToEntityChanges(entityId: string, callback: () => void)
        +WebSocketPlugin getWebSocketPlugin()
        +void resetApiFailures()
    }
```

## Service Usage

- **[[card-controller|card-controller]]** uses:
  - `getWebSocketService`
  - `handleWebSocketMessage`
  - `initializeApi`
  - `initializeServices`
  - `initializeWebSocketPlugin`
  - `loadEntityData`

## Detailed Documentation

For full implementation details, see the [card-controller.ts](../files/card-controller.md) file documentation.

