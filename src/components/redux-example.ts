import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { PropertyValues } from 'lit';
import { ReduxLitElement } from './redux-lit-element';
import { increment, decrement, incrementByAmount } from '../store/slices/counterSlice';
import { store, RootState } from '../store';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

@customElement('redux-example')
export class ReduxExample extends ReduxLitElement {
  @state() counter = 0;

  static styles = css`
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

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    const state = store.getState();
    const newCounterValue = state.counter.value;

    if (this.counter !== newCounterValue) {
      this.counter = newCounterValue;
      logger.log('ReduxExample', `Updated counter to ${newCounterValue}`);
    }
  }

  render() {
    return html`
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

  private _increment() {
    this.dispatch(increment());
  }

  private _decrement() {
    this.dispatch(decrement());
  }

  private _incrementByAmount() {
    this.dispatch(incrementByAmount(5));
  }

  private _reset() {
    this.dispatch(incrementByAmount(-this.counter));
  }
}

// This example demonstrates how to use the ReduxLitElement base class
// with a simple counter implementation 