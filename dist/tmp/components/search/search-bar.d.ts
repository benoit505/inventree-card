import { TemplateResult } from 'lit';
import { ReduxLitElement } from '../redux-lit-element';
import { RootState } from '../../store';
export declare class InvenTreeSearchBar extends ReduxLitElement {
    private _query;
    private _loading;
    private _error;
    private logger;
    private _debouncedPerformSearch;
    constructor();
    stateMap(state: RootState): {
        _query: any;
        _loading: any;
        _error: any;
    };
    dispatchMap(): {
        setQuery: (query: string) => any;
        performSearch: (query: string) => any;
        clearSearch: () => any;
    };
    private _handleInput;
    private _handleClear;
    private _handleSearchSubmit;
    static styles: import("lit").CSSResult;
    render(): TemplateResult;
}
