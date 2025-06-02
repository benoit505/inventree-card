import React from 'react';
import { InventreeItem, InventreeCardConfig } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
interface PartThumbnailProps {
    partData?: InventreeItem;
    config?: InventreeCardConfig;
    layout?: 'grid' | 'list' | 'detail';
    icon?: string;
    badge?: string | number;
    visualEffect?: VisualEffect;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}
declare const PartThumbnail: React.FC<PartThumbnailProps>;
export default PartThumbnail;
