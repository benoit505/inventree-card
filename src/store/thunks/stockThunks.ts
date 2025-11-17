import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
import { addPendingStockChange, clearPendingStockChange } from '../slices/partsSlice';
import { inventreeApi } from '../apis/inventreeApi';

// Map to track pending timeouts per part
const pendingTimeouts: Record<string, NodeJS.Timeout> = {};

// Map to track verification timeouts (waiting for WebSocket)
const verificationTimeouts: Record<string, NodeJS.Timeout> = {};

// Configuration
const DEBOUNCE_MS = 1000; // Wait 1 second after last click before sending API call
const VERIFICATION_TIMEOUT_MS = 3000; // Wait up to 3 seconds for WebSocket confirmation

/**
 * 🚌 THE BUS: Debounced stock adjustment with eventual consistency
 * 
 * Flow:
 * 1. User clicks +/- → Immediate optimistic UI update
 * 2. Start 500ms timer (restart timer if more clicks come in)
 * 3. When timer fires → Send ONE batched API call with net delta
 * 4. API call includes consolidation (handled by InvenTree)
 * 5. WebSocket update arrives → Verify against expected value
 * 6. If match: ✅ Circle closed! If mismatch: ⚠️ Trust WebSocket
 */
export const adjustStockDebounced = createAsyncThunk<
  void,
  { partId: number; delta: number; cardInstanceId: string },
  { state: RootState; dispatch: AppDispatch }
>(
  'parts/adjustStockDebounced',
  async ({ partId, delta, cardInstanceId }, { dispatch, getState }) => {
    console.log(`🎫 TICKET: User clicked ${delta > 0 ? '+' : ''}${delta} for part ${partId}`);
    
    // 1️⃣ Immediately dispatch optimistic update
    dispatch(addPendingStockChange({ partId, delta, cardInstanceId }));
    
    // 2️⃣ Cancel any existing timeout for this part (reset the bus timer!)
    const timeoutKey = `${cardInstanceId}-${partId}`;
    if (pendingTimeouts[timeoutKey]) {
      console.log(`🔄 BUS TIMER RESET: More clicks coming in, waiting...`);
      clearTimeout(pendingTimeouts[timeoutKey]);
    }
    
    // 3️⃣ Start new timeout (the bus waits for more passengers!)
    console.log(`⏱️  BUS WAITING: Timer set for ${DEBOUNCE_MS}ms...`);
    pendingTimeouts[timeoutKey] = setTimeout(async () => {
      console.log(`🚌 BUS DEPARTING: Timer expired, processing accumulated changes...`);
      
      // 4️⃣ Bus is departing! Get the accumulated delta
      const state = getState();
      const instanceState = state.parts.partsByInstance[cardInstanceId];
      const pending = instanceState?.pendingStockChanges[partId];
      
      if (!pending) {
        console.warn(`⚠️  No pending changes found for part ${partId} (already processed?)`);
        return;
      }
      
      const netDelta = pending.pendingDelta;
      console.log(`🚌 BUS CARGO: Part ${partId}, net delta: ${netDelta > 0 ? '+' : ''}${netDelta}, expected final stock: ${pending.expectedStock}`);
      
      try {
        if (netDelta > 0) {
          // ADD STOCK: POST /api/stock/
          await dispatch(inventreeApi.endpoints.addStockItem.initiate({
            partId,
            quantity: netDelta,
            notes: `Stock adjusted via InvenTree Card (+${netDelta})`,
          })).unwrap();
          console.log(`✅ API: Added ${netDelta} stock for part ${partId}`);
        } else if (netDelta < 0) {
          // REMOVE STOCK: POST /api/stock/remove/
          // First, get stock items
          console.log(`🔍 Fetching stock items for part ${partId}...`);
          const stockItems = await dispatch(inventreeApi.endpoints.getStockItems.initiate({ partId })).unwrap();
          console.log(`📦 Found ${stockItems?.length || 0} stock items:`, stockItems);
          
          if (!stockItems || stockItems.length === 0) {
            throw new Error('No stock items found to remove from');
          }
          
          // Build array of items to remove from (may need multiple if quantity > first item's quantity)
          const quantityToRemove = Math.abs(netDelta);
          let remainingToRemove = quantityToRemove;
          const itemsToRemove: Array<{ pk: number; quantity: number }> = [];
          
          for (const stockItem of stockItems) {
            if (remainingToRemove <= 0) break;
            
            const itemQuantity = typeof stockItem.quantity === 'string' ? parseFloat(stockItem.quantity) : (stockItem.quantity || 0);
            const removeFromThis = Math.min(itemQuantity, remainingToRemove);
            
            if (removeFromThis > 0) {
              itemsToRemove.push({
                pk: stockItem.pk,
                quantity: removeFromThis
              });
              remainingToRemove -= removeFromThis;
              console.log(`🎯 Will remove ${removeFromThis} from stock item PK ${stockItem.pk} (has ${itemQuantity})`);
            }
          }
          
          if (remainingToRemove > 0) {
            throw new Error(`Insufficient stock: tried to remove ${quantityToRemove}, but only ${quantityToRemove - remainingToRemove} available`);
          }
          
          console.log(`📤 Calling removeStockItem API with items:`, itemsToRemove);
          
          // Call the remove API with ALL items to remove from
          const result = await dispatch(inventreeApi.endpoints.removeStockItems.initiate({
            items: itemsToRemove
          })).unwrap();
          
          console.log(`✅ API: Removed ${quantityToRemove} stock for part ${partId}`);
          console.log(`📥 API Response:`, result);
        }
        
        // 5️⃣ API call succeeded! Now we wait for WebSocket confirmation
        console.log(`⏳ WAITING: WebSocket confirmation for part ${partId} (expecting ${pending.expectedStock})`);
        
        // 6️⃣ Set verification timeout - if WebSocket doesn't confirm in time, refetch the part
        const verificationKey = `${cardInstanceId}-${partId}`;
        if (verificationTimeouts[verificationKey]) {
          clearTimeout(verificationTimeouts[verificationKey]);
        }
        
        verificationTimeouts[verificationKey] = setTimeout(() => {
          const currentState = getState();
          const currentInstanceState = currentState.parts.partsByInstance[cardInstanceId];
          const stillPending = currentInstanceState?.pendingStockChanges[partId];
          
          if (stillPending) {
            console.warn(`⚠️ VERIFICATION TIMEOUT: No WebSocket confirmation for part ${partId} after ${VERIFICATION_TIMEOUT_MS}ms`);
            console.log(`🔄 Refetching part ${partId} to get accurate stock value...`);
            
            // Refetch the part to get accurate data
            dispatch(inventreeApi.endpoints.getPart.initiate({ pk: partId, cardInstanceId }));
            
            // Clear the pending change (refetch will provide truth)
            dispatch(clearPendingStockChange({ partId, cardInstanceId }));
          }
          
          delete verificationTimeouts[verificationKey];
        }, VERIFICATION_TIMEOUT_MS);
        
      } catch (error) {
        console.error(`❌ API ERROR: Stock adjustment failed for part ${partId}`, error);
        // Clear pending changes on error (will revert to original via WebSocket or need manual refresh)
        dispatch(clearPendingStockChange({ partId, cardInstanceId }));
      }
      
      // Clean up timeout reference
      delete pendingTimeouts[timeoutKey];
    }, DEBOUNCE_MS); // Bus waits for passengers
  }
);

/**
 * Selector to get pending stock changes for a part
 */
export const selectPendingStockChange = (state: RootState, cardInstanceId: string, partId: number) => {
  return state.parts.partsByInstance[cardInstanceId]?.pendingStockChanges[partId];
};

