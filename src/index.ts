import { CARD_NAME, CARD_TYPE } from './core/constants';
import { InventreeCard } from './inventree-card';

console.info('InvenTree Card: Starting registration...');

// Only register if not already registered
if (!customElements.get(CARD_NAME)) {
    console.info(`InvenTree Card: Registering ${CARD_NAME}`);
    customElements.define(CARD_NAME, InventreeCard);
}

// Register in HACS
window.customCards = window.customCards || [];
window.customCards.push({
    type: CARD_TYPE,
    name: "InvenTree Card",
    description: "Display and manage InvenTree inventory",
    preview: true
});

console.info('InvenTree Card: Registration complete');

// Export for external use
export * from './inventree-card';
export * from './core/types';
export * from './core/settings';
export * from './editors/editor'; 