export class StockService {
    constructor(hass) {
        this.hass = hass;
    }
    async adjustStock(part, amount) {
        try {
            // Optimistic update
            const entity_id = this.getEntityId(part);
            if (entity_id) {
                this.hass.states[entity_id] = Object.assign(Object.assign({}, this.hass.states[entity_id]), { attributes: Object.assign(Object.assign({}, this.hass.states[entity_id].attributes), { items: this.hass.states[entity_id].attributes.items.map((item) => item.pk === part.pk
                            ? Object.assign(Object.assign({}, item), { in_stock: (item.in_stock || 0) + amount }) : item) }) });
            }
            // Actual service call
            await this.hass.callService('inventree', 'adjust_stock', {
                name: part.name,
                quantity: amount
            });
        }
        catch (e) {
            // Revert optimistic update on error
            console.error('Failed to adjust stock:', e);
            throw e;
        }
    }
    getEntityId(part) {
        var _a, _b;
        // Find the entity that contains this part
        return (_b = (_a = Object.entries(this.hass.states)
            .find(([_, state]) => { var _a, _b; return (_b = (_a = state.attributes) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.some((item) => item.pk === part.pk); })) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
    }
}
//# sourceMappingURL=adjust-stock.js.map