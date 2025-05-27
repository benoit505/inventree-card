var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ReduxLitElement } from '../redux-lit-element';
import { store } from '../../store';
import { Logger } from '../../utils/logger';
import { selectSearchQuery, selectSearchLoading, selectSearchError, setSearchQuery, clearSearch } from '../../store/slices/searchSlice';
import { performSearch } from '../../store/thunks/searchThunks';
// Debounce utility (simple implementation)
function debounce(func, waitFor) {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), waitFor);
    };
}
let InvenTreeSearchBar = class InvenTreeSearchBar extends ReduxLitElement {
    constructor() {
        super();
        this._query = '';
        this._loading = 'idle';
        this._error = null;
        this.logger = Logger.getInstance();
        // Debounce search dispatch by 300ms
        this._debouncedPerformSearch = debounce((query) => {
            if (query.trim().length > 1) { // Only search if query is > 1 char
                this.logger.log('SearchBar', `Dispatching debounced search for: "${query}"`);
                this.dispatchMap().performSearch(query.trim());
            }
            else if (query.trim().length === 0) {
                // If query is cleared, clear results
                this.dispatchMap().clearSearch();
            }
        }, 300);
    }
    stateMap(state) {
        return {
            _query: selectSearchQuery(state),
            _loading: selectSearchLoading(state),
            _error: selectSearchError(state),
        };
    }
    dispatchMap() {
        const dispatch = store.dispatch;
        return {
            setQuery: (query) => dispatch(setSearchQuery(query)),
            performSearch: (query) => dispatch(performSearch(query)),
            clearSearch: () => dispatch(clearSearch()),
        };
    }
    _handleInput(event) {
        const inputElement = event.target;
        const query = inputElement.value;
        this.dispatchMap().setQuery(query); // Update query state immediately
        this._debouncedPerformSearch(query); // Trigger debounced search API call
    }
    _handleClear() {
        this.dispatchMap().clearSearch();
    }
    _handleSearchSubmit(event) {
        event.preventDefault(); // Prevent form submission if wrapped in form
        if (this._query.trim().length > 1) {
            this.logger.log('SearchBar', `Dispatching immediate search for: "${this._query}"`);
            this.dispatchMap().performSearch(this._query.trim());
        }
        else if (this._query.trim().length === 0) {
            this.dispatchMap().clearSearch();
        }
    }
    render() {
        return html `
            <div class="search-container">
                <ha-textfield
                    label="Search Parts"
                    .value=${this._query}
                    @input=${this._handleInput}
                    @keydown=${(e) => { if (e.key === 'Enter')
            this._handleSearchSubmit(e); }}
                    iconLeading="mdi:magnify"
                ></ha-textfield>
                
                <div class="status-indicator">
                    ${this._loading === 'pending' ? html `
                        <ha-circular-progress active indeterminate size="small"></ha-circular-progress>
                    ` : ''}
                </div>
                
                ${this._query ? html `
                    <ha-icon-button class="clear-button" @click=${this._handleClear} path="mdi:close" title="Clear Search"></ha-icon-button>
                ` : html `
                     <ha-icon-button path="mdi:magnify" title="Search" @click=${this._handleSearchSubmit}></ha-icon-button>
                `}
            </div>
            ${this._error ? html `<div class="error-message">${this._error}</div>` : ''}
        `;
    }
};
InvenTreeSearchBar.styles = css `
        :host {
            display: block;
            position: relative;
            margin-bottom: 1rem; /* Add some space below */
        }
        .search-container {
            display: flex;
            align-items: center;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            background-color: var(--input-fill-color, var(--secondary-background-color));
        }
        ha-textfield {
            flex-grow: 1;
            --text-field-padding: 0;
             /* Remove default border/background from ha-textfield */
            --mdc-text-field-fill-color: transparent;
            --mdc-text-field-idle-border-color: transparent;
            --mdc-text-field-hover-border-color: transparent;
            --mdc-text-field-disabled-border-color: transparent;
            --mdc-text-field-focused-border-color: transparent; 
            margin-right: 0.5rem;
        }
        ha-textfield input {
             border: none !important;
             background: none !important;
             box-shadow: none !important;
             outline: none !important; 
             padding-left: 0.5rem; 
        }
         /* Style the icon button */
        ha-icon-button {
            --mdc-icon-button-size: 36px;
            color: var(--secondary-text-color);
        }
        ha-icon-button.clear-button {
            color: var(--primary-text-color);
        }
         .status-indicator {
            position: absolute;
            right: 40px; /* Adjust based on button sizes */
            top: 50%;
            transform: translateY(-50%);
        }
        ha-circular-progress {
            --mdc-theme-primary: var(--primary-color);
            width: 24px;
            height: 24px;
        }
        .error-message {
            color: var(--error-color);
            font-size: 0.8em;
            position: absolute;
             bottom: -1.2em; /* Position below the input */
             left: 0.5rem;
        }
    `;
__decorate([
    state()
], InvenTreeSearchBar.prototype, "_query", void 0);
__decorate([
    state()
], InvenTreeSearchBar.prototype, "_loading", void 0);
__decorate([
    state()
], InvenTreeSearchBar.prototype, "_error", void 0);
InvenTreeSearchBar = __decorate([
    customElement('inventree-search-bar')
], InvenTreeSearchBar);
export { InvenTreeSearchBar };
//# sourceMappingURL=search-bar.js.map