import React from 'react';
import { EffectDefinition } from '../../types';
interface EffectEditorFormProps {
    effect: EffectDefinition;
    onUpdate: (updatedEffect: EffectDefinition) => void;
}
declare const EffectEditorForm: React.FC<EffectEditorFormProps>;
export default EffectEditorForm;
