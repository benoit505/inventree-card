import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem } from '../types';
export declare class StockService {
    private hass;
    constructor(hass: HomeAssistant);
    adjustStock(part: InventreeItem, amount: number): Promise<void>;
    private getEntityId;
}
