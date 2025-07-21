# Code Documentation and Refactor Log

This document tracks the systematic refactoring of the entire `inventree-card` codebase to implement the new structured logging system.

---

## `src/inventree-card.ts`

This file is the main entry point for the InvenTree card as a LitElement custom element. It bridges the Home Assistant Lovelace environment with the React application, handling the lifecycle of the card and passing the `hass` and `config` objects down to React.

### Functions & Methods

-   **`InventreeCard` class**: The main LitElement class for the card.
    -   `static getConfigElement()`: A required Lovelace method that returns the card's editor element.
    -   `hass`: A Lit property to hold the Home Assistant object.
    -   `_config`: A Lit property to hold the card's configuration.
    -   `_generateStableId(config)`: A private method that creates a unique, stable ID for the card instance based on its configuration, which is crucial for state persistence.
    -   `setConfig(config)`: A required Lovelace method that is called by Home Assistant when the configuration is set or changes.
    -   `getCardSize()`: A required Lovelace method to tell Home Assistant how large the card is.
    -   `connectedCallback()`: A Lit lifecycle method called when the element is added to the DOM.
    -   `disconnectedCallback()`: A Lit lifecycle method called when the element is removed from the DOM. It handles unmounting the React app.
    -   `render()`: A Lit lifecycle method that renders the component's template. It's responsible for creating the mount point for the React app.
    -   `_mountOrUpdateReactApp()`: A private method that handles the rendering and updating of the main React application (`<ReactApp>`), passing in the necessary props.
    -   `static getStubConfig()`: A required Lovelace method that provides a default configuration for when a user adds the card to their dashboard.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/InventreeCard.tsx`

This is the main React component for the card. It acts as the primary controller, orchestrating data fetching, state management, and rendering the appropriate layout based on the card's configuration. It's the first component mounted by the LitElement bridge.

### Component & Hooks

-   **`InventreeCard` (Component)**: The main functional component.
    -   Receives `hass`, `config`, and `cardInstanceId` as props.
    -   Uses a `renderCount` ref for debugging purposes.
-   **`usePrevious` (Hook)**: A utility hook to get the previous value of a prop or state.

### Primary Logic & Effects (`useEffect` hooks)

-   **Logging Setup**:
    -   Connects the `ConditionalLoggerEngine` to the Redux `dispatch` function.
    -   Updates the logger engine whenever `logSettings` from the Redux store change.
-   **Component Registration (`useEffect[cardInstanceId]`)**:
    -   Registers the component with a `componentSlice` when it mounts with a valid `cardInstanceId`.
    -   Handles cleanup on unmount, dispatching actions to remove the component's state from various slices (`components`, `config`, `parts`).
-   **Main Initialization (`useEffect[stringifiedConfig, cardInstanceId]`)**:
    -   This is the core initialization effect, triggered by changes to the card's configuration.
    -   It orchestrates a multi-stage setup process:
        1.  **Cache Reset**: Resets the RTK Query API state.
        2.  **State Setup**: Dispatches actions to set the current config, clear parameter caches, and set up action definitions.
        3.  **Rule Initialization**: Initializes conditional logic rules *before* any async operations.
        4.  **API Initialization**: Initializes the direct API and WebSocket plugin if configured.
-   **Conditional Evaluation (`useEffect[isReadyForEvaluation]`)**:
    -   A "gatekeeper" effect that only runs the `evaluateAndApplyEffectsThunk` when the `selectIsReadyForEvaluation` selector returns true, ensuring all necessary data is loaded before conditional logic is processed.
-   **HASS Entity Processing (`useEffect[hass, configInitialized, hassSensorEntities]`)**:
    -   Processes entities from `data_sources.inventree_hass_sensors`.
    -   Dispatches `processHassEntities` to sync state from Home Assistant sensors to InvenTree parts in the Redux store.
-   **Generic HA State Initialization (`useEffect[hass, genericHaEntities]`)**:
    -   Initializes generic Home Assistant entity states from `data_sources.ha_entities`.
    -   Dispatches `initializeGenericHaStatesFromConfig`.
-   **Parameter Fetching (`useEffect[apiInitialized, parametersToFetch]`)**:
    -   Fetches specified InvenTree parameters from the API once the API is initialized.
    -   Dispatches `fetchConfiguredParameters`.

### Memoized Selectors (`useMemo`)

-   `stringifiedConfig`: Creates a stable JSON string of the config for use in `useEffect` dependency arrays.
-   `hassSensorEntitiesFromConfig`: Extracts and memoizes the list of HASS sensor entities from the config.
-   `genericHaEntitiesFromConfig`: Extracts and memoizes the list of generic HA entities from the config.
-   `parametersToFetchFromConfig`: Extracts and memoizes the list of parameters to fetch from the config.
-   `idleRenderInterval`: Extracts the idle render interval from the performance config.

### Render Logic

-   **`renderLayout()`**: A function that contains a `switch` statement to determine which layout component (`DetailLayout`, `GridLayout`, `TableLayout`, etc.) to render based on the `view_type` in the configuration.
-   The main return statement includes the `GlobalActionButtons` and the selected layout, wrapped in a main container.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/index.ts`

