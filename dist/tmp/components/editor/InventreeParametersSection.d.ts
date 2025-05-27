import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface InventreeParametersSectionProps {
    hass?: HomeAssistant;
    selectedParameters: string[];
    onParametersChanged: (newParameters: string[]) => void;
}
declare const InventreeParametersSection: React.FC<InventreeParametersSectionProps>;
export default InventreeParametersSection;
