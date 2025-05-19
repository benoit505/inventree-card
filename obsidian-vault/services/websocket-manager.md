---
aliases: [websocket-manager.ts]
tags: [service, services]
---

# websocket-manager.ts

**Path:** `services/websocket-manager.ts`  
**Line Count:** 412  
**Functions:** 19  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `getConnection`
- `addOpenCallback`
- `addMessageCallback`
- `removeCallbacks`
- `closeConnection`
- `closeAllConnections`
- `handleOpen`
- `handleMessage`
- `handleError`
- `handleClose`
- `setupKeepAlive`
- `destroy`
- `isConnected`
- `getStats`
- `getReadyStateString`
- `getEnhancedStats`

## Service Interface

```mermaid
classDiagram
    class websocket-manager {
        +WebSocketManager getInstance()
        +WebSocket | null getConnection(url: string, onOpen: (event: Event) => void, onMessage: (event: MessageEvent) => void)
        +void addOpenCallback(url: string, callback: (event: Event) => void)
        +void addMessageCallback(url: string, callback: (event: MessageEvent) => void)
        +void removeCallbacks(url: string, openCallback: (event: Event) => void, messageCallback: (event: MessageEvent) => void)
        +void closeConnection(url: string)
        +void closeAllConnections()
        +void handleOpen(event: Event, url: string)
        +void handleMessage(event: MessageEvent, url: string)
        +void handleError(event: Event, url: string)
        +void handleClose(event: CloseEvent, url: string)
        +void setupKeepAlive(url: string)
        +void destroy()
        +boolean isConnected(url: string)
        +{ activeConnections: number, connections: Record<string, any> } getStats()
        +string getReadyStateString(state: number)
        +{ activeConnections: number, connections: Record<string, any> } getEnhancedStats()
    }
```

## Service Usage

- **[[websocket-manager|websocket-manager]]** uses:
  - `_handleBasicMessage`
  - `addMessageCallback`
  - `addOpenCallback`
  - `closeAllConnections`
  - `closeConnection`
  - `getConnection`
  - `getReadyStateString`
  - `getStats`
  - `handleClose`
  - `handleError`
  - `handleMessage`
  - `handleOpen`
  - `setupKeepAlive`

## Detailed Documentation

For full implementation details, see the [websocket-manager.ts](../files/websocket-manager.md) file documentation.

