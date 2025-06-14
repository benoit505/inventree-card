# InvenTree Card Refactoring Roadmap - June 2025

This document outlines the actionable steps for the Phase 3 refactoring, based on the findings from our deep analysis in Phase 2. The tasks are prioritized to deliver stability first, then architectural correctness, and finally, UI elegance.

---

### Priority 1: Stabilize the Foundation (Performance & Data Integrity)

*These tasks address the most critical performance bottlenecks and data corruption risks.*

- [x] **1. Tame the "Naive Bridge Keeper":**
    - **Objective:** Prevent the entire React app from re-rendering on every irrelevant Home Assistant state change.
    - **Action:** Implement the `shouldUpdate` lifecycle method in `inventree-card.ts`. This method will compare the old and new `hass` objects and return `false` if none of the entities the card actually depends on have changed.

- [x] **2. Slay the "Two-Headed Hydra" (Part 1 - The WebSocket):**
    - **Objective:** Eliminate the dual-cache problem by ensuring real-time data flows into the modern cache (RTK Query), not the legacy one.
    - **Action:** Refactor `websocket-plugin.ts`. Remove the dependency on `parametersSlice`. Instead, use `inventreeApi.util.updateQueryData` to inject WebSocket updates directly and surgically into the RTK Query cache.

- [x] **3. Supervise the "Unsupervised ActionEngine":**
    - **Objective:** Prevent users from accidentally corrupting the store with malformed or arbitrary Redux actions.
    - **Action:** Refactor `handleDispatchReduxAction` in `ActionEngine.ts`. Create an "action manifest" (an allow-list) that maps safe, user-facing action names to the actual, type-safe Redux action creators. Change the user configuration to use these safe names instead of raw action type strings.

---

### Priority 2: Correct the Core Logic (Architectural Fixes)

*These tasks address the fundamental design flaws in our core engines and data flows.*

- [x] **4. Fix the "Blind Logic Engine" and the "partContext Lie":**
    - **Objective:** Make the `ConditionalEffectsEngine` efficient and enable part-specific rules (`part_name === 'Resistor'`) to work correctly.
    - **Action:** Invert the evaluation loop in `ConditionalEffectsEngine.ts`. The primary loop should iterate through the parts, not the logic rules. Inside the loop, call `evaluateExpression` for each part, correctly passing the `part` object as the `partContext`.

- [x] **5. Slay the "Two-Headed Hydra" (Part 2 - The Evaluator):**
    - **Objective:** Complete the removal of the legacy parameter cache by severing its last critical dependency.
    - **Action:** Refactor `evaluateExpression.ts`. With `partContext` now correctly provided (from Task 4), change the `getActualValue` helper to get parameter data directly from the `partContext` object, removing the need to access `parametersSlice`.

---

### Priority 3: Unify the Architecture (The "Gold Standard" Refactor)

*This is the final, largest step, resulting in a clean, consistent, and maintainable UI architecture.*

- [x] **6. Implement the "Gold Standard" for Layouts:**
    - **Objective:** Refactor `GridLayout` and `ListLayout` to eliminate the flawed "smart container" pattern and align with the proven `PartView` architecture.
    - **Action:**
        - [x] **A. Make `GridItem` smart:** Refactor `GridItem.tsx` to accept only a `partId` prop and fetch all of its own data using RTK Query hooks, just like `PartView`.
        - [x] **B. Make `GridLayout` dumb:** Drastically simplify `GridLayout.tsx` to only handle layout. It will receive a list of `partIds`, map over them, and render a `<GridItem partId={id} />` for each, removing all complex data-fetching logic.
