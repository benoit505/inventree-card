import React from 'react';
import { ActionDefinition, LayoutConfig } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
interface LayoutSelectionSectionProps {
    layoutConfig: LayoutConfig;
    onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
    actions: ActionDefinition[];
}
declare const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps>;
export default LayoutSelectionSection;
