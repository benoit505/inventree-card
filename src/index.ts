// Polyfill for process.env to make Redux/Immer work properly in the browser
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: { NODE_ENV: 'production' } };
}

// Import core dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Logger } from './utils/logger';
import { CacheService } from './services/cache';
import { safelyRegisterElement } from './utils/custom-element-registry';

// Import constants
import { CARD_NAME, CARD_TYPE, EDITOR_NAME } from './core/constants';

// Import the React Root component
import { ReactApp } from './react-app';

// Import the LitElement wrapper class (implementation will change later)
import { InventreeCard } from './inventree-card';

// Initialize logger first for better debugging
const logger = Logger.getInstance();

logger.info('Index', 'Starting React module initialization', { 
  category: 'initialization', 
  subsystem: 'index' 
});

// Import services (keep if they are used globally or by middleware)
// import { CardController } from './services/card-controller';
// import { WebSocketPlugin } from './services/websocket-plugin';
// import { WebSocketService } from './services/websocket';

// Import Redux store (needed for Provider in ReactApp)
import { store } from './store';

// Import types directly to re-export them (keep if needed elsewhere)
// import type {
//   InventreeCardConfig,
//   InventreeItem,
//   ParameterCondition,
//   ParameterAction,
//   VisualModifiers
// } from './core/types';

// Ensure Redux store is available
logger.info('Index', 'Redux store initialized', { category: 'initialization', subsystem: 'redux' });

// Register the Lit wrapper component (which will render React)
try {
  safelyRegisterElement(CARD_TYPE, InventreeCard); 
  logger.info('Index', `Registering main wrapper component: ${CARD_TYPE}`, {
    category: 'initialization',
    subsystem: 'components'
  });
} catch (error) {
  logger.error('Index', `Error registering main wrapper component: ${error}`, {
    category: 'initialization',
    subsystem: 'components'
  });
}

// Register in HACS - this is important for Home Assistant to recognize the card
window.customCards = window.customCards || [];
window.customCards.push({
    type: CARD_TYPE,
    name: "InvenTree Card",
    description: "Display and manage InvenTree inventory (React Version)",
    preview: true
});

logger.info('Index', 'Card registration complete', { category: 'initialization', subsystem: 'card' });

logger.info('Index', 'React Module initialization complete', { category: 'initialization', subsystem: 'index' });