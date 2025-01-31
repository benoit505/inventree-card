import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";

const now = new Date().toISOString();

export const mockHass: Partial<HomeAssistant> = {
    states: {
        'sensor.inventree_test': {
            entity_id: 'sensor.inventree_test',
            state: '42',
            attributes: {
                items: [
                    { name: 'Test Item 1', in_stock: 10, minimum_stock: 5 },
                    { name: 'Test Item 2', in_stock: 3, minimum_stock: 5 },
                    { name: 'Test Item 3', in_stock: 8, minimum_stock: 4 }
                ],
                category_name: 'Test Category'
            },
            last_changed: now,
            last_updated: now,
            context: {
                id: "1",
                user_id: null,
                parent_id: null
            }
        } as HassEntity
    },
    callService: async (
        domain: string, 
        service: string, 
        data?: Record<string, unknown>
    ): Promise<void> => {
        console.log('Service called:', { domain, service, data });
    }
}; 