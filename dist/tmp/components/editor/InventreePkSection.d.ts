import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface ThumbnailOverride {
    pk: number;
    path: string;
}
interface InventreePkSectionProps {
    hass?: HomeAssistant;
    selectedPks: number[];
    onPksChanged: (newPks: number[]) => void;
    thumbnailOverrides: ThumbnailOverride[];
    onThumbnailOverridesChanged: (newOverrides: ThumbnailOverride[]) => void;
}
declare const InventreePkSection: React.FC<InventreePkSectionProps>;
export default InventreePkSection;
