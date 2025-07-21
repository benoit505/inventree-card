import React from 'react';
import { LayoutColumn, ActionDefinition } from '../../types';
interface LayoutBuilderProps {
    columns: LayoutColumn[];
    onColumnsChanged: (newColumns: LayoutColumn[]) => void;
    actions: ActionDefinition[];
}
declare const LayoutBuilder: React.FC<LayoutBuilderProps>;
export default LayoutBuilder;
