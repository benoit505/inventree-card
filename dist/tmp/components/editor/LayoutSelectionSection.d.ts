import React from 'react';
import { ActionDefinition, LayoutConfig, InventreeItem } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
interface LayoutSelectionSectionProps {
    layoutConfig: LayoutConfig;
    onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
    actions: ActionDefinition[];
    parts: InventreeItem[];
    cardInstanceId: string;
}
declare const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps>;
export default LayoutSelectionSection;
