import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig } from '../../types';
interface PartButtonsProps {
    partItem?: InventreeItem;
    config?: InventreeCardConfig;
    hass?: HomeAssistant;
}
declare const PartButtons: React.FC<PartButtonsProps>;
export default PartButtons;
