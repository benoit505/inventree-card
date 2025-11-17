# API Reference - Redux Store, Slices, Selectors & Utilities

This isn't going to be dry documentation. Let me walk you through the actual API surface you're working with - what exists, how it connects, and what you actually use in practice.

## Redux Store Structure

The store is built with Redux Toolkit and has this shape:

```typescript
RootState = {
  components: ComponentState,           // Card instance tracking
  conditionalLogic: ConditionalLogicState,  // Logic rules
  config: ConfigState,                  // Card configurations
  genericHaStates: GenericHaStateState, // HA entity states
  metrics: MetricsState,                // Performance metrics
  parameters: ParametersState,          // Part parameters (legacy?)
  parts: PartsState,                    // Parts data (HA + API merged)
  ui: UiState,                          // UI state (views, selection)
  visualEffects: VisualEffectsState,    // Computed effects
  websocket: WebSocketState,            // WebSocket status
  actions: ActionsState,                // Action definitions
  logging: LoggingState,                // Logging config
  inventreeApi: RTKQueryState,          // RTK Query cache for InvenTree API
  loggingApi: RTKQueryState,            // RTK Query cache for logging API
}
```

## Slice-by-Slice Breakdown

### componentsSlice - Card Instance Tracking

**Purpose:** Global registry of all active card instances on the dashboard. Tracks which cards are mounted, active, and when they were last used.

**State Shape:**
```typescript
{
  registeredComponents: {
    [cardInstanceId: string]: {
      isActive: boolean,
      registeredAt: number,    // timestamp
      lastActive: number,      // timestamp
    }
  }
}
```

**Actions:**
- `registerComponent(cardInstanceId)` - Called during card initialization
- `disconnectComponent(cardInstanceId)` - Called when card unmounts
- `reconnectComponent(cardInstanceId)` - Called when card remounts (tab switch)
- `updateComponentActivity(cardInstanceId)` - Update lastActive timestamp
- `removeComponent(cardInstanceId)` - Completely remove card tracking

**Selectors:**
- `selectIsComponentActive(state, componentId)` → `boolean`
- `selectAllComponents(state)` → `Record<string, ComponentRecord>`
- `selectActiveComponentCount(state)` → `number`
- `selectActiveCardInstanceIds(state)` → `string[]` - Used heavily for cross-card operations

**Usage:** This is how the system knows which cards exist and need data/effects updates. When you dispatch `evaluateEffectsForAllActiveCardsThunk()`, it uses `selectActiveCardInstanceIds` to know which cards to process.

---

### configSlice - Card Configuration Storage

**Purpose:** Stores the YAML config for each card instance. This is the source of truth for all card settings.

**State Shape:**
```typescript
{
  configsByInstance: {
    [cardInstanceId: string]: {
      config: InventreeCardConfig,
      configInitialized: boolean,
    }
  },
  globalConfig: {
    direct_api?: DirectApiConfig,
  }
}
```

**Actions:**
- `setConfigAction({ cardInstanceId, config })` - Set/update config (called from initializeCardThunk)
- `removeConfigAction({ cardInstanceId })` - Remove config on card destroy
- `updateLayout({ cardInstanceId, layout })` - Update just the layout portion

**Selectors (using Reselect):**
- `selectConfigByInstanceId(state, cardInstanceId)` → `InventreeCardConfig`
- `selectActions(state, cardInstanceId)` → `ActionDefinition[]` - Gets `config.actions`
- `selectConditionalLogic(state, cardInstanceId)` → `ConditionalLogicItem[]` - Gets `config.conditional_logic.definedLogics`
- `selectDisplayConfig(state, cardInstanceId)` → `DisplayConfig` - Gets `config.display`
- `selectDirectApiEnabled(state, cardInstanceId)` → `boolean`
- `selectLayoutOptions(state, cardInstanceId)` → `LayoutConfig`

**Usage:** Every component that needs config calls one of these selectors. The config flows from Lovelace → Lit element → Redux → Components.

---

### partsSlice - Parts Data (HA + API Merged)

**Purpose:** The merged state for parts from both Home Assistant sensors AND InvenTree API. This is where progressive loading happens.

