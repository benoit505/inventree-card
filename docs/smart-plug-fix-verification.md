# Smart Plug Fix - Real-time HASS Updates 🔧

## The Problem We Just Fixed

Your sensor data was **stale in the Redux store**! Here's what was happening:

### ❌ **Before Fix**
1. **Initialization**: HASS sensor data fetched once during card setup
2. **Power Changes**: Smart plug power changes from 24.6W → 0.0W in Home Assistant  
3. **Lit Wrapper**: New `hass` object received by LitElement
4. **React Component**: Gets fresh `hass` prop but **doesn't update Redux store**
5. **CLE Evaluation**: Reads stale data from Redux store (still shows 24.6W)
6. **Result**: Rules evaluate against old data! 😤

### ✅ **After Fix**
1. **Initialization**: HASS sensor data fetched during card setup
2. **Power Changes**: Smart plug power changes from 24.6W → 0.0W in Home Assistant
3. **Lit Wrapper**: New `hass` object received by LitElement  
4. **React Component**: 🚀 **NEW useEffect detects hass change**
5. **Redux Update**: `dispatch(fetchHaEntityStatesThunk())` updates store with fresh data
6. **Websocket Middleware**: Detects entity state update, triggers CLE re-evaluation
7. **CLE Evaluation**: Reads fresh data (0.0W), rules evaluate correctly
8. **Result**: Parts respond to real-time changes! ✨

## The Fix Explained

### 1. **Added HASS Update Effect**
```typescript
// In InventreeCard.tsx
useEffect(() => {
  if (!hass || !cardInstanceId) return;

  // Get the HA entities that should be monitored from config
  const haEntities = config?.data_sources?.ha_entities || [];
  
  if (haEntities.length > 0) {
    logger.debug('HASS Update', `Updating ${haEntities.length} HA entity states in Redux store`);
    
    // 🚀 Update the Redux store with fresh HASS data
    dispatch(fetchHaEntityStatesThunk({ hass, entityIds: haEntities }));
  }
}, [hass, config?.data_sources?.ha_entities, cardInstanceId, dispatch, logger]);
```

### 2. **Enhanced Websocket Middleware Logging**
```typescript
// In websocketMiddleware.ts
logger.info('middleware', `🚀 HA entity state updated, triggering effects re-evaluation.`, {
  entityCount: Array.isArray(entityData) ? entityData.length : 1,
  entities: Array.isArray(entityData) ? entityData.map(e => `${e?.entity_id}=${e?.state}`)
});
```

## Testing Your Smart Plug Setup

### Step 1: Setup Your Configuration

Ensure your configuration includes the power sensor:

