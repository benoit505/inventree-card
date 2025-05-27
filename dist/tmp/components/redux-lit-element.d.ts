import { LitElement } from 'lit';
export declare class ReduxLitElement extends LitElement {
    private _unsubscribe;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected dispatch(action: any): void;
}
