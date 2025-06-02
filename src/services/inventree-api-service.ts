import { InventreeItem, ParameterDetail, StockItem } from '../types';
import { Logger } from '../utils/logger';
import { store } from '../store';
import { selectApiConfig } from '../store/slices/apiSlice';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const logger = Logger.getInstance();

class InventreeApiService {
  private axiosInstance: AxiosInstance;
  private lastApiCallTimestamp: number = 0;
  private lastApiFailureTimestamp: number = 0;

  constructor() {
    logger.log('InventreeApiService', `Initializing with Axios.`);
    this.axiosInstance = axios.create();

    this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const state = store.getState();
      const apiSliceConfig = selectApiConfig(state);
      const apiKey = apiSliceConfig.apiKey;

      config.headers = config.headers || new AxiosHeaders();

      if (apiKey) {
        (config.headers as AxiosHeaders).set('Authorization', `Token ${apiKey}`);
      }
      
      if ((config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'patch' || config.method?.toLowerCase() === 'put')) {
        (config.headers as AxiosHeaders).set('Content-Type', 'application/json');
      }
      // console.log('[TEMP LOG - inventree-api-service.ts: request interceptor]', `Axios Request: ${config.method?.toUpperCase()} ${config.url}`, { data: config.data }); // Reduced verbosity
      return config;
    }, (error: AxiosError) => {
      // console.error('[TEMP LOG - inventree-api-service.ts: request interceptor error]', 'Axios Request Error Interceptor', { data: error }); // Reduced verbosity
      return Promise.reject(error);
    });

    this.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
      // console.log('[TEMP LOG - inventree-api-service.ts: response interceptor]', `Axios Response: ${response.status} from ${response.config.url}`); // Reduced verbosity
      this.lastApiFailureTimestamp = 0;
      return response;
    }, (error: AxiosError) => {
      /* console.error('[TEMP LOG - inventree-api-service.ts: response interceptor error]', `Axios Response Error Interceptor: ${error.message}`, { 
        data: {
          url: error.config?.url,
          status: error.response?.status,
          responseData: error.response?.data
        }
      }); */ // Reduced verbosity
      this.lastApiFailureTimestamp = Date.now();
      return Promise.reject(error);
    });
  }

  private async request<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    // REMOVE TEMP LOG for entry into request method
    const state = store.getState();
    const apiSliceConfig = selectApiConfig(state);
    // REMOVE TEMP LOG
    
    const baseUrl = apiSliceConfig.url;
    const throttleDelayMs = apiSliceConfig.throttleDelayMs;
    const failedRequestRetryDelayMs = apiSliceConfig.failedRequestRetryDelayMs;

    if (!baseUrl) {
      const errorMsg = 'API base URL is not configured in Redux store (apiSlice).';
      // REMOVE TEMP LOG for missing baseUrl
      // console.error(`[TEMP LOG - inventree-api-service.ts: request] Error: ${errorMsg}`);
      logger.error('InventreeApiService', errorMsg);
      this.lastApiFailureTimestamp = Date.now();
      throw new Error(errorMsg);
    }

    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const requestUrl = `${cleanBaseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
    // REMOVE TEMP LOG for constructed requestUrl
    
    if (this.lastApiFailureTimestamp > 0) {
      const timeSinceLastFailure = Date.now() - this.lastApiFailureTimestamp;
      if (timeSinceLastFailure < failedRequestRetryDelayMs) {
        const failureDelayNeeded = failedRequestRetryDelayMs - timeSinceLastFailure;
        // REMOVE TEMP LOG for failure delay
        // console.warn(`[TEMP LOG - inventree-api-service.ts: request] Recent API Failure. Delaying by ${failureDelayNeeded}ms.`);
        logger.warn('InventreeApiService', `Recent API Failure: Delaying next request by ${failureDelayNeeded}ms.`);
        await new Promise(resolve => setTimeout(resolve, failureDelayNeeded));
      }
    }

    if (throttleDelayMs > 0) {
      const currentTimeForThrottle = Date.now(); 
      const timeSinceLastAttempt = currentTimeForThrottle - this.lastApiCallTimestamp;
      if (timeSinceLastAttempt < throttleDelayMs) {
        const generalDelayNeeded = throttleDelayMs - timeSinceLastAttempt;
        // REMOVE TEMP LOG for throttle delay
        // console.log(`[TEMP LOG - inventree-api-service.ts: request] Throttling. Delaying by ${generalDelayNeeded}ms.`);
        logger.log('InventreeApiService', `General Throttling: Delaying by ${generalDelayNeeded}ms.`, { level: 'debug' });
        await new Promise(resolve => setTimeout(resolve, generalDelayNeeded));
        this.lastApiCallTimestamp = Date.now();
      } else {
        this.lastApiCallTimestamp = Date.now();
      }
    } else {
      this.lastApiCallTimestamp = Date.now();
    }

    try {
      const finalOptions: AxiosRequestConfig = {
        url: requestUrl,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        headers: options.headers,
        timeout: 15000,
        ...options,
      };
      // REMOVE Verbose Log
      // console.log(`[TEMP LOG - inventree-api-service.ts:102] request: Making Axios request with finalOptions:`, JSON.parse(JSON.stringify(finalOptions)));

      let response: AxiosResponse<T>;
      try {
        // REMOVE Verbose Log
        // console.log(`[TEMP LOG - inventree-api-service.ts N1] PRE-AWAIT for ${finalOptions.url}`);
        // REMOVE TEMP LOG before actual Axios call
        // console.log(`[TEMP LOG - inventree-api-service.ts: request] Making Axios request to ${finalOptions.url} with method ${finalOptions.method}`);
        response = await this.axiosInstance.request<T>(finalOptions);
        // REMOVE Verbose Log
        // console.log(`[TEMP LOG - inventree-api-service.ts N2] POST-AWAIT for ${finalOptions.url}. Response status: ${response?.status}`);
        // REMOVE TEMP LOG for Axios success
        // console.log(`[TEMP LOG - inventree-api-service.ts: request] Axios success from ${finalOptions.url}. Status: ${response?.status}, Data:`, JSON.parse(JSON.stringify(response?.data === undefined ? 'undefined' : response.data)));
      } catch (axiosCallError: any) {
        // REMOVE Verbose Log Block
        /* console.error(`[TEMP LOG - inventree-api-service.ts N3] INNER CATCH for ${finalOptions.url}. Axios call FAILED. Error Details:`, {
            message: axiosCallError.message,
            code: axiosCallError.code,
            isAxiosError: axiosCallError.isAxiosError,
            configUrl: axiosCallError.config?.url,
            responseStatus: axiosCallError.response?.status,
            responseData: axiosCallError.response?.data,
            stack: axiosCallError.stack // Include stack for more detailed debugging
        }); */
        // For a more raw view of the error object if the above misses something
        // console.error(`[TEMP LOG - inventree-api-service.ts N3-RAW] Raw error object:`, JSON.parse(JSON.stringify(axiosCallError, Object.getOwnPropertyNames(axiosCallError))));
        // REMOVE TEMP LOG for Axios failure (inner catch)
        // console.error(`[TEMP LOG - inventree-api-service.ts: request] Axios FAILED (inner catch) for ${finalOptions.url}. Error:`, axiosCallError);
        throw axiosCallError; // Re-throw to be caught by the outer catch
      }

      // REMOVE Verbose Log
      // console.log(`[TEMP LOG - inventree-api-service.ts:107] request: Axios response for ${requestUrl}: Status ${response.status}, Data:`, JSON.parse(JSON.stringify(response.data || null)));

      if (response.status === 204) {
        // REMOVE TEMP LOG for 204 No Content
        // console.log(`[TEMP LOG - inventree-api-service.ts: request] Received 204 No Content for ${requestUrl}. Returning null.`);
        return null as T;
      }
      // REMOVE TEMP LOG before returning data from request method
      // console.log(`[TEMP LOG - inventree-api-service.ts: request] Returning data from request method for ${requestUrl}.`);
      return response.data;

    } catch (error) {
      // REMOVE Verbose Log
      // console.error(`[TEMP LOG - inventree-api-service.ts:117] request: Axios request to ${requestUrl} FAILED (OUTER CATCH). Error:`, error);
      // REMOVE TEMP LOG for outer catch in request method
      // console.error(`[TEMP LOG - inventree-api-service.ts: request] FAILED (outer catch) for ${requestUrl}. Error:`, error);
      logger.error('InventreeApiService', `Axios request to ${requestUrl} failed in main try-catch.`, { data: error });
      throw error;
    }
  }

  async getPart(partId: number): Promise<InventreeItem | null> {
    // REMOVE Verbose Log
    // console.log(`[TEMP LOG - inventree-api-service.ts:125] getPart called with partId: ${partId}`);
    logger.log('InventreeApiService', `Fetching part ${partId}...`);
    try {
      return await this.request<InventreeItem>(`part/${partId}/`);
    } catch (error) {
      // REMOVE Verbose Log
      // console.error(`[TEMP LOG - inventree-api-service.ts:131] getPart FAILED for partId ${partId}. Error:`, error);
      logger.error('InventreeApiService', `Failed to get part ${partId}:`, { data: error });
      return null;
    }
  }

  async getParts(params: Record<string, any> = {}): Promise<InventreeItem[]> {
    // REMOVE Verbose Log
    // console.log(`[TEMP LOG - inventree-api-service.ts:139] getParts called with params:`, JSON.parse(JSON.stringify(params)));
    logger.log('InventreeApiService', 'Fetching parts with params:', { data: params });
    try {
      return await this.request<InventreeItem[]>('part/', { params: params });
    } catch (error) {
      // REMOVE Verbose Log
      // console.error(`[TEMP LOG - inventree-api-service.ts:145] getParts FAILED. Params:`, JSON.parse(JSON.stringify(params)), 'Error:', error);
      logger.error('InventreeApiService', 'Failed to get parts:', { data: { params, error } });
      return [];
    }
  }

  async adjustStock(partId: number, relativeAmount: number, locationId?: number, notes?: string): Promise<{ pk: number; newTotalStock: number | undefined } | null> {
    logger.log('InventreeApiService', `Adjusting stock for part ${partId} by ${relativeAmount}. Location: ${locationId}, Notes: "${notes}"`);
    try {
      if (relativeAmount === 0) {
        logger.log('InventreeApiService', `Relative amount is 0 for part ${partId}, no stock change needed.`);
      } else if (relativeAmount > 0) {
        const addResult = await this.addStockItem(partId, relativeAmount, locationId, notes);
        if (!addResult) {
          throw new Error('Failed to add stock item during positive adjustment.');
        }
        logger.log('InventreeApiService', `Added stock item PK: ${addResult.pk} for part ${partId}.`);
      } else { 
        const amountToRemove = Math.abs(relativeAmount);
        logger.log('InventreeApiService', `Attempting to remove ${amountToRemove} for part ${partId}.`);
        await this.consolidateStockForPart(partId, locationId, notes || 'Consolidating before stock removal');
        const currentStockItems = await this.getStockItemsForPart(partId, locationId);
        const currentTotalStock = currentStockItems?.reduce((sum, item) => sum + parseFloat(item.quantity || '0'), 0) ?? 0;

        if (!currentStockItems || currentStockItems.length === 0 || currentTotalStock < amountToRemove) {
            logger.warn('InventreeApiService', `Cannot remove ${amountToRemove} for part ${partId}: Insufficient stock (${currentTotalStock}) available after consolidation attempt.`);
        } else {
            const itemToRemoveFrom = currentStockItems[0];
            if (!itemToRemoveFrom) {
                logger.error('InventreeApiService', `Logic error: Stock exists (${currentTotalStock}) but no stock item found after consolidation for part ${partId}.`);
                throw new Error('Stock item not found after consolidation despite available quantity.');
            }
            logger.log('InventreeApiService', `Removing ${amountToRemove} from stock item PK ${itemToRemoveFrom.pk} for part ${partId}.`);
            const removeResult = await this.removeStockItems([{ pk: itemToRemoveFrom.pk, quantity: amountToRemove }], notes || 'Stock removal');
            if (!removeResult) {
                 logger.error('InventreeApiService', `Stock removal API call failed for part ${partId}, item ${itemToRemoveFrom.pk}.`);
            }
        }
      }

      logger.log('InventreeApiService', `Fetching final part details for ${partId} after stock adjustment.`);
      const updatedPart = await this.getPart(partId);
      if (!updatedPart) {
        logger.error('InventreeApiService', `Failed to fetch updated part details for part ${partId} after stock adjustment.`);
        return null;
      }
      logger.log('InventreeApiService', `Stock adjustment process complete for part ${partId}. Final stock: ${updatedPart.in_stock}.`);
      return { pk: partId, newTotalStock: updatedPart.in_stock };

    } catch (error) {
      logger.error('InventreeApiService', `Failed to adjust stock for part ${partId}:`, { data: error });
       try {
           const finalPartCheck = await this.getPart(partId);
           if (finalPartCheck) {
               logger.warn('InventreeApiService', `Returning last known stock (${finalPartCheck.in_stock}) for part ${partId} after adjustment error.`);
               return { pk: partId, newTotalStock: finalPartCheck.in_stock };
           }
       } catch (finalFetchError) {
            logger.error('InventreeApiService', `Failed to fetch final part details for ${partId} even after catching primary error:`, { data: finalFetchError });
       }
      return null;
    }
  }
  
  async getPartParameters(partId: number): Promise<ParameterDetail[] | null> {
    // REMOVE Verbose Log
    // console.log(`[TEMP LOG - inventree-api-service.ts:191] getPartParameters called with partId: ${partId}`);
    // REMOVE TEMP LOG for entry into getPartParameters
    // console.log(`[TEMP LOG - inventree-api-service.ts: getPartParameters] Entry. PartId: ${partId}`);
    logger.log('InventreeApiService', `Fetching parameters for part ${partId}...`);
    try {
      // REMOVE TEMP LOG before calling this.request
      // console.log(`[TEMP LOG - inventree-api-service.ts: getPartParameters] Calling this.request for part/parameter/ with partId: ${partId}`);
      const parameters = await this.request<ParameterDetail[]>('part/parameter/', { params: { part: partId } });
      // REMOVE TEMP LOG for result from this.request
      // console.log(`[TEMP LOG - inventree-api-service.ts: getPartParameters] Result from this.request for partId ${partId}:`, JSON.parse(JSON.stringify(parameters === undefined ? 'undefined' : parameters)));
      return parameters;
    } catch (error) {
      // REMOVE Verbose Log
      // console.error(`[TEMP LOG - inventree-api-service.ts:197] getPartParameters FAILED for partId ${partId}. Error:`, error);
      // REMOVE TEMP LOG for error in getPartParameters
      // console.error(`[TEMP LOG - inventree-api-service.ts: getPartParameters] FAILED for partId ${partId}. Error:`, error);
      logger.error('InventreeApiService', `Failed to get parameters for part ${partId}:`, { data: error });
      return null;
    }
  }

  async updatePartParameter(parameterInstancePk: number, newValue: string): Promise<ParameterDetail | null> {
    // REMOVE Verbose Log
    // console.log(`[TEMP LOG - inventree-api-service.ts:205] updatePartParameter called with PK: ${parameterInstancePk}, Value: "${newValue}"`);
    logger.log('InventreeApiService', `Updating parameter ${parameterInstancePk} to value: "${newValue}"...`);
    try {
      return await this.request<ParameterDetail>(`part/parameter/${parameterInstancePk}/`, {
        method: 'PATCH',
        data: { data: newValue },
      });
    } catch (error) {
      logger.error('InventreeApiService', `Failed to update parameter ${parameterInstancePk}:`, { data: error });
      return null;
    }
  }

  async getStockItemsForPart(partId: number, locationId?: number): Promise<StockItem[] | null> {
    logger.log('InventreeApiService', `Fetching stock items for part ${partId}${locationId ? ` at location ${locationId}` : ''}...`);
    try {
      const params: Record<string, any> = { part: String(partId) };
      if (locationId !== undefined) {
        params.location = String(locationId);
      }
      return await this.request<StockItem[]>('stock/', { params: params });
    } catch (error) {
      logger.error('InventreeApiService', `Failed to get stock items for part ${partId}:`, { data: error });
      return null;
    }
  }

  async addStockItem(partId: number, quantity: number, locationId?: number, notes?: string): Promise<StockItem | null> {
    logger.log('InventreeApiService', `Adding stock for part ${partId}: quantity ${quantity}, location ${locationId}, notes: "${notes}"`);
    try {
      const payload: any = {
        part: partId,
        quantity: String(quantity),
        status: 10, 
      };
      if (locationId !== undefined) {
        payload.location = locationId;
      }
      if (notes) {
        payload.notes = notes;
      }
      return await this.request<StockItem>('stock/', {
        method: 'POST',
        data: payload,
      });
    } catch (error) {
      logger.error('InventreeApiService', `Failed to add stock for part ${partId}:`, { data: error });
      return null;
    }
  }

  async removeStockItems(stockItems: Array<{ pk: number; quantity: number }>, notes?: string): Promise<any | null> {
    logger.log('InventreeApiService', `Removing stock for items: ${stockItems.map(si => `PK: ${si.pk}, Qty: ${si.quantity}`).join('; ')}. Notes: "${notes}"`);
    if (stockItems.length === 0) {
        logger.warn('InventreeApiService', 'removeStockItems called with empty stockItems array.');
        return { success: true, message: 'No items to remove.' };
    }
    try {
      const payload: any = {
        items: stockItems.map(item => ({ pk: item.pk, quantity: String(item.quantity) })),
      };
      if (notes) {
        payload.notes = notes;
      }
      return await this.request<any>('stock/remove/', {
        method: 'POST',
        data: payload,
      });
    } catch (error) {
      logger.error('InventreeApiService', 'Failed to remove stock items:', { data: { stockItems, error } });
      return null;
    }
  }

  async deleteStockItem(stockItemPk: number): Promise<void | null> {
    logger.log('InventreeApiService', `Deleting stock item PK ${stockItemPk}...`);
    try {
      await this.request<void>(`stock/${stockItemPk}/`, {
        method: 'DELETE',
      });
      return;
    } catch (error) {
      logger.error('InventreeApiService', `Failed to delete stock item ${stockItemPk}:`, { data: error });
      return null;
    }
  }

  async consolidateStockForPart(partId: number, targetLocationId?: number, notes?: string): Promise<StockItem | null> {
    logger.log('InventreeApiService', `Consolidating stock for part ${partId}${targetLocationId !== undefined ? ` to location ${targetLocationId}` : ''}...`);
    try {
      const existingStockItems = await this.getStockItemsForPart(partId);
      if (!existingStockItems) {
          logger.error('InventreeApiService', `Failed to fetch existing stock items for part ${partId} during consolidation.`);
          return null;
      }
      if (existingStockItems.length === 0) {
        logger.log('InventreeApiService', `No stock items found for part ${partId} to consolidate.`);
        return null;
      }

      let totalQuantity = 0;
      existingStockItems.forEach(item => {
        const itemQuantity = parseFloat(item.quantity);
        if (!isNaN(itemQuantity)) {
            totalQuantity += itemQuantity;
        } else {
            logger.warn('InventreeApiService', `Invalid quantity found for stock item ${item.pk}: ${item.quantity}. Skipping in total calculation.`);
        }
      });

      const consolidatedNotes = notes || `Consolidated from ${existingStockItems.length} item(s).`;
      const itemPksToDelete = existingStockItems.map(item => item.pk);
      let determinedLocationId: number | undefined | null = targetLocationId;
      if (determinedLocationId === undefined) {
          determinedLocationId = existingStockItems[0]?.location;
      }
      const newLocationId = determinedLocationId === null ? undefined : determinedLocationId;

      if (newLocationId === undefined && totalQuantity > 0) {
          const firstLocatedItem = existingStockItems.find(item => item.location !== null && item.location !== undefined);
          if (firstLocatedItem && firstLocatedItem.location !== null && firstLocatedItem.location !== undefined) {
               logger.warn('InventreeApiService', `No targetLocationId provided and first item had no location. Using location ${firstLocatedItem.location} from item ${firstLocatedItem.pk}.`);
               determinedLocationId = firstLocatedItem.location;
          } else {
               logger.error('InventreeApiService', `Cannot determine location for consolidated stock for part ${partId}. Provide targetLocationId or ensure at least one existing item has a location.`);
               return null;
          }
      }

      let newStockItem: StockItem | null = null;
      if (totalQuantity > 0) {
          newStockItem = await this.addStockItem(partId, totalQuantity, newLocationId, consolidatedNotes);
          if (!newStockItem) {
            logger.error('InventreeApiService', `Failed to create new consolidated stock item for part ${partId}. Aborting consolidation.`);
            return null;
          }
          logger.log('InventreeApiService', `Created new consolidated stock item PK: ${newStockItem.pk}`);
          const indexOfNew = itemPksToDelete.indexOf(newStockItem.pk);
          if (indexOfNew > -1) {
              itemPksToDelete.splice(indexOfNew, 1);
          }
      } else {
           logger.log('InventreeApiService', `Total quantity is 0 for part ${partId}. Proceeding to delete old items.`);
      }

      logger.log('InventreeApiService', `Deleting ${itemPksToDelete.length} old stock items for part ${partId}: [${itemPksToDelete.join(', ')}]`);
      let deleteErrors = 0;
      for (const pk of itemPksToDelete) {
        const deleteResult = await this.deleteStockItem(pk);
        if (deleteResult === null) {
            logger.warn('InventreeApiService', `Failed to delete old stock item ${pk} during consolidation.`);
            deleteErrors++;
        }
      }

      if (deleteErrors > 0) {
           logger.warn('InventreeApiService', `Consolidation completed for part ${partId}, but ${deleteErrors} old stock items failed to delete.`);
      }
      logger.log('InventreeApiService', `Successfully consolidated stock for part ${partId}. Returning ${newStockItem ? `new item PK ${newStockItem.pk}` : 'null (zero stock)'}.`);
      return newStockItem;

    } catch (error) {
      logger.error('InventreeApiService', `Failed to consolidate stock for part ${partId}:`, { data: error });
      return null;
    }
  }
}

export const inventreeApiService = new InventreeApiService(); 