**State Shape:**
```typescript
{
  partsByInstance: {
    [cardInstanceId: string]: {
      partsById: {
        [pk: number]: InventreeItem & { source: 'hass' | 'api' | 'hybrid' }
      },
      locatingPartId: number | null,
      adjustingStockPartId: number | null,
      adjustmentError: string | null,
    }
  },
  loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>,
  loading: boolean,
  error: string | null,
}
```

**Actions:**
- `addApiPart({ part, cardInstanceId })` - Add/merge API-fetched part
- `setParts({ parts, cardInstanceId })` - Set HA parts (batch)
- `setPartParameters({ partId, parameters, cardInstanceId })` - Attach parameters to part
- `updateParameterForPart({ partId, parameterPk, newValue, cardInstanceId })` - Update single parameter
- `updatePart({ part, cardInstanceId })` - Update part fields
- `updatePartStock({ partId, newStock, cardInstanceId })` - Update stock value
- `partStockUpdateFromWebSocket(payload)` - WebSocket stock update (global, affects all instances)
- `setLocatingPartId({ partId, cardInstanceId })` - UI state for "finding" a part
- `removeInstance({ cardInstanceId })` - Clean up instance data

**Selectors:**
- `selectAllPartsForInstance(state, cardInstanceId)` → `InventreeItem[]`
- `selectPartById(state, cardInstanceId, pk)` → `InventreeItem | undefined`
- `selectAllReferencedPartPksFromConfig(state, cardInstanceId)` → `number[]` - Extract PKs from config
- `selectIsReadyForEvaluation(state, cardInstanceId)` → `boolean` - Are parts loaded?
- `selectArePartsLoading(state, cardInstanceId)` → `boolean`
- `selectPartsError(state, cardInstanceId)` → `string | null`

**Extra Reducers:** Listens to RTK Query actions:
- `inventreeApi.endpoints.getPart.matchFulfilled` → calls `addApiPart`
- `inventreeApi.endpoints.getPartParameters.matchFulfilled` → calls `setPartParameters`
- `inventreeApi.endpoints.searchParts.matchFulfilled` → calls `setParts`

**Usage:** This is THE central parts state. Components read from here, RTK Query writes to here, WebSocket updates modify here. The `source` field tracks provenance.

---

### visualEffectsSlice - Computed Visual Effects

**Purpose:** Stores the results of conditional logic evaluation - what colors, animations, and visibility states to apply to parts and cells.

**State Shape:**
```typescript
{
  effectsByCardInstance: {
    [cardInstanceId]: {
      [partPk: number]: VisualEffect
    }
  },
  effectsByCellId: {
    [cardInstanceId]: {
      [cellId: string]: VisualEffect
    }
  },
  elementVisibilityByCard: {
    [cardInstanceId]: Partial<Record<DisplayConfigKey, boolean>>
  },
  layoutEffectsByCell: {
    [cardInstanceId]: {
      [cellId: string]: Partial<React.CSSProperties>
    }
  },
  layoutOverridesByCardInstance: {
    [cardInstanceId]: {
      [cellId: string]: { w?, h?, x?, y? }
    }
  } // NOTE: This is UNUSED - ghost state
}
```

**Actions:**
- `setConditionalPartEffectsBatch({ cardInstanceId, effectsMap })` - Set all part effects at once
- `setConditionalCellEffect({ cardInstanceId, cellId, effect })` - Set cell effect
- `setConditionalLayoutEffect({ cardInstanceId, cellId, layout })` - Set layout CSS
- `clearConditionalPartEffectsForCard({ cardInstanceId })` - Clear part effects
- `clearConditionalCellEffectsForCard({ cardInstanceId })` - Clear cell effects
- `clearAllVisualEffectsForCard({ cardInstanceId })` - Clear everything

**Selectors:**
- `selectVisualEffectForPart(state, cardInstanceId, partPk)` → `VisualEffect | undefined`
- `selectVisualEffectsForCell(state, cardInstanceId, cellId)` → `VisualEffect | undefined`
- `selectAllVisualEffectsForCard(state, cardInstanceId)` → `Record<number, VisualEffect>`
- `selectLayoutEffectsForCell(state, cardInstanceId, cellId)` → `Partial<CSSProperties>`
- `selectElementVisibility(state, cardInstanceId, displayKey)` → `boolean | undefined`

**Usage:** ConditionalEffectsEngine writes to this. Components (CellRenderer, TableLayout) read from this and apply the effects. The merge happens in components: `{ ...partEffects, ...cellEffects }`.

---

