import React from 'react';
import { InteractionsConfig } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
interface InteractionsConfigSectionProps {
    hass: HomeAssistant;
    interactionsConfig?: InteractionsConfig;
    onInteractionsConfigChanged: (newInteractionsConfig: InteractionsConfig) => void;
}
declare const InteractionsConfigSection: React.FC<InteractionsConfigSectionProps>;
export default InteractionsConfigSection;