This file is the main entry point for the entire card. It's the first script executed and is responsible for setting up the environment and registering the custom card with Home Assistant.

### Key Responsibilities

-   **Polyfill**: It provides a browser polyfill for `process.env`, which is a Node.js concept but is required by dependencies like Redux/Immer to function correctly in a browser environment.
-   **Logger Initialization**: It gets the first instance of the `ConditionalLoggerEngine` and creates a logger for the 'Index' category. This ensures logging is available from the very start.
-   **Custom Element Registration**: It calls `safelyRegisterElement` to register the main LitElement wrapper, `<inventree-card>`, with the browser's `customElements` registry. This makes the `<inventree-card>` tag usable in the Lovelace UI.
-   **HACS Registration**: It adds the card's details to the `window.customCards` array. This is a convention used by Home Assistant and HACS to discover and display information about custom cards in the UI.

### Refactor Status

-   [ ] Not Started
-   [ ] In Progress
-   [x] **Complete**

---

## `src/components/layouts/GridLayout.tsx`

This component is responsible for rendering a standard grid layout. It takes an array of part IDs and creates a responsive grid, rendering a `GridItem` component for each part ID.

### Component: `GridLayout`

-   **Props**:
    -   `hass`: The Home Assistant object.
    -   `config`: The card's configuration object.
    -   `partIds`: An array of part primary keys (`pk`) to be displayed in the grid.
    -   `cardInstanceId`: The unique ID for the card instance.
-   **Render Logic**:
    -   It displays loading or "no parts" messages if the configuration or `partIds` are not available.
    -   It reads layout options like `columns` and `grid_spacing` from the card configuration to style the CSS grid.
    -   It maps over the `partIds` array and renders a `GridItem` for each one, passing the necessary props down.

### Refactor Status

-   [ ] Not Started
-   [ ] In Progress
-   [ ] Complete

---

## `src/components/layouts/GridItem.tsx`

This is a "smart" component responsible for rendering a single item within the `GridLayout`. It encapsulates all the logic for fetching and displaying data for one specific part, including its details, parameters, and visual state.

### Component: `GridItem`

-   **Props**:
    -   `partId`: The primary key of the part to render. This is the only required prop for data fetching.
    -   `hass`: The Home Assistant object.
    -   `cardInstanceId`: The unique ID for the card instance.
-   **Data Fetching (RTK Query)**:
    -   `useGetPartQuery(partId)`: Fetches the core data for the specified part.
    -   `useGetPartParametersQuery(partId)`: Conditionally fetches the parameters for the part, only if `display.show_parameters` is enabled in the config.
    -   `useUpdatePartParameterMutation()`: Provides a function to update a part's parameter.
-   **State Selection (Redux)**:
    -   It selects its own `config` from the `configSlice`.
    -   `selectVisualEffectForPart`: Selects the current visual effects (highlight, animation, visibility, etc.) for this specific part from the `visualEffectsSlice`.
    -   `state.parts.locatingPartId`: Checks if this specific part is currently being "located" by the user.
-   **Event Handlers**:
    -   `handleLocateGridItem`: Dispatches an action to locate the part (e.g., flash an LED).
    -   `handleParameterActionClick`: A placeholder for handling actions on parameters.
    -   `handleThumbnailClick`: An event handler that executes a configured UI action when the part's thumbnail is clicked.
