---
aliases: [websocket-plugin.ts]
tags: [service, services]
---

# websocket-plugin.ts

**Path:** `services/websocket-plugin.ts`  
**Line Count:** 413  
**Functions:** 13  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `configure`
- `connect`
- `disconnect`
- `onMessage`
- `isConnected`
- `getStats`

## Service Interface

```mermaid
classDiagram
    class websocket-plugin {
        +WebSocketPlugin getInstance()
        +void configure(config: InvenTreeWebSocketConfig)
        +void connect()
        +void disconnect()
        +() => void onMessage(callback: (message: any) => void)
        +boolean isConnected()
        +{
    isConnected: boolean;
    messageCount: number;
    errorCount: number;
    lastMessageTime: number;
  } getStats()
    }
```

## Service Usage

- **[[websocket-plugin|websocket-plugin]]** uses:
  - `_getMessageId`
  - `_handleParameterUpdate`
  - `_processMessage`
  - `_scheduleReconnect`
  - `connect`
  - `disconnect`

## Detailed Documentation

For full implementation details, see the [websocket-plugin.ts](../files/websocket-plugin.md) file documentation.

