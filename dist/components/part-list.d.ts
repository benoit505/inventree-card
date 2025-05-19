import { PropertyValues } from 'lit';
import { ReduxLitElement } from './redux-lit-element';
import { InventreeItem } from '../core/types';
export declare class InventreePartList extends ReduxLitElement {
    entityId: string;
    parts: InventreeItem[];
    loading: boolean;
    private _shallowEqual;
    updated(changedProps: PropertyValues): void;
    loadParts(): void;
    private _fetchPartsIfNeeded;
    render(): import("lit-html").TemplateResult<1>;
}
