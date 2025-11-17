# Fix #22: Toggle Switch Button (Parameter Value Flip)

**Priority Score:** 9 (Impact: 4, Effort: 2 - HIGHLY REQUESTED FEATURE!)  
**Status:** ✅ COMPLETED  
**Date:** October 12, 2025

---

## 🎯 The Feature

### User Request
> "A button that flips False to True and back to False... a switch!"

### Use Case
User wants a single button that **toggles** a boolean parameter value:
- Current value: `"True"` → Click button → New value: `"False"`
- Current value: `"False"` → Click button → New value: `"True"`

Perfect for:
- Enable/Disable features
- Show/Hide items
- On/Off states
- Any boolean toggle!

---

## 🔧 The Implementation

### Backend: ActionEngine Toggle Logic

**File:** `src/services/ActionEngine.ts` (lines 264-275)

```typescript
// TOGGLE SUPPORT: Check if value is "TOGGLE" to flip current boolean parameter value
if (newValue === 'TOGGLE' || (typeof newValue === 'string' && newValue.toUpperCase() === 'TOGGLE')) {
  const currentValue = parameter.data;
  // Flip boolean: "True" <-> "False" (case-insensitive)
  if (currentValue && typeof currentValue === 'string') {
    newValue = currentValue.toLowerCase() === 'true' ? 'False' : 'True';
    logger.debug('handleUpdateInvenTreeParameter', `TOGGLE detected: Flipping ${currentValue} → ${newValue}`);
  } else {
    logger.warn('handleUpdateInvenTreeParameter', `TOGGLE requested but current value is not a boolean string: ${currentValue}`);
    newValue = 'True'; // Default to True if unclear
  }
}
```

**How it works:**
1. Check if `valueTemplate` is `"TOGGLE"` (case-insensitive)
2. Read current parameter value from Redux cache
3. If current value is `"True"` → Set to `"False"`
4. If current value is `"False"` → Set to `"True"`
5. Send update to InvenTree API
6. WebSocket broadcasts change
7. Conditional logic re-evaluates
8. Visual effects update!

### Frontend: Editor Checkbox

**File:** `src/components/editor/ActionEditorForm.tsx` (lines 280-298)

```typescript
<label>
  <input 
    type="checkbox" 
    checked={action.operation.valueTemplate === 'TOGGLE'}
    onChange={(e) => {
      if (e.target.checked) {
        handleInputChange('operation.valueTemplate', 'TOGGLE');
      } else {
        handleInputChange('operation.valueTemplate', '');
      }
    }}
  />
  Use as Toggle Switch (flips True ↔ False)
</label>
{action.operation.valueTemplate !== 'TOGGLE' && (
  <label>Value Template:
    <input type="text" value={action.operation.valueTemplate} onChange={(e) => handleInputChange('operation.valueTemplate', e.target.value)}/>
  </label>
)}
```

**UI Behavior:**
- When **checked**: Sets `valueTemplate` to `"TOGGLE"`, hides text input
- When **unchecked**: Shows text input for manual value entry
- Simple, intuitive, user-friendly! ✅

---

## 🎬 Usage Example

### Config
```yaml
actions:
  - id: toggle-microwavables
    name: Toggle Microwaving
    trigger:
      type: ui_button
      ui:
        labelTemplate: "🔄 Toggle"
        icon: "mdi:toggle-switch"
        placement: part_footer
        targetPartPks: [145]
    
    operation:
      type: update_inventree_parameter
      partIdContext: this_part
      parameterName: microwavables
      valueTemplate: TOGGLE  # ← Magic keyword!
    
    postEvaluationLogicIds:
      - hide-if-microwavables  # Re-evaluate after toggle
```

### User Flow
```
1. Initial state: microwavables = "False"
   ↓
2. User clicks "Toggle" button
   ↓
3. ActionEngine detects valueTemplate="TOGGLE"
   ↓
4. Reads current value: "False"
   ↓
5. Flips to: "True"
   ↓
6. API call: PATCH /api/part/parameter/134/
   Body: { "data": "True" }
   ↓
7. InvenTree updates parameter
   ↓
8. WebSocket broadcasts: "parameter_value": "True"
   ↓
9. Redux updates parameter state
   ↓
10. Conditional logic re-evaluates
    ↓
11. Visual effects apply (part hides/shows)
    ↓
12. User sees the change! ✅

13. User clicks "Toggle" again → Flips back to "False" ✅
```

---

## 🧪 Testing

### Manual Testing

- [x] Create action with toggle checkbox
- [x] Click button when value is "False" → Changes to "True" ✅
- [x] Click button when value is "True" → Changes to "False" ✅
- [x] WebSocket event shows correct flipped value ✅
- [x] Conditional logic re-evaluates correctly ✅
- [x] Visual effects update (part hides/shows) ✅
- [x] Multiple toggles in a row work correctly ✅

### Edge Cases

- [x] Parameter value is `null` → Defaults to "True" ✅
- [x] Parameter value is numeric → Warns, defaults to "True" ✅
- [x] Parameter not cached → Warns, skips update ✅
- [x] Case-insensitive detection (`"toggle"`, `"TOGGLE"`, `"Toggle"`) ✅

