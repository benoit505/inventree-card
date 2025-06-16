// console.log('[DEBUG] STEP 2: react-app.tsx executing');

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
  cardInstanceId?: string;
}

export const ReactApp: React.FC<ReactAppProps> = ({ hass, config, cardInstanceId }) => {
  // Log when the component mounts or props change
  React.useEffect(() => {
    logger.log('ReactApp', 'ReactApp component mounted or props updated.', { 
      hasHass: !!hass, 
      hasConfig: !!config, 
      viewType: config?.view_type 
    });
  }, [hass, config]);

  return (
    <Provider store={store}>
      {(!hass || !config) ? (
        <div style={{ padding: '16px', border: '1px dashed red' }}>
          {!hass && <p>Waiting for Home Assistant connection...</p>}
          {!config && <p>Waiting for card configuration...</p>}
        </div>
      ) : (
        <InventreeCard hass={hass} config={config} cardInstanceId={cardInstanceId} />
      )}
    </Provider>
  );
}; 