-   **Render Logic**:
    -   It has its own loading and error states based on the RTK Query hooks.
    -   It conditionally renders different elements of the part (name, stock, description, image, buttons) based on the `display` section of the card configuration.
    -   It uses the `framer-motion` library to apply animations based on the data from `selectVisualEffectForPart`.
    -   It dynamically constructs CSS styles and classes based on the visual modifiers.
    -   It renders the `PartThumbnail` and `PartButtons` sub-components.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/layouts/ListLayout.tsx`

This component renders parts in a high-performance, virtualized list. It uses the `react-window` library to ensure that only the visible items are rendered to the DOM, which is crucial for preventing performance degradation when displaying hundreds or thousands of parts.

### Component: `ListLayout`

-   **Props**:
    -   `parts`: The full array of `InventreeItem` objects to be displayed.
    -   `config`: The card's configuration object.
    -   `hass`: The Home Assistant object.
    -   `cardInstanceId`: The unique ID for the card instance.
-   **Render Logic**:
    -   It first filters the incoming `parts` array to exclude any parts that are marked as not visible by the `visualEffectsSlice`.
    -   It uses the `<FixedSizeList>` component from `react-window` as the main container.
    -   All necessary data (`parts`, `config`, `hass`, etc.) and the `handleLocatePart` callback are passed down to the list items via the `itemData` prop.
    -   The actual rendering of each row is delegated to the `ListItem` component.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/layouts/ListItem.tsx`

This component is responsible for rendering a single row within the `ListLayout`. It receives a single part object as a prop and handles displaying its details, fetching its parameters, and applying any conditional visual effects.

### Component: `ListItem`

-   **Props**:
    -   `part`: The `InventreeItem` object for the row.
    -   `config`: The card's configuration object.
    -   `hass`: The Home Assistant object.
    -   `cardInstanceId`: The unique ID for the card instance.
    -   `onLocate`: A callback function to trigger the "locate" action for this part.
-   **Data Fetching (RTK Query)**:
    -   `useGetPartParametersQuery(partId)`: Conditionally fetches parameters for the part, only if `display.show_parameters` is enabled.
    -   `useUpdatePartParameterMutation()`: Provides a function to update a parameter's value.
-   **State Selection (Redux)**:
    -   `selectVisualEffectForPart`: Selects the current visual effects for this part from the `visualEffectsSlice`.
    -   It also selects the `locatingPartId` to show a "Locating..." indicator.
-   **Render Logic**:
    -   The component will render `null` if its `isVisible` effect is `false`.
    -   It dynamically constructs its style based on the visual effects (highlight, text color, etc.).
    -   It conditionally renders different fields (`name`, `IPN`, `stock`, `description`) based on the `display` configuration.
    -   It renders the `PartThumbnail` and `PartButtons` sub-components.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/layouts/PartsLayout.tsx`

This component renders a layout that includes a search bar and a list of parts. It's designed to handle dynamic filtering (based on search results) and sorting (based on conditional visual effects like `priority` and `sort`).

### Component: `PartsLayout`

-   **Props**:
    -   `parts`: The initial array of `InventreeItem` objects.
    -   `hass`: The Home Assistant object.
    -   `config`: The card's configuration object.
    -   `cardInstanceId`: The unique ID for the card instance.
-   **Data Fetching (RTK Query)**:
    -   `useLazySearchPartsQuery()`: This hook provides a "trigger" function to perform a part search on demand (when the user clicks the search button). The results are then used to filter the displayed parts.
-   **State Selection (Redux)**:
    -   It selects the entire `visualEffects` object for the current card instance to perform filtering and sorting.
-   **Primary Logic (`useMemo`)**:
    -   `filteredAndSortedParts`: This is the core logic of the component. It's a memoized selector that performs a series of transformations on the parts list:
        1.  If there are search results, it filters the main `parts` list to only include parts that are in the search results.
        2.  It filters out any parts that are marked as `isVisible: false` by the visual effects.
        3.  It sorts the remaining parts based on `priority` (`high` comes first) and then by a `sort` key (`top` first, `bottom` last).
-   **Render Logic**:
    -   It renders a search input and a button.
    -   It maps over the final `filteredAndSortedParts` array and renders a simple div for each part, applying highlight and text color effects.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/layouts/VariantLayout.tsx`

This is a highly complex layout component designed to display parts that are variants of a "template" part. It handles fetching, processing, grouping, and displaying parts in several different visual formats (grid, list, or tree).

