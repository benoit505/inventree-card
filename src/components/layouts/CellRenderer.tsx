import React, { useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { get } from 'lodash';
import { useAppSelector, RootState } from '../../store';
import { selectVisualEffectForPart, selectVisualEffectsForCell } from '../../store/slices/visualEffectsSlice';
import { selectCombinedParts } from '../../store/slices/partsSlice';
import { ActionDefinition, CellDefinition, InventreeItem, ButtonCellItem } from '../../types';
import { ActionEngine } from '../../services/ActionEngine';
import { useTheme } from '../../hooks/useTheme';

// --- CellRenderer Component ---
interface CellRendererProps {
  cell: CellDefinition; // 🚀 Use the new cell prop
  isSelected: boolean;
  cardInstanceId: string;
}

const itemVariants: Variants = {
  idle: {
    x: 0,
  },
  shaking: (custom: any) => custom?.animate || {},
};

export const CellRenderer: React.FC<CellRendererProps> = ({ cell, isSelected, cardInstanceId }) => {
  // 🚀 Destructure properties from the cell object
  const { partPk, content } = cell;

  const part = useAppSelector((state: RootState) => selectCombinedParts(state, cardInstanceId).find((p) => p.pk === partPk));
  const partVisualEffects = useAppSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId, partPk)) || {};
  const cellVisualEffects = useAppSelector((state: RootState) => selectVisualEffectsForCell(state, cardInstanceId, cell.id)) || {};
  
  // Merge part-wide effects with cell-specific effects, with cell-specific taking precedence
  const visualEffects = { ...partVisualEffects, ...cellVisualEffects };
  
  const config = useAppSelector((state: RootState) => state.config.configsByInstance[cardInstanceId]?.config);
  const { theme, isDark } = useTheme();

  const processButtonLabelTemplate = useCallback((template: string, item?: InventreeItem): string => {
    if (!item) return template;
    return template
      .replace(/%%part\.pk%%/g, String(item.pk))
      .replace(/%%part\.name%%/g, item.name || '');
  }, []);

  if (!part) {
    return <div></div>;
  }

  const animation = visualEffects.animation || {};
  const animationState = animation.animate ? "shaking" : "idle";

  const cellStyle: React.CSSProperties = {
    // 🚀 FIX: visualEffects is already the merged cell-specific effects
    // No need for double-nested lookup with cellStyles[cell.id]
    backgroundColor: visualEffects.highlight || theme.cardBackground,
    color: visualEffects.textColor || theme.primaryText,
    border: isSelected 
      ? '2px solid #3498db' 
      : (visualEffects.border || (config?.layout?.no_borders ? 'none' : `1px solid ${theme.borderColor}`)),
    opacity: visualEffects.opacity,
    boxSizing: 'border-box',
    borderRadius: '12px',
    boxShadow: visualEffects.highlight 
      ? `0 4px 12px ${theme.shadowColor}, 0 0 20px ${visualEffects.highlight}40`
      : `0 2px 8px ${theme.shadowColor}`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  const renderContent = () => {
    switch (cell.content) {
      case 'thumbnail':
        return <img src={part.thumbnail || ''} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
      case 'buttons':
        if (!cell.buttons || cell.buttons.length === 0) {
          return <div>No buttons configured.</div>;
        }
        return (
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {(cell.buttons || []).map((buttonConfig: ButtonCellItem) => {
              const action = config?.actions?.find((a: ActionDefinition) => a.id === buttonConfig.actionId);
              if (!action) return null;

              const targets = buttonConfig.targetPartPks;
              // For button cells not tied to a part, partPk will be 0 or undefined.
              // We only filter by target if the button specifies targets and the cell is for a specific part.
              if (cell.partPk && targets && targets.length > 0 && !targets.includes(cell.partPk)) {
                return null;
              }

              const iconString = buttonConfig.icon ?? action.trigger?.ui?.icon;
              const labelTemplate = buttonConfig.label ?? action.trigger?.ui?.labelTemplate ?? action.name;
              const label = processButtonLabelTemplate(labelTemplate, part);

              // Determine if the button should be disabled by evaluating the expression
              const isEnabled = action.isEnabledExpressionId
                ? ActionEngine.getInstance().evaluateExpression(action.isEnabledExpressionId, { part: part as InventreeItem }, cardInstanceId)
                : true;

              const buttonStyle: React.CSSProperties = {
                border: 'none',
                background: 'transparent',
                cursor: isEnabled ? 'pointer' : 'not-allowed',
                opacity: isEnabled ? 1 : 0.5,
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              };

              return (
                <button 
                  key={`${action.id}-${cell.partPk}`} 
                  className="no-drag" // 🚀 Add cancel selector for react-grid-layout
                  onClick={(e) => { 
                    if (isEnabled) {
                      console.log('Button clicked!', { actionId: action.id, partPk: cell.partPk }); 
                      e.stopPropagation(); 
                      ActionEngine.getInstance().executeAction(action.id, { part: part as InventreeItem }, cardInstanceId); 
                    }
                  }} 
                  title={action.name} 
                  style={buttonStyle}
                  disabled={!isEnabled}
                >
                  {iconString ? (
                    <ha-icon icon={iconString} style={{ color: theme.primaryText }} />
                  ) : (
                    <span>{label}</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      case 'description':
        return <div style={{ padding: '5px', fontSize: '0.9em' }}>{part.description}</div>;
      default:
        return <>{get(part, content, '')}</>;
    }
  };
  
  return (
    <motion.div
      style={cellStyle}
      variants={itemVariants}
      animate={animationState}
      custom={animation}
      transition={animation.transition}
    >
      {renderContent()}
    </motion.div>
  );
}; 