import React from 'react';
import { DisplayConfig, ConditionalLogicItem } from '../../types';
interface ElementVisibilitySectionProps {
    displayConfig?: Partial<DisplayConfig>;
    onDisplayConfigChanged: (newDisplayConfig: Partial<DisplayConfig>) => void;
    definedLogics: ConditionalLogicItem[];
}
declare const ElementVisibilitySection: React.FC<ElementVisibilitySectionProps>;
export default ElementVisibilitySection;
