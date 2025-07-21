# Debugging Plan: Persisting `react-grid-layout` Changes to Lovelace Config

This document tracks our systematic approach to diagnosing why layout changes made in the browser are not being saved back to the Lovelace configuration.

## The Data Pipeline

The core of the issue lies in the data pipeline that should take layout changes and persist them in Home Assistant's configuration. We have mapped out this pipeline to place "listening posts" (`console.log` statements) at every critical junction.

```mermaid
graph TD
    subgraph Browser (React App)
        A["[Step A: onLayoutChange] User drags a cell in TableLayout.tsx"]
        B["[Step B: Debounce] 1.5s timer starts"]
        C["[Step C: saveLayoutOverrides] Function is called with the new layout object"]
        D["[Step D: dispatchEvent] window.dispatchEvent('lovelace-config-changed') is fired with the new full config object"]
    end
    subgraph Home Assistant Core
        E["[Step E: HA Listener] HA catches the event and saves the new config to its internal storage (e.g., lovelace-ui.yaml)"]
    end
    subgraph Browser (Card Reload)
        F["[Step F: Lit Bridge] HA re-renders our <inventree-card> element, passing the *new* config object (with layout_overrides) as a property"]
        G["[Step G: React Root] The Lit bridge passes the new config down to InventreeCard.tsx as a prop"]
        H["[Step H: TableLayout] TableLayout.tsx receives the new config and initializes its state with the saved layout_overrides"]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

## Debugging Steps & Log Locations

We will now add `console.log` statements at each step to trace the data flow:

1.  **[Step A] `TableLayout.tsx`:** Log the `layouts` object inside `onLayoutChange` to see the raw data from `react-grid-layout`.
2.  **[Step C] `TableLayout.tsx`:** Log the `newConfig` object inside the debounced `saveLayoutOverrides` function to confirm we are correctly constructing the object to be saved.
3.  **[Step D] `TableLayout.tsx`:** Add a log immediately after `window.dispatchEvent` to confirm the event is firing.
4.  **[Step F] `inventree-card.ts`:** Log the `changedProperties` inside the `updated()` method of the Lit element to see if it ever receives a new `config` from Home Assistant containing `layout_overrides`. **This is the most critical checkpoint.**
5.  **[Step G] `InventreeCard.tsx`:** Log the `config` prop to see what the React root component receives from the Lit wrapper upon initialization and subsequent updates.
6.  **[Step H] `TableLayout.tsx`:** Log the `layoutConfig` prop as it's received to see if it contains the `layout_overrides` on a page load *after* a change has been made.

By following the data through these logs, we will pinpoint exactly where the pipeline is breaking.
