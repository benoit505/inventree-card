import React from 'react';
import { DisplayConfig } from '../../types';
interface ElementVisibilitySectionProps {
    displayConfig?: Partial<DisplayConfig>;
    onDisplayConfigChanged: (newDisplayConfig: DisplayConfig) => void;
}
declare const ElementVisibilitySection: React.FC<ElementVisibilitySectionProps>;
export default ElementVisibilitySection;
