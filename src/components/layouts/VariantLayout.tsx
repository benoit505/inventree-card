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
import { selectVisualModifiers, checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { selectParametersLoadingStatus } from '../../store/slices/parametersSlice';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';

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

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const parameterConfigGlobal = useSelector(selectParameterConfig);
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.loadingStatus || {});
  const allParameterValuesGlobal = useSelector((state: RootState) => state.parameters.parameterValues || {});

  const [processedVariants, setProcessedVariants] = useState<(InventreeItem | ProcessedVariant)[]>([]);
  const [requiredPartIds, setRequiredPartIds] = useState<Set<number>>(new Set());
  const [isLoadingParameters, setIsLoadingParameters] = useState<boolean>(false);
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

  useEffect(() => {
    logger.log('VariantLayout React', 'useEffect[processedVariants, conditions] - Recalculating requiredPartIds');
    const currentVariantPartPks = new Set<number>();
    processedVariants.forEach(item => {
      if (VariantHandler.isVariant(item)) {
        currentVariantPartPks.add(item.template.pk);
        item.variants.forEach(v => currentVariantPartPks.add(v.pk));
      } else {
        currentVariantPartPks.add(item.pk);
      }
    });
    const referencedIds = getReferencedPartIdsFromConditions(parameterConfigGlobal?.conditions);
    const newIds = new Set([...Array.from(currentVariantPartPks), ...referencedIds]);
    if (requiredPartIds.size !== newIds.size || ![...requiredPartIds].every(id => newIds.has(id))) {
      setRequiredPartIds(newIds);
    }
  }, [processedVariants, parameterConfigGlobal?.conditions, getReferencedPartIdsFromConditions, logger, requiredPartIds.size]);

  // --- Manage isLoadingParameters ---
  useEffect(() => {
    if (!config?.parameters?.enabled || requiredPartIds.size === 0) {
      if (isLoadingParameters) setIsLoadingParameters(false);
      return;
    }
    let loading = false;
    for (const id of requiredPartIds) {
      if (allLoadingStatuses[id] === 'loading') { loading = true; break; }
    }
    if (isLoadingParameters !== loading) setIsLoadingParameters(loading);
  }, [requiredPartIds, allLoadingStatuses, config?.parameters?.enabled, logger, isLoadingParameters]);

  // --- Fetch Parameters ---
  useEffect(() => {
    if (!config?.direct_api?.enabled || requiredPartIds.size === 0) return;
    const idsToFetch: number[] = [];
    requiredPartIds.forEach(id => {
      const status = allLoadingStatuses[id] || 'idle';
      if (status === 'idle' || status === 'failed') idsToFetch.push(id);
    });
    if (idsToFetch.length > 0) dispatch(fetchParametersForReferencedParts(idsToFetch));
  }, [dispatch, config?.direct_api?.enabled, requiredPartIds, allLoadingStatuses, logger]);

  // --- Filter Visible Items ---
  const visibleItems = useMemo(() => {
    if (!config?.parameters?.enabled) return processedVariants; // If params disabled, all are visible initially
    return processedVariants.filter(item => {
      const partToCheckId = VariantHandler.isVariant(item) ? item.template.pk : item.pk;
      const status = allLoadingStatuses[partToCheckId] || 'idle';
      // Only consider for visibility if parameters are loaded, otherwise default to visible
      // This prevents items from disappearing while their params are loading for visibility checks
      return status !== 'succeeded' ? true : checkPartVisibility(partToCheckId, config.parameters, allLoadingStatuses, allParameterValuesGlobal);
    });
  }, [processedVariants, config?.parameters, allLoadingStatuses, allParameterValuesGlobal]);

  // --- Event Handlers ---
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; }, []);
  const handleLocateItem = useCallback((partId: number) => { dispatch(locatePartById(partId)); }, [dispatch]);
  const handleParameterAction = useCallback((partId: number, action: ParameterAction) => { dispatch(updateParameterValue({ partId, parameterName: action.parameter, value: action.value })); }, [dispatch]);
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
    const visualModifiers = selectVisualModifiers({ parameters: { parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses } } as RootState, partId);
    const isCurrentlyLocating = locatingPartId === partId;

    // Create a specific config for this item to pass to PartView
    const baseDisplayConfig = config?.display || {};
    const itemDisplayConfig = { ...baseDisplayConfig }; // Clone

    if (isGroupHeader) {
      itemDisplayConfig.show_buttons = false;
      itemDisplayConfig.show_part_details_component = false; // Corrected: Was show_details_section
      itemDisplayConfig.show_stock_status_border = baseDisplayConfig.show_stock_status_border_for_templates !== false; // Explicit control for templates
      // Potentially other display flags for headers, e.g., larger name if PartView supports it via styles from config
    } else if (isVariantInGroup) {
      // For individual variants within a group, maybe simplify the view:
      itemDisplayConfig.show_buttons = baseDisplayConfig.show_buttons_for_variants !== undefined ? baseDisplayConfig.show_buttons_for_variants : false;
      itemDisplayConfig.show_part_details_component = baseDisplayConfig.show_part_details_component_for_variants !== undefined ? baseDisplayConfig.show_part_details_component_for_variants : false; // Corrected: Was show_details_section and used show_details_for_variants
      itemDisplayConfig.show_image = baseDisplayConfig.show_image_for_variants !== undefined ? baseDisplayConfig.show_image_for_variants : true;
      itemDisplayConfig.show_stock = baseDisplayConfig.show_stock_for_variants !== undefined ? baseDisplayConfig.show_stock_for_variants : true;
      itemDisplayConfig.show_name = baseDisplayConfig.show_name_for_variants !== undefined ? baseDisplayConfig.show_name_for_variants : true;
      // If PartView respects thumbnail size from config.style.image_size, we might need a smaller one here.
      // This would require itemConfig to also modify config.style, or PartView to take a direct size prop.
    } else {
      // Standalone part (not a group header, not a variant in a group)
      // Use global display config as is, or define specific defaults if necessary
    }

    const itemConfig = {
      ...config,
      display: itemDisplayConfig,
      // Potentially adjust config.style.image_size here too if needed for variants
    } as InventreeCardConfig;

    const itemContainerStyle = getVariantItemContainerStyle(visualModifiers, isGroupHeader);

    return (
      <div 
        key={partId} 
        className={`variant-part-item ${isVariantInGroup ? 'variant-member' : ''} ${isGroupHeader ? 'group-header' : ''}`}
        style={itemContainerStyle}
        onClick={() => !isGroupHeader && handleLocateItem(partId)}
      >
        <PartView partId={partId} config={itemConfig} hass={hass} />
        {isCurrentlyLocating && <div className="locating-indicator" style={{ marginTop: '5px', textAlign:'center', color:'blue' }}>Locating...</div>}
      </div>
    );
  }, [config, hass, allParameterValuesGlobal, parameterConfigGlobal, allLoadingStatuses, locatingPartId, handleLocateItem, handleImageError]);

  // --- Main Render Logic ---
  if (!config) return <div className="variant-layout loading"><p>Loading config...</p></div>;
  if (isLoadingParameters && config.parameters?.enabled) return <div className="variant-layout loading"><p>Loading parameters...</p></div>;
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
        return renderPartItem(item);
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
        return renderPartItem(item);
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
        return renderPartItem(item);
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