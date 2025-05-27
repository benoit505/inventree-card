import { InventreeItem, ParameterDetail, StockItem } from '../types';
declare class InventreeApiService {
    private axiosInstance;
    private lastApiCallTimestamp;
    private lastApiFailureTimestamp;
    constructor();
    private request;
    getPart(partId: number): Promise<InventreeItem | null>;
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
