# InvenTree Card Architecture & State Deep Dive

This document outlines the architecture of the InvenTree Card, focusing on the data flow from Home Assistant to the final React render, with a special emphasis on state management. It aims to diagnose the persistent issue with saving and restoring `react-grid-layout` settings.

## 1. Component & Initialization Flow

The card's lifecycle begins with a LitElement wrapper and progressively bootstraps a React application.

1.  **`inventree-card.ts` (LitElement Entrypoint)**
    *   This is the Custom Element (`<inventree-card>`) that Home Assistant interacts with directly.
    *   Its primary role is to receive the `hass` (Home Assistant state) and `config` (card configuration) objects.
    *   It creates a stable `cardInstanceId` to uniquely identify this card instance across re-renders.
    *   When `setConfig` is called or the element connects to the DOM, it mounts the React application into its Shadow DOM. It passes `hass`, `config`, and `cardInstanceId` as props.

2.  **`react-app.tsx` (React Root)**
    *   This is the top-level React component.
    *   It wraps the entire application in two key providers:
        *   `<Provider store={store}>`: Connects the app to the main **Redux** store.
        *   `<PersistGate>`: Part of `redux-persist`, it ensures the Redux store is rehydrated from storage before rendering the app. This is used for more dynamic/application state.
    *   It passes the props through to the main `InventreeCard.tsx` component.

3.  **`InventreeCard.tsx` (Main React Component)**
    *   This is the central nervous system of the card's UI logic.
    *   It uses numerous `useEffect` hooks to orchestrate a complex initialization sequence whenever the configuration changes. This includes:
        *   Setting up the Redux store with the current card's configuration.
        *   Initializing API services (Direct API, WebSockets).
        *   Fetching data from various sources (InvenTree parts, HASS sensors, etc.).
        *   Setting up rules for conditional logic.
    *   It contains a `renderLayout()` method that acts as a router, selecting the appropriate layout component (e.g., `TableLayout`, `GridLayout`) based on `config.view_type`.
    *   It passes down all necessary data (parts, config, etc.) to the chosen layout component.

4.  **`components/layouts/TableLayout.tsx` (The Problem Area)**
    *   This component is responsible for rendering the parts in a `react-grid-layout`.
    *   It's designed to be highly interactive, allowing users to enter an "Edit Mode" to drag, drop, and resize grid cells.
    *   It has its own state management for the layout's structure, which is where the current issue lies.

## 2. State Management Strategy

The card uses a dual-state management strategy:

*   **Redux**: Used for the majority of the application's state. This includes the card configuration, API data, part details, UI state, conditional logic, etc. It's complex and feature-rich.
*   **Zustand (`useLayoutStore`)**: Intended to be a lightweight solution specifically for persisting the user's customized `react-grid-layout` settings (layouts and columns) to `localStorage`. The goal is to separate these "static, saved settings" from the more "dynamic" state managed by Redux.

## 3. The Layout Persistence Bug: Diagnosis

The core issue lies in the implementation of the Zustand store (`store/layoutStore.ts`) and its interaction with `TableLayout.tsx`.

**The Flaw:**

The `useLayoutStore` is a standard in-memory Zustand store. **It is not connected to `localStorage` via middleware.**

Here's the incorrect data flow on a page refresh:

1.  **App Reloads**: The entire JavaScript environment is reset.
2.  **Zustand Store Initializes**: `useLayoutStore` is created with its default, empty state: `layouts: null` and `columns: null`. It has no knowledge of `localStorage`.
3.  **`TableLayout.tsx` Renders**:
    *   It calls `useLayoutStore()` and receives `{ layouts: null, columns: null }`.
    *   The `useEffect[hydration]` hook *does* fire and reads the saved layout from `localStorage`. It then calls `setLayouts(...)` and `setColumns(...)` to update the Zustand store.
    *   **BUT**, this happens *after* the initial render. The `useMemo[baseLayouts]` hook has already run with `persistedLayouts` being `null`.
    *   Because `persistedLayouts` was null, the memo hook falls back to its default behavior: generating a fresh layout from the card's YAML `config`. It completely ignores the data that was saved in `localStorage`.
4.  **The Result**: The user's saved layout is briefly loaded into the store but is immediately overridden by the layout generated from the configuration file. The user sees the default layout, not their saved one.

The manual saving in `useEffect[persistence]` works, which is why the data exists in `localStorage`, but the re-hydration part of the cycle is broken.

## 4. The Solution: Use Zustand's `persist` Middleware

To fix this, we need to make the Zustand store itself responsible for syncing with `localStorage`. This is the intended use case for Zustand's `persist` middleware. It will automatically handle loading the state from storage on initialization and saving it whenever it changes.

This will simplify the logic in `TableLayout.tsx` significantly and fix the bug by ensuring the layout data is available on the very first render.

**Next Step:** I will propose the code change to `store/layoutStore.ts` to implement this fix.


