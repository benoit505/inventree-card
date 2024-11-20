# InvenTree Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A custom card for Home Assistant that displays and manages InvenTree inventory items.

## Installation

### HACS (Recommended)

1. Make sure you have [HACS](https://hacs.xyz) installed
2. Add this repository as a custom repository in HACS:
   - Click on HACS in your Home Assistant instance
   - Click on the three dots in the top right corner
   - Click on Custom repositories
   - Add `https://github.com/benoit505/inventree-card` as a Lovelace plugin

### Manual Installation

1. Download the `inventree-card.js` file from the latest release
2. Copy it into your `config/www` directory
3. Add a reference to the card in your `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/inventree-card.js
      type: module
```

## Usage

Add the card to your dashboard:

```yaml
type: custom:inventree-card
entity: sensor.inventree_category_stock
show_low_stock: true
show_minimum: true
columns: 3
```

## Options

|
 Name 
|
 Type 
|
 Default 
|
 Description 
|
|
------
|
------
|
---------
|
-------------
|
|
 entity 
|
 string 
|
**
Required
**
|
 The InvenTree sensor entity 
|
|
 show_low_stock 
|
 boolean 
|
 true 
|
 Show warning for low stock items 
|
|
 show_minimum 
|
 boolean 
|
 true 
|
 Show minimum stock levels 
|
|
 columns 
|
 number 
|
 3 
|
 Number of columns in the grid 
|

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch for changes
npm run watch
```

## License

MIT © benoit505
