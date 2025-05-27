import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Logger } from '../../utils/logger';
import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice'; // Removed adjustPartStock for now
import { selectVisualModifiers, checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';
import PartThumbnail from '../part/PartThumbnail'; // Added import
import PartButtons from '../part/PartButtons'; // Added import
const getListItemContainerStyle = (modifiers) => {
    if (!modifiers)
        return {};
    const styles = {};
    if (modifiers.highlight)
        styles.backgroundColor = modifiers.highlight;
    if (modifiers.border)
        styles.border = `2px solid ${modifiers.border}`;
    // Add a base style for list items
    styles.padding = '8px';
    styles.marginBottom = '4px';
    styles.cursor = 'pointer';
    return styles;
};
const getListItemTextStyle = (modifiers) => {
    if (!modifiers || !modifiers.textColor)
        return {};
    return { color: modifiers.textColor };
};
const ListLayout = ({ hass, config, parts }) => {
    var _a, _b, _c;
    const logger = useMemo(() => Logger.getInstance(), []);
    const dispatch = useDispatch();
    // --- Redux State Selections ---
    const locatingPartId = useSelector((state) => selectLocatingPartId(state));
    const parameterConfigGlobal = useSelector(selectParameterConfig);
    const allLoadingStatuses = useSelector((state) => state.parameters.loadingStatus || {});
    const allParameterValuesGlobal = useSelector((state) => state.parameters.parameterValues || {});
    // --- Internal State ---
    const [requiredPartIds, setRequiredPartIds] = useState(new Set());
    const [isLoadingParameters, setIsLoadingParameters] = useState(false);
    // --- Helper to extract referenced part IDs from conditions ---
    const getReferencedPartIdsFromConditions = useCallback((conditions) => {
        if (!conditions)
            return [];
        const ids = new Set();
        const conditionRegex = /^part:(\d+):/;
        conditions.forEach(condition => {
            if (typeof condition.parameter === 'string') {
                const match = condition.parameter.match(conditionRegex);
                if (match && match[1]) {
                    const id = parseInt(match[1], 10);
                    if (!isNaN(id)) {
                        ids.add(id);
                    }
                }
            }
        });
        return Array.from(ids);
    }, []);
    // --- Effects ---
    // Calculate requiredParameterPartIds
    useEffect(() => {
        var _a;
        logger.log('ListLayout React', 'useEffect[parts, parameterConfigGlobal.conditions] - Recalculating required IDs.', { numParts: parts.length, conditions: (_a = parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions) === null || _a === void 0 ? void 0 : _a.length });
        const currentPartPks = parts.map(p => p.pk);
        const referencedIds = getReferencedPartIdsFromConditions(parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions);
        const newIds = new Set([...currentPartPks, ...referencedIds]);
        if (requiredPartIds.size !== newIds.size || ![...requiredPartIds].every(id => newIds.has(id))) {
            logger.log('ListLayout React', `Setting new requiredParameterPartIds. Old: [${Array.from(requiredPartIds).join(', ')}], New: [${Array.from(newIds).join(', ')}]`);
            setRequiredPartIds(newIds);
        }
        else {
            logger.log('ListLayout React', 'No change to requiredParameterPartIds.');
        }
    }, [parts, parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions, getReferencedPartIdsFromConditions, logger, requiredPartIds.size]); // Added requiredPartIds.size to dependencies to ensure stable comparison logic
    // Calculate isLoadingParameters
    useEffect(() => {
        var _a;
        logger.log('ListLayout React', 'useEffect[requiredPartIds, allLoadingStatuses] - Recalculating isLoadingParameters.', { requiredNum: requiredPartIds.size });
        if (!((_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled) || requiredPartIds.size === 0) {
            if (isLoadingParameters)
                setIsLoadingParameters(false); // Ensure it's false if params disabled or no req IDs
            return;
        }
        let loading = false;
        for (const id of requiredPartIds) {
            if (allLoadingStatuses[id] === 'loading') {
                loading = true;
                break;
            }
        }
        if (isLoadingParameters !== loading) {
            logger.log('ListLayout React', `Setting isLoadingParameters to ${loading}.`);
            setIsLoadingParameters(loading);
        }
    }, [requiredPartIds, allLoadingStatuses, (_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled, logger, isLoadingParameters]);
    // Fetch parameters
    useEffect(() => {
        var _a, _b;
        logger.log('ListLayout React', 'useEffect[fetchParameters] - Checking if parameters need fetching.', { directApiEnabled: (_a = config === null || config === void 0 ? void 0 : config.direct_api) === null || _a === void 0 ? void 0 : _a.enabled, requiredNum: requiredPartIds.size });
        if (!((_b = config === null || config === void 0 ? void 0 : config.direct_api) === null || _b === void 0 ? void 0 : _b.enabled) || requiredPartIds.size === 0) {
            return;
        }
        const idsToFetch = [];
        requiredPartIds.forEach(id => {
            const status = allLoadingStatuses[id] || 'idle';
            if (status === 'idle' || status === 'failed') {
                idsToFetch.push(id);
            }
        });
        if (idsToFetch.length > 0) {
            logger.log('ListLayout React', `Dispatching fetchParametersForReferencedParts for IDs: [${idsToFetch.join(', ')}]`);
            dispatch(fetchParametersForReferencedParts(idsToFetch));
        }
        else {
            logger.log('ListLayout React', 'No parameter IDs to fetch.');
        }
    }, [dispatch, (_b = config === null || config === void 0 ? void 0 : config.direct_api) === null || _b === void 0 ? void 0 : _b.enabled, requiredPartIds, allLoadingStatuses, logger]);
    // --- Filtering and Sorting ---
    const filteredAndSortedParts = useMemo(() => {
        var _a, _b, _c;
        logger.log('ListLayout React', 'useMemo[filteredAndSortedParts] - Recalculating.', { numParts: parts.length, conditions: (_b = (_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.conditions) === null || _b === void 0 ? void 0 : _b.length });
        if (!parts)
            return [];
        let processedParts = parts;
        if (((_c = config === null || config === void 0 ? void 0 : config.parameters) === null || _c === void 0 ? void 0 : _c.enabled) && config.parameters.conditions) {
            processedParts = parts.filter(part => {
                if (!part)
                    return false;
                return checkPartVisibility(part.pk, config.parameters, allLoadingStatuses, allParameterValuesGlobal);
            });
            logger.log('ListLayout React', `Parts after visibility filter: ${processedParts.length}`);
        }
        // Basic sorting by priority (example, can be enhanced)
        // This assumes visualModifiers are available per part, which they should be via useSelector in the map below
        // For a more robust sort, we might need to select all visual modifiers here.
        // For now, let's keep it simple and sort by part.pk as a stable sort.
        processedParts.sort((a, b) => {
            // Placeholder for future priority sorting
            return a.pk - b.pk; // Basic stable sort
        });
        logger.log('ListLayout React', `Parts after sorting: ${processedParts.length}`);
        return processedParts;
    }, [parts, config === null || config === void 0 ? void 0 : config.parameters, allLoadingStatuses, allParameterValuesGlobal, logger]);
    // --- Event Handlers ---
    const handleLocateListItem = useCallback((partId) => {
        logger.log('ListLayout React', `Locating part: ${partId}`);
        dispatch(locatePartById(partId));
    }, [dispatch, logger]);
    const handleParameterActionClick = useCallback((currentPartId, action) => {
        logger.log('ListLayout React', `Handling parameter action click: "${action.label}" for part ${currentPartId}`, { action });
        dispatch(updateParameterValue({ partId: currentPartId, parameterName: action.parameter, value: action.value }));
    }, [dispatch, logger]);
    // --- Render Logic ---
    if (!config) {
        return _jsx("div", { className: "list-container loading-container", children: _jsx("div", { className: "loading", children: "Loading config..." }) });
    }
    if (!parts || parts.length === 0) {
        return _jsx("div", { className: "list-container no-parts", children: _jsx("p", { children: "No parts to display." }) });
    }
    if (isLoadingParameters && ((_c = config.parameters) === null || _c === void 0 ? void 0 : _c.enabled)) {
        logger.log('ListLayout React Render', 'Showing Loading Parameters state.');
        return _jsx("div", { className: "list-container loading-container", children: _jsx("div", { className: "loading", children: "Loading parameters..." }) });
    }
    if (filteredAndSortedParts.length === 0) {
        logger.log('ListLayout React Render', 'No parts to display after filtering.');
        return _jsx("div", { className: "list-container no-parts", children: _jsx("p", { children: "All parts filtered out or parameters still loading for relevant items." }) });
    }
    const displayConfig = config.display || {};
    logger.log('ListLayout React Render', `Rendering with ${filteredAndSortedParts.length} parts.`);
    return (_jsx("div", { className: "list-container", style: { padding: '8px' }, children: filteredAndSortedParts.map(part => {
            if (!part)
                return null; // Should not happen if filtered correctly
            const partId = part.pk;
            // Get modifiers for THIS part inside the map, as they are part-specific
            const visualModifiers = useSelector((state) => selectVisualModifiers(state, partId));
            const parameterActionsForPart = useSelector((state) => { var _a; return ((_a = state.parameters.config) === null || _a === void 0 ? void 0 : _a.actions) || []; }); // Assuming actions are global for now
            const isCurrentlyLocating = locatingPartId === partId;
            const itemContainerStyle = getListItemContainerStyle(visualModifiers);
            const itemTextStyle = getListItemTextStyle(visualModifiers);
            // Simplified class logic for now
            const itemClasses = [
                'list-item',
                isCurrentlyLocating ? 'locating' : '',
                (visualModifiers === null || visualModifiers === void 0 ? void 0 : visualModifiers.priority) ? `priority-${visualModifiers.priority}` : ''
            ].filter(Boolean).join(' ');
            return (_jsxs("div", { className: itemClasses, style: itemContainerStyle, onClick: () => handleLocateListItem(partId), children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', flexGrow: 1 }, children: [" ", displayConfig.show_image && (_jsxs("div", { className: "list-item-image", style: { marginRight: '8px' }, children: [" ", _jsx(PartThumbnail, { partData: part, config: config, layout: "list", icon: visualModifiers === null || visualModifiers === void 0 ? void 0 : visualModifiers.icon, badge: visualModifiers === null || visualModifiers === void 0 ? void 0 : visualModifiers.badge })] })), _jsxs("div", { className: "list-item-info", style: itemTextStyle, children: [displayConfig.show_name !== false && _jsx("div", { className: "name", style: { fontWeight: 'bold' }, children: part.name }), displayConfig.show_stock !== false && (_jsxs("div", { className: "stock", children: ["In Stock: ", part.in_stock, " ", part.units || ''] }))] })] }), _jsxs("div", { className: "list-item-actions-footer", style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginLeft: 'auto' }, children: [parameterActionsForPart.length > 0 && (_jsx("div", { className: "parameter-action-buttons", style: { display: 'flex', gap: '4px', marginBottom: '4px' }, children: parameterActionsForPart.map((action) => (_jsx("button", { className: "param-action-button", onClick: (e) => { e.stopPropagation(); handleParameterActionClick(partId, action); }, title: action.label, style: { fontSize: '0.7em', padding: '2px 4px' }, children: action.icon ? _jsxs("span", { children: ["(", action.icon, ")"] }) : action.label }, `${partId}-${action.label}`))) })), displayConfig.show_buttons && hass && config && (_jsx(PartButtons, { partItem: part, config: config, hass: hass }))] }), isCurrentlyLocating && _jsx("div", { className: "locating-indicator", children: "Locating..." })] }, partId));
        }) }));
};
export default ListLayout;
//# sourceMappingURL=ListLayout.js.map