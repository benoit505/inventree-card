import { InventreeItem, ParameterDetail, StockItem } from '../types';
/**
 * Placeholder for InvenTree API Service.
 * Implement actual API calls here.
 */
declare class InventreeApiService {
    private lastApiCallTimestamp;
    private lastApiFailureTimestamp;
    constructor();
    private request;
    getPart(partId: number): Promise<InventreeItem | null>;
    /**
     * Fetches multiple parts based on provided parameters.
     * Example: getParts({ category: 5, limit: 10 })
     * Example: getParts({ pk__in: [1, 2, 3] })
     */
    getParts(params?: Record<string, any>): Promise<InventreeItem[]>;
    adjustStock(partId: number, relativeAmount: number, locationId?: number, notes?: string): Promise<{
        pk: number;
        newTotalStock: number | undefined;
    } | null>;
    getPartParameters(partId: number): Promise<ParameterDetail[] | null>;
    updatePartParameter(parameterInstancePk: number, newValue: string): Promise<ParameterDetail | null>;
    getStockItemsForPart(partId: number, locationId?: number): Promise<StockItem[] | null>;
    addStockItem(partId: number, quantity: number, locationId?: number, notes?: string): Promise<StockItem | null>;
    removeStockItems(stockItems: Array<{
        pk: number;
        quantity: number;
    }>, notes?: string): Promise<any | null>;
    deleteStockItem(stockItemPk: number): Promise<void | null>;
    consolidateStockForPart(partId: number, targetLocationId?: number, notes?: string): Promise<StockItem | null>;
}
export declare const inventreeApiService: InventreeApiService;
export {};
