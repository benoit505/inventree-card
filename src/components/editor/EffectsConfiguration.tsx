import React from 'react';
import { EffectDefinition } from '../../types'; // Corrected path again
import EffectEditorForm from './EffectEditorForm'; // UNCOMMENTED

interface EffectsConfigurationProps {
  effects: EffectDefinition[];
  logicBlockId: string; // To ensure unique keys for effects within this block
  onAddEffect: (logicBlockId: string) => void;
  onUpdateEffect: (logicBlockId: string, updatedEffect: EffectDefinition) => void;
  onRemoveEffect: (logicBlockId: string, effectId: string) => void;
}

const EffectsConfiguration: React.FC<EffectsConfigurationProps> = ({
  effects,
  logicBlockId,
  onAddEffect,
  onUpdateEffect,
  onRemoveEffect,
}) => {
  return (
    <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
      {/* Removed h4 and initial text, assuming parent (ConditionalLogicSection) handles this title */}
      {effects.length === 0 && <p style={{fontSize: '0.9em', color: 'gray'}}>No effects defined for this block yet. Click "+ Add Effect" to create one.</p>}
      {effects.map((effect, index) => (
        <div key={effect.id || `effect-${index}`} style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #ccc', borderRadius: '4px' }}>
          <EffectEditorForm
            effect={effect}
            onUpdate={(updatedEffect) => onUpdateEffect(logicBlockId, updatedEffect)}
            // onRemove is handled by the button below for now, but EffectEditorForm could have its own remove if needed
          />
          <button 
            onClick={() => onRemoveEffect(logicBlockId, effect.id)} 
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
        onClick={() => onAddEffect(logicBlockId)} 
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