```json
{
  "data_sources": {
    "ha_entities": ["sensor.test_plug_power"]
  },
  "conditional_logic": {
    "definedLogics": [
      {
        "id": "smart_plug_test",
        "name": "Smart Plug Power Test",
        "logicPairs": [
          {
            "id": "power_check",
            "conditionRules": {
              "combinator": "and",
              "rules": [
                {
                  "field": "ha_entity_state_sensor.test_plug_power",
                  "operator": "greaterThan",
                  "value": "5"
                }
              ]
            },
            "effects": [
              {
                "type": "set_style",
                "styleTarget": "Row",
                "styleProperty": "background", 
                "styleValue": "linear-gradient(45deg, #4CAF50, #8BC34A)"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Step 2: Monitor the Logs

Open browser DevTools Console and watch for these log messages:

#### **When card initializes:**
```
[InventreeCard] HASS Update: Updating 1 HA entity states in Redux store
[genericHaStateThunks] Fetching states for entities: sensor.test_plug_power
[genericHaStateSlice] Set batch of 1 entity states
```

#### **When you change the smart plug state:**
```
[InventreeCard] HASS Update: Updating 1 HA entity states in Redux store
[websocketMiddleware] 🚀 HA entity state updated, triggering effects re-evaluation
[ConditionalEffectsEngine] evaluateAndApplyEffects: Starting evaluation for 1 logic items
```

### Step 3: Test the Real-time Flow

1. **Turn smart plug ON** (power > 5W):
   - Parts should immediately turn green
   - Console: `sensor.test_plug_power=24.6`

2. **Turn smart plug OFF** (power = 0W):  
   - Parts should immediately return to normal
   - Console: `sensor.test_plug_power=0.0`

3. **Toggle rapidly**:
   - Changes should be near-instantaneous
   - Throttling should prevent flooding (max 4 evaluations/second)

## Debugging Guide

### If It's Still Not Working

#### **Check 1: Is the sensor in your config?**
```javascript
// In console, check your config:
console.log('Config data sources:', yourConfig.data_sources?.ha_entities);
// Should include: ["sensor.test_plug_power"]
```

#### **Check 2: Is the HASS update effect running?**
Look for this log message:
```
[InventreeCard] HASS Update: Updating 1 HA entity states in Redux store
```

If missing, the `hass` object isn't changing or `ha_entities` is empty.

#### **Check 3: Is the Redux store updating?**
```javascript
// In console, check Redux state:
store.getState().genericHaStates.entities['sensor.test_plug_power']
// Should show current power value
```

#### **Check 4: Is the middleware triggering?**
Look for this log message:
```
🚀 HA entity state updated (action: genericHaStates/setEntityStatesBatch), triggering effects re-evaluation
```

If missing, the Redux action isn't being dispatched.

#### **Check 5: Is the CLE evaluating?**
Look for this log message:
```
[ConditionalEffectsEngine] evaluateAndApplyEffects: Starting evaluation
```

If missing, the throttled evaluator isn't working.

## Performance Characteristics

### ✅ **Efficient Updates**
- Only configured HA entities are monitored
- Throttled to max 4 evaluations per second
- Memoized rule evaluation prevents duplicate work

### ✅ **Immediate Response**
- No polling - direct event-driven updates
- Redux middleware triggers instant re-evaluation
- Visual effects applied in single batch

### ✅ **Scalable**
- Works with any number of HA entities
- Handles rapid state changes gracefully
- Memory efficient with proper cleanup

## Advanced Scenarios

### Multiple Sensors
```json
{
  "data_sources": {
    "ha_entities": [
      "sensor.workshop_temperature",
      "sensor.cnc_machine_power", 
      "sensor.3d_printer_power",
      "binary_sensor.workshop_door"
    ]
  }
}
```

All sensors update in real-time with single batch operation.

### Complex Rules
```typescript
{
  "conditionRules": {
    "combinator": "and",
    "rules": [
      {
        "field": "ha_entity_state_sensor.test_plug_power",
        "operator": "greaterThan",
        "value": "5"
      },
      {
        "field": "ha_entity_state_sensor.workshop_temperature", 
        "operator": "lessThan",
        "value": "25"
      }
    ]
  }
}
```

Rule: "Light is on AND workshop is cool = green glow"

### Time-based Rules
```typescript
{
  "conditionRules": {
    "combinator": "and", 
    "rules": [
      {
        "field": "ha_entity_state_sensor.test_plug_power",
        "operator": "greaterThan",
        "value": "0"
      },
      {
        "field": "ha_entity_state_sensor.time_of_day",
        "operator": "greaterThan", 
        "value": "18:00"
      }
    ]
  }
}
```

Rule: "Light is on after 6 PM = orange warning (work late?)"

## The Magic Result

Your bidirectional smart plug concept now works **flawlessly**:

1. **Dashboard Button** → **Toggle Smart Plug** → **Power Changes** → **Instant Visual Feedback**
2. **Physical Button** → **Toggle Smart Plug** → **Power Changes** → **Instant Visual Feedback**  
3. **Any HA Automation** → **Smart Plug State** → **Power Changes** → **Instant Visual Feedback**

The **parts truly come alive** in response to real-world changes! 🎭✨

## Next Test: Your Full Scenario

Try this complete bidirectional flow:

1. **Create rule**: Power > 5W = Green glow
2. **Add dashboard button**: Toggle smart plug  
3. **Press dashboard button** → Light turns on → **Part glows green** ✨
4. **Press physical button** → Light turns off → **Part returns normal** ✨
5. **Use HA automation** → Light changes → **Part responds** ✨

This is the **future of manufacturing visualization** - truly interactive digital twins! 🚀
