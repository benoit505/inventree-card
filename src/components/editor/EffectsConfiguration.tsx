import React from 'react';
import { EffectDefinition, InventreeItem, CellDefinition } from '../../types';
import EffectEditorForm from './EffectEditorForm';

interface EffectsConfigurationProps {
  effects: EffectDefinition[];
  logicBlockId: string;
  onAddEffect: () => void;
  onUpdateEffect: (updatedEffect: EffectDefinition) => void;
  onRemoveEffect: (effectId: string) => void;
  parts: InventreeItem[];
  cells: CellDefinition[];
}

const EffectsConfiguration: React.FC<EffectsConfigurationProps> = ({
  effects,
  logicBlockId,
  onAddEffect,
  onUpdateEffect,
  onRemoveEffect,
  parts,
  cells,
}) => {
  return (
    <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
      {/* Removed h4 and initial text, assuming parent (ConditionalLogicSection) handles this title */}
      {effects.length === 0 && <p style={{fontSize: '0.9em', color: 'gray'}}>No effects defined for this block yet. Click "+ Add Effect" to create one.</p>}
      {effects.map((effect, index) => (
        <div key={`${logicBlockId}-effect-${effect.id || index}`} style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #ccc', borderRadius: '4px' }}>
          <EffectEditorForm
            effect={effect}
            onUpdate={(updatedEffect) => onUpdateEffect(updatedEffect)}
            parts={parts}
            cells={cells}
          />
          <button 
            onClick={() => onRemoveEffect(effect.id)} 
            style={{
              marginTop: '10px', 
              color: 'red', 
              background: 'none', 
              border: '1px solid red', 
              borderRadius: '4px', 
              padding: '3px 8px', 
              cursor: 'pointer'
            }}
          >
            Remove This Effect
          </button>
        </div>
      ))}
      <button 
        onClick={() => onAddEffect()} 
        style={{
          marginTop: '10px', 
          padding: '5px 10px', 
          border: '1px solid #007bff', 
          background: '#007bff', 
          color: 'white', 
          borderRadius: '4px', 
          cursor: 'pointer'
        }}
      >
        + Add Effect
      </button>
    </div>
  );
};

export default EffectsConfiguration; 