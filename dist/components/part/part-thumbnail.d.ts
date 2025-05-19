import { LitElement } from 'lit';
import { InventreeItem, InventreeCardConfig } from '../../core/types';
export declare class InvenTreePartThumbnail extends LitElement {
    partData?: InventreeItem;
    config?: InventreeCardConfig;
    layout: 'grid' | 'list' | 'detail';
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