### Component: `VariantLayout`

-   **Props**:
    -   `parts`: The raw array of `InventreeItem` objects, which includes both templates and their variants.
    -   `config`, `hass`, `cardInstanceId`.
-   **Internal State**:
    -   `processedVariants`: Stores the result of passing the raw `parts` through the `VariantHandler.processItems` utility. This creates a structured array of `ProcessedVariant` groups or individual `InventreeItem`s.
    -   `expandedGroups`: A `Set` that keeps track of which variant groups are expanded in the 'tree' view.
-   **Core Logic**:
    -   **`useEffect[parts, config]`**: This effect is the entry point. Whenever the raw parts or config change, it re-runs the `VariantHandler.processItems` function to create the structured groups and updates the component's internal state.
    -   **`visibleItems` (`useMemo`)**: This memoized value takes the `processedVariants` and filters them based on the `isVisible` flag from the `visualEffectsSlice`, ensuring that entire groups or individual items can be hidden conditionally.
-   **Event Handlers (`useCallback`)**:
    -   `handleLocateItem`: Dispatches the `locatePartById` action.
    -   `handleToggleGroup`: Manages the internal `expandedGroups` state for the tree view, adding or removing a group's PK from the set.
-   **Render Logic**:
    -   **`renderPartItem` (`useCallback`)**: A memoized function responsible for rendering a *single* item, whether it's a template or a variant. It dynamically adjusts the display configuration (e.g., hiding buttons for templates) and renders the `PartView` component.
    -   **View Modes**: The component has a `switch` statement that chooses a master render function based on `config.variant_view_type`:
        -   `renderGridView()`: Renders groups in a grid.
        -   `renderListView()`: Renders groups as nested lists.
        -   `renderTreeView()`: Renders groups as a collapsible tree structure, using the `expandedGroups` state to manage visibility.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/layouts/TableLayout.tsx`

This is the most advanced and complex layout component. It renders parts in a customizable, editable, and persistent grid that behaves like a spreadsheet or a table. It leverages `react-grid-layout` for the core drag-and-drop functionality and `framer-motion` for animations and column reordering.

### Key Components

-   **`CellRenderer`**: A sub-component responsible for rendering the content of a single cell. It uses Redux selectors to get part data and visual effects. It can render thumbnails, descriptions, parameters, or custom action buttons based on the column's configuration.
-   **`HeaderCell`**: A sub-component for rendering a single column header. It uses `framer-motion` to handle drag-to-reorder functionality.
-   **`TableHeader`**: A container for all `HeaderCell`s, managing the reordering logic.
-   **`TableLayout` (Main Component)**: The orchestrator for the entire layout.

### State Management

-   **`useLayoutStore()`**: This Zustand store is used to persist the column order (`columns`) and cell positions/sizes (`layouts`) across page reloads. The state is synchronized with `localStorage`.
-   **Internal Component State (`useState`)**:
    -   `isHydrated`: Tracks if the state has been loaded from `localStorage`.
    -   `isEditMode`: A boolean that toggles the `isDraggable` and `isResizable` props of the `react-grid-layout` grid, enabling or disabling layout editing.
    -   `draftLayouts` & `draftColumns`: When entering edit mode, the persisted state is copied into these "draft" states. All changes are applied to the drafts, which are only saved back to the persistent store when the user clicks "Save".
    -   `globalFilter`: Holds the value of the search/filter input field.

### Core Logic

-   **Hydration (`useEffect[localStorageKey]`)**: On mount, this effect attempts to load the layout state from `localStorage`. If no state is found, it initializes the layout from the main card configuration.
-   **Persistence (`useEffect[persistedLayouts, persistedColumns]`)**: Whenever the persisted layout or columns in the `useLayoutStore` change, this effect saves the new state back to `localStorage`.
-   **Memoized Selectors (`useMemo`)**:
    -   `displayColumns`: Selects the correct columns to display (draft, persisted, or config default).
    -   `filteredParts`: Filters the parts list based on the `globalFilter`.
    -   `baseLayouts`: Calculates the initial layout. It prioritizes the persisted layout but can generate a new one from scratch if none exists.
    -   `visibleLayouts`: Filters the items in the `react-grid-layout` `layouts` array to only include those corresponding to `visibleParts`.
-   **Event Handlers**:
    -   `handleEditClick`: Enters edit mode by copying persisted state to draft state.
    -   `handleSaveClick`: Exits edit mode and saves draft state back to the persisted `useLayoutStore`.
    -   `handleCancelClick`: Exits edit mode and discards any changes in the draft state.

### Refactor Status

-   [ ] Not Started
-   [ ] In Progress
-   [x] **Complete**

---

## `src/components/common/variant-handler.ts`

This file exports the `VariantHandler` class, which contains the core business logic for identifying and grouping part variants. It's a non-component utility file, and its primary method, `processItems`, is static, meaning it can be called without creating an instance of the class.

### Class: `VariantHandler`

-   **`processItems(items, config)` (static method)**: This is the main function. It takes a flat array of `InventreeItem`s and a card configuration, and it returns a new array where variants have been grouped together under their template part into a `ProcessedVariant` object.
    -   It can operate in two modes based on the config:
        1.  **`auto_detect`**: It will automatically find all parts with a `variant_of` property and group them under their parent.
        2.  **`variant_groups`**: It will use a manually defined list of groups from the configuration to create the `ProcessedVariant` objects.
    -   Any items that are not part of a variant group are returned as-is alongside the processed groups.
-   **`isVariant(item)` (static method)**: A type guard function that checks if a given item is a `ProcessedVariant` or a standard `InventreeItem`.
-   **`calculateTotalStock(template, variants)` (static method)**: A helper function to sum the stock of a template and all its variants.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/common/ImageWithFallback.tsx`

