import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { InventreeCardConfig } from "../types/types";

const now = new Date().toISOString();

const mockEntity: HassEntity = {
    entity_id: 'sensor.inventree_stock',
    state: JSON.stringify([
        { name: "Test Item 1", in_stock: 5, minimum_stock: 10 },
        { name: "Test Item 2", in_stock: 15, minimum_stock: 5 },
        { name: "Test Item 3", in_stock: 0, minimum_stock: 3 }
    ]),
    attributes: {
        friendly_name: "InvenTree Stock"
    },
    last_changed: now,
    last_updated: now,
    context: {
        id: "1",
        user_id: null,
        parent_id: null
    }
};

// Create a simpler mock that focuses on what we actually need
export const mockHass = {
    states: { 
        'sensor.inventree_stock': mockEntity 
    },
    services: {},
    callService: async (
        domain: string,
        service: string,
        data?: Record<string, unknown>
    ): Promise<void> => {
        console.log('Service called:', { domain, service, data });
    },
    auth: {
        data: {
            hassUrl: 'http://localhost:8123',
            clientId: 'mock-client-id',
            expires: 1234567890,
            refresh_token: 'mock-refresh-token',
            access_token: 'mock-access-token',
            expires_in: 1800
        }
    },
    connection: {
        haVersion: '2024.1.0',
        connected: true
    },
    connected: true,
    themes: { default_theme: 'default', themes: {} },
    selectedTheme: null,
    panels: {},
    panelUrl: 'lovelace',
    dockedSidebar: true,
    moreInfoEntityId: '',
    user: {
        id: '1',
        name: 'Dev User',
        is_admin: true,
        is_owner: true,
        credentials: [],
        mfa_modules: []
    },
    language: 'en',
    selectedLanguage: null,
    locale: { 
        language: 'en',
        number_format: 'decimal_comma'
    },
    resources: {},
    localize: () => '',
    translationMetadata: { fragments: [], translations: {} },
    config: {
        components: [],
        location_name: 'Home',
        latitude: 0,
        longitude: 0,
        elevation: 0,
        time_zone: 'UTC',
        unit_system: {
            length: 'm',
            mass: 'kg',
            temperature: '°C',
            volume: 'L'
        },
        version: '0.0.0',
        config_dir: '',
        allowlist_external_dirs: [],
        allowlist_external_urls: []
    }
} as unknown as HomeAssistant;

// Debug log
console.log('Mock HASS initialized:', {
    entity: mockEntity,
    parsedState: JSON.parse(mockEntity.state)
});

export const initialConfig: InventreeCardConfig = {
    type: 'custom:inventree-card',
    entity: 'sensor.inventree_stock',
    title: 'Test Inventory',
    show_header: true,
    show_low_stock: true,
    show_minimum: true,
    columns: 2
}; 