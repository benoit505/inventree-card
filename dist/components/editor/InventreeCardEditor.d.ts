import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
interface InventreeCardEditorProps {
    hass: HomeAssistant;
    config: InventreeCardConfig;
    onConfigChanged: (newConfig: InventreeCardConfig) => void;
}
declare const InventreeCardEditor: React.FC<InventreeCardEditorProps>;
export default InventreeCardEditor;
