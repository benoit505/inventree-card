import { InventreeItem } from "../core/types";

export class StateService {
    static getStockClass(item: InventreeItem): string {
        if (item.in_stock <= 0) return 'out-of-stock';
        if (item.in_stock < item.minimum_stock) return 'low-stock';
        return 'good-stock';
    }
}
