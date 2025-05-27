import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface HaEntitiesSectionProps {
    hass: HomeAssistant;
    selectedEntities: string[];
    onEntitiesChanged: (newEntities: string[]) => void;
}
declare const HaEntitiesSection: React.FC<HaEntitiesSectionProps>;
export default HaEntitiesSection;
