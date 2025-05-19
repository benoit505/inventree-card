# Cross-Part Parameter Fetching Implementation

This document outlines the implementation details for fetching parameters from parts referenced *within* parameter conditions (e.g., `part:<id>:<param_name>`). This enables conditions in one card instance to react to the state of parameters belonging to different InvenTree parts.

## Goal

Allow parameter conditions like `If part:146:microwavables equals True then show item` to function correctly by ensuring the necessary parameter data for the referenced part (e.g., part `146`) is fetched and available in the Redux store.

## Implementation Strategy

1.  **Identify Referenced Parts:**
    *   In `inventree-card.ts`, scan the `config.parameters.conditions` array when the configuration is set or updated.
    *   Parse the `parameter` string of each condition.
    *   Use a regular expression or string manipulation to find patterns matching `part:<id>:<param_name>`.
    *   Extract the `<id>` part (e.g., `146`) from all such references.
    *   Collect these extracted IDs into a unique set to avoid redundant checks.

2.  **Check Loading Status:**
    *   For each unique referenced part ID identified, check its current loading status in the `parametersSlice.loadingStatus` section of the Redux state.

3.  **Dispatch Fetch Thunk:**
    *   Compile a list of part IDs whose `loadingStatus` is currently `idle`.
    *   If this list is not empty, dispatch the `fetchParametersForReferencedParts` thunk with this list of part IDs.

4.  **Integration Point:**
    *   Create a new private method in `inventree-card.ts` (e.g., `_fetchReferencedParameters`).
    *   Call this method after the configuration is processed (`setConfig`) and whenever the HASS state is updated (`processHassState` or the `hass` setter), ensuring it only runs when the Direct API is enabled.

## Data Flow

1.  `inventree-card.ts` (`setConfig`/`hass` setter) triggers `_fetchReferencedParameters`.
2.  `_fetchReferencedParameters` scans conditions, identifies needed part IDs (e.g., `[146, 147]`).
3.  Checks Redux state: `loadingStatus[146]` is `succeeded`, `loadingStatus[147]` is `idle`.
4.  Dispatches `fetchParametersForReferencedParts([147])`.
5.  Thunk calls API (`/api/part/parameter/?part=147`).
6.  API returns data for part `147`.
7.  Thunk dispatches `fulfilled` action.
8.  `parametersSlice` reducer updates `parameterValues[147]` and sets `loadingStatus[147]` to `succeeded`.
9.  Selectors (`selectVisualModifiers`, etc.) can now resolve conditions referencing part `147`.

## Benefits

*   Enables complex cross-part interactions and conditional logic.
*   Efficiently fetches data only when needed and only once per part.
*   Leverages existing Redux infrastructure (thunks, slice, selectors). 