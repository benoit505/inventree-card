export const parseState = (hass, entityId) => {
    var _a, _b, _c;
    console.debug('🔍 Starting parseState for:', entityId);
    const state = hass.states[entityId];
    if (!state) {
        console.warn('❌ No state found for:', entityId);
        return [];
    }
    // Debug all available data
    console.debug('📦 Raw state data:', state);
    // First try the items attribute
    if ((_a = state.attributes) === null || _a === void 0 ? void 0 : _a.items) {
        console.debug('📦 Found items in attributes');
        return state.attributes.items;
    }
    // Then try the stock attribute
    if ((_b = state.attributes) === null || _b === void 0 ? void 0 : _b.stock) {
        console.debug('📦 Found stock in attributes');
        return state.attributes.stock;
    }
    // Try to parse the state itself if it's a string
    if (typeof state.state === 'string' && state.state.startsWith('[')) {
        try {
            const parsed = JSON.parse(state.state);
            if (Array.isArray(parsed)) {
                console.debug('📦 Parsed state into array');
                return parsed;
            }
        }
        catch (e) {
            console.warn('❌ Failed to parse state as JSON:', e);
        }
    }
    // If we get here, try to construct a single item from the state
    if ((_c = state.attributes) === null || _c === void 0 ? void 0 : _c.name) {
        console.debug('📦 Constructing single item from attributes');
        return [{
                pk: state.attributes.pk || state.attributes.id || 0,
                name: state.attributes.name,
                in_stock: Number(state.state) || 0,
                minimum_stock: state.attributes.minimum_stock || 0,
                image: state.attributes.image || null,
                thumbnail: state.attributes.thumbnail || null,
                // Add all the new required fields with default values
                active: state.attributes.active || true,
                assembly: state.attributes.assembly || false,
                category: state.attributes.category || 0,
                category_name: state.attributes.category_name || '',
                component: state.attributes.component || false,
                description: state.attributes.description || '',
                full_name: state.attributes.full_name || state.attributes.name || '',
                IPN: state.attributes.IPN || '',
                purchaseable: state.attributes.purchaseable || false,
                salable: state.attributes.salable || false,
                total_in_stock: Number(state.state) || 0,
                unallocated_stock: Number(state.state) || 0,
                allocated_to_build_orders: state.attributes.allocated_to_build_orders || 0,
                allocated_to_sales_orders: state.attributes.allocated_to_sales_orders || 0,
                building: state.attributes.building || 0,
                ordering: state.attributes.ordering || 0
            }];
    }
    console.warn('❌ No valid items found in state or attributes');
    return [];
};
export const shouldUpdate = (newHass, oldHass, entityId) => {
    var _a, _b;
    console.debug('shouldUpdate - Checking updates for:', entityId);
    if (!entityId) {
        console.debug('shouldUpdate - No entityId provided');
        return false;
    }
    const oldState = (_a = oldHass === null || oldHass === void 0 ? void 0 : oldHass.states[entityId]) === null || _a === void 0 ? void 0 : _a.state;
    const newState = (_b = newHass === null || newHass === void 0 ? void 0 : newHass.states[entityId]) === null || _b === void 0 ? void 0 : _b.state;
    console.debug('shouldUpdate - Old state:', oldState);
    console.debug('shouldUpdate - New state:', newState);
    const shouldUpdate = oldState !== newState;
    console.debug('shouldUpdate - Should update?', shouldUpdate);
    return shouldUpdate;
};
//# sourceMappingURL=helpers.js.map