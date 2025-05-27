import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface InventreeHassSensorsSectionProps {
    hass: HomeAssistant;
    selectedSensors: string[];
    onSensorsChanged: (newSensors: string[]) => void;
}
declare const InventreeHassSensorsSection: React.FC<InventreeHassSensorsSectionProps>;
export default InventreeHassSensorsSection;
