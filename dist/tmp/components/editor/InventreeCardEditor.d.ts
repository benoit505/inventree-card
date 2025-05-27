import React from 'react';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
export interface InventreeCardEditorProps {
    hass: HomeAssistant;
    lovelace?: LovelaceCardEditor;
    config?: InventreeCardConfig;
    onConfigChanged: (config: InventreeCardConfig) => void;
}
declare const InventreeCardEditor: React.FC<InventreeCardEditorProps>;
export default InventreeCardEditor;
