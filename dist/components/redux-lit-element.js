import { LitElement } from 'lit';
import { store } from '../store';
export class ReduxLitElement extends LitElement {
    constructor() {
        super(...arguments);
        this._unsubscribe = null;
    }
    connectedCallback() {
        super.connectedCallback();
        if (!store) {
            console.warn('Redux store not available, component will operate in non-Redux mode');
            return;
        }
        this._unsubscribe = store.subscribe(() => {
            this.requestUpdate();
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }
    dispatch(action) {
        store.dispatch(action);
    }
}
//# sourceMappingURL=redux-lit-element.js.map