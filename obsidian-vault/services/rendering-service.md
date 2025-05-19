---
aliases: [rendering-service.ts]
tags: [service, services]
---

# rendering-service.ts

**Path:** `services/rendering-service.ts`  
**Line Count:** 653  
**Functions:** 26  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `setupRendering`
- `handleWebSocketUpdate`
- `startIdleTimer`
- `restartIdleTimer`
- `registerRenderCallback`
- `notifyRenderCallbacks`
- `executeRenderCallbacks`
- `forceRender`
- `shouldRender`
- `startScheduler`
- `stopScheduler`
- `processScheduledJobs`
- `shouldRunJob`
- `evaluateCronExpression`
- `matchesCronPart`
- `calculateNextRunTime`
- `addScheduledJob`
- `removeScheduledJob`
- `updateScheduledJob`
- `getScheduledJobs`
- `getScheduledJob`
- `destroy`
- `notifyRenderComplete`
- `getIdleTimerStatus`
- `getSchedulerStatus`

## Service Interface

```mermaid
classDiagram
    class rendering-service {
        +RenderingService getInstance()
        +void setupRendering(config: DirectApiConfig)
        +void handleWebSocketUpdate(detail: any)
        +void startIdleTimer()
        +void restartIdleTimer()
        +() => void registerRenderCallback(callback: () => void)
        +void notifyRenderCallbacks()
        +void executeRenderCallbacks()
        +void forceRender()
        +boolean shouldRender(entityId: string, dataHash: string)
        +void startScheduler()
        +void stopScheduler()
        +void processScheduledJobs()
        +boolean shouldRunJob(job: ScheduledJobConfig, now: Date)
        +boolean evaluateCronExpression(cronExpression: string, now: Date)
        +boolean matchesCronPart(cronPart: string, currentValue: number, min: number, max: number)
        +number calculateNextRunTime(job: ScheduledJobConfig, now: Date)
        +void addScheduledJob(jobConfig: ScheduledJobConfig)
        +boolean removeScheduledJob(jobId: string)
        +boolean updateScheduledJob(jobId: string, updates: Partial<ScheduledJobConfig>)
        +ScheduledJobConfig[] getScheduledJobs()
        +ScheduledJobConfig | undefined getScheduledJob(jobId: string)
        +void destroy()
        +void notifyRenderComplete()
        +{active: boolean, timeRemaining: number} getIdleTimerStatus()
        +{
    active: boolean,
    jobCount: number,
    nextJobs: Array<{id: string, description?: string, nextRun: number}>
  } getSchedulerStatus()
    }
```

## Service Usage

- **[[rendering-service|rendering-service]]** uses:
  - `calculateNextRunTime`
  - `evaluateCronExpression`
  - `executeRenderCallbacks`
  - `handleWebSocketUpdate`
  - `matchesCronPart`
  - `notifyRenderCallbacks`
  - `processScheduledJobs`
  - `restartIdleTimer`
  - `shouldRunJob`
  - `startIdleTimer`
  - `startScheduler`
  - `stopScheduler`

## Detailed Documentation

For full implementation details, see the [rendering-service.ts](../files/rendering-service.md) file documentation.

