import { LitElement, PropertyValues } from 'lit';
import { store, RootState } from '../store';
import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('ReduxLitElement');
ConditionalLoggerEngine.getInstance().registerCategory('ReduxLitElement', { enabled: false, level: 'info' });

export class ReduxLitElement extends LitElement {
  private _unsubscribe: (() => void) | null = null;
  
  connectedCallback() {
    super.connectedCallback();
    logger.debug('connectedCallback', 'Component connected, subscribing to Redux store.');
    
    if (!store) {
      logger.warn('connectedCallback', 'Redux store not available, component will operate in non-Redux mode');
      return;
    }
    
    this._unsubscribe = store.subscribe(() => {
      logger.verbose('store.subscribe', 'Store changed, requesting update.');
      this.requestUpdate();
    });
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      logger.debug('disconnectedCallback', 'Component disconnected, unsubscribing from Redux store.');
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
  
  protected dispatch(action: any) {
    logger.debug('dispatch', 'Dispatching action to Redux store.', { actionType: action.type });
    store.dispatch(action);
  }
}


