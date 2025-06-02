import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
interface GlobalActionButtonsProps {
    config?: InventreeCardConfig;
    hass?: HomeAssistant;
}
declare const GlobalActionButtons: React.FC<GlobalActionButtonsProps>;
export default GlobalActionButtons;
