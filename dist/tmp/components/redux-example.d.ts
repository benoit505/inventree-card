import { PropertyValues } from 'lit';
import { ReduxLitElement } from './redux-lit-element';
export declare class ReduxExample extends ReduxLitElement {
    counter: number;
    static styles: import("lit").CSSResult;
    updated(changedProps: PropertyValues): void;
    render(): import("lit-html").TemplateResult<1>;
    private _increment;
    private _decrement;
    private _incrementByAmount;
    private _reset;
}
