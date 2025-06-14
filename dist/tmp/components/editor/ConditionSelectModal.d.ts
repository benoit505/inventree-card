import React from 'react';
import { ConditionalLogicItem } from '../../types';
interface ConditionSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedConditionId?: string) => void;
    availableConditions: ConditionalLogicItem[];
    currentConditionId?: string;
    elementName: string;
}
declare const ConditionSelectModal: React.FC<ConditionSelectModalProps>;
export default ConditionSelectModal;
