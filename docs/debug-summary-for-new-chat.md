# Debugging Summary: Layout Persistence

## Current Status

We are in the process of debugging a layout persistence issue with the `custom` (`TableLayout`) view. User-made changes to cell positions and sizes (drag/drop, resize) are not being saved and restored after a page reload.

Our investigation has concluded that using Home Assistant's `lovelace-config-changed` event is not a reliable mechanism for saving this client-side state.

## Agreed-Upon Strategy

Our current and agreed-upon strategy is to use the browser's `localStorage` to persist layout changes independently for each card instance.

The plan consists of two main parts:

1.  **Stable Card ID Generation:** We need to generate a unique but **stable** ID for each card instance. The plan is to create this ID by hashing the card's initial configuration (the `config` object received in `setConfig`). This ensures that the same card will always have the same ID across page loads.

2.  **LocalStorage Integration:** The `TableLayout.tsx` component will be modified to use this stable ID as part of its `localStorage` key.
    *   **On Load:** The component will attempt to read its layout state from `localStorage` using the stable ID key.
    *   **On Change:** The `onLayoutChange` event handler will save the new layout state to `localStorage`.

## Roadblock

We have been unable to proceed due to a persistent failure of the file editing tools. All attempts to modify the necessary files in the `inventree-card/src` directory have failed to apply, preventing any progress.

## Next Steps for New Chat

The immediate goal is to successfully execute the file modifications required to implement the `localStorage` strategy.

1.  **Add Temporary Logging:** Add `console.log` statements at every key step of the process. **These logs should not be removed until the issue is fully resolved.**

2.  **Implement Stable ID in `inventree-card.ts`:**
    *   Add a simple string hashing function to the `InventreeCard` class.
    *   Modify the `setConfig` method to:
        *   Create a string representation of the initial `config` object (after cleaning any old `layout_overrides`).
        *   Use the hashing function to generate a stable `_cardInstanceId`.
        *   Log the generated ID to the console for verification.
    *   Ensure this `_cardInstanceId` is passed down as a prop to the React application.

3.  **Update `TableLayout.tsx` to Use `localStorage`:**
    *   Modify the component to receive the stable `cardInstanceId`.
    *   Create a unique `localStorageKey` (e.g., `inventree-layout-${cardInstanceId}`).
    *   **In `useEffect` (on mount):**
        *   Log that it's attempting to load from `localStorage`.
        *   Try to read and parse the layout from `localStorage` using the key.
        *   Log the result (found or not found).
        *   If a layout is found, set it as the component's state.
    *   **In `onLayoutChange`:**
        *   Log the new layout that is being saved.
        *   Save the stringified layout to `localStorage` using the key.

This step-by-step plan, verified with console logs, should allow us to successfully implement and debug the persistence mechanism. 