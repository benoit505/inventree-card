# Redux Store Architectural Analysis

*Last Updated: {{TIMESTAMP}}*

## 1. Core Philosophy & Goals

This document serves as a deep-dive analysis into the Redux state management architecture of the InvenTree Card. The primary goal is not to fix individual bugs, but to understand the system as a whole, identify its core concepts, architectural patterns, and stress points. 

Our guiding principle is to move towards an "organically sound" architecture—one that is predictable, scalable, and easier to reason about, especially in the context of multiple card instances co-existing on a single dashboard.

We will investigate:
- **State Structure:** How is the global state organized?
- **Per-Instance Data:** How do we isolate state for different card instances? Is the current pattern consistent and robust?
- **Data Flow & Lifecycle:** How and when is data fetched, initialized, updated, and persisted?
- **Race Conditions:** Where are the potential race conditions, especially during card initialization?
- **Middleware:** What role does each middleware play, and how do they interact?
- **Slice Responsibilities:** Is there a clear separation of concerns between slices?

## 2. High-Level Overview

The store is configured in `src/store/index.ts`.

- **Persistence:** `redux-persist` is used.
  - The entire state is **not** persisted. The `whitelist` is currently set to `['config']`. This is a critical architectural choice. It implies that the `config` slice is the source of truth that survives a refresh, and all other state must be derivable from it.
- **Slices:** There are currently **16** registered reducers/slices, including 2 RTK Query APIs. This is a significant number of state domains to manage.
- **Middleware:** There are **6** registered middleware components, including the RTK Query middleware. This indicates complex side-effect and data-fetching logic.

## 3. Slice-by-Slice Analysis

We will now analyze each slice to understand its purpose, state shape, and interactions.

### 3.1. `configSlice`

*   **File:** `src/store/slices/configSlice.ts`
*   **Purpose:** To store the YAML configuration provided by Home Assistant for each unique instance of the card. It acts as the foundational "source of truth" for a card's settings.
*   **State Shape:** 
    ```typescript
    {
      configsByInstance: {
        [cardInstanceId: string]: {
          config: InventreeCardConfig;
          configInitialized: boolean;
        }
      }
    }
    ```
    This follows the correct "per-instance" pattern, isolating configuration between different cards on the same dashboard.
*   **Key Observations & Questions:** 
    1.  **The "Bedrock" Slice:** This is the **only** slice persisted to `localStorage`. This is a major architectural decision. It means that on a page refresh, all other application state (part data, UI state, etc.) must be re-derived or re-fetched using the information stored in this slice.
    2.  **Initialization Trigger:** The `setConfigAction` is the entry point for a card's configuration. This action must be dispatched early in the component lifecycle. The timing of this action relative to the initialization of other services and data-fetching slices is a critical area and a likely source of race conditions.
    3.  **Shallow Merge on Update:** The reducer uses a shallow merge (`{ ...existingConfig, ...newConfigPartial }`) to update the configuration. **Question:** Is it the intended behavior that removing a key from the YAML configuration does *not* remove it from the state? This could lead to confusing behavior where old settings persist until a full card reset. A deep merge or a more specific replacement logic might be safer.
    4.  **Unused `configInitialized` Flag:** The state includes a `configInitialized` boolean flag. **Question:** Is any other part of the application observing this flag? It seems designed to solve an initialization race condition, but it's unclear if it's actually being used. If not, it represents a missed opportunity for synchronization. Other slices might be firing off actions before the config they depend on is actually ready.

### 3.2. `partsSlice`

*   **File:** `src/store/slices/partsSlice.ts`
*   **Purpose:** To fetch, store, and manage the `InventreeItem` objects that are the core data of the card. It handles data coming from Home Assistant sensors, direct API calls, and WebSocket updates.
*   **State Shape:** 
    ```typescript
    {
      // GOOD: Data is correctly namespaced by card instance.
      partsByInstance: {
        [cardInstanceId: string]: {
          partsById: { [partId: number]: InventreeItem } 
        }
      },
      // BAD: Transient UI/action state is global, not per-instance.
      locatingPartId: number | null,
      adjustingStockPartId: number | null,
      // ... other global fields
    }
    ```
