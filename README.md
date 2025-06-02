# InvenTree Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A highly flexible custom card for Home Assistant that displays, manages, and interacts with InvenTree inventory items and other Home Assistant entities. This card leverages React and Redux for a modern, dynamic, and powerful user experience.

## Key Features

*   **React & Redux Powered:** Modern architecture for robust state management and a responsive UI.
*   **Versatile Data Sourcing:**
    *   Integrate InvenTree parts via Home Assistant sensors.
    *   Directly fetch InvenTree parts by their Primary Keys (PKs) or from specified InvenTree Categories.
    *   **Proactive Parameter Fetching:** Configure specific InvenTree parameters to be fetched for targeted parts (all loaded, or specific PKs).
    *   **Custom Thumbnail Paths:** Specify local thumbnail overrides for parts, especially useful for API-sourced items.
    *   Incorporate data from **any** Home Assistant entity (e.g., sensors, lights, switches) into the card's logic and display through configurable bindings.
*   **Powerful Conditional Logic & Effects Engine:**
    *   **Expression Engine:** Define reusable, named conditions and calculations based on InvenTree part parameters, attributes, or the state/attributes of any HA entity. Supports comparisons and logical operators (AND/OR/NOT).
    *   **Conditional Effects:** Define logic blocks that trigger a series of visual or functional effects when their associated expressions evaluate to true.
    *   Dynamically change the appearance of parts (visibility, highlight, text color, border, opacity, icon, badge, custom CSS classes) based on these conditions.
*   **Configurable Interactions & Action Engine:**
    *   **Action Definitions:** Create custom actions triggered by UI elements (buttons, thumbnail clicks) or events.
    *   **Operations:** Actions can call Home Assistant services, update InvenTree parameters, dispatch internal Redux actions, or trigger other conditional logic.
    *   Templating support for service data and action parameters using part data or bound HA entity values.
    *   Optional confirmation dialogs for actions.
*   **Flexible Layouts:** Choose from various view types (grid, list, detail, parts, variants) to display your items, with layout-specific options.
*   **Direct InvenTree API Integration (Optional):**
    *   Connect directly to your InvenTree instance for richer data and real-time updates via WebSockets.
*   **React-based Visual Editor:** A new, evolving visual editor built with React to configure the card's extensive options. It supports the new data sourcing, conditional logic, and action systems. *(Refer to `docs/editor-migration.md` for the development roadmap and `docs/react-migration/editor-migration-pipeline.md` for the conceptual framework).*

## Installation

### HACS (Recommended)

