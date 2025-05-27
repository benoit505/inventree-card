import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Logger } from '../../utils/logger';
import { VariantHandler } from '../common/variant-handler';
import PartView from '../part/PartView';
import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { selectVisualModifiers, checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';
// --- Style Helpers (Consider moving to a shared util if used across more layouts) ---
const getVariantItemContainerStyle = (modifiers, isGroupHeader) => {
    const styles = {
        border: '1px solid #e0e0e0',
        padding: '8px',
        marginBottom: '8px',
        cursor: 'pointer',
    };
    if (isGroupHeader) {
        styles.backgroundColor = '#f5f5f5'; // Slightly different background for group headers
    }
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.highlight)
        styles.backgroundColor = modifiers.highlight;
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.border)
        styles.border = `2px solid ${modifiers.border}`;
    return styles;
};
const getVariantItemTextStyle = (modifiers) => {
    if (!modifiers || !modifiers.textColor)
        return {};
    return { color: modifiers.textColor };
};
const VariantLayout = ({ hass, config, parts }) => {
    var _a, _b, _c;
    const logger = useMemo(() => Logger.getInstance(), []);
    const dispatch = useDispatch();
    const locatingPartId = useSelector((state) => selectLocatingPartId(state));
    const parameterConfigGlobal = useSelector(selectParameterConfig);
    const allLoadingStatuses = useSelector((state) => state.parameters.loadingStatus || {});
    const allParameterValuesGlobal = useSelector((state) => state.parameters.parameterValues || {});
    const [processedVariants, setProcessedVariants] = useState([]);
    const [requiredPartIds, setRequiredPartIds] = useState(new Set());
    const [isLoadingParameters, setIsLoadingParameters] = useState(false);
    const [selectedVariantGroupKey, setSelectedVariantGroupKey] = useState(null); // For dropdown/tabs: key might be template PK
    const [expandedGroups, setExpandedGroups] = useState(new Set()); // For tree view: set of template PKs
    // --- Process Variants --- 
    useEffect(() => {
        if (config && parts) {
            logger.log('VariantLayout React', 'useEffect[parts, config] - Processing variants', { numParts: parts.length });
            // Ensure VariantHandler.processItems is available and correctly typed for React usage
            const newProcessed = VariantHandler.processItems(parts, config);
            setProcessedVariants(newProcessed);
        }
        else {
            setProcessedVariants([]);
        }
    }, [parts, config, logger]);
    // --- Calculate Required Part IDs ---
    const getReferencedPartIdsFromConditions = useCallback((conditions) => {
        if (!conditions)
            return [];
        const ids = new Set();
        const conditionRegex = /^part:(\d+):/;
        conditions.forEach(condition => {
            if (typeof condition.parameter === 'string') {
                const match = condition.parameter.match(conditionRegex);
                if (match && match[1])
                    ids.add(parseInt(match[1], 10));
            }
        });
        return Array.from(ids);
    }, []);
    useEffect(() => {
        logger.log('VariantLayout React', 'useEffect[processedVariants, conditions] - Recalculating requiredPartIds');
        const currentVariantPartPks = new Set();
        processedVariants.forEach(item => {
            if (VariantHandler.isVariant(item)) {
                currentVariantPartPks.add(item.template.pk);
                item.variants.forEach(v => currentVariantPartPks.add(v.pk));
            }
            else {
                currentVariantPartPks.add(item.pk);
            }
        });
        const referencedIds = getReferencedPartIdsFromConditions(parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions);
        const newIds = new Set([...Array.from(currentVariantPartPks), ...referencedIds]);
        if (requiredPartIds.size !== newIds.size || ![...requiredPartIds].every(id => newIds.has(id))) {
            setRequiredPartIds(newIds);
        }
    }, [processedVariants, parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions, getReferencedPartIdsFromConditions, logger, requiredPartIds.size]);
    // --- Manage isLoadingParameters ---
    useEffect(() => {
        var _a;
        if (!((_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled) || requiredPartIds.size === 0) {
            if (isLoadingParameters)
                setIsLoadingParameters(false);
            return;
        }
        let loading = false;
        for (const id of requiredPartIds) {
            if (allLoadingStatuses[id] === 'loading') {
                loading = true;
                break;
            }
        }
        if (isLoadingParameters !== loading)
            setIsLoadingParameters(loading);
    }, [requiredPartIds, allLoadingStatuses, (_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled, logger, isLoadingParameters]);
    // --- Fetch Parameters ---
    useEffect(() => {
        var _a;
        if (!((_a = config === null || config === void 0 ? void 0 : config.direct_api) === null || _a === void 0 ? void 0 : _a.enabled) || requiredPartIds.size === 0)
            return;
        const idsToFetch = [];
        requiredPartIds.forEach(id => {
            const status = allLoadingStatuses[id] || 'idle';
            if (status === 'idle' || status === 'failed')
                idsToFetch.push(id);
        });
        if (idsToFetch.length > 0)
            dispatch(fetchParametersForReferencedParts(idsToFetch));
    }, [dispatch, (_b = config === null || config === void 0 ? void 0 : config.direct_api) === null || _b === void 0 ? void 0 : _b.enabled, requiredPartIds, allLoadingStatuses, logger]);
    // --- Filter Visible Items ---
    const visibleItems = useMemo(() => {
        var _a;
        if (!((_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled))
            return processedVariants; // If params disabled, all are visible initially
        return processedVariants.filter(item => {
            const partToCheckId = VariantHandler.isVariant(item) ? item.template.pk : item.pk;
            const status = allLoadingStatuses[partToCheckId] || 'idle';
            // Only consider for visibility if parameters are loaded, otherwise default to visible
            // This prevents items from disappearing while their params are loading for visibility checks
            return status !== 'succeeded' ? true : checkPartVisibility(partToCheckId, config.parameters, allLoadingStatuses, allParameterValuesGlobal);
        });
    }, [processedVariants, config === null || config === void 0 ? void 0 : config.parameters, allLoadingStatuses, allParameterValuesGlobal]);
    // --- Event Handlers ---
    const handleImageError = useCallback((e) => { e.currentTarget.style.display = 'none'; }, []);
    const handleLocateItem = useCallback((partId) => { dispatch(locatePartById(partId)); }, [dispatch]);
    const handleParameterAction = useCallback((partId, action) => { dispatch(updateParameterValue({ partId, parameterName: action.parameter, value: action.value })); }, [dispatch]);
    const handleToggleGroup = useCallback((groupPk) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupPk))
                newSet.delete(groupPk);
            else
                newSet.add(groupPk);
            return newSet;
        });
    }, []);
    // --- Render Helper for a single part (template or variant) ---
    const renderPartItem = useCallback((part, isVariantInGroup = false, isGroupHeader = false) => {
        const partId = part.pk;
        const visualModifiers = selectVisualModifiers({ parameters: { parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses } }, partId);
        const isCurrentlyLocating = locatingPartId === partId;
        // Create a specific config for this item to pass to PartView
        const baseDisplayConfig = (config === null || config === void 0 ? void 0 : config.display) || {};
        const itemDisplayConfig = Object.assign({}, baseDisplayConfig); // Clone
        if (isGroupHeader) {
            itemDisplayConfig.show_buttons = false;
            itemDisplayConfig.show_part_details_component = false; // Corrected: Was show_details_section
            itemDisplayConfig.show_stock_status_border = baseDisplayConfig.show_stock_status_border_for_templates !== false; // Explicit control for templates
            // Potentially other display flags for headers, e.g., larger name if PartView supports it via styles from config
        }
        else if (isVariantInGroup) {
            // For individual variants within a group, maybe simplify the view:
            itemDisplayConfig.show_buttons = baseDisplayConfig.show_buttons_for_variants !== undefined ? baseDisplayConfig.show_buttons_for_variants : false;
            itemDisplayConfig.show_part_details_component = baseDisplayConfig.show_part_details_component_for_variants !== undefined ? baseDisplayConfig.show_part_details_component_for_variants : false; // Corrected: Was show_details_section and used show_details_for_variants
            itemDisplayConfig.show_image = baseDisplayConfig.show_image_for_variants !== undefined ? baseDisplayConfig.show_image_for_variants : true;
            itemDisplayConfig.show_stock = baseDisplayConfig.show_stock_for_variants !== undefined ? baseDisplayConfig.show_stock_for_variants : true;
            itemDisplayConfig.show_name = baseDisplayConfig.show_name_for_variants !== undefined ? baseDisplayConfig.show_name_for_variants : true;
            // If PartView respects thumbnail size from config.style.image_size, we might need a smaller one here.
            // This would require itemConfig to also modify config.style, or PartView to take a direct size prop.
        }
        else {
            // Standalone part (not a group header, not a variant in a group)
            // Use global display config as is, or define specific defaults if necessary
        }
        const itemConfig = Object.assign(Object.assign({}, config), { display: itemDisplayConfig });
        const itemContainerStyle = getVariantItemContainerStyle(visualModifiers, isGroupHeader);
        return (_jsxs("div", { className: `variant-part-item ${isVariantInGroup ? 'variant-member' : ''} ${isGroupHeader ? 'group-header' : ''}`, style: itemContainerStyle, onClick: () => !isGroupHeader && handleLocateItem(partId), children: [_jsx(PartView, { partId: partId, config: itemConfig, hass: hass }), isCurrentlyLocating && _jsx("div", { className: "locating-indicator", style: { marginTop: '5px', textAlign: 'center', color: 'blue' }, children: "Locating..." })] }, partId));
    }, [config, hass, allParameterValuesGlobal, parameterConfigGlobal, allLoadingStatuses, locatingPartId, handleLocateItem, handleImageError]);
    // --- Main Render Logic ---
    if (!config)
        return _jsx("div", { className: "variant-layout loading", children: _jsx("p", { children: "Loading config..." }) });
    if (isLoadingParameters && ((_c = config.parameters) === null || _c === void 0 ? void 0 : _c.enabled))
        return _jsx("div", { className: "variant-layout loading", children: _jsx("p", { children: "Loading parameters..." }) });
    if (!processedVariants || processedVariants.length === 0)
        return _jsx("div", { className: "variant-layout no-variants", children: _jsx("p", { children: "No parts or variants to display." }) });
    if (visibleItems.length === 0 && processedVariants.length > 0)
        return _jsx("div", { className: "variant-layout no-variants", children: _jsx("p", { children: "All items filtered out." }) });
    const viewMode = config.variant_view_type || 'grid';
    logger.log('VariantLayout React Render', `Rendering in ${viewMode} mode with ${visibleItems.length} visible items.`);
    // For simplicity, starting with Grid and List views. Others can be added.
    const renderGridView = () => (_jsx("div", { style: { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${(config === null || config === void 0 ? void 0 : config.item_width) || 150}px, 1fr))`, gap: '10px', padding: '10px' }, children: visibleItems.map(item => {
            if (VariantHandler.isVariant(item)) {
                return (_jsxs("div", { className: "variant-group-grid", children: [renderPartItem(item.template, false, true), " ", _jsx("div", { style: { marginLeft: '20px', borderLeft: '2px solid #f0f0f0', paddingLeft: '10px' }, children: item.variants.map(v => renderPartItem(v, true)) })] }, item.template.pk));
            }
            return renderPartItem(item);
        }) }));
    const renderListView = () => (_jsx("div", { style: { padding: '10px' }, children: visibleItems.map(item => {
            if (VariantHandler.isVariant(item)) {
                return (_jsxs("div", { className: "variant-group-list", style: { marginBottom: '15px' }, children: [renderPartItem(item.template, false, true), _jsx("div", { style: { marginLeft: '30px', paddingTop: '5px' }, children: item.variants.map(v => renderPartItem(v, true)) })] }, item.template.pk));
            }
            return renderPartItem(item);
        }) }));
    const renderTreeView = () => (_jsx("div", { style: { padding: '10px' }, children: visibleItems.map(item => {
            if (VariantHandler.isVariant(item)) {
                const isExpanded = expandedGroups.has(item.template.pk);
                return (_jsxs("div", { className: "variant-group-tree", style: { marginBottom: '5px' }, children: [_jsxs("div", { onClick: () => handleToggleGroup(item.template.pk), style: { display: 'flex', alignItems: 'center' }, children: [_jsx("span", { style: { marginRight: '5px' }, children: isExpanded ? '▼' : '►' }), renderPartItem(item.template, false, true)] }), isExpanded && (_jsx("div", { style: { marginLeft: '30px', paddingTop: '5px', borderLeft: '1px dashed #ccc' }, children: item.variants.map(v => renderPartItem(v, true)) }))] }, item.template.pk));
            }
            return renderPartItem(item);
        }) }));
    // Default to grid, add more cases as needed
    switch (viewMode) {
        case 'list': return renderListView();
        case 'tree': return renderTreeView();
        case 'grid':
        default: return renderGridView();
    }
};
export default VariantLayout;
//# sourceMappingURL=VariantLayout.js.map