var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WLEDService } from '../../services/wled-service';
import { createSelector } from 'reselect';
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';
const logger = Logger.getInstance();
const initialState = {
    partsById: {},
    partsByEntity: {},
    loading: false,
    error: null,
    locatingPartId: null,
    adjustingStockPartId: null,
    adjustmentError: null,
};
// Async thunk for fetching a single part's details
export const fetchPartDetails = createAsyncThunk('parts/fetchPartDetails', async (partId, { rejectWithValue, getState }) => {
    var _a;
    logger.info('partsSlice', `Fetching details for part ${partId}...`);
    try {
        const { api } = getState(); // Access api state for URL and key
        if (!((_a = api.directApiConfig) === null || _a === void 0 ? void 0 : _a.url) || !api.directApiConfig.apiKey) {
            logger.warn('partsSlice', 'Direct API URL or API Key not configured. Cannot fetch part details.');
            return rejectWithValue('Direct API not configured.');
        }
        // Temporarily use the placeholder service
        const partData = await inventreeApiService.getPart(partId);
        if (!partData) {
            logger.warn('partsSlice', `No data returned for part ${partId} from API.`);
            return rejectWithValue(`Part ${partId} not found or API error.`);
        }
        logger.log('partsSlice', `Successfully fetched part details for ${partId}`, partData);
        return partData;
    }
    catch (error) {
        logger.error('partsSlice', `Error fetching part details for ${partId}:`, error);
        return rejectWithValue(error.message || `Failed to fetch part ${partId}`);
    }
});
// Async thunk for locating a part (e.g., with WLED)
export const locatePartById = createAsyncThunk('parts/locatePartById', async (partId, { getState, dispatch, rejectWithValue }) => {
    var _a, _b, _c;
    const state = getState();
    const part = state.parts.partsById[partId];
    // Get WLED config from the resolvedCardConfig in configSlice
    const wledConfigFromState = (_b = (_a = state.config.resolvedConfig) === null || _a === void 0 ? void 0 : _a.services) === null || _b === void 0 ? void 0 : _b.wled;
    if (!part) {
        logger.warn('partsSlice', `Part with ID ${partId} not found for location.`);
        return rejectWithValue(`Part with ID ${partId} not found.`);
    }
    // Use the wledConfigFromState directly for checks and passing to the service
    if (!wledConfigFromState || !wledConfigFromState.enabled || !wledConfigFromState.entity_id || !wledConfigFromState.parameter_name) {
        logger.warn('partsSlice', `WLED service not configured or enabled for part ${partId}.`);
        return rejectWithValue('WLED service not configured or enabled.');
    }
    // Correct WLEDService instantiation
    const wledService = new WLEDService(state.hass.hass);
    // Explicitly type 'p' using ParameterDetail from '../../types'
    const locationParameter = (_c = part.parameters) === null || _c === void 0 ? void 0 : _c.find((p) => { var _a; return ((_a = p.template_detail) === null || _a === void 0 ? void 0 : _a.name) === wledConfigFromState.parameter_name; });
    if (!locationParameter || !locationParameter.data) {
        logger.warn('partsSlice', `Location parameter '${wledConfigFromState.parameter_name}' not found or empty for part ${partId}.`);
        return rejectWithValue(`Location parameter not found for part ${partId}.`);
    }
    try {
        // Call the correct method 'locatePart' and pass the part and WLED config from state
        await wledService.locatePart(part, wledConfigFromState);
        logger.log('partsSlice', `Successfully triggered WLED location for part ${partId} at segment ${locationParameter.data}.`);
        // Optionally dispatch an action to clear locatingPartId after a delay
        setTimeout(() => {
            dispatch(partsSlice.actions.setLocatingPartId(null));
        }, 5000); // Clear after 5 seconds
    }
    catch (error) {
        logger.error('partsSlice', `Error locating part ${partId} via WLED:`, error);
        return rejectWithValue(error.message || `Failed to locate part ${partId}.`);
    }
});
// Async thunk for adjusting part stock
export const adjustPartStock = createAsyncThunk('parts/adjustPartStock', 
// Remove getState from args if apiState check is removed
async ({ partId, amount, locationId, notes }, { rejectWithValue }) => {
    logger.info('partsSlice', `Adjusting stock for part ${partId} by ${amount}. Location: ${locationId}, Notes: \"${notes}\"`);
    // REMOVED: API state check (service handles config)
    // const apiState = (getState() as RootState).api;
    // if (!apiState.url || !apiState.apiKey) { ... }
    try {
        // REMOVED: setConfig call
        // inventreeApiService.setConfig(apiState.url, apiState.apiKey);
        // Call the service method (which now gets config from store)
        const adjustmentResult = await inventreeApiService.adjustStock(partId, amount, locationId, notes);
        // Check the result format from the service
        if (!adjustmentResult || typeof adjustmentResult.newTotalStock !== 'number') { // Check type explicitly
            logger.error('partsSlice', `Stock adjustment for part ${partId} failed or did not return expected result format.`, adjustmentResult);
            // Provide more specific error based on result
            const reason = !adjustmentResult ? 'API call failed' : 'API response missing newTotalStock';
            return rejectWithValue(`Stock adjustment failed: ${reason}.`);
        }
        logger.log('partsSlice', `Stock for part ${partId} adjusted successfully via API. New total stock: ${adjustmentResult.newTotalStock}.`);
        // Ensure returned object matches the thunk's fulfilled payload type
        return { partId: adjustmentResult.pk, newTotalStock: adjustmentResult.newTotalStock };
    }
    catch (error) {
        logger.error('partsSlice', `Error calling inventreeApiService.adjustStock for part ${partId}:`, error);
        return rejectWithValue(error.message || `Failed to adjust stock for part ${partId}.`);
    }
});
const partsSlice = createSlice({
    name: 'parts',
    initialState,
    reducers: {
        setParts(state, action) {
            const { entityId, parts } = action.payload;
            const partIds = [];
            parts.forEach(part => {
                state.partsById[part.pk] = Object.assign(Object.assign({}, state.partsById[part.pk]), part);
                partIds.push(part.pk);
            });
            state.partsByEntity[entityId] = partIds;
            logger.log('partsSlice', `Set ${parts.length} parts for entity '${entityId}'. Part IDs: [${partIds.join(', ')}]`, { level: 'debug' });
        },
        updatePart(state, action) {
            const part = action.payload;
            if (state.partsById[part.pk]) {
                state.partsById[part.pk] = Object.assign(Object.assign({}, state.partsById[part.pk]), part);
                logger.log('partsSlice', `Updated part ${part.pk} in partsById.`, { level: 'debug' });
            }
            else {
                // If part doesn't exist, add it (e.g., from a direct API fetch not tied to an entity)
                state.partsById[part.pk] = part;
                logger.log('partsSlice', `Added new part ${part.pk} to partsById.`, { level: 'debug' });
            }
        },
        updatePartStock(state, action) {
            const { partId, newStock } = action.payload;
            const partToUpdate = state.partsById[partId];
            if (partToUpdate) {
                partToUpdate.in_stock = newStock;
                logger.log('partsSlice', `Updated stock for part ${partId} to ${newStock} in partsById.`, { level: 'debug' });
            }
            else {
                logger.warn('partsSlice', `Attempted to update stock for non-existent partId: ${partId}`);
            }
        },
        clearParts(state, action) {
            const entityId = action.payload;
            logger.log('partsSlice', `Clearing parts mapping for entity '${entityId}'.`, { level: 'debug' });
            delete state.partsByEntity[entityId];
        },
        registerEntity(state, action) {
            const entityId = action.payload;
            if (!(entityId in state.partsByEntity)) {
                state.partsByEntity[entityId] = [];
                logger.log('partsSlice', `Registered entity '${entityId}' in partsByEntity.`, { level: 'debug' });
            }
        },
        partStockUpdateFromWebSocket(state, action) {
            const _a = action.payload, { partId, quantity } = _a, otherStockData = __rest(_a, ["partId", "quantity"]);
            const part = state.partsById[partId];
            if (part) {
                logger.log('partsSlice', `Processing WebSocket stock update for part ${partId}. Current stock: ${part.in_stock}, New quantity from WS: ${quantity}`);
                if (quantity !== undefined) {
                    part.in_stock = parseFloat(quantity); // Ensure it's a number
                }
                // Optionally update other fields from otherStockData if needed
                // For example: part.last_updated = otherStockData.last_updated;
                logger.log('partsSlice', `Part ${partId} stock updated to ${part.in_stock} via WebSocket.`, { level: 'debug', otherStockData });
            }
            else {
                logger.warn('partsSlice', `Received WebSocket stock update for unknown part ${partId}. Triggering fetch.`);
                // If part isn't in store, the fetchPartDetails thunk (dispatched by middleware) should add it.
            }
        },
        setLocatingPartId(state, action) {
            state.locatingPartId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(locatePartById.pending, (state, action) => {
            state.locatingPartId = action.meta.arg; // partId is the argument
        })
            .addCase(locatePartById.rejected, (state, action) => {
            if (state.locatingPartId === action.meta.arg) {
                state.locatingPartId = null;
            }
            // Optionally handle error display here if needed
        })
            .addCase(locatePartById.fulfilled, (state, action) => {
            // The timeout to clear locatingPartId is handled in the thunk itself.
            // No state change needed here for fulfilled, unless an error occurred before timeout.
        })
            .addCase(adjustPartStock.pending, (state, action) => {
            var _a;
            const { partId, amount } = action.meta.arg;
            state.adjustingStockPartId = partId;
            state.adjustmentError = null;
            // Optimistically update stock
            const partToUpdate = state.partsById[partId];
            if (partToUpdate) {
                const originalStock = partToUpdate.in_stock;
                partToUpdate.in_stock = ((_a = partToUpdate.in_stock) !== null && _a !== void 0 ? _a : 0) + amount;
                logger.log('partsSlice', `Optimistically updated stock for part ${partId} from ${originalStock} to ${partToUpdate.in_stock}`, { level: 'debug' });
            }
            else {
                logger.warn('partsSlice', `Cannot optimistically update stock for partId ${partId}: Part not found.`);
            }
        })
            .addCase(adjustPartStock.fulfilled, (state, action) => {
            const { partId, newTotalStock } = action.payload;
            const part = state.partsById[partId];
            if (part) {
                part.in_stock = newTotalStock; // Ensure final stock is accurate from API response
            }
            if (state.adjustingStockPartId === partId) {
                state.adjustingStockPartId = null;
            }
            state.adjustmentError = null;
        })
            .addCase(adjustPartStock.rejected, (state, action) => {
            var _a;
            const rejectedPartId = action.meta.arg.partId;
            const originalArgs = action.meta.arg;
            state.adjustmentError = action.payload || action.error.message || 'Failed to adjust stock';
            logger.error('partsSlice', `Stock adjustment failed for part ${rejectedPartId}: ${state.adjustmentError}`);
            const partToRevert = state.partsById[rejectedPartId];
            if (partToRevert && typeof originalArgs.amount === 'number') {
                partToRevert.in_stock = ((_a = partToRevert.in_stock) !== null && _a !== void 0 ? _a : 0) - originalArgs.amount;
                logger.warn('partsSlice', `Reverted optimistic stock update for part ${rejectedPartId}. New reverted stock: ${partToRevert.in_stock}`);
            }
            if (state.adjustingStockPartId === rejectedPartId) {
                state.adjustingStockPartId = null;
            }
        })
            .addCase(fetchPartDetails.pending, (state, action) => {
            const partId = action.meta.arg;
            logger.info('partsSlice', `Fetching details for part ${partId} (pending)...`);
            state.loading = true; // General loading, or use per-part loading:
            // if (state.partsById[partId]) state.partsById[partId].isLoadingDetails = true;
        })
            .addCase(fetchPartDetails.fulfilled, (state, action) => {
            const fetchedPart = action.payload;
            logger.info('partsSlice', `Successfully fetched details for part ${fetchedPart.pk}. Updating state.`);
            state.partsById[fetchedPart.pk] = Object.assign(Object.assign({}, state.partsById[fetchedPart.pk]), fetchedPart);
            state.loading = false;
        })
            .addCase(fetchPartDetails.rejected, (state, action) => {
            const partId = action.meta.arg;
            logger.error('partsSlice', `Failed to fetch details for part ${partId}: ${action.payload || action.error.message}`);
            state.loading = false;
            state.error = action.payload || action.error.message || `Failed to fetch details for part ${partId}`;
        });
    },
});
export const { setParts, updatePart, updatePartStock, clearParts, registerEntity, partStockUpdateFromWebSocket, setLocatingPartId } = partsSlice.actions;
export default partsSlice.reducer;
// --- Selectors ---
export const selectPartsByEntityMapping = (state) => state.parts.partsByEntity;
export const selectPartsById = (state) => state.parts.partsById;
export const selectAllPartIds = createSelector([selectPartsById], (partsById) => Object.keys(partsById).map(Number));
export const selectAllParts = createSelector([selectPartsById], (partsById) => Object.values(partsById));
export const selectPartsForEntities = createSelector([selectPartsByEntityMapping, selectPartsById, (_, entityIds) => entityIds], (partsByEntity, partsById, entityIds) => {
    const relevantPartIds = new Set();
    entityIds.forEach(entityId => {
        const partIds = partsByEntity[entityId];
        if (partIds) {
            partIds.forEach((id) => relevantPartIds.add(id));
        }
    });
    const result = [];
    relevantPartIds.forEach(partId => {
        const part = partsById[partId];
        if (part) {
            result.push(part);
        }
    });
    return result;
});
export const selectPartsByEntityId = createSelector([selectPartsById, selectPartsByEntityMapping, (_, entityId) => entityId], (partsById, partsByEntity, entityId) => {
    var _a;
    const partIds = (_a = partsByEntity[entityId]) !== null && _a !== void 0 ? _a : [];
    return partIds.map((id) => partsById[id]).filter((part) => !!part);
});
export const selectPartById = createSelector([(state) => state.parts.partsById, (_, partId) => partId], (partsById, partId) => (partId !== null && partId !== undefined ? partsById[partId] : undefined));
export const selectPartsLoading = (state) => state.parts.loading;
export const selectPartsError = (state) => state.parts.error;
export const selectLocatingPartId = (state) => state.parts.locatingPartId;
export const selectAdjustingStockPartId = (state) => state.parts.adjustingStockPartId;
export const selectAdjustmentError = (state) => state.parts.adjustmentError;
export const selectFilteredParts = createSelector([selectAllParts], (parts) => {
    return parts;
});
export const selectPartsByEntity = createSelector([
    (state) => state.parts.partsById,
    (state) => state.parts.partsByEntity,
    (_, entityId) => entityId,
], (partsById, partsByEntity, entityId) => {
    if (!entityId) {
        return [];
    }
    const currentPartIds = partsByEntity[entityId];
    if (!currentPartIds) {
        return [];
    }
    return currentPartIds.map((id) => partsById[id]).filter((part) => part !== undefined);
});
export const selectCombinedParts = createSelector([
    (state) => state.parts.partsById,
    (state) => state.parts.partsByEntity,
    (_, primaryEntityId, additionalEntityIds = []) => ({
        primaryEntityId,
        additionalEntityIds,
    }),
], (partsById, partsByEntity, { primaryEntityId, additionalEntityIds }) => {
    const combinedPartIds = new Set();
    if (primaryEntityId) {
        const primaryPartIds = partsByEntity[primaryEntityId];
        if (primaryPartIds) {
            primaryPartIds.forEach((id) => combinedPartIds.add(id));
        }
    }
    additionalEntityIds.forEach(entityId => {
        const additionalPartIds = partsByEntity[entityId];
        if (additionalPartIds) {
            additionalPartIds.forEach((id) => combinedPartIds.add(id));
        }
    });
    return Array.from(combinedPartIds).map((id) => partsById[id]).filter((part) => part !== undefined);
});
//# sourceMappingURL=partsSlice.js.map