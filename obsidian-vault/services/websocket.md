---
aliases: [websocket.ts]
tags: [service, services]
---

# websocket.ts

**Path:** `services/websocket.ts`  
**Line Count:** 445  
**Functions:** 20  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `getConnectionId`
- `setHass`
- `subscribeToEntity`
- `subscribeToParts`
- `isConnected`
- `getDiagnostics`
- `destroy`
- `getConnectionStatus`
- `getApiStatus`
- `setDirectApi`
- `getDirectApi`

## Service Interface

```mermaid
classDiagram
    class websocket {
        +WebSocketService getInstance()
        +string getConnectionId(hass: HomeAssistant)
        +void setHass(hass: HomeAssistant)
        +() => void subscribeToEntity(entityId: string, callback: (data: any) => void)
        +() => void subscribeToParts(entityId: string, callback: (parts: any[]) => void)
        +boolean isConnected()
        +object getDiagnostics()
        +void destroy()
        +Record<string, boolean> getConnectionStatus()
        +{ 
    failureCount: number, 
    usingFallback: boolean, 
    recentSuccess: boolean 
  } getApiStatus()
        +void setDirectApi(api: InvenTreeDirectAPI | null)
        +InvenTreeDirectAPI | null getDirectApi()
    }
```

## Service Usage

- **[[websocket|websocket]]** uses:
  - `_isMessageForEntity`
  - `_processMessage`
  - `_resubscribeAll`
  - `_subscribeToEntity`
  - `_unsubscribeFromEntity`
  - `_updateEntityState`
  - `getConnectionId`
  - `isConnected`
  - `subscribeToEntity`

## Detailed Documentation

For full implementation details, see the [websocket.ts](../files/websocket.md) file documentation.

