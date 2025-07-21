# Brainstorming: Card Lifecycle & State Management

This document captures our brainstorming process for solving the persistent lifecycle issues in the InvenTree card. The format is a series of questions and answers to explore the problem space.

---

### Q1: What is the fundamental conflict in our card's lifecycle?

**A:** The core conflict is between **Lovelace's stateless "recreate everything" model** and our **desire for stateful persistence** within the card.

*   **Lovelace:** When *any* part of the card's `config` changes, Lovelace's standard behavior is to destroy the entire card element and create a new one from scratch. This is simple and predictable.
*   **Our Card:** We have complex state that is expensive to re-create (API data via RTK Query) or that we want to persist across simple view changes (e.g., UI state in `TableLayout`, Redux Persist data).
*   **The Clash:** Our attempts to manage this clash have led to a complex system of thunks (`initialize`, `destroy`, `softDestroy`), instance IDs, and Redux state management that fights against Lovelace's lifecycle, causing race conditions. The "Initializing configuration..." bug is the primary symptom of losing this fight. When we switch from the main view to the editor, or after saving, our Redux state gets wiped just before the new component needs it.

---

### Q2: Where in the code does the "destroying and building up" happen?

**A:** The process is split between the top-level Lit component, the main React component, and dedicated Redux thunks.

*   **The "Build-Up" (Initialization):**
    1.  **Entry Point:** `inventree-card.ts` -> `setConfig()` is called by Lovelace. It generates the `cardInstanceId`.
    2.  **React Mount:** It mounts the `<ReactApp>` and passes the `cardInstanceId` as a prop.
    3.  **Trigger:** `InventreeCard.tsx` -> A `useEffect` hook fires when the `cardInstanceId` is received.
    4.  **Orchestrator:** This hook dispatches `initializeCardThunk` from `src/store/thunks/lifecycleThunks.ts`. This single thunk is the master builder, responsible for setting up all the different state slices (rules, API, WebSockets, etc.) for that specific instance.

*   **The "Tear-Down" (Destruction):** This is a two-level process, designed to be either "soft" for view changes or "hard" for full removal.
    1.  **Soft Destroy (View Change):**
        *   **Trigger:** In `InventreeCard.tsx`, the `useEffect` hook's cleanup function for a *view change* dispatches `softDestroyCardThunk`.
        *   **Action:** This thunk is intended to clear out temporary or volatile state (like visual effects) without deleting the core configuration or persisted data.
    2.  **Hard Destroy (Full Unmount):**
        *   **Trigger:** The `useEffect` cleanup function for a full *component unmount* in `InventreeCard.tsx` dispatches `removeCardInstanceThunk` (which is aliased to the legacy name `destroyCardThunk`).
        *   **Action:** This thunk is aggressive. It's supposed to find every piece of state associated with the `cardInstanceId` across all Redux slices (`config`, `parts`, `logging`, etc.) and delete it entirely.
    3.  **Final Unmount:** `inventree-card.ts` -> The `disconnectedCallback` method is called by Lit when the element is removed from the DOM. This calls `this.reactRoot.unmount()`, which triggers the final React cleanup cycle.

This distinction between soft and hard destruction is our primary tool for trying to manage the lifecycle, but it's clearly where the race conditions are happening.

---

### Q3: How does the `cardInstanceId` relate to the lifecycle thunks?

**A:** This is a crucial point of clarification.

*   The `cardInstanceId` is **NOT** created or managed *by* the thunks.
*   It is created in the LitElement entry points (`inventree-card.ts` and formerly `ReactEditorHost.ts`) within the `setConfig` method, as soon as a configuration is available.
*   The ID is then **passed as an argument** to the lifecycle thunks (e.g., `dispatch(initializeCardThunk({ cardInstanceId, config }))`).
*   The thunk then uses this ID as a key to access the correct "slice" of the Redux state (e.g., `state.parts.partsByInstance[cardInstanceId]`).

So, the ID is the *address* that tells the thunk *which* piece of state to build up or tear down. The generation of the address and the action on the state are separate but tightly coupled steps.

---

### Q4: What do the top-level lifecycle logs from `inventree-card.ts` tell us?

**A:** They reveal the true, underlying cause of our problems.

1.  **Multiple Initializations:** On initial page load, Lovelace creates **multiple (e.g., 5+) instances** of our component. We see a series of `constructor` -> `setConfig` -> `connectedCallback` logs, each for a different component instance. Each one generates a unique `cardInstanceId` and dispatches actions to the Redux store. This is massively inefficient and the primary source of our race conditions. Our component is too "heavy" in its setup phase, assuming every instantiation is for a final, permanent card. Lovelace likely creates these temporary "phantom" instances to measure card dimensions before rendering the final one.

2.  **Save = Disconnect:** When the editor is saved, the only lifecycle event we see for the existing card is `disconnectedCallback`. This confirms that Lovelace's strategy is to simply destroy the old card element. A completely new element with the new config is created during the UI refresh that follows a save.

**Conclusion:** Our core architectural flaw is assuming that `constructor` + `setConfig` means "this is a real card, build everything now". We need a way to lazily perform our expensive initializations (`initializeCardThunk`, mounting React) only for the *final, stable* card instance that Lovelace decides to actually keep on the page.

---

### Q5: Is this multiple-instance behavior normal for Lovelace? And what's the solution?

**A:** Yes. Research (specifically GitHub issue `home-assistant/frontend#7246`) confirms this is known and expected behavior. Lovelace creates "phantom" instances of cards, calling `constructor` and `setConfig`, likely to calculate layout and size. It then creates a *second*, final instance which it actually attaches to the DOM (firing `connectedCallback`).

**The Solution:** We must embrace a "lazy" initialization strategy. All expensive operations must be deferred until after `connectedCallback`.

*   **`constructor` & `setConfig`:** These methods should be as lightweight as possible. They should only store the configuration. They MUST NOT dispatch Redux actions or attempt to render a React app.
*   **`connectedCallback`:** This is the first moment we can be reasonably sure the element is "live". This is the new trigger point for our initialization.
*   **Preventing Double Initialization:** Since `connectedCallback` might still be called multiple times if the element is moved in the DOM, we must still guard against re-initializing an already-live card. The `reactRoot` property can serve as our flag; if it already exists, the card has been initialized.

**New Implementation Plan:**
1.  Remove the Redux dispatch (`setConfigAction`) from `setConfig` in `inventree-card.ts`.
2.  Move all initialization logic into `connectedCallback`.
3.  In `connectedCallback`, check if `this.reactRoot` already exists. If it does, do nothing.
4.  If it doesn't exist, *then* dispatch the `setConfigAction` and call `_mountOrUpdateReactApp`.
