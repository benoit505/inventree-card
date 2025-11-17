# InvenTree Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A sophisticated custom card for Home Assistant that transforms InvenTree inventory management into a modern, interactive dashboard experience. Built with React and Redux for robust performance and flexible customization.

## Overview

InvenTree Card bridges your InvenTree inventory system with Home Assistant, providing real-time stock management, intelligent automation, and touchscreen-friendly controls. Perfect for home workshops, maker spaces, small businesses, or anyone managing physical inventory alongside their smart home.

## Key Features

### Modern Architecture
- **React & Redux**: Modern component architecture with centralized state management
- **Real-time Updates**: WebSocket integration for instant inventory synchronization
- **Optimized Performance**: Debounced operations, intelligent caching, and efficient rendering

### Flexible Data Integration
- **Multiple Data Sources**: InvenTree parts via HA sensors, direct API connections, or manual part selection
- **Entity Bindings**: Integrate any Home Assistant entity (sensors, switches, lights) into your inventory logic
- **Smart Parameter Loading**: Automatically fetch InvenTree parameters for targeted parts
- **Custom Thumbnails**: Override images with local paths for better visual organization

### Advanced Stock Management
- **Custom Portions**: Define increment/decrement amounts per item (e.g., -15g coffee, +500g restock)
- **Slider Mode**: Touch-friendly slider for precise stock adjustments with configurable ranges and steps
- **Unit Support**: Display stock with units (grams, milliliters, pieces, etc.)
- **Debounced Updates**: Intelligent batching of rapid stock changes with eventual consistency
- **WebSocket Verification**: Automatic validation of stock updates against server state

### Powerful Conditional Logic Engine
- **Expression Builder**: Create reusable conditions based on part parameters, attributes, or HA entity states
- **Dynamic Effects**: Automatically change visibility, styling, highlights, icons, and badges based on conditions
- **Logical Operators**: Support for AND/OR/NOT combinations with nested logic groups
- **Real-time Evaluation**: Conditions automatically re-evaluate when data changes

### Configurable Actions
- **Multi-Operation Actions**: Chain multiple operations in sequence (call services, update parameters, trigger logic)
- **Rich Triggers**: Buttons, thumbnail clicks, or automated events
- **Template Support**: Dynamic values using part data or entity bindings
- **Confirmation Dialogs**: Optional user confirmation for critical actions

### Responsive Layouts
- **Flexible Grid System**: Configure 4-24 columns for different screen sizes
- **Multiple View Types**: Grid, list, table, detail, and variant views
- **Custom Cell Layouts**: Position and size each element precisely
- **Zoom & Preview**: Visual editor with live preview and zoom controls

### Visual Editor
- **React-based Interface**: Modern, intuitive configuration UI
- **Live Preview**: See changes in real-time as you configure
- **Inline Editors**: Configure portions, slider settings, and actions directly
- **Data Availability Indicators**: Visual feedback on parameter and entity loading status

## Installation

### HACS (Recommended)

1. Ensure [HACS](https://hacs.xyz/) is installed
2. Navigate to HACS in your Home Assistant interface
3. Click the three dots (⋮) and select "Custom repositories"
4. Add `https://github.com/benoit505/inventree-card` as the Repository URL
5. Select "Lovelace" as the Category and click "Add"
6. Find "InvenTree Card" in the HACS Lovelace section and click "Install"

### Manual Installation

1. Download `inventree-card.js` from the [latest release](https://github.com/benoit505/inventree-card/releases)
2. Copy it to your `config/www/` directory
3. Add to Lovelace resources:
   - Go to Configuration → Lovelace Dashboards → Resources
   - Click "Add Resource"
   - Set URL to `/local/inventree-card.js` and type to "JavaScript Module"

Or in YAML mode:

```yaml
resources:
  - url: /local/inventree-card.js
    type: module
```

## Quick Start

### Basic Configuration

```yaml
type: custom:inventree-card
data_sources:
  inventree_hass_sensors:
    - sensor.inventree_all_parts
view_type: grid
layout_options:
  columns: 3
  grid_spacing: 8
```

### Stock Management Example

```yaml
type: custom:inventree-card
data_sources:
  inventree_pks: [150, 179, 305]  # Coffee, Tea, Milk
direct_api:
  enabled: true
  url: 'http://inventree.local:8000'
  api_key: 'your_api_key'
layout:
  gridColumns: 12  # 12-column grid for tablet display
  cells:
    - id: coffee-stock
      partPk: 150
      content: in_stock
      x: 0
      y: 0
      w: 4
      h: 1
      stockUnit: g
      decrementAmount: 15   # Daily use
      incrementAmount: 500  # Restock amount
      sliderMin: 0
      sliderMax: 1000
      sliderStep: 50
```

### Conditional Logic Example

```yaml
expressions:
  low_stock:
    name: "Stock Below Threshold"
    type: "comparison"
    source:
      type: "part_attribute"
      id: "in_stock"
    operator: "less_than"
    value: 10

conditional_logic:
  definedLogics:
    - id: "highlight_low_stock"
      name: "Highlight Low Stock Items"
      conditionRules:
        combinator: "and"
        rules:
          - field: "expression:low_stock"
            operator: "equals"
            value: true
      effects:
        - type: "set_style"
          styleProperty: "border"
          styleValue: "2px solid red"
          targetPartPks: "*"
```

## Configuration Options

The card offers extensive configuration through the visual editor. Key sections include:

- **Data Sources**: Define where parts and entity data come from
- **Direct API**: Optional direct connection to InvenTree
- **Layout**: Grid configuration, cell positioning, and view type
- **Expressions**: Reusable conditions and calculations
- **Conditional Logic**: Dynamic styling and visibility rules
- **Actions**: Custom interactions and automations
- **Display**: Control which elements are shown

For detailed documentation, see the [Configuration Guide](docs/102025/configuration%20guide/configuration%20guide.md).

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode for development
npm run watch
```

The build outputs to `dist/inventree-card.js`. Copy this to your Home Assistant `config/www/` directory for testing.

## Use Cases

- **Home Workshop**: Track tools, materials, and consumables alongside your smart home
- **Kitchen Inventory**: Monitor pantry stock with automatic low-stock alerts
- **Maker Space**: Manage shared resources with touchscreen kiosks
- **Small Business**: Integrate inventory with environmental sensors and automation
- **Consumables**: Perfect for coffee, tea, milk, snacks with custom portion tracking

## Roadmap

- Enhanced visual editor with drag-and-drop layout builder
- Advanced relationship handling (assemblies, BOMs)
- More layout types and customization options
- Extended expression engine with functions and calculations
- Barcode/QR code scanning integration
- Historical stock trend visualization

## Contributing

Contributions are welcome! Please:

1. Open an issue to discuss proposed changes
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

## License

MIT © benoit505

## Acknowledgments

Built with modern web technologies:
- React for UI components
- Redux Toolkit for state management
- React Grid Layout for flexible positioning
- Framer Motion for smooth animations
- TypeScript for type safety
