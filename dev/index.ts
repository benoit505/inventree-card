import { InventreeCard, CARD_NAME } from './components/card';
import { InventreeCardEditor } from './editors/editor';
import { mockHass, initialConfig } from './utils/mock-data';
import { InventreeCardConfig } from './types/types';
import './utils/ha-framework';

// Define the custom event type
interface ConfigChangedEvent extends CustomEvent {
    detail: {
        config: InventreeCardConfig;
    };
}

// Keep track of current config with deep copy
let currentConfig = JSON.parse(JSON.stringify(initialConfig));

// Add at the top, after imports
console.log('🔧 Available custom elements:', customElements.get('inventree-card-editor'));

// Initialize when DOM is ready
window.addEventListener('load', () => {
    console.log('🔧 Window loaded, custom elements:', customElements.get('inventree-card-editor'));
    
    // Initialize card
    const cardElement = document.createElement(CARD_NAME) as InventreeCard;
    cardElement.setConfig(currentConfig);
    cardElement.hass = mockHass;
    document.getElementById('demo')?.appendChild(cardElement);

    // Initialize editor with verification
    console.log('🔧 Creating editor...');
    const editorElement = document.createElement('inventree-card-editor');
    console.log('🔧 Editor created:', {
        element: editorElement,
        constructor: editorElement.constructor.name,
        prototype: Object.getPrototypeOf(editorElement)
    });
    
    editorElement.hass = mockHass;
    
    // Update how we handle the editor configuration
    if (editorElement instanceof InventreeCardEditor) {
        editorElement.setConfig(currentConfig);
        
        editorElement.addEventListener('config-changed', ((ev: Event) => {
            const customEvent = ev as ConfigChangedEvent;
            
            // Create a deep copy of the new config
            currentConfig = JSON.parse(JSON.stringify(customEvent.detail.config));
            
            console.log('Config updated:', currentConfig);
            
            // Update the card with the new config
            cardElement.setConfig(currentConfig);
        }) as EventListener);
    }
    
    document.getElementById('editor')?.appendChild(editorElement);
});

console.info('🎴 InvenTree Card Dev: Registration complete'); 