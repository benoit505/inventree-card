import React from 'react';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
interface InventreeCardProps {
    hass: HomeAssistant;
    config: LovelaceCardConfig;
    cardInstanceId?: string;
}
declare const InventreeCard: React.FC<InventreeCardProps>;
export default InventreeCard;
