import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualEffect, ParameterCondition, ProcessedVariant } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { VariantHandler } from '../common/variant-handler';
import PartView from '../part/PartView';
import { motion, AnimatePresence } from 'framer-motion';

import { selectLocatingPartId, setLocatingPartId } from '../../store/slices/partsSlice';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';

interface VariantLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[]; // Raw parts array
  cardInstanceId?: string;
}

// --- Types specific to this layout ---
interface DisplayItem {
  item: ProcessedVariant | InventreeItem;
  depth: number;
}

// --- Style Helpers (Consider moving to a shared util if used elsewhere) ---
const getVariantItemContainerStyle = (modifiers?: VisualEffect, isGroupHeader?: boolean): React.CSSProperties => {
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

const getVariantItemTextStyle = (modifiers?: VisualEffect): React.CSSProperties => {
  if (!modifiers || !modifiers.textColor) return {};
  return { color: modifiers.textColor };
};

ConditionalLoggerEngine.getInstance().registerCategory('VariantLayout', { enabled: false, level: 'info' });

const VariantLayout: React.FC<VariantLayoutProps> = ({ hass, config, parts, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('VariantLayout', cardInstanceId);
  }, [cardInstanceId]);
  
  logger.verbose('VariantLayout', 'Component rendering', { partCount: parts.length, cardInstanceId });
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const fullState = useSelector((state: RootState) => state);

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state, cardInstanceId || 'unknown_card'));
  const parameterConfigFromProps = useMemo(() => config?.parameters, [config]);
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.parameterLoadingStatus || {});

  const [processedVariants, setProcessedVariants] = useState<(InventreeItem | ProcessedVariant)[]>([]);
  const [selectedVariantGroupKey, setSelectedVariantGroupKey] = useState<string | null>(null); // For dropdown/tabs: key might be template PK
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set()); // For tree view: set of template PKs

  // --- Process Variants --- 
  useEffect(() => {
    if (config && parts) {
      logger.debug('useEffect[processVariants]', 'Processing variants', { numParts: parts.length });
      // Ensure VariantHandler.processItems is available and correctly typed for React usage
      const newProcessed = VariantHandler.processItems(parts, config);
      setProcessedVariants(newProcessed);
    } else {
      setProcessedVariants([]);
    }
  }, [parts, config]);

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
    logger.debug('useMemo[visibleItems]', 'Filtering visible items', { processedCount: processedVariants.length });
    if (processedVariants.length === 0) return [];

    const filtered = processedVariants.filter(item => {
      const partToCheckId = VariantHandler.isVariant(item) ? item.template.pk : item.pk;
      const effect = selectVisualEffectForPart(fullState, cardInstanceId || 'unknown_card', partToCheckId);
      const isVisible = effect?.isVisible !== false;
      if (!isVisible) {
          logger.debug('useMemo[visibleItems]', `Hiding partId ${partToCheckId} due to isVisible:false effect.`);
      }
      return isVisible;
    });
    logger.debug('useMemo[visibleItems]', `Found ${filtered.length} visible items.`);
    return filtered;
  }, [processedVariants, fullState, cardInstanceId]);

  // --- Event Handlers ---
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; }, []);
  const handleLocateItem = useCallback((partId: number) => {
    logger.info('handleLocateItem', `Locating item with partId: ${partId}`);
    if (cardInstanceId) {
      dispatch(setLocatingPartId({ partId, cardInstanceId }));
    }
  }, [dispatch, cardInstanceId]);
  const handleParameterAction = useCallback((partId: number, action: ParameterAction) => { 
    logger.warn('handleParameterAction', 'handleParameterAction called (needs review for RTK Query integration)', { partId, action });
  }, [dispatch]);
  const handleToggleGroup = useCallback((groupPk: number) => {
    logger.debug('handleToggleGroup', `Toggling group visibility for template PK: ${groupPk}`);
    setExpandedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(groupPk)) newSet.delete(groupPk);
        else newSet.add(groupPk);
        return newSet;
    });
  }, []);

  // --- Render Helper for a single part (template or variant) ---
  const renderPartItem = useCallback((partId: number, layoutContext: 'grid' | 'list' | 'tree', isTemplate: boolean) => {
    logger.verbose('renderPartItem', `Rendering item for partId: ${partId}`, { layoutContext, isTemplate });
    const visualModifiers = selectVisualEffectForPart(fullState, cardInstanceId || '', partId) || {};
    const isCurrentlyLocating = locatingPartId === partId;

    // This check ensures config and cardInstanceId are defined for the selectors and PartView
    if (!config || !cardInstanceId || !hass) {
        logger.warn('renderPartItem', `Cannot render partId ${partId}: critical props missing.`);
        return <div style={{padding: '8px'}}>Initializing part...</div>;
    }

    const baseDisplayConfig = config.display || {};
    const itemDisplayConfig = { ...baseDisplayConfig };

    if (isTemplate) {
      itemDisplayConfig.show_buttons = false;
      itemDisplayConfig.show_part_details_component = false; 
      itemDisplayConfig.show_stock_status_border = baseDisplayConfig.show_stock_status_border_for_templates !== false; 
    } else {
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

    const itemContainerStyleToUse = getVariantItemContainerStyle(visualModifiers, isTemplate);

    return (
      <div 
        key={partId} 
        className={`variant-part-item ${isTemplate ? 'group-header' : ''}`}
        style={itemContainerStyleToUse}
        onClick={() => !isTemplate && handleLocateItem(partId)}
      >
        <PartView partId={partId} config={itemConfig} hass={hass} cardInstanceId={cardInstanceId} />
        {isCurrentlyLocating && <div className="locating-indicator" style={{ marginTop: '5px', textAlign:'center', color:'blue' }}>Locating...</div>}
      </div>
    );
  }, [config, hass, cardInstanceId, fullState, locatingPartId, handleLocateItem]);

  // --- Main Render Logic ---
  if (!config || !cardInstanceId || !hass) {
      logger.warn('VariantLayout', 'Render blocked: critical props missing.');
      return <div className="variant-layout loading"><p>Loading...</p></div>;
  }
  if (!processedVariants || processedVariants.length === 0) {
      logger.info('VariantLayout', 'Render blocked: no parts or variants to display.');
      return <div className="variant-layout no-variants"><p>No parts or variants to display.</p></div>;
  }
  if (visibleItems.length === 0 && processedVariants.length > 0) {
      logger.info('VariantLayout', 'Render complete, but all items were filtered out.');
      return <div className="variant-layout no-variants"><p>All items filtered out.</p></div>;
  }
  
  const viewMode = config.variant_view_type || 'grid';
  logger.debug('VariantLayout', `Rendering in ${viewMode} mode with ${visibleItems.length} visible items.`);

  // For simplicity, starting with Grid and List views. Others can be added.
  const renderGridView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${config?.item_width || 150}px, 1fr))`, gap: '10px', padding: '10px' }}>
      {visibleItems.map(item => {
        if (VariantHandler.isVariant(item)) {
          return (
            <div key={item.template.pk} className="variant-group-grid">
              {renderPartItem(item.template.pk, 'grid', true)} {/* Render template as header */}
              <div style={{ marginLeft: '20px', borderLeft: '2px solid #f0f0f0', paddingLeft: '10px' }}>
                {item.variants.map(v => renderPartItem(v.pk, 'grid', false))}
              </div>
            </div>
          );
        }
        return renderPartItem(item.pk, 'grid', false);
      })}
    </div>
  );

  const renderListView = () => (
    <div style={{ padding: '10px' }}>
      {visibleItems.map(item => {
        if (VariantHandler.isVariant(item)) {
          return (
            <div key={item.template.pk} className="variant-group-list" style={{ marginBottom: '15px' }}>
              {renderPartItem(item.template.pk, 'list', true)}
              <div style={{ marginLeft: '30px', paddingTop: '5px' }}>
                {item.variants.map(v => renderPartItem(v.pk, 'list', false))}
              </div>
            </div>
          );
        }
        return renderPartItem(item.pk, 'list', false);
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
                        {renderPartItem(item.template.pk, 'tree', true)}
                    </div>
                    {isExpanded && (
                        <div style={{ marginLeft: '30px', paddingTop: '5px', borderLeft: '1px dashed #ccc' }}>
                            {item.variants.map(v => renderPartItem(v.pk, 'tree', false))}
                        </div>
                    )}
                </div>
            );
        }
        return renderPartItem(item.pk, 'tree', false);
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