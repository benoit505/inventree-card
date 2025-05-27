import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Logger } from '../../utils/logger';
import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { selectVisualModifiers, checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';
import { selectSearchQuery, selectSearchResults, selectSearchLoading } from '../../store/slices/searchSlice';
import SearchBar from '../../components/search/SearchBar';
import PartThumbnail from '../part/PartThumbnail';
import PartButtons from '../part/PartButtons';
// Reusable style functions (could be in a shared util)
const getItemContainerStyle = (modifiers, layoutMode, config) => {
    const styles = {
        border: '1px solid #ddd',
        padding: '8px',
        cursor: 'pointer',
        marginBottom: layoutMode === 'list' ? '4px' : '0',
        display: 'flex',
        flexDirection: layoutMode === 'list' ? 'row' : 'column',
        alignItems: layoutMode === 'list' ? 'center' : 'stretch',
        textAlign: layoutMode === 'grid' ? 'center' : 'left',
    };
    if (layoutMode === 'grid') {
        styles.height = (config === null || config === void 0 ? void 0 : config.item_height) ? `${config.item_height}px` : 'auto';
        styles.justifyContent = 'space-between';
    }
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.highlight)
        styles.backgroundColor = modifiers.highlight;
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.border)
        styles.border = `2px solid ${modifiers.border}`;
    return styles;
};
const getItemTextStyle = (modifiers) => {
    if (!modifiers || !modifiers.textColor)
        return {};
    return { color: modifiers.textColor };
};
const PartsLayout = ({ hass, config, parts }) => {
    var _a, _b, _c;
    const logger = useMemo(() => Logger.getInstance(), []);
    const dispatch = useDispatch();
    const locatingPartId = useSelector((state) => selectLocatingPartId(state));
    const parameterConfigGlobal = useSelector(selectParameterConfig);
    const allLoadingStatuses = useSelector((state) => state.parameters.loadingStatus || {});
    const allParameterValuesGlobal = useSelector((state) => state.parameters.parameterValues || {});
    const searchQuery = useSelector(selectSearchQuery);
    const searchResults = useSelector(selectSearchResults);
    const searchLoading = useSelector(selectSearchLoading);
    const [requiredPartIds, setRequiredPartIds] = useState(new Set());
    const [isLoadingParameters, setIsLoadingParameters] = useState(false);
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
        const currentPartPks = parts.map(p => p.pk);
        const referencedIds = getReferencedPartIdsFromConditions(parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions);
        const newIds = new Set([...currentPartPks, ...referencedIds]);
        if (requiredPartIds.size !== newIds.size || ![...requiredPartIds].every(id => newIds.has(id))) {
            setRequiredPartIds(newIds);
        }
    }, [parts, parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.conditions, getReferencedPartIdsFromConditions, requiredPartIds.size]);
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
    }, [requiredPartIds, allLoadingStatuses, (_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled, isLoadingParameters]);
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
    }, [dispatch, (_b = config === null || config === void 0 ? void 0 : config.direct_api) === null || _b === void 0 ? void 0 : _b.enabled, requiredPartIds, allLoadingStatuses]);
    const filteredAndSortedParts = useMemo(() => {
        var _a;
        let processedParts = parts;
        const searchResultPks = new Set(searchResults.map(r => r.pk));
        if (searchQuery.trim().length > 0) {
            if (searchLoading === 'succeeded' || searchResults.length > 0) {
                processedParts = parts.filter(part => searchResultPks.has(part.pk));
            }
            else if (searchLoading !== 'pending') { // Search attempted, but no results
                processedParts = [];
            }
            // If search is pending, we use all parts and let text filter below handle it, or wait for results
        }
        if (((_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled) && config.parameters.conditions) {
            processedParts = processedParts.filter(part => part && checkPartVisibility(part.pk, config.parameters, allLoadingStatuses, allParameterValuesGlobal));
        }
        // Text search filter (if query exists but results might not be specific enough or still loading)
        if (searchQuery.trim().length > 0 && (searchLoading === 'pending' || searchResults.length === 0)) {
            processedParts = processedParts.filter(part => part.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Sorting Logic
        processedParts.sort((a, b) => {
            const modA = allParameterValuesGlobal[a.pk] ? selectVisualModifiers({ parameters: { parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses } }, a.pk) : {};
            const modB = allParameterValuesGlobal[b.pk] ? selectVisualModifiers({ parameters: { parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses } }, b.pk) : {};
            if (modA.sort === 'top' && modB.sort !== 'top')
                return -1;
            if (modA.sort !== 'top' && modB.sort === 'top')
                return 1;
            if (modA.sort === 'bottom' && modB.sort !== 'bottom')
                return 1;
            if (modA.sort !== 'bottom' && modB.sort === 'bottom')
                return -1;
            const prioA = modA.priority === 'high' ? 3 : modA.priority === 'medium' ? 2 : 1;
            const prioB = modB.priority === 'high' ? 3 : modB.priority === 'medium' ? 2 : 1;
            if (prioA !== prioB)
                return prioB - prioA;
            return a.name.localeCompare(b.name);
        });
        return processedParts;
    }, [parts, config === null || config === void 0 ? void 0 : config.parameters, allLoadingStatuses, allParameterValuesGlobal, searchQuery, searchResults, searchLoading, parameterConfigGlobal]);
    const handleLocateItem = useCallback((partId) => { dispatch(locatePartById(partId)); }, [dispatch]);
    const handleParameterAction = useCallback((partId, action) => { dispatch(updateParameterValue({ partId, parameterName: action.parameter, value: action.value })); }, [dispatch]);
    // const handleSearchQueryChange = useCallback((query: string) => { dispatch(setSearchQuery(query)); }, [dispatch]);
    // const handlePerformSearch = useCallback(() => { if(searchQuery.trim()) dispatch(performSearch(searchQuery)); }, [dispatch, searchQuery]);
    // const handleClearSearchCB = useCallback(() => { dispatch(clearSearch()); }, [dispatch]);
    if (!config)
        return _jsx("div", { className: "parts-layout loading", children: _jsx("p", { children: "Loading config..." }) });
    if (!parts && searchLoading !== 'pending')
        return _jsx("div", { className: "parts-layout no-parts", children: _jsx("p", { children: "No parts to display." }) });
    if (isLoadingParameters && ((_c = config.parameters) === null || _c === void 0 ? void 0 : _c.enabled))
        return _jsx("div", { className: "parts-layout loading", children: _jsx("p", { children: "Loading parameters..." }) });
    const displayConfig = config.display || {};
    const viewMode = config.parts_layout_mode || 'grid';
    const columns = config.columns || 3;
    const gridSpacing = config.grid_spacing || 8;
    // const thumbnailWidth = config.style?.image_size || (viewMode === 'grid' ? 80 : 40);
    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gridSpacing}px`,
        padding: '8px',
    };
    const listStyles = { padding: '8px' };
    let noPartsMessage = "No parts match the current filters or search.";
    if (searchQuery.trim().length > 0 && filteredAndSortedParts.length === 0 && searchLoading !== 'pending') {
        noPartsMessage = `No parts found matching "${searchQuery}".`;
    }
    const renderPartItem = (part) => {
        if (!part)
            return null;
        const partId = part.pk;
        const visualModifiers = selectVisualModifiers({ parameters: { parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses } }, partId);
        const parameterActionsForPart = (parameterConfigGlobal === null || parameterConfigGlobal === void 0 ? void 0 : parameterConfigGlobal.actions) || [];
        const isCurrentlyLocating = locatingPartId === partId;
        const itemContainerStyle = getItemContainerStyle(visualModifiers, viewMode, config);
        const itemTextStyle = getItemTextStyle(visualModifiers);
        const itemClasses = [
            viewMode === 'grid' ? 'part-container' : 'list-item',
            isCurrentlyLocating ? 'locating' : '',
            (visualModifiers === null || visualModifiers === void 0 ? void 0 : visualModifiers.priority) ? `priority-${visualModifiers.priority}` : ''
        ].filter(Boolean).join(' ');
        return (_jsxs("div", { className: itemClasses, style: itemContainerStyle, onClick: () => handleLocateItem(partId), children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', width: '100%', flexDirection: viewMode === 'grid' ? 'column' : 'row' }, children: [displayConfig.show_image && (_jsxs("div", { className: viewMode === 'grid' ? "part-thumbnail" : "list-item-image", style: {
                                marginBottom: viewMode === 'grid' ? '8px' : '0',
                                marginRight: viewMode === 'list' ? '8px' : '0',
                                display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }, children: [_jsx(PartThumbnail, { partData: part, config: config, layout: viewMode }), (visualModifiers === null || visualModifiers === void 0 ? void 0 : visualModifiers.icon) && _jsxs("span", { style: { fontSize: '0.7em' }, children: [" (Icon: ", visualModifiers.icon, ")"] })] })), _jsxs("div", { className: viewMode === 'grid' ? "part-info" : "list-item-info", style: Object.assign(Object.assign({}, itemTextStyle), { flexGrow: 1, textAlign: viewMode === 'grid' ? 'center' : 'left' }), children: [displayConfig.show_name && _jsx("div", { className: "part-name", style: { fontWeight: 'bold' }, children: part.name }), displayConfig.show_stock && _jsxs("div", { className: "part-stock", children: ["Stock: ", part.in_stock, " ", part.units || ''] })] }), _jsxs("div", { className: "item-actions-footer", style: { marginTop: viewMode === 'grid' ? 'auto' : '0', marginLeft: viewMode === 'list' ? 'auto' : '0', paddingTop: '4px' }, children: [parameterActionsForPart.length > 0 && (_jsx("div", { className: "parameter-action-buttons", style: { display: 'flex', justifyContent: viewMode === 'grid' ? 'center' : 'flex-start', gap: '4px', marginBottom: '4px' }, children: parameterActionsForPart.map((action) => (_jsx("button", { className: "param-action-button", onClick: (e) => { e.stopPropagation(); handleParameterAction(partId, action); }, title: action.label, style: { fontSize: '0.7em', padding: '2px 4px' }, children: action.icon ? _jsxs("span", { children: ["(", action.icon, ")"] }) : action.label }, `${partId}-${action.label}`))) })), displayConfig.show_buttons && hass && config && (_jsx(PartButtons, { partItem: part, config: config, hass: hass }))] })] }), isCurrentlyLocating && _jsx("div", { className: "locating-indicator", children: "Locating..." })] }, partId));
    };
    return (_jsxs("div", { className: "parts-layout", style: { padding: '8px' }, children: [_jsx(SearchBar, {}), filteredAndSortedParts.length === 0
                ? _jsx("div", { className: "no-parts", children: _jsx("p", { children: noPartsMessage }) })
                : (_jsx("div", { style: viewMode === 'grid' ? gridStyles : listStyles, children: filteredAndSortedParts.map(part => renderPartItem(part)) }))] }));
};
export default PartsLayout;
//# sourceMappingURL=PartsLayout.js.map