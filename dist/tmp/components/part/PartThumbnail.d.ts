import React from 'react';
import { InventreeItem, InventreeCardConfig } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
interface PartThumbnailProps {
    partData?: InventreeItem;
    config?: InventreeCardConfig;
    layout?: 'grid' | 'list' | 'detail' | 'button' | 'default';
    icon?: string;
    badge?: string | number;
    visualModifiers?: VisualEffect;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
    className?: string;
}
declare const PartThumbnail: React.FC<PartThumbnailProps>;
export default PartThumbnail;
