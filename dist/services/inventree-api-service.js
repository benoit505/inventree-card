import { Logger } from '../utils/logger';
import { store } from '../store'; // Import the Redux store
const logger = Logger.getInstance();
/**
 * Placeholder for InvenTree API Service.
 * Implement actual API calls here.
 */
class InventreeApiService {
    constructor() {
        this.lastApiCallTimestamp = 0;
        this.lastApiFailureTimestamp = 0; // Timestamp of the last API failure
        logger.log('InventreeApiService', `Initialized.`);
    }
    async request(endpoint, options = {}) {
        const state = store.getState();
        const apiSliceConfig = state.api; // Get the whole api slice state
        const baseUrl = apiSliceConfig.url;
        const apiKey = apiSliceConfig.apiKey;
        const throttleDelayMs = apiSliceConfig.throttleDelayMs;
        const failedRequestRetryDelayMs = apiSliceConfig.failedRequestRetryDelayMs;
        if (!baseUrl || !apiKey) {
            const errorMsg = 'API base URL or API key is not configured in Redux store (apiSlice).';
            logger.error('InventreeApiService', errorMsg);
            this.lastApiFailureTimestamp = Date.now(); // Treat config error as a failure to prevent spamming
            throw new Error(errorMsg);
        }
        // Ensure baseUrl has no trailing slash for consistency before appending endpoint
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const url = `${cleanBaseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
        const headers = new Headers(Object.assign({ 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' }, (options.headers || {})));
        logger.log('InventreeApiService', `Requesting URL: ${url}`, { method: options.method || 'GET', level: 'debug' });
        // 1. Handle Failure-Specific Delay (if a recent failure occurred)
        if (this.lastApiFailureTimestamp > 0) {
            const timeSinceLastFailure = Date.now() - this.lastApiFailureTimestamp;
            if (timeSinceLastFailure < failedRequestRetryDelayMs) {
                const failureDelayNeeded = failedRequestRetryDelayMs - timeSinceLastFailure;
                logger.warn('InventreeApiService', `Recent API Failure: Delaying next request by ${failureDelayNeeded}ms. Cooldown until ${new Date(Date.now() + failureDelayNeeded).toISOString()}`);
                await new Promise(resolve => setTimeout(resolve, failureDelayNeeded));
                // After this enforced delay, we still respect the general throttle for the actual call attempt.
            }
        }
        // 2. General Throttling (based on last *attempt*)
        // This ensures that even after the failure delay, we don't spam rapid calls.
        if (throttleDelayMs > 0) {
            const currentTimeForThrottle = Date.now(); // Get current time *after* potential failure delay
            const timeSinceLastAttempt = currentTimeForThrottle - this.lastApiCallTimestamp;
            if (timeSinceLastAttempt < throttleDelayMs) {
                const generalDelayNeeded = throttleDelayMs - timeSinceLastAttempt;
                logger.log('InventreeApiService', `General Throttling: Delaying by ${generalDelayNeeded}ms.`, { level: 'debug' });
                await new Promise(resolve => setTimeout(resolve, generalDelayNeeded));
            }
        }
        this.lastApiCallTimestamp = Date.now(); // Update timestamp *before* making the actual call
        try {
            const response = await fetch(url, Object.assign(Object.assign({}, options), { headers }));
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                }
                catch (e) {
                    errorData = await response.text();
                }
                const errorMsg = `API request failed: ${response.status} ${response.statusText}`;
                logger.error('InventreeApiService', errorMsg, { url, status: response.status, errorData });
                this.lastApiFailureTimestamp = Date.now(); // Record failure timestamp
                throw new Error(errorMsg); // Propagate error
            }
            // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
            if (response.status === 204) {
                this.lastApiFailureTimestamp = 0; // Reset on success
                return null;
            }
            const responseData = await response.json();
            this.lastApiFailureTimestamp = 0; // Reset on success
            return responseData;
        }
        catch (error) { // This catches fetch internal errors (network, CORS after preflight) and the re-thrown !response.ok error
            logger.error('InventreeApiService', `Catch-all for ${url}. Setting failure timestamp. Error:`, error);
            // Ensure lastApiFailureTimestamp is set for any error during the try block related to the request
            this.lastApiFailureTimestamp = Date.now();
            throw error; // Re-throw the error to be caught by the caller (thunks)
        }
    }
    async getPart(partId) {
        logger.log('InventreeApiService', `Fetching part ${partId}...`);
        try {
            return await this.request(`part/${partId}/`);
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to get part ${partId}:`, error);
            return null;
        }
    }
    /**
     * Fetches multiple parts based on provided parameters.
     * Example: getParts({ category: 5, limit: 10 })
     * Example: getParts({ pk__in: [1, 2, 3] })
     */
    async getParts(params = {}) {
        logger.log('InventreeApiService', 'Fetching parts with params:', params);
        try {
            const queryParams = new URLSearchParams(params).toString();
            return await this.request(`part/?${queryParams}`);
        }
        catch (error) {
            logger.error('InventreeApiService', 'Failed to get parts:', { params, error });
            return []; // Return empty array on error, or rethrow if preferred
        }
    }
    async adjustStock(partId, relativeAmount, locationId, notes) {
        var _a;
        logger.log('InventreeApiService', `Adjusting stock for part ${partId} by ${relativeAmount}. Location: ${locationId}, Notes: "${notes}"`);
        try {
            if (relativeAmount === 0) {
                logger.log('InventreeApiService', `Relative amount is 0 for part ${partId}, no stock change needed. Fetching current stock.`);
                // No operation needed, just return current stock
            }
            else if (relativeAmount > 0) {
                // --- Add Stock --- 
                const addResult = await this.addStockItem(partId, relativeAmount, locationId, notes);
                if (!addResult) {
                    throw new Error('Failed to add stock item during positive adjustment.');
                }
                logger.log('InventreeApiService', `Added stock item PK: ${addResult.pk} for part ${partId}.`);
            }
            else {
                // --- Remove Stock --- 
                const amountToRemove = Math.abs(relativeAmount);
                logger.log('InventreeApiService', `Attempting to remove ${amountToRemove} for part ${partId}.`);
                // 1. Consolidate stock first to make removal simpler/more predictable
                //    Consolidate to the target location if specified, otherwise let the function decide.
                const consolidatedItem = await this.consolidateStockForPart(partId, locationId, notes || 'Consolidating before stock removal');
                // Check current stock *after* consolidation attempt
                const currentStockItems = await this.getStockItemsForPart(partId, locationId);
                const currentTotalStock = (_a = currentStockItems === null || currentStockItems === void 0 ? void 0 : currentStockItems.reduce((sum, item) => sum + parseFloat(item.quantity || '0'), 0)) !== null && _a !== void 0 ? _a : 0;
                if (!currentStockItems || currentStockItems.length === 0 || currentTotalStock < amountToRemove) {
                    logger.warn('InventreeApiService', `Cannot remove ${amountToRemove} for part ${partId}: Insufficient stock (${currentTotalStock}) available after consolidation attempt.`);
                    // Even if we can't remove, fetch final state
                }
                else {
                    // We have enough stock. If consolidated, there should be one item.
                    // If not consolidated (e.g., multiple batches remained), remove from the first available.
                    const itemToRemoveFrom = currentStockItems[0]; // Assume first item after potential consolidation
                    if (!itemToRemoveFrom) {
                        // This case should ideally not happen if currentTotalStock > 0
                        logger.error('InventreeApiService', `Logic error: Stock exists (${currentTotalStock}) but no stock item found after consolidation for part ${partId}.`);
                        throw new Error('Stock item not found after consolidation despite available quantity.');
                    }
                    logger.log('InventreeApiService', `Removing ${amountToRemove} from stock item PK ${itemToRemoveFrom.pk} for part ${partId}.`);
                    const removeResult = await this.removeStockItems([{ pk: itemToRemoveFrom.pk, quantity: amountToRemove }], notes || 'Stock removal');
                    if (!removeResult) {
                        logger.error('InventreeApiService', `Stock removal API call failed for part ${partId}, item ${itemToRemoveFrom.pk}.`);
                        // Allow proceeding to fetch final state despite API error
                    }
                }
            }
            // --- Final Step: Fetch updated part details --- 
            logger.log('InventreeApiService', `Fetching final part details for ${partId} after stock adjustment.`);
            const updatedPart = await this.getPart(partId);
            if (!updatedPart) {
                logger.error('InventreeApiService', `Failed to fetch updated part details for part ${partId} after stock adjustment.`);
                // Return null if the final part fetch fails, as we can't confirm the stock level
                return null;
            }
            logger.log('InventreeApiService', `Stock adjustment process complete for part ${partId}. Final stock: ${updatedPart.in_stock}.`);
            return { pk: partId, newTotalStock: updatedPart.in_stock };
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to adjust stock for part ${partId}:`, error);
            // Attempt to fetch final part details even on error during adjustment steps
            try {
                const finalPartCheck = await this.getPart(partId);
                if (finalPartCheck) {
                    logger.warn('InventreeApiService', `Returning last known stock (${finalPartCheck.in_stock}) for part ${partId} after adjustment error.`);
                    return { pk: partId, newTotalStock: finalPartCheck.in_stock };
                }
            }
            catch (finalFetchError) {
                logger.error('InventreeApiService', `Failed to fetch final part details for ${partId} even after catching primary error:`, finalFetchError);
            }
            return null; // Return null if adjustment failed and final fetch also failed
        }
    }
    // Add other API methods as needed, e.g.,
    // async getCategories(): Promise<any[]> { ... }
    // async getStockLocations(): Promise<any[]> { ... }
    async getPartParameters(partId) {
        logger.log('InventreeApiService', `Fetching parameters for part ${partId}...`);
        try {
            // The API returns a list of PartParameter objects
            return await this.request(`part/parameter/?part=${partId}`);
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to get parameters for part ${partId}:`, error);
            return null;
        }
    }
    async updatePartParameter(parameterInstancePk, newValue) {
        logger.log('InventreeApiService', `Updating parameter ${parameterInstancePk} to value: "${newValue}"...`);
        try {
            return await this.request(`part/parameter/${parameterInstancePk}/`, {
                method: 'PATCH',
                body: JSON.stringify({ data: newValue }),
            });
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to update parameter ${parameterInstancePk}:`, error);
            return null;
        }
    }
    // --- Robust Stock Adjustment Methods (Phase R3.4) ---
    async getStockItemsForPart(partId, locationId) {
        logger.log('InventreeApiService', `Fetching stock items for part ${partId}${locationId ? ` at location ${locationId}` : ''}...`);
        try {
            const params = new URLSearchParams({ part: String(partId) });
            if (locationId !== undefined) {
                params.set('location', String(locationId));
            }
            // Use the internal request helper
            return await this.request(`stock/?${params.toString()}`);
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to get stock items for part ${partId}:`, error);
            return null;
        }
    }
    async addStockItem(partId, quantity, locationId, notes) {
        logger.log('InventreeApiService', `Adding stock for part ${partId}: quantity ${quantity}, location ${locationId}, notes: "${notes}"`);
        try {
            const payload = {
                part: partId,
                quantity: String(quantity), // Ensure quantity is sent as string
                status: 10, // Default to OK status = 10 in InvenTree
            };
            if (locationId !== undefined) {
                payload.location = locationId;
            }
            if (notes) {
                payload.notes = notes;
            }
            // Use the internal request helper
            return await this.request('stock/', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to add stock for part ${partId}:`, error);
            return null;
        }
    }
    async removeStockItems(stockItems, notes) {
        logger.log('InventreeApiService', `Removing stock for items: ${stockItems.map(si => `PK: ${si.pk}, Qty: ${si.quantity}`).join('; ')}. Notes: "${notes}"`);
        if (stockItems.length === 0) {
            logger.warn('InventreeApiService', 'removeStockItems called with empty stockItems array.');
            return { success: true, message: 'No items to remove.' }; // Indicate success as nothing needed doing
        }
        try {
            const payload = {
                // Ensure quantity is stringified
                items: stockItems.map(item => ({ pk: item.pk, quantity: String(item.quantity) })),
            };
            if (notes) {
                payload.notes = notes;
            }
            // Use the internal request helper
            // Endpoint is /api/stock/remove/
            return await this.request('stock/remove/', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        }
        catch (error) {
            logger.error('InventreeApiService', 'Failed to remove stock items:', { stockItems, error });
            return null;
        }
    }
    async deleteStockItem(stockItemPk) {
        logger.log('InventreeApiService', `Deleting stock item PK ${stockItemPk}...`);
        try {
            // Use the internal request helper, endpoint is /api/stock/{pk}/
            // DELETE requests usually don't have a body and often return 204 No Content on success.
            await this.request(`stock/${stockItemPk}/`, {
                method: 'DELETE',
            });
            return; // Explicitly return void on success (or handle 204 specifically in request helper)
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to delete stock item ${stockItemPk}:`, error);
            return null; // Indicate failure
        }
    }
    // Placeholder for consolidateStockForPart
    async consolidateStockForPart(partId, targetLocationId, notes) {
        var _a;
        logger.log('InventreeApiService', `Consolidating stock for part ${partId}${targetLocationId !== undefined ? ` to location ${targetLocationId}` : ''}...`);
        try {
            // 1. Get all existing stock items for the part
            const existingStockItems = await this.getStockItemsForPart(partId);
            if (!existingStockItems) {
                logger.error('InventreeApiService', `Failed to fetch existing stock items for part ${partId} during consolidation.`);
                return null; // Error fetching items
            }
            if (existingStockItems.length === 0) {
                logger.log('InventreeApiService', `No stock items found for part ${partId} to consolidate.`);
                // Nothing to consolidate, return null as no *new* consolidated item was created.
                return null;
            }
            // 2. Calculate total quantity
            let totalQuantity = 0;
            existingStockItems.forEach(item => {
                const itemQuantity = parseFloat(item.quantity); // Handle string quantity
                if (!isNaN(itemQuantity)) {
                    totalQuantity += itemQuantity;
                }
                else {
                    logger.warn('InventreeApiService', `Invalid quantity found for stock item ${item.pk}: ${item.quantity}. Skipping in total calculation.`);
                }
            });
            const consolidatedNotes = notes || `Consolidated from ${existingStockItems.length} item(s).`;
            const itemPksToDelete = existingStockItems.map(item => item.pk);
            // Determine the location for the new consolidated stock item
            // Priority: targetLocationId > first item's location > undefined (error)
            let determinedLocationId = targetLocationId;
            if (determinedLocationId === undefined) {
                determinedLocationId = (_a = existingStockItems[0]) === null || _a === void 0 ? void 0 : _a.location; // Use optional chaining
            }
            // Convert null location (meaning top-level/no specific location) to undefined for addStockItem if necessary,
            // but keep it as number if it's a valid location PK.
            const newLocationId = determinedLocationId === null ? undefined : determinedLocationId;
            if (newLocationId === undefined && totalQuantity > 0) { // Only require location if adding stock
                // Attempt to find *any* location from the items if target wasn't specified and first item had no location
                const firstLocatedItem = existingStockItems.find(item => item.location !== null && item.location !== undefined);
                if (firstLocatedItem) {
                    logger.warn('InventreeApiService', `No targetLocationId provided and first item had no location. Using location ${firstLocatedItem.location} from item ${firstLocatedItem.pk}.`);
                    determinedLocationId = firstLocatedItem.location;
                    // newLocationId = determinedLocationId; // Re-assign - done above
                }
                else {
                    logger.error('InventreeApiService', `Cannot determine location for consolidated stock for part ${partId}. Provide targetLocationId or ensure at least one existing item has a location.`);
                    return null; // Fail if no location can be determined and stock needs to be added
                }
            }
            // 3. Create ONE new stock item with the total quantity (if > 0)
            let newStockItem = null;
            if (totalQuantity > 0) {
                newStockItem = await this.addStockItem(partId, totalQuantity, newLocationId, consolidatedNotes);
                if (!newStockItem) {
                    logger.error('InventreeApiService', `Failed to create new consolidated stock item for part ${partId}. Aborting consolidation.`);
                    // Don't delete old items if we couldn't create the new one
                    return null;
                }
                logger.log('InventreeApiService', `Created new consolidated stock item PK: ${newStockItem.pk}`);
                // Ensure we don't delete the item we just created if it somehow shared a PK (highly unlikely)
                const indexOfNew = itemPksToDelete.indexOf(newStockItem.pk);
                if (indexOfNew > -1) {
                    itemPksToDelete.splice(indexOfNew, 1);
                }
            }
            else {
                logger.log('InventreeApiService', `Total quantity is 0 for part ${partId}. Proceeding to delete old items.`);
            }
            // 4. Delete all the old stock items
            logger.log('InventreeApiService', `Deleting ${itemPksToDelete.length} old stock items for part ${partId}: [${itemPksToDelete.join(', ')}]`);
            let deleteErrors = 0;
            for (const pk of itemPksToDelete) {
                const deleteResult = await this.deleteStockItem(pk);
                if (deleteResult === null) { // deleteStockItem returns null on failure
                    logger.warn('InventreeApiService', `Failed to delete old stock item ${pk} during consolidation.`);
                    deleteErrors++;
                    // Continue deleting others even if one fails
                }
            }
            if (deleteErrors > 0) {
                logger.warn('InventreeApiService', `Consolidation completed for part ${partId}, but ${deleteErrors} old stock items failed to delete.`);
            }
            logger.log('InventreeApiService', `Successfully consolidated stock for part ${partId}. Returning ${newStockItem ? `new item PK ${newStockItem.pk}` : 'null (zero stock)'}.`);
            return newStockItem; // Return the new item (or null if total quantity was 0)
        }
        catch (error) {
            logger.error('InventreeApiService', `Failed to consolidate stock for part ${partId}:`, error);
            return null;
        }
    }
}
// Export a singleton instance
export const inventreeApiService = new InventreeApiService();
//# sourceMappingURL=inventree-api-service.js.map