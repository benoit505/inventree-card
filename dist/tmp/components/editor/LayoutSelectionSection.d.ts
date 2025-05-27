import React from 'react';
import { ViewType } from '../../types';
export interface LayoutOptions {
    columns?: number | undefined;
    grid_spacing?: number | undefined;
    item_height?: number | undefined;
}
interface LayoutSelectionSectionProps {
    viewType?: ViewType;
    layoutOptions?: LayoutOptions;
    onLayoutConfigChanged: (newViewType: ViewType, newLayoutOptions: LayoutOptions) => void;
}
declare const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps>;
export default LayoutSelectionSection;
