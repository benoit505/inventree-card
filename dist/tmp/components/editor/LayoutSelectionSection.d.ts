import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { LayoutConfig, ActionDefinition } from '../../types';
interface LayoutSelectionSectionProps {
    hass?: HomeAssistant;
    layoutConfig: LayoutConfig;
    onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
    actions: ActionDefinition[];
}
declare const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps>;
export default LayoutSelectionSection;
