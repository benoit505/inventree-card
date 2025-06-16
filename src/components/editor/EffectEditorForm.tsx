import React, { useState, useEffect, useMemo } from 'react';
import { EffectDefinition, ActionDefinition, DisplayConfigKey, AnimationPreset, LayoutColumn } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { Logger } from '../../utils/logger';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ANIMATION_PRESETS } from '../../core/constants';

const logger = Logger.getInstance();

interface EffectEditorFormProps {
  effect: EffectDefinition;
  onUpdate: (updatedEffect: EffectDefinition) => void;
}

const EffectEditorForm: React.FC<EffectEditorFormProps> = ({
  effect,
  onUpdate,
}) => {
  const [effectType, setEffectType] = useState<EffectDefinition['type']>(effect.type);
  const [styleTarget, setStyleTarget] = useState<string>('Row');
  const [styleProperty, setStyleProperty] = useState<string | undefined>(undefined);
  const [styleValue, setStyleValue] = useState<any>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [targetDisplayKey, setTargetDisplayKey] = useState<DisplayConfigKey | undefined>(undefined);
  const [animationPreset, setAnimationPreset] = useState<string>('none');
  const [customActionId, setCustomActionId] = useState<string | undefined>(undefined);
  const [targetPartPksInput, setTargetPartPksInput] = useState<string>('');
  
  const layoutColumns = useSelector((state: RootState) => {
    // In the editor, we don't have a single card instance.
    // We'll take the layout from the first available configured card instance.
    const firstInstanceId = Object.keys(state.config.configsByInstance)[0];
    if (firstInstanceId) {
      return state.config.configsByInstance[firstInstanceId].config?.layout?.columns || [];
    }
    return [];
  });
  const allActionDefinitions = useSelector((state: RootState) => state.actions.actionDefinitions);
  
  const availableActions = useMemo(() => {
    return Object.values(allActionDefinitions || {});
  }, [allActionDefinitions]);

  const parseTargetPks = (input: string): number[] | 'all_loaded' | undefined => {
    const trimmedInput = input.trim();
    if (trimmedInput.toLowerCase() === 'all_loaded') return 'all_loaded';
    if (trimmedInput === '') return undefined;
    const pks = trimmedInput.split(',').map(pk => parseInt(pk.trim(), 10)).filter(pk => !isNaN(pk));
    return pks.length > 0 ? pks : undefined;
  };
  
  useEffect(() => {
    setEffectType(effect.type);
    
    // Reset all state then set the correct one
    setStyleTarget('Row');
    setStyleProperty(undefined);
    setStyleValue(undefined);
    setIsVisible(true);
    setTargetDisplayKey(undefined);
    setAnimationPreset('none');
    setCustomActionId(undefined);

    if (effect.type === 'set_style') {
      setStyleTarget(effect.styleTarget || 'Row');
      setStyleProperty(effect.styleProperty);
      setStyleValue(effect.styleValue);
    } else if (effect.type === 'set_visibility') {
      setIsVisible(effect.isVisible);
      setTargetDisplayKey(effect.targetDisplayKey);
    } else if (effect.type === 'animate_style') {
      setAnimationPreset(effect.preset || 'none');
    } else if (effect.type === 'trigger_custom_action') {
      setCustomActionId(effect.customActionId);
    }

    if (typeof effect.targetPartPks === 'string') {
      setTargetPartPksInput(effect.targetPartPks);
    } else if (Array.isArray(effect.targetPartPks)) {
      setTargetPartPksInput(effect.targetPartPks.join(', '));
    } else {
      setTargetPartPksInput('');
    }
  }, [effect]);

  const handleUpdate = (update: Partial<EffectDefinition>) => {
    // This is a bit unsafe, but necessary as we build the object incrementally
    const baseEffect = {
        ...effect,
        targetPartPks: parseTargetPks(targetPartPksInput),
    };
    onUpdate({ ...baseEffect, ...update } as EffectDefinition);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as EffectDefinition['type'];
    
    // Create a base new effect with a default state for that type
    let newEffect: EffectDefinition;

    switch (newType) {
      case 'set_style':
        newEffect = { id: effect.id, type: 'set_style', styleTarget: 'Row', styleProperty: '', styleValue: '' };
        break;
      case 'set_visibility':
        newEffect = { id: effect.id, type: 'set_visibility', isVisible: true };
        break;
      case 'animate_style':
        newEffect = { id: effect.id, type: 'animate_style', preset: 'none' };
        break;
      case 'trigger_custom_action':
        newEffect = { id: effect.id, type: 'trigger_custom_action', customActionId: '' };
        break;
      default:
        // Fallback for any unhandled types
        newEffect = { id: effect.id, type: newType } as EffectDefinition;
    }
    
    onUpdate(newEffect);
  };
  
  const rowStylePropertyOptions: { value: keyof VisualEffect, label: string }[] = [
    { value: 'highlight', label: 'Highlight Color' },
    { value: 'textColor', label: 'Text Color' },
    { value: 'border', label: 'Border Style' },
    { value: 'icon', label: 'Icon (MDI)' },
    { value: 'badge', label: 'Badge Text' },
    { value: 'opacity', label: 'Opacity (0-1)' },
  ];

  const cellStylePropertyOptions: { value: string, label: string }[] = [
    { value: 'backgroundColor', label: 'Background Color' },
    { value: 'color', label: 'Text Color' },
    { value: 'fontWeight', label: 'Font Weight (e.g., bold)' },
    { value: 'fontStyle', label: 'Font Style (e.g., italic)' },
    { value: 'textAlign', label: 'Text Align (e.g., center)' },
    { value: 'textDecoration', label: 'Text Decoration (e.g., underline)' },
    { value: 'opacity', label: 'Opacity (0-1)' },
    { value: 'border', label: 'Border (e.g., 1px solid red)' },
    { value: 'borderRadius', label: 'Border Radius (e.g., 4px)' },
    { value: 'padding', label: 'Padding (e.g., 8px)' },
  ];

  const displayConfigKeyOptions: Array<{ value: DisplayConfigKey; label: string }> = [
    { value: 'show_header', label: 'Show Header' },
    { value: 'show_image', label: 'Show Image' },
    // Add other display keys as needed
  ];

  return (
    <div className="effect-editor-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor={`effect-type-${effect.id}`} style={{ flexShrink: 0 }}>Effect Type:</label>
        <select id={`effect-type-${effect.id}`} value={effectType} onChange={handleTypeChange} style={{flexGrow: 1}}>
          <option value="set_style">Set Style</option>
          <option value="set_visibility">Set Visibility</option>
          <option value="animate_style">Animate Style</option>
          <option value="trigger_custom_action">Trigger Custom Action</option>
        </select>
      </div>

      {effectType === 'set_style' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <div>
            <label htmlFor={`effect-style-target-${effect.id}`} style={{ marginRight: '5px' }}>Style Target:</label>
            <select id={`effect-style-target-${effect.id}`} value={styleTarget} onChange={(e) => handleUpdate({ type: 'set_style', styleTarget: e.target.value })}>
              <option value="Row">Row</option>
              {layoutColumns.map((col: LayoutColumn) => (
                <option key={col.id} value={col.id}>{col.header || `(Column: ${col.content})`}</option>
              ))}
            </select>
          </div>
          
          {styleTarget === 'Row' ? (
            <select value={styleProperty} onChange={(e) => handleUpdate({ type: 'set_style', styleProperty: e.target.value })}>
              <option value="">Select property...</option>
              {rowStylePropertyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <select value={styleProperty || ''} onChange={(e) => handleUpdate({ type: 'set_style', styleProperty: e.target.value })}>
              <option value="">Select property...</option>
              {cellStylePropertyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          <input type="text" value={styleValue || ''} onChange={(e) => handleUpdate({ type: 'set_style', styleValue: e.target.value })} placeholder="Value (e.g. red, bold, 1px solid)"/>
        </div>
      )}

      {effectType === 'set_visibility' && (
        <div>
          <label htmlFor={`effect-visible-${effect.id}`} style={{ marginRight: '5px' }}>Is Visible:</label>
          <input
            type="checkbox"
            id={`effect-visible-${effect.id}`}
            checked={isVisible === true}
            onChange={(e) => handleUpdate({ type: 'set_visibility', isVisible: e.target.checked })}
          />
        </div>
      )}

      {effectType === 'animate_style' && (
        <div>
          <label htmlFor={`effect-anim-preset-${effect.id}`} style={{ marginRight: '5px' }}>Animation Preset:</label>
          <select 
            id={`effect-anim-preset-${effect.id}`} 
            value={animationPreset}
            onChange={(e) => handleUpdate({ type: 'animate_style', preset: e.target.value })}
          >
            <option value="none">None</option>
            {Object.values(ANIMATION_PRESETS).map((preset: AnimationPreset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name.charAt(0).toUpperCase() + preset.name.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {effectType === 'trigger_custom_action' && (
        <div>
          <label htmlFor={`effect-custom-action-${effect.id}`} style={{ marginRight: '5px' }}>Action:</label>
          <select
            id={`effect-custom-action-${effect.id}`}
            value={customActionId || ''}
            onChange={(e) => handleUpdate({ type: 'trigger_custom_action', customActionId: e.target.value })}
          >
            <option value="">Select an action...</option>
            {availableActions.map((action: ActionDefinition) => (
              <option key={action.id} value={action.id}>{action.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <label htmlFor={`effect-target-pks-${effect.id}`} style={{ marginRight: '5px' }}>Target Part PKs (optional):</label>
        <input
          type="text"
          id={`effect-target-pks-${effect.id}`}
          value={targetPartPksInput}
          onChange={(e) => setTargetPartPksInput(e.target.value)}
          onBlur={(e) => onUpdate({ ...effect, targetPartPks: parseTargetPks(e.target.value) })}
          placeholder="e.g., 1, 2, 3 or 'all_loaded'"
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        <p style={{ fontSize: '0.8em', color: 'gray', margin: '2px 0 0 0' }}>
          Overrides the part that triggered the rule. Leave blank to target the triggering part.
        </p>
      </div>
    </div>
  );
};

export default EffectEditorForm; 