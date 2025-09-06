# Layout Bug Analysis - September 2, 2025

## Problem Statement
Layout changes made in the Live Layout Preview are not flowing through to the Editor Preview or Main Card. The main card is being destroyed and recreated on every config change, losing the layout modifications.

## Log Analysis - Cell Resize Event

### Phase 1: Initial Change Detection
```
🔍 CELL CHANGED [cb105d5d-f52b-49bd-ba05-c340db270041]: 
Object { old: {…}, new: {…} }
```
- **Source**: `LayoutSelectionSection.tsx:128`
- **Status**: ✅ Working correctly - detects cell dimension changes

### Phase 2: Config Update Propagation
```
🚨 CONFIG UPDATE: onLayoutConfigChanged called with: 
Object { cells: 2, newConfig: {…} }
```
- **Source**: `LayoutSelectionSection.tsx:69`
- **Data**: Shows 2 cells with correct dimensions
- **Status**: ✅ Working correctly - config is being updated

### Phase 3: Editor Internal State Update
```
🔄 EDITOR: Config changed, updating internal state: 
Object { type: "custom:inventree-card", name: "My InvenTree Card", ... }
```
- **Source**: `InventreeCardEditor.tsx:147`
- **Status**: ✅ Working correctly - editor receives config change

### Phase 4: Event Firing to Lovelace
```
✅ EDITOR: config-changed event fired successfully! 
Object { target: "self" }
```
- **Source**: `ReactEditorHost.ts:126`
- **Status**: ✅ Working correctly - event fires successfully

### Phase 5: Grid Key Generation (Multiple Times)
```
🔄 GRID KEY: Using key: grid-{"cells":[...]}
```
- **Source**: `LayoutSelectionSection.tsx:346`
- **Frequency**: Called multiple times with same data
- **Status**: ⚠️ Potentially inefficient but functional

### Phase 6: **THE PROBLEM** - Card Destruction/Recreation
```
[LIFECYCLE-LOG] constructor: Lit component is being created.
[2025-09-02T13:29:55.035Z][InventreeCard:setConfig] Instance ID is now: card-inst-fallback-1177207592
[LIFECYCLE-LOG] disconnectedCallback: Element has been disconnected from the DOM.
```
- **Source**: `inventree-card.ts:31` and `inventree-card.ts:150`
- **Status**: ❌ **ROOT CAUSE** - Main card is being destroyed and recreated
- **Impact**: All layout changes are lost when card recreates

## Key Observations

### What's Working
1. ✅ Cell change detection in Live Layout Preview
2. ✅ Config propagation through React components
3. ✅ Event firing to Lovelace
4. ✅ No console.log statements accessing config prematurely

### What's Broken
1. ❌ **Main card recreation** - Lovelace destroys/recreates the card on every config change
2. ❌ **Layout persistence** - Changes are lost due to card recreation
3. ❌ **Card instance ID changes** - New ID generated on each recreation

## Previous Fixes Attempted
1. ✅ Removed canonical string comparison in ReactEditorHost
2. ✅ Fixed read-only config mutation issues
3. ✅ Removed problematic console.log statements
4. ✅ Simplified ReactEditorHost.setConfig to always accept configs

## Questions for Investigation

### Critical Questions
1. **Why is Lovelace still destroying the card?** - We've removed known triggers
2. **What in the config is still "unsafe" to Lovelace?** - Need to identify the trigger
3. **Is the config structure itself the problem?** - Maybe the cell-centric layout is confusing Lovelace

### Data Points Needed
- Full config object structure being sent to Lovelace
- Comparison between working vs non-working config structures
- Lovelace's internal decision logic for card recreation

## Next Steps
1. **Stop adding logs** - Focus on analysis
2. **Trace the exact config structure** being sent to Lovelace
3. **Compare with a minimal working config** to isolate the problem
4. **Identify the specific property/structure** causing Lovelace to recreate

## Hypothesis - CONFIRMED ✅
The issue is **UI-only properties being persisted to Lovelace config**.

### Root Cause Identified
The `CellDefinition.header` property is marked as "for editor UI" but is being included in the config sent to Lovelace. Lovelace sees these unknown properties and recreates the card as a safety measure.