### actionsSlice - Action Definitions & Runtime State

**Purpose:** Stores action definitions from config AND tracks runtime execution state (though runtime state isn't currently used).

**State Shape:**
```typescript
{
  byInstance: {
    [cardInstanceId]: {
      actionDefinitions: {
        [actionId: string]: ActionDefinition
      },
      actionRuntimeStates: {
        [actionId: string]: {
          status: 'idle' | 'pending' | 'success' | 'error',
          actionName?: string,
          error?: string,
          lastRun?: number,
        }
      }
    }
  }
}
```

**Actions:**
- `setActionDefinitions({ definitions, cardInstanceId })` - Set all actions from config
- `updateActionRuntimeState({ cardInstanceId, actionId, runtimeState })` - Update execution state (unused)
- `clearActionRuntimeState({ cardInstanceId, actionId })` - Clear execution state (unused)
- `removeInstance({ cardInstanceId })` - Clean up

**Selectors:**
- `selectActionDefinitionsForInstance(state, cardInstanceId)` → `Record<string, ActionDefinition>`
- `selectAllActionDefinitionsForInstance(state, cardInstanceId)` → `ActionDefinition[]`
- `selectActionDefinitionForInstance(state, cardInstanceId, actionId)` → `ActionDefinition | undefined`
- `selectActionRuntimeStatesForInstance(state, cardInstanceId)` → `Record<string, ActionRuntimeState>`
- `selectActionRuntimeStateForInstance(state, cardInstanceId, actionId)` → `ActionRuntimeState | undefined`

**Usage:** ActionEngine reads from this to get action configs. Runtime states are stored but never displayed - that's dead infrastructure.

---

### conditionalLogicSlice - Logic Rules

**Purpose:** Stores the conditional logic rules from config. Simple storage, no computation here.

**State Shape:**
```typescript
{
  definedLogicsByInstance: {
    [cardInstanceId]: ConditionalLogicItem[]
  }
}
```

**Actions:**
- `setDefinedLogicItems({ logics, cardInstanceId })` - Set logic rules from config
- `removeDefinedLogicItemsForCard({ cardInstanceId })` - Remove on cleanup
- `clearAllConditions()` - Nuclear clear (probably unused)

**Selectors:**
- `selectDefinedLogicItems(state, cardInstanceId)` → `ConditionalLogicItem[]`

**Usage:** ConditionalEffectsEngine reads from this to know what rules to evaluate.

---

### genericHaStateSlice - Home Assistant Entity States

**Purpose:** Stores HA entity states in Redux for conditional logic evaluation. This is synced from the `hass` object.

**State Shape:**
```typescript
{
  entities: {
    [entity_id: string]: {
      entity_id: string,
      state: string,
      attributes: Record<string, any>,
      last_changed?: string,
      last_updated?: string,
    }
  }
}
```

**Actions:**
- `setEntityState({ entity_id, state, attributes, ... })` - Set single entity
- `setEntityStatesBatch(entities)` - Set multiple entities
- `clearAllEntityStates()` - Clear all

**Selectors:**
- `selectAllGenericHaStates(state)` → all entities
- `selectGenericHaEntityActualState(state, entityId)` → state value
- `selectGenericHaEntityAttribute(state, entityId, attribute)` → attribute value

**Usage:** `fetchHaEntityStatesThunk` syncs from `hass` object to Redux. `evaluateExpression` reads from here for HA-based rules. `websocketMiddleware` intercepts updates and triggers re-evaluation.

---

### uiSlice - UI State

**Purpose:** Global UI state like active view, selected part, debug panel.

**State Shape:**
```typescript
{
  activeView: string,
  selectedPartId: number | null,
  debug: {
    showDebugPanel: boolean,
    activeTab: string,
  },
  loading: boolean,
}
```

**Actions:**
- `setActiveView(view)` - Switch layout view
- `setSelectedPart(partId)` - Select a part (for detail view)
- `toggleDebugPanel()` - Show/hide debug panel
- `setDebugTab(tab)` - Switch debug tab
- `setLoading(boolean)` - Global loading state

**Selectors:** None exported (just access `state.ui` directly)

**Usage:** These actions are in the ActionEngine whitelist, so they can be triggered from config actions. Debug panel state, view switching.

---

### websocketSlice - WebSocket Status

**Purpose:** Track WebSocket connection status (for polling fallback decisions).

**State Shape:**
```typescript
{
  status: 'disconnected' | 'connecting' | 'connected' | 'error',
  lastMessageTime: number | null,
  error: string | null,
}
```

**Actions:**
- `webSocketConnected()` - Mark as connected
- `webSocketDisconnected()` - Mark as disconnected
- `webSocketError(error)` - Store error
- `webSocketMessageReceived(message)` - Update lastMessageTime

**Selectors:**
- `selectWebSocketStatus(state)` → status string

**Usage:** `InventreeCard.tsx` checks this to decide whether to enable polling fallback. `websocketMiddleware` updates this based on WebSocketPlugin events.

---

## RTK Query APIs

### inventreeApi - InvenTree REST API

**Endpoints:**
- `getPart({ pk, cardInstanceId })` - Fetch single part
- `getPartParameters({ partId, cardInstanceId, template_detail?: boolean })` - Fetch part parameters
- `updatePartParameter({ partId, parameterId, data })` - Update a parameter
- `searchParts({ searchText })` - Search parts
- `getPartStock({ pk })` - Get part stock info

**Tags:** `['Part', 'PartParameters']` - Used for cache invalidation

**Base Query:** `inventreeBaseQuery` handles auth, base URL from config

**Usage:** Components use hooks like `useGetPartQuery({ pk, cardInstanceId })`. Results auto-populate `partsSlice` via extraReducers. ActionEngine uses `.initiate()` for imperative requests.

---

## Thunks (Async Logic)

### lifecycleThunks

**initializeCardThunk({ cardInstanceId, hass, config })**
- The big initialization sequence (5 stages)
- Sets config, registers component, fetches data
- Returns promise that resolves when stages dispatched (not awaited)

**removeCardInstanceThunk({ cardInstanceId })**
- Complete teardown
- Removes config, parts, component registration

**softDestroyCardThunk({ cardInstanceId })**
- Partial teardown (for view switching)
- Resets API state but preserves config

---

### conditionalLogicThunks

**evaluateAndApplyEffectsThunk({ cardInstanceId })**
- Main evaluation loop
- Creates ConditionalEffectsEngine, calls `evaluateAndApplyEffects()`
- If WebSocket down: invalidates cache and force-refetches
- Updates `visualEffectsSlice` with results

**evaluateEffectsForAllActiveCardsThunk()**
- Loops through all active cards
- Dispatches `evaluateAndApplyEffectsThunk` for each

**initializeRuleDefinitionsThunk({ logics, cardInstanceId })**
- Sets logic rules in `conditionalLogicSlice`

---

### genericHaStateThunks

**fetchHaEntityStatesThunk({ hass, entityIds })**
- Syncs HA entity states from `hass` object to Redux
- Dispatches `setEntityStatesBatch`

**initializeGenericHaStatesFromConfig({ hass, cardInstanceId })**
- Reads `data_sources.ha_entities` from config
- Calls `fetchHaEntityStatesThunk` for those entities

---

### systemThunks

**initializeWebSocketPlugin({ directApiConfig, cardDebugWebSocket, cardInstanceId })**
- Sets up InvenTree WebSocket connection
- Dispatches connection status to `websocketSlice`

**processHassEntities({ entityIds, hass, cardInstanceId })**
- Legacy? Seems to overlap with genericHaStateThunks

---

## Key Utilities & Services

### ActionEngine (Singleton)

**Static Methods:**
- `ActionEngine.getInstance()` → singleton instance

**Instance Methods:**
- `setHomeAssistant(hass)` - Inject HASS object
- `executeAction(actionId, context, cardInstanceId)` - Execute an action
- `evaluateExpression(expressionId, context, cardInstanceId)` → boolean - Check if expression is true (for button enable/disable)

**Usage:** Components call `ActionEngine.getInstance().executeAction()` on button clicks. `react-app.tsx` calls `setHomeAssistant()` on mount.

---

### ConditionalEffectsEngine (Instantiated per evaluation)

**Constructor:** `new ConditionalEffectsEngine(dispatch, getState)`

**Methods:**
- `evaluateAndApplyEffects(cardInstanceId, forceReevaluation, logicItemsToEvaluate)` - The big evaluation loop

**Usage:** `evaluateAndApplyEffectsThunk` creates an instance and calls this method. Results written to `visualEffectsSlice`.

---

### evaluateExpression Utility

**Function:** `evaluateExpression(ruleGroup, partContext, globalContext, logger, cardInstanceId, dispatch?)`

**Returns:** `boolean` - True if rules match

**Features:**
- Recursive rule group evaluation (AND/OR/NOT logic)
- Reads from `partsSlice`, `genericHaStateSlice`, RTK Query cache
- Auto-fetches missing data (side effect!)
- Handles `part_`, `inv_param_`, `ha_entity_state_`, `ha_entity_attr_` fields

**Usage:** Called by ConditionalEffectsEngine for every rule. Called by ActionEngine for button enable/disable checks.

---

## Type Definitions (Key Interfaces)

### InventreeItem
The part object. Fields include: `pk`, `name`, `description`, `in_stock`, `category`, `parameters`, `thumbnail`, `source` ('hass' | 'api' | 'hybrid'), etc.

### ActionDefinition
```typescript
{
  id: string,
  name: string,
  trigger: ActionTrigger,
  operation: ActionOperation,
  confirmation?: { textTemplate: string },
  postEvaluationLogicIds?: string[],
  isEnabledExpressionId?: string,
}
```

### ConditionalLogicItem
```typescript
{
  id: string,
  name: string,
  logicPairs: LogicPair[],
}
```

### LogicPair
```typescript
{
  id: string,
  conditionRules: RuleGroupType,  // The IF part
  effects: EffectDefinition[],     // The THEN part
}
```

### VisualEffect
```typescript
{
  highlight?: string,         // background color
  textColor?: string,
  border?: string,
  opacity?: number,
  icon?: string,
  badge?: string,
  isVisible?: boolean,
  animation?: AnimationProps,
  thumbnailStyle?: CSSProperties,
  cellStyles?: Record<cellId, CSSProperties>,
}
```

### CellDefinition
```typescript
{
  id: string,
  partPk: number,
  content: 'name' | 'thumbnail' | 'buttons' | ... | string,
  x: number, y: number, w: number, h: number,
  isHidden?: boolean,
  buttons?: ButtonCellItem[],
}
```

---

## Common Patterns

**Reading Parts:**
```typescript
const parts = useAppSelector(state => selectAllPartsForInstance(state, cardInstanceId));
const part = useAppSelector(state => selectPartById(state, cardInstanceId, pk));
```

**Reading Visual Effects:**
```typescript
const partEffect = useAppSelector(state => selectVisualEffectForPart(state, cardInstanceId, partPk));
const cellEffect = useAppSelector(state => selectVisualEffectsForCell(state, cardInstanceId, cellId));
const merged = { ...partEffect, ...cellEffect }; // Cell wins
```

**Reading Config:**
```typescript
const config = useAppSelector(state => selectConfigByInstanceId(state, cardInstanceId));
const actions = useAppSelector(state => selectActions(state, cardInstanceId));
```

**Dispatching Actions:**
```typescript
const dispatch = useAppDispatch();
dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId }));
dispatch(setSelectedPart(partPk));
```

**RTK Query Hooks:**
```typescript
const { data: part, isLoading } = inventreeApi.useGetPartQuery({ pk, cardInstanceId });
const { data: parameters } = inventreeApi.useGetPartParametersQuery({ partId: pk, cardInstanceId });
```

---

## What's Actually Used vs What Exists

**Heavily Used:**
- partsSlice (THE central data store)
- visualEffectsSlice (effects computation results)
- configSlice (configuration source)
- genericHaStateSlice (HA entity tracking)
- componentSlice (instance tracking)
- All the thunks (lifecycle, evaluation)

**Lightly Used:**
- actionsSlice (definitions used, runtime states NOT used)
- uiSlice (exists but UI could work without it)
- websocketSlice (only for status checking)

**Dead/Unused:**
- `layoutOverridesByCardInstance` in visualEffectsSlice (ghost state)
- `actionRuntimeStates` in actionsSlice (stored but never displayed)
- Several selectors that aren't called anywhere

**Duplicated:**
- Parts data (RTK Query cache + partsSlice) - INTENTIONAL for progressive loading
- Config (Lit element + Redux) - Bridge between systems
- Template processors (ActionEngine + components) - Different capabilities

---

That's the API landscape. Not a dry reference, but a tour of what actually exists and how it's used. The store is complex but mostly makes sense - except for the dead code and the few bits of ghost state.

