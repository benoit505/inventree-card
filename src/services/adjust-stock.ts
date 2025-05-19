import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem } from '../types';
import { Logger } from '../utils/logger';

export class StockService {
    constructor(private hass: HomeAssistant) {}

    async adjustStock(part: InventreeItem, amount: number): Promise<void> {
        try {
            // Optimistic update
            const entity_id = this.getEntityId(part);
            if (entity_id) {
                this.hass.states[entity_id] = {
                    ...this.hass.states[entity_id],
                    attributes: {
                        ...this.hass.states[entity_id].attributes,
                        items: this.hass.states[entity_id].attributes.items.map((item: InventreeItem) => 
                            item.pk === part.pk 
                                ? { ...item, in_stock: (item.in_stock || 0) + amount }
                                : item
                        )
                    }
                };
            }

            // Actual service call
            await this.hass.callService('inventree', 'adjust_stock', {
                name: part.name,
                quantity: amount
            });
        } catch (e) {
            // Revert optimistic update on error
            console.error('Failed to adjust stock:', e);
            throw e;
        }
    }

    private getEntityId(part: InventreeItem): string | null {
        // Find the entity that contains this part
        return Object.entries(this.hass.states)
            .find(([_, state]) => 
                state.attributes?.items?.some((item: InventreeItem) => item.pk === part.pk)
            )?.[0] ?? null;
    }
}