*   **Key Observations & Questions:** 
    1.  **Mixed State Model (The "Hybrid" Problem):** This slice exemplifies a core architectural conflict. While the primary data (`partsByInstance`) is correctly namespaced for multi-card support, the transient state for actions (`locatingPartId`, `adjustingStockPartId`) is global. If a user tried to "locate" parts on two different cards at once, the UI state would clash, as they both write to the same `locatingPartId` key.
    2.  **The "Find First" Problem in Thunks:** The async thunks (`locatePartById`, `adjustPartStock`) are not truly multi-instance aware. When an action is triggered, they search for the part across *all* instances and then find the *first matching service configuration* (e.g., WLED) from the global state. **This is a critical flaw.** If two cards are configured to use two different WLED controllers, which one is used is non-deterministic. It depends on the iteration order of objects in the state.
    3.  **Assumption of a Single API Source:** The `fetchPartDetails` thunk reads API connection details from a separate, global `api` slice, not from the per-instance `configSlice`. This implies the entire system is hard-wired to talk to only **one** InvenTree server instance. **Question:** Is this an intentional limitation? If the goal is to allow different cards to point to different servers, this is a fundamental bug in the data-fetching architecture.
    4.  **Data Provenance:** The `setParts` action populates the initial data from Home Assistant. Other actions (`fetchPartDetails`, WebSocket updates) then modify this data. This can make it difficult to trace the origin of the data currently displayed on the card, which is crucial for debugging.

### 3.3. `visualEffectsSlice`

*   **File:** `src/store/slices/visualEffectsSlice.ts`
*   **Purpose:** To manage the dynamic visual state of UI components. This includes per-part effects (highlights, animations), visibility of UI elements, and dynamic CSS properties for layout cells. It is a pure UI state slice.
*   **State Shape:** 
    ```typescript
    {
      effectsByCardInstance: Record<string, ...>,
      elementVisibilityByCard: Record<string, ...>,
      layoutOverridesByCardInstance: Record<string, ...>,
      layoutEffectsByCell: Record<string, ...>
    }
    ```
    The state is comprehensively and correctly namespaced by `cardInstanceId`. This is a model implementation of the per-instance pattern.
*   **Key Observations & Questions:** 
    1.  **A "Model Citizen" Slice:** This slice is an excellent example of the per-instance pattern done right. All its state is properly namespaced, and all its actions require a `cardInstanceId`. It avoids the "Hybrid Problem" entirely, proving that robust multi-card state management is achievable within this architecture.
    2.  **Clean Separation of Concerns:** This slice contains no async thunks or data-fetching logic. It is purely *reactive*, holding state that is managed by other parts of the system (likely middleware). This is a strong architectural positive.
    3.  **No Side Effects, No Problems:** Because this slice manages internal UI state and has no async thunks that interact with external services, it completely avoids the "Find First" and "Single API Source" problems seen in `partsSlice`. This strongly suggests that the core architectural issues are concentrated in how async side effects are handled.
    4.  **The `undefined_card` Anomaly:** The `selectAllVisualEffectsForCard` selector contains logic to merge a card's specific effects with a "global" set of effects stored under the key `'undefined_card'`. **Question:** This is a powerful feature for defaults, but its origin is unclear. How is this global state set? Is it an intentional feature or an implementation artifact? It could be a source of "magic" or unexpected behavior if not understood.

### 3.4. `loggingSlice`

*   **File:** `src/store/slices/loggingSlice.ts`
*   **Purpose:** Manages the state for the interactive logging UI in the card editor. It stores user-defined "log queries" and the "captured logs" that match those queries.
*   **State Shape:** 
    ```typescript
    {
      settings: GlobalLogSettings;
      queries: LogQuery[];
      capturedLogs: LogEntry[];
    }
    ```
    The state is **entirely global**. None of the keys are namespaced by `cardInstanceId`.
*   **Key Observations & Questions:** 
    1.  **Architectural Regression:** This slice, despite being one of the newest, is a regression from the better per-instance patterns. Its state is completely global. If a user opens the editor for two different cards, they will interact with the *exact same* set of queries and captured logs, making concurrent debugging impossible and confusing.
    2.  **Is Global State Necessary?** The state in this slice is only relevant when the card *editor* is open. **Question:** Does this state belong in the global Redux store? It could potentially be managed by local React state (`useState`, `useReducer`) within the editor component itself. Placing ephemeral, editor-only state in the global store adds complexity and potential for conflicts.
    3.  **A Case Study for This Analysis:** The fact that this global pattern was so recently implemented proves the core thesis of this analysis: without explicit, documented architectural principles, it is easy for even well-intentioned development to degrade the system's integrity over time. This slice is "Exhibit A" for why this deep-dive is necessary.

(... and so on for other slices)

## 4. Middleware Analysis

This section analyzes the custom middleware, which contains critical side-effect logic.

### 4.1. `logging-middleware.ts`

