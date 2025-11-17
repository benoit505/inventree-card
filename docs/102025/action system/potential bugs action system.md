# Action System - Raw Observations & Reflections

Alright, so this is where things get real. The conditional logic engine makes things look pretty, but the action system is where your card actually *does* stuff. This is the bridge between your UI and the outside world - Home Assistant services, InvenTree API updates, Redux state changes, you name it.

Let me walk through what I'm seeing here...

The action system is built around `ActionDefinition` objects. Each action has an ID, a name, a trigger (how it gets invoked), and an operation (what it actually does). Simple concept, but the implementation has layers.

Looking at the trigger types, you've got `ActionTrigger` which can be either UI-triggered (`ui_button`, `ui_thumbnail_click`) or event-triggered (`conditional_logic`, `websocket_event`, `internal_event`). The UI triggers are the ones I see actually used in the code. Event triggers seem like they're planned but not implemented yet? Or maybe used somewhere I haven't seen.

For UI triggers, there's this `ActionUITriggerConfig` that defines where the button shows up - `part_footer`, `global_header`, or `custom_layout_element`. Part footer buttons appear on individual part cards (like "Add Stock" for a specific part), global header buttons are card-wide (like "Refresh All" or "Toggle Debug Panel"), and custom layout elements would be for your grid cells. Looking at `CellRenderer.tsx` lines 82-143, you ARE rendering buttons in cells, so that's the third placement in action.

