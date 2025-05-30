import React from 'react';
import { EffectDefinition } from '../../types';
interface EffectsConfigurationProps {
    effects: EffectDefinition[];
    logicBlockId: string;
    onAddEffect: (logicBlockId: string) => void;
    onUpdateEffect: (logicBlockId: string, updatedEffect: EffectDefinition) => void;
    onRemoveEffect: (logicBlockId: string, effectId: string) => void;
}
declare const EffectsConfiguration: React.FC<EffectsConfigurationProps>;
export default EffectsConfiguration;
