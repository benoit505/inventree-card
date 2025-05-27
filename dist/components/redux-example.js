var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ReduxLitElement } from './redux-lit-element';
import { increment, decrement, incrementByAmount } from '../store/slices/counterSlice';
import { store } from '../store';
import { Logger } from '../utils/logger';
const logger = Logger.getInstance();
let ReduxExample = class ReduxExample extends ReduxLitElement {
    constructor() {
        super(...arguments);
        this.counter = 0;
    }
    updated(changedProps) {
        super.updated(changedProps);
        const state = store.getState();
        const newCounterValue = state.counter.value;
        if (this.counter !== newCounterValue) {
            this.counter = newCounterValue;
            logger.log('ReduxExample', `Updated counter to ${newCounterValue}`);
        }
    }
    render() {
        return html `
      <div>
        <h2>Redux Counter Example</h2>
        <div class="counter">Count: ${this.counter}</div>
        <div>
          <button @click=${this._increment}>Increment</button>
          <button @click=${this._decrement}>Decrement</button>
          <button @click=${this._incrementByAmount}>Add 5</button>
          <button @click=${this._reset}>Reset</button>
        </div>
      </div>
    `;
    }
    _increment() {
        this.dispatch(increment());
    }
    _decrement() {
        this.dispatch(decrement());
    }
    _incrementByAmount() {
        this.dispatch(incrementByAmount(5));
    }
    _reset() {
        this.dispatch(incrementByAmount(-this.counter));
    }
};
ReduxExample.styles = css `
    :host {
      display: block;
      padding: 16px;
      color: var(--redux-example-text-color, #000);
    }
    .counter {
      font-size: 24px;
      margin: 10px 0;
    }
    button {
      margin: 5px;
      padding: 8px 16px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #2980b9;
    }
  `;
__decorate([
    state()
], ReduxExample.prototype, "counter", void 0);
ReduxExample = __decorate([
    customElement('redux-example')
], ReduxExample);
export { ReduxExample };
// This example demonstrates how to use the ReduxLitElement base class
// with a simple counter implementation 
//# sourceMappingURL=redux-example.js.map