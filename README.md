# InvenTree Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A highly flexible custom card for Home Assistant that displays, manages, and interacts with InvenTree inventory items and other Home Assistant entities. This card leverages React and Redux for a modern, dynamic, and powerful user experience.

## Key Features

*   **React & Redux Powered:** Modern architecture for robust state management and a responsive UI.
*   **Versatile Data Sourcing:**
    *   Integrate InvenTree parts via Home Assistant sensors.
    *   Directly fetch InvenTree parts by their Primary Keys (PKs).
    *   Fetch specific InvenTree parameters for parts.
    *   Incorporate data from **any** Home Assistant entity (e.g., sensors, lights, switches) into the card's logic and display.
*   **Powerful Conditional Logic:**
    *   Define rules based on InvenTree part parameters, attributes, or the state/attributes of any HA entity.
    *   Dynamically change the appearance of parts (highlight, text color, border, icon, visibility) based on these conditions.
*   **Flexible Layouts:** Choose from various view types (grid, list, detail - more planned) to display your items.
*   **Configurable Interactions:**
    *   Add custom buttons to parts or the card itself.
    *   Trigger Home Assistant services, navigate, or run internal card functions.
*   **Direct InvenTree API Integration (Optional):**
    *   Connect directly to your InvenTree instance for richer data and real-time updates via WebSockets.
*   **Visual Editor (Under Development):** A new React-based visual editor is being developed to easily configure the card's extensive options. *(Refer to `docs/editor-migration.md` for the development roadmap).*

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

The InvenTree Card offers a wide range of configuration options. Below is an example showcasing some of its capabilities. For detailed information on all available options and the configuration structure, please refer to the editor or future documentation.

The visual editor for this card is currently undergoing a significant rewrite to a more powerful React-based interface.

```yaml
type: custom:inventree-card
# --- Data Sources: Define where your data comes from ---
data_sources:
  inventree_hass_sensors: # InvenTree parts via HA sensors
    - sensor.inventree_parts_tools
  ha_entities: # Generic Home Assistant entities
    - sun.sun
    - binary_sensor.office_motion
  inventree_pks: # Specific InvenTree parts by their ID
    - 101
    - 15
  inventree_parameters_to_fetch: # Parameters to proactively load
    - targetPartIds: 'all_loaded' # Fetch for all parts loaded by other sources
      parameterNames: ['status', 'color_code']
    - targetPartIds: [101] # Fetch specific parameters for part 101
      parameterNames: ['length', 'width']

# --- Direct InvenTree API Connection (Optional) ---
direct_api:
  enabled: true
  url: 'http://your-inventree.local:8000'
  api_key: 'your_inventree_api_key_here'
  # method: 'websocket' # or 'polling' or 'hass' (if using HA for websocket proxy)

# --- Layout & Presentation ---
view_type: grid # Options: detail, grid, list, parts, variants
layout_options: # Options specific to the chosen view_type
  columns: 3
  grid_spacing: 8 # Pixels
  item_height: 180 # Pixels
display_elements: # Toggle visibility of standard elements
  show_image: true
  show_name: true
  show_stock: true
  show_description: false
  show_category: true
  show_buttons: true

# --- Conditional Logic: Dynamically alter appearance ---
# Rules are evaluated in order.
conditional_logic:
  rules:
    - name: "Highlight if sun is above horizon"
      parameter: "ha_entity:sun.sun:state" # Source: HA entity state
      operator: "equals"
      value: "above_horizon"
      action: "highlight" # Effect to apply
      action_value: "rgba(255, 255, 0, 0.3)" # Yellowish highlight
      targetPartIds: "*" # Apply to all parts

    - name: "Low stock warning for tools"
      parameter: "part:*:stock_level" # Source: Part attribute (stock_level applies to current part)
      operator: "less_than"
      value: 5
      action: "border"
      action_value: "2px solid red"
      targetPartIds: "*" # Could also be specific part IDs, e.g., [101, 102]

# --- Interactions: Define custom buttons and actions ---
interactions:
  buttons:
    - label: "Office Light On"
      icon: "mdi:lightbulb-on-outline"
      type: "ha-service" # Action type
      service: "light.turn_on"
      service_data:
        entity_id: light.office_desk_light
      # confirmation: true # Optional: require confirmation
      # confirmation_text: "Turn on the office light?"

    - label: "Adjust Part 101 Stock"
      icon: "mdi:plus-minus-variant"
      type: "internal-function" # (Future: More internal functions)
      # Example for a potential future internal function:
      # function_name: "adjust_stock"
      # function_args:
      #   part_id: 101
      #   amount: 1
      #   notes: "Added via card button"

# --- Performance & Debugging ---
performance:
  rendering:
    debounceTime: 100 # Milliseconds
# debug: true
# debug_verbose: true
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

*   **React-based Visual Editor:** A complete rewrite of the card configuration editor using React for a more intuitive and powerful experience.
*   **Enhanced Conditional Logic:** Further development of the conditional logic engine, including more complex expressions and actions.
*   **Expanded Layout Options:** Adding more built-in layouts and improving customization.
*   **Deeper InvenTree Integration:** Exploring more ways to interact with and display InvenTree data.

For a detailed view of the ongoing migration and feature development, please see the [Editor Migration Roadmap](docs/editor-migration.md).

## Contributing

Contributions are welcome! If you have ideas, bug reports, or want to contribute code, please:

1.  Open an issue on GitHub to discuss your proposed changes.
2.  Submit a pull request with your contributions.

## License

MIT © benoit505
