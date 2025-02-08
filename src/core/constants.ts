import { FormSchema } from "./types";
import { SETTINGS_SCHEMA } from './settings';

export const CARD_NAME = "inventree-card";
export const CARD_TYPE = `custom:${CARD_NAME}`;
export const EDITOR_NAME = `${CARD_NAME}-editor`;

export const SCHEMA: FormSchema[] = [
    {
        name: "entity",
        label: "Entity",
        selector: { entity: { domain: "sensor" } }
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
        selector: { number: { min: 1, max: 6, step: 1 } }
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
        selector: { number: { min: 4, max: 48, step: 4 } }
    },
    {
        name: "item_height",
        label: "Item Height",
        selector: { number: { min: 32, max: 200, step: 8 } }
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
    },
    {
        name: "enable_print_labels",
        label: "Enable Label Printing",
        selector: { boolean: {} }
    },
    {
        name: "layout",
        label: "Layout Settings",
        type: "expandable",
        schema: [
            {
                name: "min_height",
                label: "Minimum Height",
                selector: { number: { min: 0, max: 1000, step: 10 } }
            },
            {
                name: "max_height",
                label: "Maximum Height",
                selector: { number: { min: 0, max: 2000, step: 10 } }
            },
            {
                name: "transparent",
                label: "Transparent Background",
                selector: { boolean: {} }
            }
        ]
    },
    {
        name: "display",
        label: "Display Options",
        type: "expandable",
        schema: [
            {
                name: "show_image",
                label: "Show Images",
                selector: { boolean: {} }
            },
            {
                name: "show_name",
                label: "Show Names",
                selector: { boolean: {} }
            },
            {
                name: "show_stock",
                label: "Show Stock Levels",
                selector: { boolean: {} }
            },
            {
                name: "show_description",
                label: "Show Descriptions",
                selector: { boolean: {} }
            },
            {
                name: "show_parameters",
                label: "Show Parameters",
                selector: { boolean: {} }
            },
            {
                name: "show_buttons",
                label: "Show Action Buttons",
                selector: { boolean: {} }
            },
            {
                name: "image_only",
                label: "Image Only Mode",
                selector: { boolean: {} }
            }
        ]
    },
    {
        name: "style",
        label: "Style Settings",
        type: "expandable",
        schema: [
            {
                name: "background",
                label: "Background Color",
                selector: { text: {} }
            },
            {
                name: "image_size",
                label: "Image Size",
                selector: { number: { min: 20, max: 500, step: 5 } }
            },
            {
                name: "spacing",
                label: "Element Spacing",
                selector: { number: { min: 0, max: 50, step: 2 } }
            }
        ]
    },
    {
        name: "thumbnails",
        label: "Thumbnail Settings",
        type: "expandable",
        schema: [
            {
                name: "mode",
                label: "Path Mode",
                selector: {
                    select: {
                        options: [
                            { value: "auto", label: "Automatic (Local)" },
                            { value: "manual", label: "Manual (Custom Path)" }
                        ]
                    }
                }
            },
            {
                name: "local_path",
                label: "Local Path Override",
                selector: { text: {} },
                description: "Default: /local/inventree_thumbs"
            },
            {
                name: "custom_path",
                label: "Custom Path",
                selector: { text: {} },
                description: "Used when Path Mode is set to Manual"
            },
            {
                name: "enable_bulk_import",
                label: "Enable Bulk Import",
                selector: { boolean: {} },
                description: "Allow using custom images for thumbnails"
            }
        ].filter(item => 
            Object.keys(SETTINGS_SCHEMA.thumbnails).includes(item.name as keyof typeof SETTINGS_SCHEMA.thumbnails)
        )
    }
];

