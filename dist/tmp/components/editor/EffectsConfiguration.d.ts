import React from 'react';
import { EffectDefinition, InventreeItem, CellDefinition } from '../../types';
interface EffectsConfigurationProps {
    effects: EffectDefinition[];
    logicBlockId: string;
    onAddEffect: () => void;
    onUpdateEffect: (updatedEffect: EffectDefinition) => void;
    onRemoveEffect: (effectId: string) => void;
    parts: InventreeItem[];
    cells: CellDefinition[];
}
declare const EffectsConfiguration: React.FC<EffectsConfigurationProps>;
export default EffectsConfiguration;
