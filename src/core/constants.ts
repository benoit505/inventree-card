export const CARD_VERSION = '1.0.0';
export const CARD_NAME = 'inventree-card';
export const CARD_TYPE = 'inventree-card';
export const EDITOR_NAME = 'inventree-card-editor';

// Default configuration for the card
export const DEFAULT_CONFIG: Record<string, any> = {
    type: `custom:${CARD_NAME}`,
    entity: '',
    view_type: 'detail',
    selected_entities: [],
    display: {
        show_header: true,
        show_image: true,
        show_name: true,
        show_stock: true,
        show_description: false,
        show_category: false,
        show_stock_status_border: true,
        show_stock_status_colors: true,
        show_buttons: true
    },
    direct_api: {
        enabled: false,
        url: '',
        api_key: '',
        method: 'websocket'
    }
};

// Editor schema for configuration
export const SCHEMA = [
    {
        name: "entity",
        required: true,
        selector: { 
            entity: {
                domain: ["sensor"],
                multiple: false
            }
        }
    },
    {
        name: "view_type",
        selector: {
            select: {
                options: [
                    { value: "detail", label: "Detail" },
                    { value: "grid", label: "Grid" },
                    { value: "list", label: "List" },
                    { value: "parts", label: "Parts" },
                    { value: "variants", label: "Variants" },
                    { value: "base", label: "Base Layout" },
                    { value: "debug", label: "Data Flow Debug" }
                ],
                mode: "dropdown"
            }
        }
    },
    {
        name: "selected_entities",
        selector: {
            entity: {
                domain: ["sensor"],
                multiple: true
            }
        }
    }
];

// Import settings schema directly if needed elsewhere
// export { SETTINGS_SCHEMA } from './settings';