This is a smart image component that attempts to load an image from a list of sources. It will try each source in the provided array until one successfully loads. If all sources fail, it will render a placeholder component instead. This is useful for trying different image file extensions (e.g., `.png`, `.jpg`, `.webp`).

### Component: `ImageWithFallback`

-   **Props**:
    -   `sources`: An array of strings representing the image URLs to try.
    -   `alt`: The alt text for the image.
    -   `placeholder`: A React element to render if all sources fail.
    -   Other props are passed down to the `react-lazy-load-image-component`.
-   **Core Logic (`useEffect[sources]`)**:
    -   When the component mounts or the `sources` prop changes, it triggers a `useEffect` hook.
    -   Inside the effect, it defines a `probeNext` function. This function creates a new `Image` object in memory and sets its `src`.
    -   If `img.onload` fires, it means the source is valid, and it sets the `workingSrc` state to that URL.
    -   If `img.onerror` fires, it recursively calls `probeNext` to try the next source in the array.
    -   If all sources are exhausted, it sets an `hasError` flag.
-   **Render Logic**:
    -   If `hasError` is true or there is no `workingSrc` yet, it renders the `placeholder`.
    -   Once a `workingSrc` is found, it renders the `LazyLoadImage` component with that source.

### Refactor Status

-   [ ] ~~Not Started~~
-   [ ] ~~In Progress~~
-   [x] **Complete**

---

## `src/components/part/PartButtons.tsx`

This component is responsible for rendering all the dynamically configured UI action buttons that are meant to appear in a part's footer or view.

### Component: `PartButtons`

-   **Props**:
    -   `partItem`: The `InventreeItem` for which to display buttons.
    -   `config`: The card's configuration object.
    -   `hass`: The Home Assistant object.
    -   `cardInstanceId`: The unique ID for the card instance.
-   **Core Logic (`useCallback`)**:
    -   **`processButtonLabelTemplate`**: A helper function to replace placeholders like `%%part.name%%` in a button's label template.
    -   **`getUiActionButtons`**: This is the main filtering logic. It scans the `config.actions` array and returns only the actions that are of type `ui_button` and are designated for the `part_footer`. It also handles filtering by `targetPartPks` if specified.
    -   **`handleClick`**: The event handler for button clicks. It constructs the `ActionExecutionContext` and passes the action to the `actionEngine` for execution.
-   **Render Logic**:
    -   It uses `useMemo` to get the final list of `displayedButtons`.
    -   It renders `null` if there are no buttons to display or if `display.show_buttons` is false.
    -   It maps over the `displayedButtons` and creates a `<button>` for each one.
    -   It dynamically sets the button's label (from a template), icon, and a `disabled` state if an `isEnabledExpressionId` is present on the action.

### Refactor Status

-   [ ] Not Started
-   [ ] In Progress
-   [ ] Complete

---