1.  Ensure [HACS (Home Assistant Community Store)](https://hacs.xyz) is installed.
2.  Navigate to HACS in your Home Assistant interface.
3.  Click on the three dots in the top right corner and select "Custom repositories".
4.  Add `https://github.com/benoit505/inventree-card` as the Repository URL and select "Lovelace" as the Category. Click "Add".
5.  The "InvenTree Card" should now appear in the HACS Lovelace section. Click "Install".

### Manual Installation

1.  Download the `inventree-card.js` file from the [latest release](https://github.com/benoit505/inventree-card/releases).
2.  Copy the downloaded file into your Home Assistant `config/www/` directory.
3.  Add a reference to the card in your Lovelace resources:
    *   Go to Configuration -> Lovelace Dashboards -> Resources.
    *   Click "Add Resource".
    *   Set URL to `/local/inventree-card.js` and Resource Type to "JavaScript Module".
    *   Alternatively, if you manage Lovelace in YAML mode, add this to your `ui-lovelace.yaml` or dashboard YAML file:

    ```yaml
    resources:
      - url: /local/inventree-card.js
        type: module
    ```

## Configuration

The InvenTree Card offers a wide range of configuration options. The new React-based visual editor is the recommended way to configure the card. Below is an example showcasing some of its capabilities using the new structure.

```yaml
type: custom:inventree-card
# --- Data Sources: Define where your data comes from ---
data_sources:
  inventree_hass_sensors: # InvenTree parts via HA sensors
    - sensor.inventree_all_parts
  ha_entities: # Generic Home Assistant entities for binding
    - entity_id: sun.sun
      context_name: current_sun_state # Made available as {{ bindings.current_sun_state.value }}
    - entity_id: sensor.office_temperature
      type: state # 'state' or 'attribute'
      context_name: office_temp
  inventree_pks: # Specific InvenTree parts by their ID
    - 101
    - 15
  inventree_parameters_to_fetch: # Parameters to proactively load
    - targetPartIds: 'all_loaded' # Fetch for all parts loaded by other sources
      parameterNames: ['status', 'color_code']
    - targetPartIds: [101] # Fetch specific parameters for part 101
      parameterNames: ['length', 'width']
  inventree_pk_thumbnail_overrides:
    - pk: 101
      path: '/local/custom_thumbs/part_101_override.jpg'

# --- Direct InvenTree API Connection (Optional) ---
direct_api:
  enabled: true
  url: 'http://your-inventree.local:8000'
  api_key: 'your_inventree_api_key_here'

# --- Layout & Presentation ---
view_type: grid # Options: detail, grid, list, parts, variants
layout_options: # Options specific to the chosen view_type
  columns: 3
  grid_spacing: 8 # Pixels
  item_height: 200 # Pixels
display: # Toggle visibility of standard elements (presentation.display in editor)
  show_image: true
  show_name: true
  show_stock: true
  show_description: false
  show_category: true
  show_buttons: true # Area for custom action buttons

# --- Expression Engine: Define reusable conditions/calculations ---
expressions:
  expr_sun_is_up: # Unique expression ID
    name: "Sun is Above Horizon"
    type: "comparison"
    source:
      type: "entity_binding"
      id: "current_sun_state" # Matches context_name from data_sources.ha_entities
    operator: "equals"
    value: "above_horizon"
  expr_low_stock_tools:
    name: "Low Stock for Tools"
    type: "logical_and" # Example: Combine multiple conditions
    operands:
      - "expr_is_tool_category" # Assume this expression is also defined
      - "expr_stock_less_than_5"  # Assume this expression is also defined
  expr_stock_less_than_5:
    name: "Stock Less Than 5"
    type: "comparison"
    source:
      type: "part_attribute"
      id: "in_stock" # Referring to the part's 'in_stock' attribute
    operator: "less_than"
    value: 5

# --- Conditional Logic: Dynamically alter appearance using defined expressions ---
conditional_logic:
  definedLogics:
    - id: "logic_highlight_if_sun_up"
      name: "Highlight if Sun is Up"
      conditionRules: # This is a RuleGroupType from react-querybuilder
        id: "group_sun_up"
        combinator: "and"
        rules:
          - id: "rule_sun_up"
            field: "expression:expr_sun_is_up" # Reference an expression
            operator: "equals" # Expressions usually evaluate to boolean
            value: true
      effects:
        - id: "effect_highlight_yellow_sun_up"
          type: "set_style"
          styleProperty: "highlight"
          styleValue: "rgba(255, 255, 0, 0.3)"
          targetPartPks: "*" # Apply to all parts matching this logic

    - id: "logic_low_stock_border"
      name: "Low Stock Warning Border"
      conditionRules:
        id: "group_low_stock"
        combinator: "and"
        rules:
          - id: "rule_low_stock_tools_eval"
            field: "expression:expr_low_stock_tools" # Reference a combined expression
            operator: "equals"
            value: true
      effects:
        - id: "effect_border_red_low_stock"
          type: "set_style"
          styleProperty: "border"
          styleValue: "2px solid red"
          targetPartPks: "*"

# --- Interactions & Actions: Define custom buttons and their operations ---
actions: # Replaces 'interactions.buttons' from old example
  - id: "action_toggle_office_light"
    name: "Toggle Office Light"
    trigger:
      type: "ui_button" # Displayed as a button
      ui:
        labelTemplate: "Office Light"
        icon: "mdi:lightbulb"
        placement: "global_header" # Or 'part_footer'
    operation:
      type: "call_ha_service"
      callHAService:
        service: "light.toggle"
        target: # New target structure
          type: "direct_entity"
          entity_id: "light.office_desk_light"
    # confirmation: # Optional
    #   textTemplate: "Really toggle the office light?"

  - id: "action_add_one_part_101"
    name: "Add 1 to Part 101 Stock"
    trigger:
      type: "ui_button"
      ui:
        labelTemplate: "+1 for Part 101"
        icon: "mdi:plus"
        placement: "part_footer" # Example: show on part if context matches
    operation:
      type: "update_inventree_parameter" # Example, actual stock adjustment is complex
      updateInvenTreeParameter:
        partIdContext: 101 # Specific Part PK
        parameterName: "stock" # This is illustrative; stock isn't a simple parameter
        valueTemplate: "{{ current_value + 1 }}" # Illustrative template
    # This action might be better as a 'call_ha_service' to an InvenTree script/service for stock adjustment

# --- Performance & Debugging ---
performance:
  rendering:
    debounceTime: 100 # Milliseconds
# system: # Debug settings are now nested under 'system' in the editor
#   debug:
#     enabled: true
#     verbose: true
```

## Development

To contribute to the development of the InvenTree Card:

1.  **Fork & Clone:** Fork the repository and clone it to your local machine.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Build:** To create a production build:
    ```bash
    npm run build
    ```
    This will generate the `inventree-card.js` file in the `dist` directory.
4.  **Watch for Changes (Development Mode):** For automatic rebuilding during development:
    ```bash
    npm run watch
    ```
    This will watch for file changes and rebuild `inventree-card.js` on the fly. You can then copy this file to your Home Assistant `config/www/` directory (or use symlinks) to test your changes.

## Roadmap

The InvenTree Card is actively being developed and enhanced. Key areas of focus include:

*   **React-based Visual Editor:** Continuously improving the card configuration editor for a more intuitive and powerful experience, covering all new features.
*   **Enhanced Conditional Logic & Expression Engine:** Expanding capabilities, including more complex expression types, functions, and potentially a visual expression builder.
*   **Advanced Action Engine:** Adding more operation types and trigger mechanisms for the action system.
*   **Expanded Layout Options:** Adding more built-in layouts and improving customization for existing ones.
*   **Deeper InvenTree Integration:** Exploring more ways to interact with and display InvenTree data, including advanced relationship handling (assemblies, BOMs).

For a detailed view of the ongoing migration and feature development, please see the [Editor Migration Roadmap](docs/editor-migration.md) and the [Conceptual Pipeline](docs/react-migration/editor-migration-pipeline.md).

## Contributing

Contributions are welcome! If you have ideas, bug reports, or want to contribute code, please:

1.  Open an issue on GitHub to discuss your proposed changes.
2.  Submit a pull request with your contributions.

## License

MIT © benoit505
