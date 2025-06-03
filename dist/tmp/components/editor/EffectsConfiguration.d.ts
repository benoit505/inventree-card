import React from 'react';
import { EffectDefinition } from '../../types';
interface EffectsConfigurationProps {
    effects: EffectDefinition[];
    logicBlockId: string;
    onAddEffect: () => void;
    onUpdateEffect: (updatedEffect: EffectDefinition) => void;
    onRemoveEffect: (effectId: string) => void;
}
declare const EffectsConfiguration: React.FC<EffectsConfigurationProps>;
export default EffectsConfiguration;
