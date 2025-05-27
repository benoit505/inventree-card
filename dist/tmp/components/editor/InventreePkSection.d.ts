import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface InventreePkSectionProps {
    hass?: HomeAssistant;
    selectedPks: number[];
    onPksChanged: (newPks: number[]) => void;
}
declare const InventreePkSection: React.FC<InventreePkSectionProps>;
export default InventreePkSection;
