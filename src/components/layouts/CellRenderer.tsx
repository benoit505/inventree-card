import React, { useCallback, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { get } from 'lodash';
import { useAppSelector, RootState } from '../../store';
import { selectVisualEffectForPart, selectVisualEffectsForCell } from '../../store/slices/visualEffectsSlice';
import { selectAllPartsForInstance } from '../../store/slices/partsSlice';
import { ActionDefinition, CellDefinition, InventreeItem, ButtonCellItem } from '../../types';
import { ActionEngine } from '../../services/ActionEngine';
import { useTheme } from '../../hooks/useTheme';
import { adjustStockDebounced } from '../../store/thunks/stockThunks';
import { useAppDispatch } from '../../store';

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
  
  // 🎚️ Slider mode state (for precise stock adjustments)
  const [isSliderMode, setIsSliderMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  const dispatch = useAppDispatch();
  const part = useAppSelector((state: RootState) => selectAllPartsForInstance(state, cardInstanceId).find((p: InventreeItem) => p.pk === partPk));
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

  // FIXED: Apply cellStyles from set_style effects!
  // cellStyles contains dynamic styles like { backgroundColor: 'red', color: 'blue', etc. }
  const dynamicCellStyles = visualEffects.cellStyles?.[cell.id] || {};

  const cellStyle: React.CSSProperties = {
    // Base styles with theme defaults
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
    // FIXED: Apply dynamic styles from set_style effects (these override defaults!)
    ...dynamicCellStyles,
  };

  // 🚌 Stock adjustment handler with debounced batching and eventual consistency
  const handleStockAdjustment = useCallback((delta: number) => {
    if (!part) return;
    
    // Dispatch the debounced thunk - it handles:
    // 1. Immediate optimistic UI update
    // 2. Batching multiple clicks into one API call
    // 3. Eventual consistency verification via WebSocket
    dispatch(adjustStockDebounced({
      partId: part.pk,
      delta,
      cardInstanceId
    }));
  }, [part, dispatch, cardInstanceId]);

  const renderContent = () => {
    switch (cell.content) {
      case 'thumbnail':
        return <img src={part.thumbnail || ''} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
      case 'in_stock':
        // STOCK CELL WITH +/- BUTTONS AND SLIDER MODE!
        const stockValue = part.in_stock || 0;
        
        // 🎯 Custom portion amounts (for consumables like coffee!)
        const decrementAmount = Math.abs(cell.decrementAmount || 1);
        const incrementAmount = Math.abs(cell.incrementAmount || 1);
        const stockUnit = cell.stockUnit || '';
        
        // 🎚️ Slider settings
        const sliderMin = cell.sliderMin ?? 0;
        const sliderMax = cell.sliderMax ?? 1000;
        const sliderStep = cell.sliderStep ?? 1;
        
        // 🎚️ SLIDER MODE: Render slider UI for precise adjustments
        if (isSliderMode) {
          return (
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '8px',
              gap: '8px'
            }}>
              {/* Current Value Display */}
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2196F3' }}>
                {sliderValue}{stockUnit}
              </div>
              
              {/* Slider */}
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="no-drag"
                style={{
                  width: '80%',
                  cursor: 'pointer',
                  accentColor: '#2196F3'
                }}
              />
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Confirm Button */}
                <button
                  className="no-drag"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Calculate delta from current stock to slider value
                    const delta = sliderValue - stockValue;
                    if (delta !== 0) {
                      handleStockAdjustment(delta);
                    }
                    setIsSliderMode(false);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  title="Confirm stock amount"
                >
                  ✓
                </button>
                
                {/* Cancel Button */}
                <button
                  className="no-drag"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSliderMode(false);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#9E9E9E',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        }
        
        // 🔢 NORMAL MODE: Render +/- buttons
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* MINUS BUTTON (Left) */}
            <button
              className="no-drag"
              onClick={(e) => {
                e.stopPropagation();
                handleStockAdjustment(-decrementAmount);
              }}
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(244, 67, 54, 0.9)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'all 0.2s',
                zIndex: 10,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
              title={`Decrease stock by ${decrementAmount}${stockUnit}`}
            >
              −
            </button>
            
            {/* STOCK VALUE (Center) - Now with unit and edit button */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '2px'
            }}>
              <div style={{ fontSize: '1.2em', fontWeight: 'bold', userSelect: 'none' }}>
                {stockValue}{stockUnit}
              </div>
              
              {/* Edit Button for Slider Mode */}
              <button
                className="no-drag"
                onClick={(e) => {
                  e.stopPropagation();
                  setSliderValue(stockValue); // Initialize slider with current value
                  setIsSliderMode(true);
                }}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'rgba(33, 150, 243, 0.8)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
                title="Open slider to set exact amount"
              >
                📊 Edit
              </button>
            </div>
            
            {/* PLUS BUTTON (Right) */}
            <button
              className="no-drag"
              onClick={(e) => {
                e.stopPropagation();
                handleStockAdjustment(+incrementAmount);
              }}
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(76, 175, 80, 0.9)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'all 0.2s',
                zIndex: 10,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
              title={`Increase stock by ${incrementAmount}${stockUnit}`}
            >
              +
            </button>
          </div>
        );
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