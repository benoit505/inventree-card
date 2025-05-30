import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualModifiers, ParameterCondition, ProcessedVariant } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';
import { VariantHandler } from '../common/variant-handler';
import PartView from '../part/PartView';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';

interface VariantLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[]; // Raw parts array
}

// --- Style Helpers (Consider moving to a shared util if used across more layouts) ---
const getVariantItemContainerStyle = (modifiers?: VisualModifiers, isGroupHeader?: boolean): React.CSSProperties => {
  const styles: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    padding: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
  };
  if (isGroupHeader) {
    styles.backgroundColor = '#f5f5f5'; // Slightly different background for group headers
  }
  if (modifiers?.highlight) styles.backgroundColor = modifiers.highlight;
  if (modifiers?.border) styles.border = `2px solid ${modifiers.border}`;
  return styles;
};

const getVariantItemTextStyle = (modifiers?: VisualModifiers): React.CSSProperties => {
  if (!modifiers || !modifiers.textColor) return {};
  return { color: modifiers.textColor };
};

const VariantLayout: React.FC<VariantLayoutProps> = ({ hass, config, parts }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const fullState = useSelector((state: RootState) => state);

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const parameterConfigFromProps = useMemo(() => config?.parameters, [config]);
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.parameterLoadingStatus || {});

  const [processedVariants, setProcessedVariants] = useState<(InventreeItem | ProcessedVariant)[]>([]);
  const [selectedVariantGroupKey, setSelectedVariantGroupKey] = useState<string | null>(null); // For dropdown/tabs: key might be template PK
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set()); // For tree view: set of template PKs

  // --- Process Variants --- 
  useEffect(() => {
    if (config && parts) {
      logger.log('VariantLayout React', 'useEffect[parts, config] - Processing variants', { numParts: parts.length });
      // Ensure VariantHandler.processItems is available and correctly typed for React usage
      const newProcessed = VariantHandler.processItems(parts, config);
      setProcessedVariants(newProcessed);
    } else {
      setProcessedVariants([]);
    }
  }, [parts, config, logger]);

  // --- Calculate Required Part IDs ---
  const getReferencedPartIdsFromConditions = useCallback((conditions?: ParameterCondition[]): number[] => {
    if (!conditions) return [];
    const ids = new Set<number>();
    const conditionRegex = /^part:(\d+):/;
    conditions.forEach(condition => {
        if(typeof condition.parameter === 'string') {
            const match = condition.parameter.match(conditionRegex);
            if (match && match[1]) ids.add(parseInt(match[1], 10));
        }
    });
    return Array.from(ids);
  }, []);

  // --- Filter Visible Items ---
  const visibleItems = useMemo(() => {
    if (!config?.parameters?.enabled && !config?.conditional_logic) {
      return processedVariants;
    }
    return processedVariants.filter(item => {
      const partToCheckId = VariantHandler.isVariant(item) ? item.template.pk : item.pk;
      const effect = selectVisualEffectForPart(fullState, partToCheckId) as VisualModifiers | undefined;
      return effect?.isVisible !== false;
    });
  }, [processedVariants, config?.parameters, config?.conditional_logic, fullState]);

  // --- Event Handlers ---
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; }, []);
  const handleLocateItem = useCallback((partId: number) => {
    if (hass) {
      dispatch(locatePartById({ partId, hass }));
    }
  }, [dispatch, hass]);
  const handleParameterAction = useCallback((partId: number, action: ParameterAction) => { 
    logger.warn('VariantLayout Action', 'handleParameterAction called (needs review for RTK Query integration)', { data: { partId, action } });
  }, [dispatch, logger]);
  const handleToggleGroup = useCallback((groupPk: number) => {
    setExpandedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(groupPk)) newSet.delete(groupPk);
        else newSet.add(groupPk);
        return newSet;
    });
  }, []);

  // --- Render Helper for a single part (template or variant) ---
  const renderPartItem = useCallback((part: InventreeItem, isVariantInGroup: boolean = false, isGroupHeader: boolean = false) => {
    const partId = part.pk;
    const visualModifiers = (selectVisualEffectForPart(fullState, partId) as VisualModifiers | undefined) || {};
    const isCurrentlyLocating = locatingPartId === partId;

    const baseDisplayConfig = config?.display || {};
    const itemDisplayConfig = { ...baseDisplayConfig };

    if (isGroupHeader) {
      itemDisplayConfig.show_buttons = false;
      itemDisplayConfig.show_part_details_component = false; 
      itemDisplayConfig.show_stock_status_border = baseDisplayConfig.show_stock_status_border_for_templates !== false; 
    } else if (isVariantInGroup) {
      itemDisplayConfig.show_buttons = baseDisplayConfig.show_buttons_for_variants !== undefined ? baseDisplayConfig.show_buttons_for_variants : false;
      itemDisplayConfig.show_part_details_component = baseDisplayConfig.show_part_details_component_for_variants !== undefined ? baseDisplayConfig.show_part_details_component_for_variants : false;
      itemDisplayConfig.show_image = baseDisplayConfig.show_image_for_variants !== undefined ? baseDisplayConfig.show_image_for_variants : true;
      itemDisplayConfig.show_stock = baseDisplayConfig.show_stock_for_variants !== undefined ? baseDisplayConfig.show_stock_for_variants : true;
      itemDisplayConfig.show_name = baseDisplayConfig.show_name_for_variants !== undefined ? baseDisplayConfig.show_name_for_variants : true;
    }

    const itemConfig = {
      ...config,
      display: itemDisplayConfig,
    } as InventreeCardConfig;

    const itemContainerStyleToUse = getVariantItemContainerStyle(visualModifiers, isGroupHeader);

    return (
      <div 
        key={partId} 
        className={`variant-part-item ${isVariantInGroup ? 'variant-member' : ''} ${isGroupHeader ? 'group-header' : ''}`}
        style={itemContainerStyleToUse}
        onClick={() => !isGroupHeader && handleLocateItem(partId)}
      >
        <PartView partId={partId} config={itemConfig} hass={hass} />
        {isCurrentlyLocating && <div className="locating-indicator" style={{ marginTop: '5px', textAlign:'center', color:'blue' }}>Locating...</div>}
      </div>
    );
  }, [config, hass, fullState, locatingPartId, handleLocateItem]);

  // --- Main Render Logic ---
  if (!config) return <div className="variant-layout loading"><p>Loading config...</p></div>;
  if (!processedVariants || processedVariants.length === 0) return <div className="variant-layout no-variants"><p>No parts or variants to display.</p></div>;
  if (visibleItems.length === 0 && processedVariants.length > 0) return <div className="variant-layout no-variants"><p>All items filtered out.</p></div>;
  
  const viewMode = config.variant_view_type || 'grid';
  logger.log('VariantLayout React Render', `Rendering in ${viewMode} mode with ${visibleItems.length} visible items.`);

  // For simplicity, starting with Grid and List views. Others can be added.
  const renderGridView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${config?.item_width || 150}px, 1fr))`, gap: '10px', padding: '10px' }}>
      {visibleItems.map(item => {
        if (VariantHandler.isVariant(item)) {
          return (
            <div key={item.template.pk} className="variant-group-grid">
              {renderPartItem(item.template, false, true)} {/* Render template as header */}
              <div style={{ marginLeft: '20px', borderLeft: '2px solid #f0f0f0', paddingLeft: '10px' }}>
                {item.variants.map(v => renderPartItem(v, true))}
              </div>
            </div>
          );
        }
        return renderPartItem(item as InventreeItem);
      })}
    </div>
  );

  const renderListView = () => (
    <div style={{ padding: '10px' }}>
      {visibleItems.map(item => {
        if (VariantHandler.isVariant(item)) {
          return (
            <div key={item.template.pk} className="variant-group-list" style={{ marginBottom: '15px' }}>
              {renderPartItem(item.template, false, true)}
              <div style={{ marginLeft: '30px', paddingTop: '5px' }}>
                {item.variants.map(v => renderPartItem(v, true))}
              </div>
            </div>
          );
        }
        return renderPartItem(item as InventreeItem);
      })}
    </div>
  );
  
  const renderTreeView = () => (
    <div style={{ padding: '10px' }}>
      {visibleItems.map(item => {
        if (VariantHandler.isVariant(item)) {
            const isExpanded = expandedGroups.has(item.template.pk);
            return (
                <div key={item.template.pk} className="variant-group-tree" style={{ marginBottom: '5px' }}>
                    <div onClick={() => handleToggleGroup(item.template.pk)} style={{ display:'flex', alignItems:'center'}}>
                        <span style={{ marginRight:'5px' }}>{isExpanded ? '▼' : '►'}</span>
                        {renderPartItem(item.template, false, true)}
                    </div>
                    {isExpanded && (
                        <div style={{ marginLeft: '30px', paddingTop: '5px', borderLeft: '1px dashed #ccc' }}>
                            {item.variants.map(v => renderPartItem(v, true))}
                        </div>
                    )}
                </div>
            );
        }
        return renderPartItem(item as InventreeItem);
      })}
    </div>
  );

  // Default to grid, add more cases as needed
  switch (viewMode) {
    case 'list': return renderListView();
    case 'tree': return renderTreeView();
    case 'grid':
    default: return renderGridView();
  }
};

export default VariantLayout; 