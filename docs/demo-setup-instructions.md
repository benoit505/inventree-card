# Demo Setup Instructions - Your Smart Plug Proof of Concept

## 🎯 Goal

Transform your current smart plug setup into a **fully functional bidirectional manufacturing dashboard** using the new Intent Builder!

## Current Setup (Your Hardware)

✅ **Smart Plug**: Controls workshop light  
✅ **Universal Button**: Triggers Home Assistant services  
✅ **Power Sensor**: Monitors electricity consumption  
✅ **Home Assistant**: Managing all devices  

## New Setup (With Intent Builder)

🚀 **Intent Builder**: Auto-configures everything from natural language  
🎨 **Visual Effects**: Parts come alive based on real data  
🔄 **Bidirectional Control**: Dashboard buttons control physical devices  
⚡ **Real-time Feedback**: Instant visual response to changes  

## Step-by-Step Demo

### Step 1: Access Intent Builder

1. Open your InventreeCard editor
2. Click the new **"🚀 Intent Builder"** tab (first tab, highlighted in blue)
3. You'll see two options: "Natural Language" and "Templates"

### Step 2: Natural Language Demo

1. **Click "Natural Language" tab**
2. **Type your intent:**
   ```
   Toggle my workshop light with a dashboard button. When the light consumes more than 5 watts, make the part glow green and show "LIGHT ON" text.
   ```

3. **Click "Analyze Intent"**
   - System discovers your smart plug entities
   - Shows confidence level
   - Lists discovered switches and sensors

4. **Click "Generate Configuration"**
   - Auto-creates toggle button action
   - Generates conditional rule for power > 5W
   - Creates green glow + text overlay effects
   - Configures data sources automatically

5. **Click "Apply to Card Configuration"**
   - Everything gets added to your card config
   - No manual configuration needed!

### Step 3: Template Demo

1. **Click "Templates" tab**
2. **Select "Smart Device Control" template**
3. **Fill in the parameters:**
   - **Smart Device**: `switch.workshop_smart_plug` (or your entity name)
   - **Feedback Sensor**: `sensor.workshop_smart_plug_power` (or your sensor)
   - **Condition**: "greater than"
   - **Threshold Value**: `5`
   - **Visual Effect**: "highlight green"

4. **Click "Generate Configuration"**
5. **Click "Apply to Card Configuration"**

### Step 4: Test the Magic! ✨

1. **Save your card configuration**
2. **Go back to the card view** (exit editor)
3. **You should now see:**
   - A "Toggle Workshop Light" button on your dashboard
   - Your part displayed normally

4. **Press the button:**
   - Light turns on physically
   - Power consumption increases
   - Part immediately glows green
   - "LIGHT ON" text appears

5. **Press button again:**
   - Light turns off physically
   - Power consumption drops
   - Part returns to normal appearance

## Home Assistant Entity Names

Your entities might be named differently. Common patterns:

### Smart Plugs
- `switch.workshop_smart_plug`
- `switch.tp_link_smart_plug`
- `switch.sonoff_basic_relay`
- `switch.shelly_plug_s`

### Power Sensors
- `sensor.workshop_smart_plug_power`
- `sensor.tp_link_smart_plug_current_consumption`
- `sensor.sonoff_basic_power`
- `sensor.shelly_plug_s_power`

### Finding Your Entities

1. **In Home Assistant:**
   - Go to Settings → Devices & Services
   - Find your smart plug device
   - Note the entity IDs

2. **In Intent Builder:**
   - The dropdowns will show all available entities
   - Look for entities containing "plug", "power", "consumption"

## Expected Results

### ✅ **What Should Work:**
- Button appears on dashboard
- Clicking button toggles physical light
- Part glows green when light is on
- Part returns to normal when light is off
- "LIGHT ON" text appears/disappears

### 🔧 **If Something Doesn't Work:**

#### **No Entities Found:**
- Check entity names in Home Assistant
- Ensure entities are available in HA states
- Try typing entity names manually

#### **Button Doesn't Control Light:**
- Verify service call in HA Developer Tools
- Test: `service: switch.toggle`, `entity_id: your_switch`

#### **No Visual Feedback:**
- Check power sensor is updating
- Verify threshold value (try lowering to 1W)
- Look for console errors in browser dev tools

#### **Power Sensor Not Updating:**
- Some plugs only report power when load changes
- Try turning light on/off manually first
- Check sensor history in Home Assistant

## Advanced Demo Scenarios

### Multi-Device Workshop

**Intent:**
```
Monitor my workshop equipment: drill press, 3D printer, and soldering station. Show green when running, red when idle.
```

**Result:**
- Auto-discovers all power sensors
- Creates monitoring rules for each device
- Color-codes parts based on equipment status

### Environmental Response

**Intent:**
```
When workshop temperature exceeds 25°C, highlight parts in orange and turn on the exhaust fan.
```

**Result:**
- Finds temperature sensor
- Creates conditional rule
- Adds fan control action
- Orange warning visualization

### Safety Monitoring

**Intent:**
```
If any equipment draws more than 10 amps, flash all parts red and send notification.
```

**Result:**
- Discovers current sensors
- Creates safety threshold rules
- Emergency visual effects
- Notification actions

## The Revolutionary Aspect

This isn't just automation - it's **Interactive Digital Manufacturing**:

1. **Physical → Digital**: Real equipment states visualized instantly
2. **Digital → Physical**: Dashboard controls real equipment
3. **Context Aware**: Visual effects based on actual conditions
4. **Intent Driven**: Describe goals, system figures out implementation

## Next Steps

Once this basic demo works:

1. **Add More Devices**: Expand to other workshop equipment
2. **Complex Rules**: Multi-sensor conditions (temperature + power + time)
3. **Advanced Effects**: Animations, multi-color themes, sound alerts
4. **Mobile Interface**: Control from tablet/phone
5. **Sharing**: Export configurations for team use

## Troubleshooting

### Common Issues:

**"Home Assistant not available"**
- Refresh the page
- Check HA connection in main card

**"No entities discovered"**
- Ensure devices are properly configured in HA
- Check entity naming patterns
- Try manual entity ID entry

**"Configuration not applied"**
- Check browser console for errors
- Verify all required fields are filled
- Try refreshing and re-applying

### Getting Help:

1. **Check Browser Console**: F12 → Console tab
2. **Home Assistant Logs**: Settings → System → Logs  
3. **Test Services**: HA Developer Tools → Services

## Success Criteria

You'll know it's working when:
- ✅ Physical button press changes dashboard visualization
- ✅ Dashboard button controls physical device
- ✅ Real-time sensor data drives visual effects
- ✅ Complete bidirectional communication loop

**This is the future of manufacturing visualization!** 🚀

You're creating **interactive digital twins** where every piece of equipment communicates its status through beautiful, intuitive visualizations. 

Ready to make your parts come alive? Let's do this! 🎉
