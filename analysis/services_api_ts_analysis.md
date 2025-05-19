# File Analysis: services/api.ts

## Overview

- **Line Count:** 702
- **Function Count:** 21
- **Imports:** 1 modules
  - From `../utils/logger`: Logger
- **Exports:** 0 items

## Functions Defined (21)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 102 | `setParameterService` | method | public | service: any | void | 142 |
| 109 | `getParameterValue` | method | public | partId: number, paramName: string, fallbackData: any | Promise<string | null> | 3942 |
| 205 | `getFallbackParameterValue` | method | public | paramName: string, fallbackData: any | string | null | 813 |
| 232 | `setFallbackEnabled` | method | public | enabled: boolean | void | 90 |
| 238 | `testConnection` | method | public | quiet: boolean | Promise<boolean> | 2706 |
| 320 | `getApiStats` | method | public | none | { apiCalls: number, fallbackCalls: number } | 176 |
| 327 | `getApiUrl` | method | public | none | string | 62 |
| 332 | `testBasicAuth` | method | public | username: string, password: string | Promise<boolean> | 1100 |
| 369 | `getPartParameters` | method | public | partId: number | Promise<any[]> | 1885 |
| 424 | `testBasicAuthWithEndpoint` | method | public | username: string, password: string, endpoint: string | Promise<any> | 1110 |
| 461 | `testConnectionExactFormat` | method | public | quiet: boolean | Promise<boolean> | 1718 |
| 521 | `testParameterAPI` | method | public | quiet: boolean | Promise<boolean> | 1286 |
| 564 | `destroy` | method | public | none | void | 172 |
| 571 | `logApiStats` | method | public | none | void | 234 |
| 575 | `updateParameterDirectly` | method | public | partId: number, parameterId: number, value: string | Promise<boolean> | 1533 |
| 617 | `getPerformanceStats` | method | public | none | { 
    apiCalls: number, 
    successes: number, 
    failures: number, 
    fallbackCalls: number, 
    avgCallTime: number 
  } | 493 |
| 639 | `getLastKnownParameterValue` | method | public | partId: number, paramName: string | string | 159 |
| 643 | `updateLastKnownParameterValue` | method | public | partId: number, paramName: string, value: string | void | 169 |
| 650 | `notifyParameterChanged` | method | public | partId: number, paramName: string, value: string | void | 1416 |
| 691 | `isFallbackEnabled` | method | public | none | boolean | 178 |
| 698 | `resetRateLimiting` | method | public | none | void | 204 |

## Outgoing Calls (31 unique functions)

### From `getParameterValue`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 10 | 109, 118, 122, 130, 141, 167, 177, 182, 191, 193 |
| `now` | 4 | 112, 126, 130, 165 |
| `setTimeout` | 1 | 122 |
| `endsWith` | 1 | 137 |
| `append` | 3 | 146, 147, 148 |
| `fetch` | 1 | 152 |
| `error` | 2 | 158, 198 |
| `json` | 1 | 164 |
| `round` | 1 | 169 |
| `find` | 1 | 172 |
| `toLowerCase` | 2 | 174, 174 |
| `syncApiDataToEntityState` | 1 | 181 |
| `notifyParameterChanged` | 1 | 184 |
| `warn` | 1 | 190 |
| `forEach` | 1 | 192 |

### From `getFallbackParameterValue`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 206 |
| `isArray` | 1 | 214 |
| `find` | 1 | 217 |
| `toLowerCase` | 2 | 217, 218 |

### From `testConnection`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `endsWith` | 2 | 243, 277 |
| `log` | 2 | 249, 267 |
| `append` | 6 | 254, 255, 256, 272, 273, 274 |
| `fetch` | 2 | 260, 281 |
| `warn` | 5 | 287, 295, 299, 308, 313 |
| `setFallbackEnabled` | 4 | 288, 303, 309, 314 |
| `text` | 1 | 299 |

### From `testBasicAuth`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `endsWith` | 1 | 336 |
| `log` | 3 | 340, 355, 358 |
| `btoa` | 1 | 344 |
| `fetch` | 1 | 346 |
| `error` | 1 | 362 |

### From `getPartParameters`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `startsWith` | 2 | 375, 385 |
| `replace` | 1 | 376 |
| `endsWith` | 1 | 380 |
| `log` | 3 | 390, 409, 412 |
| `fetch` | 1 | 394 |
| `error` | 2 | 402, 417 |
| `json` | 1 | 407 |

### From `testBasicAuthWithEndpoint`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `endsWith` | 1 | 428 |
| `log` | 3 | 432, 447, 451 |
| `btoa` | 1 | 436 |
| `fetch` | 1 | 438 |
| `json` | 1 | 449 |
| `error` | 1 | 455 |

