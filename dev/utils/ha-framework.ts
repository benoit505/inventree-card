export {}; // Make this a module

// Define interfaces for schema and data
interface FormField {
    name: string;
    label: string;
    selector?: {
        entity?: {
            domain?: string[];
        };
        select?: {
            options?: Array<{
                value: string;
                label: string;
            }>;
        };
        boolean?: {};
        text?: {};
        number?: {
            min?: number;
            max?: number;
            step?: number;
            mode?: string;
        };
    };
}

// Define interfaces for our custom elements
declare global {
    interface HTMLElementTagNameMap {
        'ha-form': HaForm;
        'ha-switch': HaSwitch;
        'ha-textfield': HaTextfield;
        'ha-card': HaCard;
    }
}

class HaForm extends HTMLElement {
    private _schema?: FormField[];
    private _data?: Record<string, any>;
    private _shadowRoot: ShadowRoot;

    static get properties() {
        return {
            hass: { type: Object },
            data: { type: Object },
            schema: { type: Array },
            computeLabel: { type: Function },
            computeHelper: { type: Function }
        };
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
    }

    set schema(schema: FormField[]) {
        this._schema = schema;
        this._render();
    }

    set data(data: Record<string, any>) {
        this._data = data;
        this._render();
    }

    private _render(): void {
        if (!this._schema || !this._data) return;

        this._shadowRoot.innerHTML = `
            <style>
                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                label {
                    font-weight: 500;
                }
                input, select {
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                input[type="checkbox"] {
                    width: 20px;
                    height: 20px;
                }
            </style>
            <div class="form">
                ${this._schema.map(field => `
                    <div class="field">
                        <label>${field.label}</label>
                        ${this._renderField(field)}
                    </div>
                `).join('')}
            </div>
        `;

        this._addEventListeners();
    }

    private _addEventListeners(): void {
        const inputs = Array.from(this._shadowRoot.querySelectorAll('input, select'));
        
        inputs.forEach((element) => {
            const input = element as HTMLInputElement | HTMLSelectElement;
            const name = input.getAttribute('name');
            if (!name) return;

            const field = this._schema?.find(f => f.name === name);
            if (!field) return;

            input.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLInputElement | HTMLSelectElement;
                let value: string | number | boolean = target.value;

                // Type conversion
                if (field.selector?.boolean) {
                    value = (target as HTMLInputElement).checked;
                } else if (field.selector?.number) {
                    value = Number(value);
                }

                this.dispatchEvent(new CustomEvent('value-changed', {
                    detail: {
                        target: { configValue: field.name },
                        value
                    }
                }));
            });
        });
    }

    private _renderField(field: FormField): string {
        const value = this._data?.[field.name] ?? '';
        
        if (field.selector?.boolean) {
            return `
                <input type="checkbox" 
                       name="${field.name}" 
                       ${value ? 'checked' : ''}>
            `;
        }
        
        if (field.selector?.number) {
            const { min = 0, max = 100, step = 1 } = field.selector.number;
            return `
                <input type="number" 
                       name="${field.name}" 
                       value="${value}"
                       min="${min}"
                       max="${max}"
                       step="${step}">
            `;
        }
        
        if (field.selector?.select?.options) {
            const options = field.selector.select.options
                .map(opt => `
                    <option value="${opt.value}" 
                            ${value === opt.value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('');
            
            return `<select name="${field.name}">${options}</select>`;
        }
        
        // Default to text input
        return `
            <input type="text" 
                   name="${field.name}" 
                   value="${value}">
        `;
    }
}

class HaSwitch extends HTMLElement {
    constructor() {
        super();
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.margin = '8px';
        this.appendChild(input);
    }
}

class HaTextfield extends HTMLElement {
    constructor() {
        super();
        const input = document.createElement('input');
        input.type = 'text';
        input.style.padding = '4px';
        input.style.margin = '8px';
        this.appendChild(input);
    }
}

class HaCard extends HTMLElement {
    constructor() {
        super();
        this.style.display = 'block';
        this.style.background = 'white';
        this.style.borderRadius = '8px';
        this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        this.style.margin = '8px';
        this.style.padding = '16px';
    }
}

// Register components
customElements.define('ha-form', HaForm);
customElements.define('ha-switch', HaSwitch);
customElements.define('ha-textfield', HaTextfield);
customElements.define('ha-card', HaCard);

console.log('Registered ha-form successfully'); 