import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store'; // Assuming store is exported from src/store/index.ts
import InventreeCard from './InventreeCard'; // Assuming InventreeCard.tsx is in src/
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from './types';
import { Logger } from './utils/logger';

const logger = Logger.getInstance();

interface ReactAppProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
}

export const ReactApp: React.FC<ReactAppProps> = ({ hass, config }) => {
  // Log when the component mounts or props change
  React.useEffect(() => {
    logger.log('ReactApp', 'ReactApp component mounted or props updated.', { 
      hasHass: !!hass, 
      hasConfig: !!config, 
      viewType: config?.view_type 
    });
  }, [hass, config]);

  if (!hass || !config) {
    logger.warn('ReactApp', 'ReactApp rendered without HASS or config. Displaying loading/error.');
    // Display a loading or error state, perhaps based on which prop is missing
    return (
      <div style={{ padding: '16px', border: '1px dashed red' }}>
        { !hass && <p>Waiting for Home Assistant connection...</p> }
        { !config && <p>Waiting for card configuration...</p> }
      </div>
    );
  }

  // Render the main card component within the Redux Provider
  return (
    <Provider store={store}>
      <InventreeCard hass={hass} config={config} />
    </Provider>
  );
}; 