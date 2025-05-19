import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState, AppDispatch } from '../../store';
import { Logger } from '../../utils/logger';
import { InventreeCardConfig } from '../../types'; // Full config from card
import { ConfigState, selectFullConfig, setFullConfig } from '../../store/slices/configSlice'; // Config from our new slice

const logger = Logger.getInstance();

interface InventreeCardEditorProps {
  hass: HomeAssistant;
  config: InventreeCardConfig; // This is the card's raw config object
  onConfigChanged: (newConfig: InventreeCardConfig) => void; // Callback to save changes
}

const InventreeCardEditor: React.FC<InventreeCardEditorProps> = ({ hass, config, onConfigChanged }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select the editor's configuration state from the Redux store
  const editorConfigState = useSelector<RootState, ConfigState>(selectFullConfig);

  useEffect(() => {
    logger.log('InventreeCardEditor', 'Editor component mounted/updated.', { initialCardConfig: config });
    // TODO: When the editor loads, dispatch an action to initialize 
    // the configSlice with the current card config, potentially transforming it.
    // For now, let's imagine a direct dispatch, though transformation will be needed.
    // dispatch(setFullConfig(config as unknown as ConfigState)); // This is a placeholder and needs proper mapping
  }, [config, dispatch]);

  // Placeholder rendering
  return (
    <div style={{ padding: '16px', border: '1px dashed #ccc' }}>
      <h2>InvenTree Card - New React Editor (Scaffolding)</h2>
      <p>This is the placeholder for the new React-based card editor.</p>
      <p>Current view_type from card config: <code>{config.view_type || 'N/A'}</code></p>
      <p>Editor config (from Redux store) view_type: <code>{editorConfigState.presentation.viewType || 'N/A'}</code></p>
      <p><em>Next steps: Implement UI sections for Data Sources, Presentation, etc.</em></p>
      <pre style={{ maxHeight: '200px', overflowY: 'auto', background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify(editorConfigState, null, 2)}
      </pre>
    </div>
  );
};

export default InventreeCardEditor; 