*   **Purpose:** 
    1.  To provide generic, low-level logging for all Redux actions (timing, payload).
    2.  To act as the engine for the interactive logging feature. It intercepts a specific `logging/logFired` action, compares it against the user's queries in the `loggingSlice`, and dispatches a `captureLog` action if it finds a match.
*   **Key Observations & Questions:**
    1.  **Executing the Flawed Pattern:** This middleware is the "action arm" of the `loggingSlice`, and it perfectly demonstrates the consequences of the slice's global state. Because it reads from a global `state.logging.queries` array, its behavior is inherently global. It has no mechanism to know which card an action originated from or to apply a query to a specific card's logs.
    2.  **Confirms the Slice Analysis:** This middleware's behavior validates our analysis of `loggingSlice`. The problem is not in the middleware's implementation—it correctly executes its logic. The problem is that the *design* it is based on (a global state for a per-instance feature) is flawed.
    3.  **Safe Dispatch Logic:** The middleware dispatches a `captureLog` action from within its own body. This is handled safely, as it only reacts to `logFired` actions, preventing an infinite dispatch loop.

### 4.2. `services-middleware.ts`

*   **Purpose:** Intended as a bridge to a previous, service-singleton based architecture. The comments suggest it was created to help with a gradual migration to Redux.
*   **Key Observations & Questions:**
    1.  **A "Ghost" Middleware:** This middleware is largely a historical artifact. Most of its logic, which involved interacting with singleton services like `CacheService` and `ParameterService`, has been commented out. It is a "ghost" of a previous architecture that persists in the codebase.
    2.  **Lack of Multi-Instance Awareness:** The patterns within the middleware, both active and commented-out, are entirely global. They do not use `cardInstanceId` and rely on fetching global singleton instances (`ParameterService.getInstance()`). If this middleware were active, it would suffer from the same "Single Global Service" problem as the thunks in `partsSlice`.
    3.  **Candidate for Deletion:** As it is mostly dormant and its remaining logic seems redundant (dispatching a thunk in response to an action that could have just been the thunk in the first place), this middleware is a strong candidate for complete removal. Its presence adds to the system's cognitive load without providing significant value, and it represents an incomplete refactoring.

### 4.3. `websocketMiddleware.ts`

*   **Purpose:** To act as the central handler for real-time events from the Home Assistant WebSocket connection. It processes incoming data, updates the state (primarily the RTK Query cache), and triggers re-evaluation of conditional logic.
*   **Key Observations & Questions:**
    1.  **A "Good" Global Component:** This middleware is an excellent example of a component that is correctly designed to be global. Since there is only one WebSocket connection, a single handler is the right approach.
    2.  **Pattern: "Receive Globally, Update Specifically":** This middleware demonstrates a robust architectural pattern. It receives a global event (e.g., "stock was updated for part 123"), then uses a highly specific tool (`inventreeApi.util.updateQueryData`) to update only that precise piece of data in the RTK Query cache. This is efficient and leverages modern Redux Toolkit features correctly.
    3.  **Smart Multi-Instance Awareness:** The middleware's throttling logic is noteworthy. It inspects the configuration of *all* active card instances to find the most aggressive `conditionEvalFrequency` requested, and adapts its throttle delay accordingly. This is a smart, multi-instance-aware implementation.
    4.  **Pragmatic Global Evaluation:** After a specific data update, the middleware triggers a re-evaluation of conditional logic for *all* active cards (`evaluateEffectsForAllActiveCardsThunk`). While a more complex implementation could try to figure out exactly which cards were affected, this is a reasonable and pragmatic trade-off between implementation complexity and performance, especially given the throttling.

### 4.4. `metricsMiddleware.ts`

*   **Purpose:** A simple utility middleware that listens for a `metrics/trackEvent` action and calls a global `trackUsage` function.
*   **Key Observations & Questions:**
    1.  **Simple and Decoupled:** This middleware is a good example of a single-purpose utility. It cleanly decouples the desire to track an event (the action) from the implementation of how it's tracked (the `trackUsage` function).
    2.  **No State Interaction:** It does not read from or write to the Redux state, making it immune to the state-related architectural issues seen elsewhere.
    3.  **Implicitly Global:** The underlying `trackUsage` function is global. **Question:** Is a `cardInstanceId` passed in the action payload? If not, the metrics are not being correlated to specific card instances, which limits their usefulness in a multi-card environment. This is a minor point but fits the broader theme.

## 5. Architectural Patterns & Stress Points

Our analysis reveals several key architectural patterns and the stress points they create.

### 5.1. The "Per-Instance vs. Global" Conflict

This is the primary source of tension in the codebase. The system is caught between two models for handling state and side effects.

