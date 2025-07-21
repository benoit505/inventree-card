// console.log('[DEBUG] STEP 2: react-app.tsx executing');

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store'; // Assuming store is exported from src/store/index.ts
import InventreeCard from './InventreeCard'; // Assuming InventreeCard.tsx is in src/
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from './types';
import { ActionEngine } from './services/ActionEngine';

interface ReactAppProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  cardInstanceId?: string;
}

const AppContent: React.FC<ReactAppProps> = ({ hass, config, cardInstanceId }) => {
  // This effect is crucial for connecting the ActionEngine to Home Assistant
  useEffect(() => {
    if (hass) {
      console.log('%c[ReactApp] Setting HASS object on ActionEngine', 'color: #16A085; font-weight: bold;');
      ActionEngine.getInstance().setHomeAssistant(hass);
    }
  }, [hass]);

  return (
    <>
      {(!hass || !config) ? (
        <div style={{ padding: '16px', border: '1px dashed red' }}>
          {!hass && <p>Waiting for Home Assistant connection...</p>}
          {!config && <p>Waiting for card configuration...</p>}
        </div>
      ) : (
        <InventreeCard hass={hass} config={config} cardInstanceId={cardInstanceId} />
      )}
    </>
  );
};

export const ReactApp: React.FC<ReactAppProps> = (props) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent {...props} />
      </PersistGate>
    </Provider>
  );
}; 