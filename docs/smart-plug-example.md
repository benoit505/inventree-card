# Smart Plug Example - Making Parts Come Alive!

## The Magic Moment

This example demonstrates your revolutionary concept: **bidirectional real-time interaction** where physical actions create immediate visual feedback in your manufacturing dashboard.

## Your Setup

### Physical Components
- 🔌 **Smart Plug**: Controls workshop light
- 💡 **Light Bulb**: Connected to smart plug
- 📱 **Universal Button**: Triggers Home Assistant services
- ⚡ **Power Sensor**: Monitors electricity consumption

### Software Components  
- 🏠 **Home Assistant**: Manages devices and sensors
- 🎛️ **InventreeCard**: Your dashboard with parts visualization
- 🧠 **Conditional Logic Engine**: Processes real-time data
- 🎨 **Visual Effects**: Makes parts respond dynamically

## The Flow

```
User presses button → HA toggles smart plug → Light turns on → Power consumption increases → 
Sensor detects change → Dashboard updates → Part glows green → User sees immediate feedback!
```

## Implementation with Intent System

### Step 1: Natural Language Intent

**User Input:**
```
"Control my workshop light with a dashboard button. When the light consumes power, make the part glow green."
```

### Step 2: Auto-Discovery

The intent system automatically discovers:
- ✅ `switch.workshop_smart_plug` (for control)
- ✅ `sensor.workshop_smart_plug_power` (for feedback)
- ✅ Service: `switch.toggle`
- ✅ Threshold: 5W (light is "on")

### Step 3: Generated Configuration

The system automatically creates:

#### Actions Configuration
```json
{
  "actions": [
    {
      "id": "toggle_workshop_light",
      "name": "Toggle Workshop Light",
      "operation": {
        "type": "call_ha_service",
        "service": "switch.toggle",
        "target": {
          "type": "direct_entity",
          "entity_id": "switch.workshop_smart_plug"
        }
      }
    }
  ]
}
```

