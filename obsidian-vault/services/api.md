---
aliases: [api.ts]
tags: [service, services]
---

# api.ts

**Path:** `services/api.ts`  
**Line Count:** 869  
**Functions:** 24  

## Overview

This service is part of the `services` directory.

## Public Interface

- `setParameterService`
- `getParameterValue`
- `getFallbackParameterValue`
- `setFallbackEnabled`
- `testConnection`
- `getApiStats`
- `getApiUrl`
- `testBasicAuth`
- `getPartParameters`
- `testBasicAuthWithEndpoint`
- `testConnectionExactFormat`
- `testParameterAPI`
- `destroy`
- `logApiStats`
- `updateParameterDirectly`
- `getPerformanceStats`
- `getLastKnownParameterValue`
- `updateLastKnownParameterValue`
- `notifyParameterChanged`
- `isFallbackEnabled`
- `resetRateLimiting`
- `updateParameter`
- `fetchParameterData`
- `isApiConnected`

## Service Interface

```mermaid
classDiagram
    class api {
        +void setParameterService(service: any)
        +Promise<string | null> getParameterValue(partId: number, paramName: string, fallbackData: any)
        +string | null getFallbackParameterValue(paramName: string, fallbackData: any)
        +void setFallbackEnabled(enabled: boolean)
        +Promise<boolean> testConnection(quiet: boolean)
        +{ apiCalls: number, fallbackCalls: number } getApiStats()
        +string getApiUrl()
        +Promise<boolean> testBasicAuth(username: string, password: string)
        +Promise<any[]> getPartParameters(partId: number)
        +Promise<any> testBasicAuthWithEndpoint(username: string, password: string, endpoint: string)
        +Promise<boolean> testConnectionExactFormat(quiet: boolean)
        +Promise<boolean> testParameterAPI(quiet: boolean)
        +void destroy()
        +void logApiStats()
        +Promise<boolean> updateParameterDirectly(partId: number, parameterId: number, value: string)
        +{ 
    apiCalls: number, 
    successes: number, 
    failures: number, 
    fallbackCalls: number, 
    avgCallTime: number 
  } getPerformanceStats()
        +string getLastKnownParameterValue(partId: number, paramName: string)
        +void updateLastKnownParameterValue(partId: number, paramName: string, value: string)
        +void notifyParameterChanged(partId: number, paramName: string, value: string)
        +boolean isFallbackEnabled()
        +void resetRateLimiting()
        +Promise<boolean> updateParameter(partId: number, paramName: string, value: string)
        +Promise<void> fetchParameterData(partId: number, parameterName: string)
        +boolean isApiConnected()
    }
```

## Service Usage

- **[[api|api]]** uses:
  - `getParameterValue`
  - `notifyParameterChanged`
  - `setFallbackEnabled`
  - `testParameterAPI`

## Detailed Documentation

For full implementation details, see the [api.ts](../files/api.md) file documentation.

