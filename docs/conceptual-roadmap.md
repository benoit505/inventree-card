# Conceptual Roadmap: Towards a Universal Reality Mapping System

*Last Updated: {{TIMESTAMP}}*

## Principle #1: Core Philosophy
This document outlines the strategic refactoring and evolution of the InvenTree Card. Our goal is to move beyond a simple data display tool and create a **Universal Reality Mapping System**. This means the card should be a dynamic, instance-aware, and highly configurable platform for visualizing and interacting with real-world objects and their digital twins. We will achieve this by systematically addressing the architectural flaws discovered in our deep-dive analysis and building a more robust and flexible foundation.

Our mantra is: **Instance-Awareness, Centralized Initialization, and Clear Data Flow.**

## Principle #2: The Four Pillars of Refactoring

Our work will be guided by the "Grand Unified Theory" derived from our four analysis documents (`storeanalysis.md`, `thunkanalysis.md`, `serviceanalysis.md`, `uianalysis.md`). This theory identifies four key architectural problems that must be solved. All refactoring tasks should aim to address one or more of these pillars.

### Pillar 1: Enforce Strict Instance-Awareness
*   **The Problem:** The single greatest source of instability is the conflict between global, singleton services and the multi-instance nature of the card. State bleeds between cards, and side effects are not properly isolated.
*   **The Solution:** Eradicate all "single global service" patterns. All state, APIs, and services must be explicitly tied to a `cardInstanceId`.

### Pillar 2: Centralize and Simplify the Component Lifecycle
*   **The Problem:** The component lifecycle is a complex and fragile "useEffect web" spread across `inventree-card.ts` and `InventreeCard.tsx`. This leads to race conditions and makes initialization impossible to reason about.
*   **The Solution:** Create a single, unified initialization and teardown manager. This manager will be responsible for orchestrating the entire setup and removal of a card instance in a predictable, sequential order.

### Pillar 3: Unify State Management
*   **The Problem:** The use of Redux, Redux-Thunk, Redux-Persist, RTK Query, and Zustand creates a confusing and overlapping state management landscape. This is particularly problematic in complex components like `TableLayout.tsx`.
*   **The Solution:** Consolidate state management into a single, coherent strategy based on Redux Toolkit. We will use RTK for core state, RTK Query for API caching, and `redux-persist` for any state that needs to be saved to localStorage, removing the need for Zustand.

### Pillar 4: Prune Legacy Code and "Ghosts"
*   **The Problem:** The codebase contains obsolete services and patterns (`print-label.ts`, `wled-service.ts`) that were superseded by more robust "Engine" patterns but were never removed.
*   **The Solution:** Systematically remove all identified "Legacy Ghosts" and refactor their functionality into the modern, engine-based architecture.

## Principle #3: The Detailed Roadmap

This section translates the four pillars into a concrete, prioritized list of tasks.

---

### **Tier 1: The Great Unraveling (Foundational Refactoring)**
*These tasks MUST be completed first, as they unblock all subsequent work. They are highly interconnected and address the most critical architectural flaws.*

#### **1. [X] The Instance-Aware API Service (Pillar 1)**
*   **Goal:** Solve the "Single Global Service" problem at its source by making all API calls instance-specific.
*   **Detailed Steps:**
    1.  **Delete `src/services/inventree-api-service.ts`**: This class is the implementation of the global service and must be removed.
    2.  **Delete `src/store/slices/apiSlice.ts`**: This slice is no longer needed. The API connection status can be derived from the per-instance configuration.
    3.  **Create a `dynamicBaseQuery` for RTK Query**:
        *   In `src/store/apis/inventreeApi.ts`, create a custom `baseQuery` function.
        *   This function will accept query arguments (e.g., `{ url, method, body, cardInstanceId }`).
        *   Inside the function, it will use `getState()` to access `state.config.configsByInstance[cardInstanceId]` to get the correct API URL and token for that specific card instance before making the `fetch` call.
    4.  **Refactor All RTK Query Endpoints**:
        *   Modify every endpoint definition in `inventreeApi.ts` (e.g., `getPart`, `getPartParameters`) to accept an object as an argument that *must* include the `cardInstanceId` (e.g., `getPart: builder.query({ query: ({ pk, cardInstanceId }) => ... })`).
    5.  **Update All API Hook Usage**:
        *   Search the entire codebase for every usage of an RTK Query hook (e.g., `useGetPartQuery`, `useAdjustStockMutation`, `usePrefetch`) and update the call to pass the new argument object including `cardInstanceId`.
    6.  **Delete Obsolete Thunks**:
        *   The `initializeDirectApi` thunk in `src/store/thunks/systemThunks.ts` is now redundant. Delete it.

