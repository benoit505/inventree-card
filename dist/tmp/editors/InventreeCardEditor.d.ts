import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../types';
export declare const REACT_EDITOR_NAME = "inventree-card-react-editor";
interface InventreeCardEditorProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    onConfigChanged: (config: InventreeCardConfig) => void;
}
declare const InventreeCardEditor: React.FC<InventreeCardEditorProps>;
export default InventreeCardEditor;