*   **The Good (Correct Per-Instance State):** The fundamental pattern of namespacing state by a unique `cardInstanceId` (e.g., `state.slice.dataByInstance[id]`) is sound and correctly implemented in slices like `configSlice` and `visualEffectsSlice`. This is the bedrock of multi-card support.
*   **The Bad (The "Hybrid" Slice):** `partsSlice` exemplifies this problem. It correctly namespaces its core data but mixes it with **global** UI state for actions (e.g., `locatingPartId`). This creates direct state conflicts when actions are performed on multiple cards simultaneously.
*   **The Ugly (The "Purely Global" Slice):** `loggingSlice` is entirely global. It was built without any per-instance awareness, making it fundamentally incompatible with multi-card debugging and a prime example of architectural drift.

### 5.2. The Side-Effect Handling Problem

The way async actions and side effects are handled is the second major stress point. The issue is not in the state *shape*, but in the *logic that uses the state*.

*   **The Good ("Receive Globally, Update Specifically"):** `websocketMiddleware` provides a model pattern. It listens to a single global source but uses highly specific RTK Query cache utilities to update discrete pieces of state, which is efficient and robust.
*   **The Bad (The "Find First" Pattern):** Thunks like `locatePartById` in `partsSlice` are not truly instance-aware. They search for data globally, then find the **first available** service configuration in the state to perform their action. In a multi-card setup with differing configurations, this is non-deterministic and a critical flaw.
*   **The Ugly (The "Single Global Service" Assumption):** The core data-fetching thunks assume the entire system will only ever talk to one InvenTree server. They get their API config from a legacy, global `api` slice instead of the per-instance `configSlice`.

### 5.3. The Initialization Race Condition

There is no clear, enforced sequence for card initialization. The `configSlice` holds the foundational data, but other parts of the system have no way of knowing if or when that data is ready. This leads to bugs where data fetching or other logic may fire before the necessary configuration is available in the store. The `configInitialized` flag exists but appears to be unused, a missed opportunity for coordination.

## 6. Path Forward: Recommendations

Based on the analysis, here is a proposed set of architectural principles and actionable steps to create a more robust, predictable, and "organically sound" system. We will not fix symptoms; we will fix the foundation.

### Principle #1: All Card-Specific State MUST Be Per-Instance

There can be no more "hybrid" or "purely global" slices for state that belongs to a card.

*   **Action Item 1.1:** Refactor `partsSlice`. Move transient state keys (`locatingPartId`, `adjustingStockPartId`, `adjustmentError`) inside the `partsByInstance` object. Each card must have its own loading/action state.
*   **Action Item 1.2:** Refactor `loggingSlice`. The entire state (`settings`, `queries`, `capturedLogs`) must be namespaced by `cardInstanceId`. The editor UI must be updated to read from and write to the state for its specific instance.

### Principle #2: All Side Effects MUST Be Instance-Aware

The "Find First" pattern is forbidden. Thunks must be explicitly told which card instance they are operating on.

*   **Action Item 2.1:** Refactor all data-modifying thunks (e.g., `locatePartById`, `adjustPartStock`, `fetchPartDetails` in `partsSlice`). They **must** accept `cardInstanceId` as a parameter.
*   **Action Item 2.2:** Inside these thunks, the `cardInstanceId` must be used to select the specific configuration from `state.config.configsByInstance[cardInstanceId]`. The thunk must use *that specific config* to perform its API/service call. This will eliminate the "Single Global Service" problem as a natural consequence.

### Principle #3: Establish a Clear Initialization Flow

Create a predictable, observable startup sequence for each card.

*   **Action Item 3.1:** Create a new `initializeCardThunk` that accepts `{ hass, config, cardInstanceId }`.
*   **Action Item 3.2:** This thunk will be the **single entry point** for setting up a new card instance. It will be dispatched from `react-app.tsx` when the component mounts.
*   **Action Item 3.3:** The thunk's logic will be:
    1.  Dispatch `setConfigAction` with the config and instance ID.
    2.  The `configSlice` reducer is synchronous, so the config is now in the state.
    3.  Dispatch any subsequent actions needed for initialization (e.g., fetching initial part data), passing the `cardInstanceId` and the now-guaranteed-to-exist configuration to them.

### Principle #4: Aggressively Prune Dead Code

Reduce cognitive load and eliminate historical artifacts.

*   **Action Item 4.1:** Delete `src/store/middleware/services-middleware.ts` from the project and remove it from the store configuration.
*   **Action Item 4.2:** Find any components that dispatch the now-defunct `parameters/updateValue` action and refactor them to dispatch the `updateParameterValue` thunk directly.