### From `testConnectionExactFormat`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `endsWith` | 1 | 464 |
| `slice` | 1 | 464 |
| `log` | 1 | 467 |
| `fetch` | 1 | 479 |
| `json` | 1 | 490 |
| `testParameterAPI` | 1 | 496 |
| `warn` | 3 | 500, 507, 513 |

### From `testParameterAPI`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `endsWith` | 1 | 523 |
| `slice` | 1 | 523 |
| `log` | 1 | 526 |
| `fetch` | 1 | 536 |
| `json` | 1 | 543 |
| `setFallbackEnabled` | 1 | 546 |
| `warn` | 2 | 550, 556 |

### From `destroy`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clearInterval` | 1 | 565 |

### From `logApiStats`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 571 |

### From `updateParameterDirectly`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `endsWith` | 1 | 577 |
| `slice` | 1 | 577 |
| `log` | 2 | 580, 596 |
| `fetch` | 1 | 584 |
| `stringify` | 1 | 591 |
| `error` | 4 | 599, 603, 605, 611 |
| `text` | 1 | 603 |

### From `getPerformanceStats`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `round` | 1 | 624 |

### From `getLastKnownParameterValue`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 640 |

### From `updateLastKnownParameterValue`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `set` | 1 | 643 |

### From `notifyParameterChanged`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `has` | 1 | 655 |
| `log` | 2 | 655, 676 |
| `add` | 1 | 658 |
| `setTimeout` | 1 | 661 |
| `delete` | 1 | 662 |
| `dispatchEvent` | 2 | 678, 679 |

### From `resetRateLimiting`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 698 |


## Incoming Calls (15 calls from other files)

### To `destroy`

| Caller | File | Line |
|--------|------|------|
| `disconnectedCallback` | inventree-card.ts | 1004 |

### To `resetRateLimiting`

| Caller | File | Line |
|--------|------|------|
| `_testSpecificParameter` | inventree-card.ts | 1220 |

### To `getParameterValue`

| Caller | File | Line |
|--------|------|------|
| `_testSpecificParameter` | inventree-card.ts | 1228 |
| `matchesConditionAsync` | services/parameter-service.ts | 184 |
| `matchesConditionAsync` | services/parameter-service.ts | 188 |
| `matchesLocalCondition` | services/parameter-service.ts | 528 |
| `getParameterValueDirectly` | services/parameter-service.ts | 591 |
| `fetchParameterData` | services/parameter-service.ts | 1036 |

### To `setFallbackEnabled`

| Caller | File | Line |
|--------|------|------|
| `setFallbackState` | services/parameter-service.ts | 611 |

### To `getApiStats`

| Caller | File | Line |
|--------|------|------|
| `diagnosticDump` | services/parameter-service.ts | 641 |
| `getApiStats` | services/parameter-service.ts | 816 |
| `runDiagnostics` | services/parameter-service.ts | 919 |

### To `isFallbackEnabled`

| Caller | File | Line |
|--------|------|------|
| `diagnosticDump` | services/parameter-service.ts | 642 |

### To `getPerformanceStats`

| Caller | File | Line |
|--------|------|------|
| `diagnosticDump` | services/parameter-service.ts | 646 |

### To `setParameterService`

| Caller | File | Line |
|--------|------|------|
| `setDirectApi` | services/parameter-service.ts | 978 |


## File Dependencies

### Direct Dependencies (1)

- ../utils/logger

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `getParameterValue` | 3942 | 6 | 3 |
| 2 | `testConnection` | 2706 | 0 | 1 |
| 3 | `getPartParameters` | 1885 | 0 | 1 |
| 4 | `testConnectionExactFormat` | 1718 | 0 | 1 |
| 5 | `updateParameterDirectly` | 1533 | 0 | 3 |
| 6 | `notifyParameterChanged` | 1416 | 1 | 3 |
| 7 | `testParameterAPI` | 1286 | 1 | 1 |
| 8 | `testBasicAuthWithEndpoint` | 1110 | 0 | 3 |
| 9 | `testBasicAuth` | 1100 | 0 | 2 |
| 10 | `getFallbackParameterValue` | 813 | 0 | 2 |
| 11 | `getPerformanceStats` | 493 | 1 | 0 |
| 12 | `logApiStats` | 234 | 0 | 0 |
| 13 | `resetRateLimiting` | 204 | 1 | 0 |
| 14 | `isFallbackEnabled` | 178 | 1 | 0 |
| 15 | `getApiStats` | 176 | 3 | 0 |
| 16 | `destroy` | 172 | 1 | 0 |
| 17 | `updateLastKnownParameterValue` | 169 | 0 | 3 |
| 18 | `getLastKnownParameterValue` | 159 | 0 | 2 |
| 19 | `setParameterService` | 142 | 1 | 1 |
| 20 | `setFallbackEnabled` | 90 | 6 | 1 |
| 21 | `getApiUrl` | 62 | 0 | 0 |