---

## 💡 Advanced Use Cases

### 1. Toggle with Visual Feedback

Use conditional logic to style the button based on current value:

```yaml
conditional_logic:
  definedLogics:
    # Green button when True
    - id: button-green-when-true
      logicPairs:
        - conditionRules:
            rules:
              - field: inv_param_145_microwavables
                operator: "="
                value: "True"
          effects:
            - type: set_cell_style
              targetCellId: "toggle-button-cell"
              property: backgroundColor
              value: "#4CAF50"  # Green
    
    # Red button when False
    - id: button-red-when-false
      logicPairs:
        - conditionRules:
            rules:
              - field: inv_param_145_microwavables
                operator: "="
                value: "False"
          effects:
            - type: set_cell_style
              targetCellId: "toggle-button-cell"
              property: backgroundColor
              value: "#F44336"  # Red
```

**Result:** Button changes color based on state! 🟢🔴

### 2. Toggle with Label Change

Use conditional logic to change button label:

```yaml
actions:
  - id: toggle-microwavables
    trigger:
      ui:
        labelTemplate: "%%inv_param_145_microwavables == 'True' ? '🚫 Disable' : '✅ Enable'%%"
        # Note: Requires template evaluation enhancement
```

### 3. Multiple Toggles in Sequence

Chain multiple parameter updates:

```yaml
actions:
  - id: toggle-all-features
    operations:  # Multiple operations!
      - type: update_inventree_parameter
        parameterName: microwavables
        valueTemplate: TOGGLE
      - type: update_inventree_parameter
        parameterName: dishwasher_safe
        valueTemplate: TOGGLE
      - type: update_inventree_parameter
        parameterName: freezer_safe
        valueTemplate: TOGGLE
```

*Note: Multiple operations per action requires enhancement (see Future Work below)*

---

## 🚀 Performance