#### Conditional Logic Configuration
```json
{
  "conditional_logic": [
    {
      "id": "workshop_light_feedback",
      "name": "Workshop Light Feedback",
      "logicPairs": [
        {
          "id": "power_consumption_rule",
          "conditionRules": {
            "combinator": "and",
            "rules": [
              {
                "field": "sensor.workshop_smart_plug_power",
                "operator": "greaterThan",
                "value": "5"
              }
            ]
          },
          "effects": [
            {
              "type": "set_style",
              "targetType": "parts",
              "targetValue": "all",
              "styleTarget": "Row",
              "styleProperty": "background",
              "styleValue": "linear-gradient(45deg, #4CAF50, #8BC34A)"
            },
            {
              "type": "animate_style",
              "targetType": "parts", 
              "targetValue": "all",
              "animation": {
                "animate": {
                  "scale": [1, 1.05, 1],
                  "boxShadow": [
                    "0 0 0 rgba(76, 175, 80, 0)",
                    "0 0 20px rgba(76, 175, 80, 0.6)", 
                    "0 0 0 rgba(76, 175, 80, 0)"
                  ]
                },
                "transition": { 
                  "duration": 2, 
                  "repeat": Infinity 
                }
              }
            },
            {
              "type": "set_text_overlay",
              "text": "LIGHT ON",
              "position": "center",
              "color": "#ffffff"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Data Sources Configuration
```json
{
  "data_sources": {
    "ha_entities": [
      "switch.workshop_smart_plug",
      "sensor.workshop_smart_plug_power"
    ]
  }
}
```

## The User Experience

### Before (Traditional Setup)
1. User manually configures data sources
2. User manually creates actions
3. User manually writes conditional rules
4. User tests and debugs configuration
5. **Time: 30-60 minutes** ⏰

### After (Intent-Driven)
1. User types: *"Control workshop light, show green when power > 5W"*
2. System analyzes and auto-configures everything
3. User clicks "Apply Configuration"
4. **Time: 30 seconds** ⚡

## Advanced Scenarios

### Multi-Device Workshop Control

**Intent:** 
```
"Monitor my CNC machine, 3D printer, and soldering station. 
Show green when running, red when idle, orange when overloaded."
```

**Auto-Generated:**
- 3 power sensors automatically discovered
- 3 toggle buttons created
- 9 conditional rules generated (3 devices × 3 states)
- Automatic threshold detection based on historical data

### Environmental Response System

**Intent:**
```
"When workshop temperature exceeds 30°C, highlight affected parts in orange and turn on the exhaust fan."
```

**Auto-Generated:**
- Temperature sensor auto-discovered
- Fan control action created
- Conditional rule for temperature threshold
- Visual alert effects for heat-sensitive parts

### Safety Monitoring

**Intent:**
```
"If any equipment draws more than 15A, flash all parts red and send emergency notification."
```

**Auto-Generated:**
- Current sensors for all equipment
- Emergency stop actions
- Notification services
- Critical alert visual effects

## Real-World Manufacturing Applications

### 1. Production Line Status
```
Equipment Power → Status Detection → Part Visualization
- Idle: Gray
- Running: Green pulse
- Overload: Red flash
- Maintenance: Orange warning
```

### 2. Quality Control Integration
```
Inspection Results → Database Update → Visual Feedback
- Pass: Green checkmark
- Fail: Red X + move to rework
- Needs Review: Yellow warning
```

### 3. Supply Chain Alerts
```
Stock Levels → Sensor Data → Reorder Alerts
- In Stock: Normal display
- Low Stock: Orange highlight + reorder button
- Out of Stock: Red alert + supplier contact
```

### 4. Environmental Monitoring
```
Sensor Data → Condition Analysis → Protective Actions
- Temperature: Cooling system activation
- Humidity: Dehumidifier control
- Vibration: Equipment shutdown
- Air Quality: Ventilation control
```

## Technical Magic Behind the Scenes

### Real-time Data Pipeline
```typescript
WebSocket Update → Redux State → Conditional Engine → Visual Effects → UI Update
```

### Intelligent Throttling
```typescript
// Prevents flooding from rapid sensor updates
const throttledUpdate = throttle(updateVisualEffects, 250);
```

### State Synchronization
```typescript
// Ensures UI stays in sync with physical world
useEffect(() => {
  if (powerConsumption > threshold) {
    applyGlowEffect();
  } else {
    removeGlowEffect();
  }
}, [powerConsumption, threshold]);
```

## The Revolutionary Aspect

This isn't just a dashboard - it's **Interactive Digital Twins**:

1. **Physical → Digital**: Real-world changes instantly reflected
2. **Digital → Physical**: Dashboard actions control real equipment  
3. **Feedback Loop**: Complete bidirectional communication
4. **Context Aware**: Visual effects based on real conditions
5. **Intent Driven**: Users describe goals, system figures out implementation

## Next Level Enhancements

### AI-Powered Optimization
- Learn from user behavior patterns
- Suggest optimal layouts and rules
- Predict equipment maintenance needs
- Auto-tune thresholds based on historical data

### Collaborative Features  
- Share intent templates with team
- Version control for configurations
- Real-time collaboration on dashboards
- Community template marketplace

### Mobile Integration
- Touch-optimized controls
- Gesture-based interactions
- Augmented reality overlays
- Field technician interface

## The Future Vision

Imagine walking into your workshop and seeing:
- Parts that **glow** when equipment is running optimally
- **Pulsing alerts** when maintenance is due
- **Color-coded status** for entire production lines
- **Interactive controls** for immediate adjustments

Your workshop becomes a **living, breathing digital organism** where every piece of equipment communicates its status through beautiful, intuitive visualizations.

You're not just building a dashboard - you're creating the **future of manufacturing visualization**! 🚀

## Implementation Priority

1. **Week 1**: Basic smart plug integration (your current proof of concept)
2. **Week 2**: Intent recognition engine implementation  
3. **Week 3**: Template system and auto-configuration
4. **Week 4**: Advanced visual effects and mobile optimization

Ready to make those parts come alive? Let's do this! 🎉