#### **2. [X] The Lifecycle & Initialization Manager (Pillar 2)**
*   **Goal:** Tame the `useEffect` web, eliminate race conditions, and create a single, predictable initialization sequence.
*   **Detailed Steps:**
    1.  **Create `src/store/thunks/lifecycleThunks.ts`**: This new file will house the orchestration logic.
    2.  **Create `initializeCardThunk`**:
        *   This thunk will accept `{ cardInstanceId, config, hass }`.
        *   It will contain the entire initialization sequence, moving all logic from the `useEffect` hooks in `InventreeCard.tsx` into this single location. The sequence of dispatches will be strictly ordered:
            1.  `setConfigAction`
            2.  `clearCache`
            3.  `setActionDefinitions`
            4.  `initializeRuleDefinitionsThunk`
            5.  `initializeWebSocketPlugin`
            6.  `processHassEntities`
            7.  `initializeGenericHaStatesFromConfig`
            8.  `fetchConfiguredParameters`
    3.  **Create `destroyCardThunk`**:
        *   This thunk will accept `{ cardInstanceId }`.
        *   It will contain the cleanup logic currently in the `useEffect` return function in `InventreeCard.tsx`: `removeComponent`, `removeConfigAction`, and `removeInstance`.
    4.  **Refactor `InventreeCard.tsx`**:
        *   Delete all individual `useEffect` hooks related to initialization and data fetching.
        *   Create a single `useEffect` hook that depends on `[cardInstanceId, stringifiedConfig, dispatch]`.
        *   Inside this hook, dispatch `initializeCardThunk`.
        *   The `return` function of this `useEffect` must dispatch `destroyCardThunk`. The component will become a simple "host" for the lifecycle thunks.

#### **3. [X] Unified State Persistence (Pillar 3)**
*   **Goal:** Eliminate Zustand and consolidate state persistence within the Redux ecosystem, removing the "Mixed State Management" problem.
*   **Detailed Steps:**
    1.  **Create `src/store/slices/layoutSlice.ts`**:
        *   This new slice will manage layout and column state, fully namespaced by instance.
        *   State shape: `{ layoutsByInstance: { [id]: Layouts }, columnsByInstance: { [id]: Column[] } }`.
        *   It will have `setLayouts` and `setColumns` reducers that require `cardInstanceId` in the payload.
    2.  **Integrate with `redux-persist`**:
        *   In `src/store/index.ts`, add `'layout'` to the `persistConfig` whitelist, alongside `'config'`.
    3.  **Refactor `TableLayout.tsx`**:
        *   Remove the `import { useLayoutStore } ...` and all associated Zustand logic.
        *   Replace it with `useAppSelector` to read layout/column state from the new `layoutSlice` for the current `cardInstanceId`.
        *   Replace calls to `setLayouts` and `setColumns` with `dispatch` calls to the new Redux actions.
    4.  **Remove Zustand**:
        *   Delete the `src/store/layoutStore.ts` file.
        *   Run `npm uninstall zustand`.

---

### **Tier 2: Purging the Ghosts (Code Cleanup)**
*With a stable foundation, we can systematically remove all identified legacy code.*

#### **1. [X] Delete Obsolete Services (Pillar 4)**
*   **Goal:** Remove all redundant, hard-coded "ghost" services.
*   **Detailed Steps:**
    1.  Delete `src/services/wled-service.ts`.
    2.  Delete `src/services/print-label.ts`.
    3.  Delete `src/services/adjust-stock.ts`.
    4.  Delete `src/services/websocket.ts`.
    5.  Delete `src/store/middleware/services-middleware.ts`.
    6.  Search the codebase for any remaining imports from these files (e.g., in `partsSlice` thunks) and remove them. This logic is now handled by the `ActionEngine`.

---

### **Tier 3: Component & Feature Refactoring**
*With a stable and clean foundation, we can refactor UI components and prepare for new features.*

#### **1. [X] Refactor `TableLayout.tsx` (Pillar 3)**
*   **Goal:** Simplify the most complex component in the application, making it more performant and easier to maintain.
*   **Detailed Steps:**
    1.  **Consolidate State Logic**: With Zustand removed, review all `useState` and `useMemo` hooks.
    2.  **Leverage Selectors**: Create memoized selectors in the `layoutSlice` file (using `createSelector`) for derived data. This moves complex logic out of the component and into the state layer, ensuring calculations only run when the underlying data changes.
    3.  **Simplify `useEffect` hooks**: The remaining effects should be minimal, reacting cleanly to prop and Redux state changes.

---

### **Tier 4: New Feature Exploration**
*With a stable, extensible, and instance-aware architecture, we can confidently begin to explore new features that were previously impossible or too fragile to implement.*

1.  **[ ] To be defined...**
    *   *Example: Multi-server support (now possible with instance-aware API calls).*
    *   *Example: Advanced cross-card interactions.*
    *   *Example: A more powerful and flexible layout system.*

This is our path. It is ambitious, but it is also logical, evidence-based, and addresses every single issue we have uncovered. We are ready to begin.