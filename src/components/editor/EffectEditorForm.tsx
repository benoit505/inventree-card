import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import { EffectDefinition, ActionDefinition, DisplayConfigKey, AnimationPreset, VisualEffect, CellDefinition, InventreeItem } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ANIMATION_PRESETS } from '../../core/constants';
import { selectAllActionDefinitionsForInstance } from '../../store/slices/actionsSlice';

const logger = ConditionalLoggerEngine.getInstance().getLogger('EffectEditorForm');
ConditionalLoggerEngine.getInstance().registerCategory('EffectEditorForm', { enabled: false, level: 'info' });

interface EffectEditorFormProps {
  effect: EffectDefinition;
  onUpdate: (updatedEffect: EffectDefinition) => void;
  parts: InventreeItem[];
  cells: CellDefinition[];
}

const EffectEditorForm: React.FC<EffectEditorFormProps> = ({
  effect,
  onUpdate,
  parts,
  cells,
}) => {
  const [effectType, setEffectType] = useState<EffectDefinition['type']>(effect.type);
  const [styleTarget, setStyleTarget] = useState<string>('Row');
  const [styleProperty, setStyleProperty] = useState<keyof CSSProperties | undefined>(undefined);
  const [styleValue, setStyleValue] = useState<any>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [targetDisplayKey, setTargetDisplayKey] = useState<DisplayConfigKey | undefined>(undefined);
  const [animationPreset, setAnimationPreset] = useState<string>('none');
  const [customActionId, setCustomActionId] = useState<string | undefined>(undefined);
  const [selectedPartPk, setSelectedPartPk] = useState<string>('');
  const [selectedCellId, setSelectedCellId] = useState<string>('');
  
  // State for all other effect types
  const [thumbnailFilter, setThumbnailFilter] = useState<string | undefined>();
  const [thumbnailOpacity, setThumbnailOpacity] = useState<number | undefined>();
  const [service, setService] = useState<string | undefined>();
  const [serviceData, setServiceData] = useState<Record<string, any> | undefined>();
  const [layoutProperty, setLayoutProperty] = useState<'w' | 'h' | 'x' | 'y'>('w');
  const [layoutValue, setLayoutValue] = useState<number>(1);

  const layoutColumns = useSelector((state: RootState) => {
    // In the editor, we don't have a single card instance.
    // We'll take the layout from the first available configured card instance.
    const firstInstanceId = Object.keys(state.config.configsByInstance)[0];
    if (firstInstanceId) {
      return state.config.configsByInstance[firstInstanceId].config?.layout?.columns || [];
    }
    return [];
  });
  
  const allActionDefinitions = useSelector((state: RootState) => {
    const firstInstanceId = Object.keys(state.actions.byInstance)[0];
    if (firstInstanceId) {
      return selectAllActionDefinitionsForInstance(state, firstInstanceId);
    }
    return [];
  });
  
  const availableActions = useMemo(() => {
    return allActionDefinitions || [];
  }, [allActionDefinitions]);

  const availablePartsInCells = useMemo(() => {
    if (!cells || !parts) return [];
    const partPksInCells = new Set(cells.map(cell => cell.partPk));
    return parts.filter(part => partPksInCells.has(part.pk));
  }, [cells, parts]);

  const availableCellsForPart = useMemo(() => {
    if (!selectedPartPk || !cells) return [];
    const pk = parseInt(selectedPartPk, 10);
    return cells.filter(cell => cell.partPk === pk);
  }, [selectedPartPk, cells]);
  
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
    setSelectedPartPk('');
    setSelectedCellId('');
    // Reset new state
    setThumbnailFilter(undefined);
    setThumbnailOpacity(undefined);
    setService(undefined);
    setServiceData(undefined);
    setLayoutProperty('w');
    setLayoutValue(1);

    if (effect.type === 'set_style') {
      setStyleTarget(effect.styleTarget || 'Row');
      setStyleProperty(effect.styleProperty as keyof CSSProperties);
      setStyleValue(effect.styleValue);
    } else if (effect.type === 'set_visibility') {
      setIsVisible(effect.isVisible);
      setTargetDisplayKey(effect.targetDisplayKey);
    } else if (effect.type === 'animate_style') {
      setAnimationPreset(effect.preset || 'none');
    } else if (effect.type === 'trigger_custom_action') {
      setCustomActionId(effect.customActionId);
    } else if (effect.type === 'set_thumbnail_style') {
      setThumbnailFilter(effect.thumbnailFilter);
      setThumbnailOpacity(effect.thumbnailOpacity);
    } else if (effect.type === 'call_ha_service') {
      setService(effect.service);
      setServiceData(effect.service_data);
    } else if (effect.type === 'set_layout') {
      setLayoutProperty(effect.layoutProperty);
      setLayoutValue(effect.layoutValue);
    }

    if ('targetCellId' in effect && effect.targetCellId) {
      const targetCell = cells.find(c => c.id === effect.targetCellId);
      if (targetCell) {
        setSelectedPartPk(String(targetCell.partPk));
        setSelectedCellId(targetCell.id);
      }
    }
  }, [effect, cells]);

  // This effect listens to all form state changes and constructs a valid EffectDefinition
  useEffect(() => {
    let updatedEffect: EffectDefinition;

    switch (effectType) {
      case 'set_style':
        updatedEffect = { id: effect.id, type: 'set_style', styleTarget: styleTarget, styleProperty: styleProperty || '', styleValue, targetCellId: selectedCellId || undefined };
        break;
      case 'set_visibility':
        updatedEffect = { id: effect.id, type: 'set_visibility', isVisible, targetDisplayKey, targetCellId: selectedCellId || undefined };
        break;
      case 'animate_style':
        updatedEffect = { id: effect.id, type: 'animate_style', preset: animationPreset, targetCellId: selectedCellId || undefined };
        break;
      case 'trigger_custom_action':
        updatedEffect = { id: effect.id, type: 'trigger_custom_action', customActionId: customActionId || '', targetCellId: selectedCellId || undefined };
        break;
      case 'set_thumbnail_style':
        updatedEffect = { id: effect.id, type: 'set_thumbnail_style', thumbnailFilter, thumbnailOpacity, targetCellId: selectedCellId || undefined };
        break;
      case 'call_ha_service':
        updatedEffect = { id: effect.id, type: 'call_ha_service', service, service_data: serviceData, targetCellId: selectedCellId || undefined };
        break;
      case 'set_layout':
        updatedEffect = { id: effect.id, type: 'set_layout', targetCellId: selectedCellId || '', layoutProperty: layoutProperty || 'w', layoutValue: layoutValue || 1 };
        break;
      default:
        // This should not be reachable if all types are handled, but as a safe fallback:
        updatedEffect = effect;
        break;
    }
    
    // Prevent infinite loops by only calling onUpdate when the generated object differs from the source prop
    if (JSON.stringify(updatedEffect) !== JSON.stringify(effect)) {
      onUpdate(updatedEffect);
    }
  }, [
    effect, onUpdate, effectType, styleTarget, styleProperty, styleValue, 
    isVisible, targetDisplayKey, animationPreset, customActionId, selectedCellId,
    thumbnailFilter, thumbnailOpacity, service, serviceData, layoutProperty, layoutValue
  ]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as EffectDefinition['type'];
    setEffectType(newType);

    // Reset state for other types to defaults
    setStyleTarget('Row');
    setStyleProperty(undefined);
    setStyleValue('');
    setIsVisible(true);
    setTargetDisplayKey(undefined);
    setAnimationPreset('none');
    setCustomActionId(undefined);
    setSelectedPartPk('');
    setSelectedCellId('');
    // Reset new state
    setThumbnailFilter(undefined);
    setThumbnailOpacity(undefined);
    setService(undefined);
    setServiceData(undefined);
    setLayoutProperty('w');
    setLayoutValue(1);
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

  const needsTarget = effect.type === 'animate_style' || effect.type === 'set_visibility' || effect.type === 'trigger_custom_action' || effect.type === 'set_thumbnail_style' || effect.type === 'call_ha_service' || (effect.type === 'set_style' && styleTarget === 'Row');

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
            <select id={`effect-style-target-${effect.id}`} value={styleTarget} onChange={(e) => setStyleTarget(e.target.value)}>
              <option value="Row">Part (Row)</option>
              {cells.map((cell: CellDefinition) => {
                const part = parts.find(p => p.pk === cell.partPk);
                const header = part ? `${part.name} - ${cell.content}` : `Part ${cell.partPk} - ${cell.content}`;
                return <option key={cell.id} value={cell.id}>{header}</option>;
              })}
            </select>
          </div>
          
          {styleTarget === 'Row' ? (
            <select value={styleProperty || ''} onChange={(e) => setStyleProperty(e.target.value as keyof CSSProperties)}>
              <option value="">Select property...</option>
              {rowStylePropertyOptions.map(opt => (
                <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <select value={styleProperty || ''} onChange={(e) => setStyleProperty(e.target.value as keyof CSSProperties)}>
              <option value="">Select property...</option>
              {cellStylePropertyOptions.map(opt => (
                <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
              ))}
            </select>
          )}

          <input type="text" value={styleValue || ''} onChange={(e) => setStyleValue(e.target.value)} placeholder="Value (e.g. red, bold, 1px solid)"/>
        </div>
      )}

      {effectType === 'set_visibility' && (
        <div>
          <label htmlFor={`effect-visible-${effect.id}`} style={{ marginRight: '5px' }}>Is Visible:</label>
          <input
            type="checkbox"
            id={`effect-visible-${effect.id}`}
            checked={isVisible === true}
            onChange={(e) => setIsVisible(e.target.checked)}
          />
        </div>
      )}

      {effectType === 'animate_style' && (
        <div>
          <label htmlFor={`effect-anim-preset-${effect.id}`} style={{ marginRight: '5px' }}>Animation Preset:</label>
          <select 
            id={`effect-anim-preset-${effect.id}`} 
            value={animationPreset}
            onChange={(e) => setAnimationPreset(e.target.value)}
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
            onChange={(e) => setCustomActionId(e.target.value)}
          >
            <option value="">Select an action...</option>
            {availableActions.map((action) => (
              <option key={action.id} value={action.id}>{action.name}</option>
            ))}
          </select>
        </div>
      )}

      {needsTarget && (
        <div style={{ marginTop: '10px' }}>
          <label>Target Cell (optional):</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedPartPk}
              onChange={(e) => {
                setSelectedPartPk(e.target.value);
                setSelectedCellId(''); // Reset cell when part changes
              }}
              style={{ flex: 1 }}
            >
              <option value="">-- Select Part --</option>
              {availablePartsInCells.map(part => (
                <option key={part.pk} value={part.pk}>{part.name}</option>
              ))}
            </select>
            <select
              value={selectedCellId}
              onChange={(e) => setSelectedCellId(e.target.value)}
              disabled={!selectedPartPk}
              style={{ flex: 1 }}
            >
              <option value="">-- Select Cell --</option>
              {availableCellsForPart.map(cell => {
                const part = parts.find(p => p.pk === cell.partPk);
                const header = part ? `${part.name} - ${cell.content}` : `Part ${cell.partPk} - ${cell.content}`;
                return <option key={cell.id} value={cell.id}>{header}</option>;
              })}
            </select>
          </div>
          <p style={{ fontSize: '0.8em', color: 'gray', margin: '2px 0 0 0' }}>
            Overrides the part that triggered the rule. Leave blank to target the triggering part.
          </p>
        </div>
      )}
    </div>
  );
};

export default EffectEditorForm; 