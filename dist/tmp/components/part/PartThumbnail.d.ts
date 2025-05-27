import * as React from 'react';
import { InventreeItem, InventreeCardConfig } from '../../types';
interface PartThumbnailProps {
    partData?: InventreeItem;
    config?: InventreeCardConfig;
    layout?: 'grid' | 'list' | 'detail';
    icon?: string;
    badge?: string | number;
}
declare const PartThumbnail: React.FC<PartThumbnailProps>;
export default PartThumbnail;
