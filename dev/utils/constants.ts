// Card constants
export const CARD_NAME = "inventree-card";
export const CARD_TYPE = `custom:${CARD_NAME}`;
export const EDITOR_NAME = `${CARD_NAME}-editor`;

// Default configuration
export const DEFAULT_CONFIG: Record<string, any> = {
    type: CARD_TYPE,
    entity: "",
    title: "Inventory",
    show_header: true,
    show_low_stock: true,
    show_minimum: true,
    columns: 2,
    compact_view: false,
    sort_by: "name",
    sort_direction: "asc",
    grid_spacing: 16,
    item_height: 64,
    enable_quick_add: false,
    show_history: false,
    show_stock_warning: false
};

// Form schema
export const SCHEMA = [
    { 
        name: "entity",
        label: "Entity",
        selector: { 
            entity: { 
                domain: ["sensor"]
            }
        }
    },
    {
        name: "title",
        label: "Card Title",
        selector: { text: {} }
    },
    {
        name: "show_header",
        label: "Show Header",
        selector: { boolean: {} }
    },
    {
        name: "show_minimum",
        label: "Show Minimum Stock",
        selector: { boolean: {} }
    },
    {
        name: "show_low_stock",
        label: "Show Low Stock Warning",
        selector: { boolean: {} }
    },
    {
        name: "columns",
        label: "Number of Columns",
        selector: { 
            number: {
                min: 1,
                max: 4,
                step: 1,
                mode: "slider"
            }
        }
    },
    {
        name: "compact_view",
        label: "Compact View",
        selector: { boolean: {} }
    },
    {
        name: "sort_by",
        label: "Sort By",
        selector: {
            select: {
                options: [
                    { value: "name", label: "Name" },
                    { value: "stock", label: "Stock Level" },
                    { value: "minimum", label: "Minimum Stock" }
                ]
            }
        }
    },
    {
        name: "sort_direction",
        label: "Sort Direction",
        selector: {
            select: {
                options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" }
                ]
            }
        }
    },
    {
        name: "grid_spacing",
        label: "Grid Spacing",
        selector: {
            number: {
                min: 8,
                max: 32,
                step: 4,
                mode: "slider"
            }
        }
    },
    {
        name: "item_height",
        label: "Item Height",
        selector: {
            number: {
                min: 32,
                max: 96,
                step: 8,
                mode: "slider"
            }
        }
    },
    {
        name: "enable_quick_add",
        label: "Enable Quick Add",
        selector: { boolean: {} }
    },
    {
        name: "show_history",
        label: "Show History",
        selector: { boolean: {} }
    },
    {
        name: "show_stock_warning",
        label: "Show Stock Warning",
        selector: { boolean: {} }
    }
]; 