import { LitElement, PropertyValues } from 'lit';
import { store, RootState } from '../store';

export class ReduxLitElement extends LitElement {
  private _unsubscribe: (() => void) | null = null;
  
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
  
  protected dispatch(action: any) {
    store.dispatch(action);
  }
}


