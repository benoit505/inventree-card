console.log("Hello World Card: Script starting");

class HelloWorldCard extends HTMLElement {
    constructor() {
        super();
        console.log("Hello World Card: Constructor called");
    }
    
    setConfig(config) {
        console.log("Hello World Card: setConfig called with", config);
        this.config = config;
    }

    set hass(hass) {
        console.log("Hello World Card: hass setter called");
        const entityId = this.config.entity;
        const state = hass.states[entityId];
        const stateStr = state ? state.state : 'unavailable';

        if (!this.content) {
            this.innerHTML = `
                <ha-card header="Hello ${hass.user.name}!">
                    <div class="card-content"></div>
                </ha-card>
            `;
            this.content = this.querySelector('div');
        }

        this.content.innerHTML = `
            <p>The ${entityId} is ${stateStr}.</p>
        `;
    }
}

// Register the card
console.log("Hello World Card: Registering element");
customElements.define('hello-world-card', HelloWorldCard);

// Add to window.customCards
console.log("Hello World Card: Adding to customCards");
if (!window.customCards) {
    window.customCards = [];
}

window.customCards.push({
    type: "custom:hello-world-card",
    name: "Hello World Card",
    description: "A basic test card"
});

console.log("Hello World Card: Script complete"); 