### Efficiency
- **No extra API calls:** Reads current value from Redux cache (O(1))
- **Instant flip:** No network latency to determine new value
- **Debounced evaluation:** Prevents evaluation storms (Fix #14)
- **Targeted evaluation:** Only re-evaluates specified logic (Fix #13)

### Network Traffic
```
Single Toggle Click:
1. PATCH /api/part/parameter/{pk} (update)
2. WebSocket event (broadcast)
Total: 1 API call, 1 WebSocket message
```

**Compared to two separate buttons:**
- Same network traffic ✅
- But better UX (single button vs. two) ✅

---

## 🎉 Impact

### Before This Fix
```yaml
# Required TWO buttons for toggle functionality
actions:
  - id: enable-microwavables
    operation:
      valueTemplate: "True"  # Hard-coded
  
  - id: disable-microwavables
    operation:
      valueTemplate: "False"  # Hard-coded

# + Conditional logic to show/hide each button
# = Complex config, confusing UX
```

### After This Fix
```yaml
# ONE button does it all!
actions:
  - id: toggle-microwavables
    operation:
      valueTemplate: TOGGLE  # ← Magic!

# Simple config, intuitive UX ✅
```

**Improvement:**
- **50% fewer actions** (1 instead of 2)
- **No conditional visibility logic** needed
- **Simpler configuration**
- **Better UX** (single toggle button)

---

## 🤔 Discoveries & Insights

### Why "TOGGLE" Keyword?

**Considered alternatives:**
1. `valueTemplate: "!inv_param_145_microwavables"` (prefix syntax)
2. `valueTemplate: "FLIP"` (different keyword)
3. `toggleMode: true` (separate config field)

**Chose `"TOGGLE"` because:**
- ✅ Clear intent (self-documenting)
- ✅ Easy to type (no special characters)
- ✅ Case-insensitive (forgiving)
- ✅ Works with existing template system (no new fields)
- ✅ Simple to detect (string comparison)

### Current Value Must Be Cached

Toggle requires reading the current parameter value from Redux cache. This means:
- **Parameters must be pre-fetched** (via `inventree_parameters_to_fetch` or auto-fetch)
- **Cache must be populated** before toggle works

**This is okay because:**
- Parameters are typically fetched during initialization
- Auto-fetch (Fix #3) ensures data is available for rules
- If cache is empty, we warn and skip (safe failure)

### Toggle is Non-Atomic

The toggle operation is:
1. Read current value (from cache)
2. Flip it
3. Send update

**Race condition?**
If value changes between step 1 and 3, we might flip to the wrong value.

**Mitigation:**
- WebSocket updates keep cache in sync
- Debouncing (Fix #14) batches rapid updates
- User typically waits for visual feedback before clicking again

**Future enhancement:** Add optimistic UI updates to prevent double-clicks.

### Boolean Parameters Use Strings

InvenTree stores boolean parameters as strings (`"True"`, `"False"`), not actual booleans.

**Toggle logic handles:**
- Case-insensitive comparison (`toLowerCase()`)
- Both `"True"` and `"False"` strings
- Default to `"True"` if value is unclear

**Future enhancement:** Support numeric toggles (0 ↔ 1) for numeric parameters.

---

## 🛣️ Future Work

### 1. Multiple Operations Per Action

**Current limitation:** One operation per action

**Desired:**
```yaml
actions:
  - id: toggle-and-notify
    operations:  # Array!
      - type: update_inventree_parameter
        parameterName: microwavables
        valueTemplate: TOGGLE
      - type: call_ha_service
        service: notify.notify
        data:
          message: "Microwavables toggled!"
```

**Required changes:**
1. Change `action.operation` → `action.operations: ActionOperation[]`
2. Update `ActionEngine.executeAction` to iterate over operations
3. Update `ActionEditorForm` to allow adding/removing operations
4. Handle operation dependencies/ordering

**Estimated effort:** 2-3 hours

### 2. Numeric Parameter Toggle

Support toggling between arbitrary values:

```yaml
operation:
  type: update_inventree_parameter
  parameterName: power_level
  valueTemplate: "TOGGLE:1,2,3,4,5"  # Cycle through values
```

**Estimated effort:** 1 hour

### 3. Template-Based Toggle Logic

Allow templates in toggle conditions:

```yaml
valueTemplate: "%%inv_param_145_microwavables == 'True' ? 'False' : 'True'%%"
```

Requires template evaluation engine enhancement.

**Estimated effort:** 3-4 hours

### 4. Optimistic UI Updates

Update UI immediately before API call completes:

```typescript
// Optimistically flip value in Redux
dispatch(updateParameterForPart({ partId, parameterPk, newValue: flippedValue }));

// Then send API call
dispatch(inventreeApi.endpoints.updatePartParameter.initiate(...));

// If API fails, revert
```

**Estimated effort:** 2 hours

### 5. Button State Persistence

Remember button state across page reloads:

```yaml
ui:
  statePersistence: true  # Save toggle state to localStorage
```

**Estimated effort:** 1-2 hours

---

## 📝 Commit Message

```
feat: add toggle switch button for boolean parameters

Feature Request:
Users wanted a single button that flips boolean parameter values
(True ↔ False) instead of needing two separate buttons.

Implementation:
1. ActionEngine (src/services/ActionEngine.ts):
   - Added TOGGLE keyword detection in handleUpdateInvenTreeParameter
   - When valueTemplate="TOGGLE", reads current value from cache
   - Flips boolean: "True" → "False" or "False" → "True"
   - Case-insensitive detection (toggle, TOGGLE, Toggle all work)
   - Safe fallback if current value is unclear

2. ActionEditorForm (src/components/editor/ActionEditorForm.tsx):
   - Added checkbox: "Use as Toggle Switch (flips True ↔ False)"
   - When checked: Sets valueTemplate to "TOGGLE" automatically
   - When unchecked: Shows regular Value Template input
   - Hides text input when toggle mode is active (cleaner UI)

Usage:
```yaml
operation:
  type: update_inventree_parameter
  parameterName: microwavables
  valueTemplate: TOGGLE  # ← Automatically flips value!
```

Benefits:
- Single button instead of two (50% fewer actions)
- Intuitive UX (one toggle vs. show/hide logic)
- Reads from cache (no extra API calls)
- Works with existing WebSocket + conditional logic
- Case-insensitive (forgiving user input)

Testing:
- Tested toggle from False → True ✅
- Tested toggle from True → False ✅
- Tested multiple toggles in sequence ✅
- Tested with conditional logic (hide/show) ✅
- Tested WebSocket integration ✅

Future Work:
- Multiple operations per action
- Numeric parameter cycling
- Template-based toggle logic

Breaking changes: None (additive feature)
```

---

## 🎊 Success Metrics

**Feature Completeness:**
```
Toggle logic: ✅ Implemented
Editor UI: ✅ Implemented
Testing: ✅ Complete
Documentation: ✅ Complete
User request: ✅ Fulfilled
```

**User Impact:**
```
Configuration complexity: -50% (1 action vs. 2)
Button count: -50% (1 button vs. 2)
Logic complexity: -100% (no show/hide logic needed)
User satisfaction: +♾️ (THIS IS SO COOL!)
```

**Time to Implement:**
```
Investigation: ~5 minutes (user explained clearly)
Backend logic: ~15 minutes (toggle detection + flip)
Frontend checkbox: ~10 minutes (UI update)
Testing: ~10 minutes (toggle back and forth)
Documentation: ~30 minutes (this document)
Total: ~70 minutes
```

**Lines Changed:** ~25 (high impact, low risk!)

---

**Status:** ✅ **TOGGLE SWITCH COMPLETE!!!**

Users can now create intuitive toggle buttons that flip boolean parameter values with a single click. Combined with conditional logic for visual feedback, this enables **incredibly powerful interactive dashboards**! 🎯🔥🚀

The future possibilities are endless:
- Color-coded buttons (green when on, red when off)
- Dynamic labels (show current state)
- Chained toggles (multiple parameters at once)
- State persistence (remember across reloads)

**THIS IS HOME AUTOMATION GOLD!** 🏆✨🎊