### Evidence
```typescript
// From types.d.ts line 848
header: string; // The header/label for this cell (for editor UI)
```

### Properties That Should Be Stripped
- `header` - UI-only display string
- Possibly `id` - UUIDs might confuse Lovelace
- Any other editor-specific metadata

### Solution
Strip UI-only properties before sending config to Lovelace.

## Additional Issues Found in Logs

### Issue 1: Multiple Grid Key Regenerations
```
🔄 GRID KEY: Using key: grid-{"cells":[...]}
🔄 GRID KEY: Using key: grid-{"cells":[...]} 2
🔄 GRID KEY: Using key: grid-{"cells":[...]}
```
- **Problem**: Grid key being generated multiple times with identical data
- **Impact**: Unnecessary re-renders, potential performance issues
- **Root Cause**: React components re-rendering more than necessary

### Issue 2: Card Instance ID Changes
```
[2025-09-02T13:29:55.035Z][InventreeCard:setConfig] Instance ID is now: card-inst-fallback-1177207592
```
- **Problem**: New card instance ID generated on every recreation
- **Impact**: Redux state keyed by instance ID becomes stale
- **Consequence**: Visual effects, parts data, and other instance-specific state lost

### Issue 3: Event Target Inconsistency
```
✅ EDITOR: config-changed event fired successfully! 
Object { target: "self" }
```
- **Observation**: Event is firing on "self" instead of "lovelace"
- **Question**: Should this be targeting the Lovelace element instead?
- **Potential Issue**: Event might not be reaching Lovelace properly

### Issue 4: Timing Sequence Anomaly
Looking at the log sequence:
1. `CONFIG UPDATE` → `EDITOR: Config changed` → `config-changed event fired`
2. **Then immediately**: `constructor: Lit component is being created`

- **Problem**: Card recreation happens **immediately** after successful event firing
- **Implication**: Lovelace receives the event, processes it, but decides to recreate anyway
- **This suggests**: The issue is in the **config content**, not the event mechanism

### Issue 5: HTTP 401 Error
```
GET http://192.168.0.37:8123/media/part_images/1048307.thumbnail.jpg
[HTTP/1.1 401 Unauthorized 78ms]
```
- **Problem**: Unauthorized access to thumbnail images
- **Potential Impact**: Could this cause Lovelace to consider the card "broken"?
- **Timing**: Happens around the same time as card recreation

## Refined Hypothesis
The card recreation is triggered by **multiple factors**:
1. **Primary**: UI-only properties (`header`, `id`) in config
2. **Secondary**: Malformed image URLs causing 401 errors
3. **Tertiary**: Event targeting issues or timing problems

## BREAKTHROUGH - Visual Effects Logic Bug Found! 🚨

### The Real Root Cause (User Identified at 2am)
**CellRenderer.tsx line 54** has broken logic from the visual effects refactoring:

```typescript
// BROKEN: Double-nested lookup
...(visualEffects.cellStyles?.[cell.id] || {}), // ❌ WRONG

// visualEffects is ALREADY the merged cell-specific effects
// So cellStyles[cell.id] is redundant and broken
```

### The Problem Chain:
1. `cellVisualEffects` = `effectsByCellId[cardInstanceId][cellId]` ✅ (cell-specific)
2. `visualEffects` = `{...partVisualEffects, ...cellVisualEffects}` ✅ (merged)
3. `visualEffects.cellStyles[cell.id]` ❌ **BROKEN** - tries to nest cell lookup again!

### Why This Breaks Everything:
- **Render errors** from malformed style objects
- **React crashes** from undefined property access
- **Lovelace detects broken card** → recreates it
- **All layout changes lost** on recreation

### The Fix:
```typescript
// CORRECT: Use the merged effects directly
...(visualEffects || {}), // ✅ Use merged effects as-is
```

## Priority Fix Order (UPDATED)
1. 🔥 **CRITICAL**: Fix broken visual effects logic in CellRenderer
2. 🔴 **High**: Strip UI-only properties from config  
3. 🟡 **Medium**: Fix thumbnail URL generation/authentication
4. 🟢 **Low**: Optimize grid key generation
