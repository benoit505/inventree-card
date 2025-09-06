import React from 'react';
import { EffectDefinition, CellDefinition, InventreeItem } from '../../types';
interface EffectEditorFormProps {
    effect: EffectDefinition;
    onUpdate: (updatedEffect: EffectDefinition) => void;
    parts: InventreeItem[];
    cells: CellDefinition[];
}
declare const EffectEditorForm: React.FC<EffectEditorFormProps>;
export default EffectEditorForm;
