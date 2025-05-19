import { InventreeCardConfig } from '../../core/types';
import { ReduxLitElement } from '../redux-lit-element';
import { RootState } from '../../store';
export declare class InvenTreePartDetails extends ReduxLitElement {
    partId?: number;
    config?: InventreeCardConfig;
    private _partData?;
    stateMap(state: RootState): {
        _partData: any;
    };
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