Now the operation types. You've defined five:
1. `call_ha_service` - Call Home Assistant services (lights, switches, etc.)
2. `update_inventree_parameter` - Update InvenTree part parameters via API
3. `dispatch_redux_action` - Trigger Redux actions (like navigating views, selecting parts)
4. `set_card_state` - Transient UI state (but line 341 in ActionEngine.ts says it's not implemented)
5. `trigger_conditional_logic` - Re-evaluate conditional logic

The ActionEngine is a singleton (line 112 ActionEngine.ts). Why? Probably because it needs to maintain state (the `isExecuting` Set for infinite loop prevention) and there's no benefit to multiple instances. It also holds a reference to the `hass` object which gets set from ReactApp via useEffect (react-app.tsx lines 21-26). That's how it can call Home Assistant services.

The execution flow goes: button click → `ActionEngine.executeAction()` → confirmation dialog (if configured) → `handleOperation()` → specific handler for operation type → cleanup + post-evaluation logic.

Let's talk about the template system. This is wild. You have `processTemplate` (lines 72-109 in ActionEngine.ts) that processes template strings with TWO different syntaxes:
1. Simple format: `%pk%`, `%name%` - automatically prefixes with `part.`
2. Full context format: `%%context.part.pk%%`, `%%context.part.name%%`

So you can write templates like: `"Add stock to %name%"` and it becomes `"Add stock to Rice"`. Or for more complex stuff: `%%context.part.parameters:Weight.data%%` which uses the named item syntax to find a parameter by name. That's actually clever - the colon syntax lets you navigate arrays by name instead of index.

But here's the thing - there are THREE template processing functions in this codebase:
1. `ActionEngine.processTemplate()` - full featured, handles both syntaxes
2. The standalone `processTemplate()` at the top of ActionEngine.ts (lines 72-109) - used for confirmation dialogs
3. Component-local template processors like in `PartButtons.tsx` (lines 24-29) - just does simple string replacement

Why three? The component ones only handle `%%part.pk%%` and `%%part.name%%`. They can't do the fancy path navigation. So button labels are limited to simple templates, but action payloads can use the full system. Inconsistent, but maybe intentional to keep button rendering fast?

Looking at `handleCallHAService` (lines 259-282 in ActionEngine.ts). You process the `dataTemplate` and the `target` separately. Targets can be either `direct_entity` (just an entity_id string) or `standard_object_target` (the full HA target object with entity_id, device_id, area_id). Both get templated. Then you split the service string on dot to get domain and service name, merge target and data, and call `hass.callService()`.

That's straightforward. But what if the `hass` object isn't available? Line 260-263 logs an error and returns. The button would appear to do nothing. No user feedback. Should probably show a toast notification or something.

The `handleUpdateInvenTreeParameter` operation (lines 284-323) is more complex. You can specify the part ID three ways:
1. Direct number: `partIdContext: 123`
2. String keyword: `partIdContext: 'current'` (uses context.part)
3. Template string: `partIdContext: '%%context.part.pk%%'`

Then it fetches the parameter by NAME from the RTK Query cache (line 309). If not found, error. If found, dispatches an update via `inventreeApi.endpoints.updatePartParameter.initiate()`. That's async but you don't await it. Fire and forget. Does the user know if it succeeded? Only if they have logging enabled.

The `dispatch_redux_action` handler (lines 325-330) has a whitelist (lines 37-42) - `actionManifest`. Only four actions are allowed:
- `ui.setActiveView`
- `ui.setSelectedPart`
- `ui.toggleDebugPanel`
- `parts.setLocatingPartId`

Why whitelist? Security? To prevent users from dispatching arbitrary Redux actions that could break the state? Makes sense. But it means you can't add new Redux actions from config without modifying code. That's limiting but probably safer than allowing eval-like behavior.

The `trigger_conditional_logic` operation (lines 332-338) just dispatches `evaluateAndApplyEffectsThunk` for all active cards. It doesn't actually trigger a SPECIFIC logic item by ID, even though the operation has a `logicIdToTrigger` field. It re-evaluates EVERYTHING. That's the nuclear option. Why not implement selective evaluation? Probably easier to just re-run everything than track dependencies.

Now the infinite loop prevention. Line 115 - `isExecuting` Set that tracks action IDs currently running. If you try to execute an action that's already executing, it bails (lines 190-193). This prevents:
- Action A triggers Action B which triggers Action A
- Button double-clicks
- Rapid-fire executions from event triggers

But it's per action ID, not per action + context. So if you have a button that triggers action "add_stock" on part 123, and you click it, then immediately click it on part 456, the second click will be blocked if the first hasn't finished. Is that intentional? Probably fine for most use cases but could be surprising.

The confirmation system (lines 207-215) uses `confirm()` - the native browser dialog. That's... not pretty. It works, but it's not customizable. No styling, no async handling beyond the synchronous blocking behavior of `confirm()`. But it's simple and it works.

Post-evaluation logic (lines 226-233) - if an action has `postEvaluationLogicIds` defined, after execution finishes, it triggers `evaluateAndApplyEffectsThunk` for all active cards. Wait, but it doesn't actually USE the `postEvaluationLogicIds` array. It just checks if it's non-empty and re-evaluates everything. So you can't say "after this action, only re-evaluate these specific logic items". Another nuclear option.

Button enable/disable logic. Looking at `PartButtons.tsx` lines 122-129 and `CellRenderer.tsx` lines 104-106. If an action has `isEnabledExpressionId`, the button calls `ActionEngine.evaluateExpression()` to determine if it should be enabled. This uses that duplicate evaluator I mentioned earlier (lines 129-186 in ActionEngine.ts). It's synchronous, only handles HA entity states, and returns true if the expression isn't found. That last part is weird - if you typo the expression ID, all buttons are enabled. Should probably default to false for safety.

The button rendering in different contexts is interesting. `PartButtons.tsx` filters actions by:
1. Must be `ui_button` trigger type
2. Must have no placement OR `part_footer` placement
3. If `targetPartPks` is specified, current part must be in the list

`GlobalActionButtons.tsx` filters by:
1. Must be `ui_button` trigger type
2. Must have `global_header` placement
3. Must NOT have `targetPartPks` specified (or empty array)

`CellRenderer.tsx` for button cells (lines 88-141) is different - it uses `ButtonCellItem` objects from the cell definition. These reference actions by ID but have their own icon/label overrides. So the same action can appear with different icons/labels in different cells. That's flexible but also means the action definition isn't the single source of truth for how it's displayed.

Looking at line 95-97 in CellRenderer, there's filtering by `targetPartPks` again. If the button specifies targets and the cell's part isn't in the list, don't render. But this is checking `cell.partPk` which might be 0 or undefined for non-part cells. The comment says "For button cells not tied to a part, partPk will be 0 or undefined." So you can have buttons in cells that aren't associated with specific parts? Like header cells or footer cells? And those buttons would render for all target parts? The logic doesn't quite make sense to me.

The template processing in components vs ActionEngine creates this weird split. In `PartButtons.tsx` line 117, the label is templated locally before rendering. But then when you click the button, ActionEngine templates the payloads and confirmation text. So you're templating twice, in different places, with different capabilities. The button label can't use the fancy path navigation, but the confirmation dialog can. Why not template the label in ActionEngine too? Probably because it needs to be reactive to part changes without executing the action.

Actions are stored in Redux via `actionsSlice.ts`. There's both `actionDefinitions` (the config) and `actionRuntimeStates` (execution state). Runtime states track status (idle/pending/success/error), action name, error message, and last run timestamp. But I don't see this used anywhere. It's stored but never displayed. Dead code? Or planned for a future "action history" panel?

The RTK Query cache is used heavily. For `update_inventree_parameter`, you're reading from the cache (line 306-309) to find the parameter by name, then dispatching an update. But what if the parameters aren't in cache? It returns undefined and logs "Parameter data for part X not in cache. Cannot update." No auto-fetch like in the conditional logic engine. Inconsistent.

Error handling is minimal. Most operations just log errors and return. The user doesn't see anything. The action appears to complete but silently failed. Only if they open the console do they see the error. There's no toast notification system, no error badges, nothing. The `actionRuntimeStates` could be used for this but aren't.

The `UNDEFINED_TEMPLATE_MARKER` constant (line 35) is used when a template path can't be resolved. It sets the value to `'[TEMPLATE_VALUE_NOT_FOUND]'`. So if you template `%%context.part.invalid_field%%`, your service call data will contain `{ field: '[TEMPLATE_VALUE_NOT_FOUND]' }`. That's... not good? You're sending invalid data to HA services or InvenTree API. Should probably either throw an error or use a sentinel value that gets filtered out.

The `getPathValue` function (lines 44-70) is doing a lot of work. It handles:
- Named item access: `parameters:Weight` finds parameter with name "Weight"
- Array index access: `parameters[0]` gets first parameter
- Nested paths: `template_detail.name`

That's powerful but also fragile. Any typo in a template path returns undefined which becomes `UNDEFINED_TEMPLATE_MARKER`. And there's no validation of paths before execution. You only discover errors when you click the button.

Looking at the action manifest whitelist again (lines 37-42), those are Redux action creators directly imported and called. So the `actionType` in the config has to match the key in the manifest exactly. `'ui.setActiveView'` works, `'ui.set_active_view'` doesn't. No aliasing, no fuzzy matching. And if you add a new action creator, you have to update both the Redux slice AND the ActionEngine manifest. Two places to maintain.

The confirmation text templating (line 209) calls the standalone `processTemplate` function, not the class method. Why? Looking at the code, both functions are nearly identical except the class method is bound to `this`. The standalone function is used for confirmations, which need to be processed before the main execution flow. But they do the same thing. Why not consolidate?

Action triggering from cells vs parts vs global has different context available:
- Global buttons: `{ hass, hassStates, cardInstanceId }` (no part)
- Part buttons: `{ part, hass, cardInstanceId }` (no hassStates?)
- Cell buttons: `{ part }` via CellRenderer → ActionEngine (gets full context added)

So depending on where the button is, different context is available for templating. Global buttons can't reference `%%context.part.*%%` but part buttons can. That makes sense but should be validated. If you use a part template in a global button, you get `UNDEFINED_TEMPLATE_MARKER` at runtime.

One more thing - the styling console logs (lines 189, 237) are back. Same as in ConditionalEffectsEngine. Logger is broken, falling back to pretty console spam.

Alright, that's a lot. The action system is actually pretty well-designed conceptually. The trigger/operation separation is clean. The template system is powerful. The singleton pattern makes sense. But there's execution gaps - error handling, user feedback, template validation, code duplication, inconsistent behavior between operations. It works, but it's rough around the edges.

Now for the bugs:

```markdown:/home/benoit/projects/inventree-card/docs/102025/action system/potential bugs action system.md
<code_block_to_apply_changes_from>
```

This captures everything I found! The action system is actually pretty robust compared to the conditional logic engine - fewer catastrophic bugs, more just "this could be better" issues. Should we move on to another subsystem or dig deeper into something here?


