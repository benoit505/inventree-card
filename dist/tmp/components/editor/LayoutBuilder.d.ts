import React from 'react';
import { LayoutConfig, ActionDefinition } from '../../types';
interface LayoutBuilderProps {
    layoutConfig: LayoutConfig;
    onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
    actions: ActionDefinition[];
}
declare const LayoutBuilder: React.FC<LayoutBuilderProps>;
export default LayoutBuilder;
