import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Logger } from '../../utils/logger';
import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';
// Import GridItem
import GridItem from './GridItem';
const getGridItemContainerStyle = (modifiers, config) => {
    const styles = {
        border: '1px solid #eee', // Default border
        padding: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        height: (config === null || config === void 0 ? void 0 : config.item_height) ? `${config.item_height}px` : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    };
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.highlight)
        styles.backgroundColor = modifiers.highlight;
    if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.border)
        styles.border = `2px solid ${modifiers.border}`;
    return styles;
};
const getGridItemTextStyle = (modifiers) => {
    if (!modifiers || !modifiers.textColor)
        return {};
    return { color: modifiers.textColor };
};
const GridLayout = ({ hass, config, parts }) => {
    var _a, _b, _c;
    const logger = useMemo(() => Logger.getInstance(), []);
    const dispatch = useDispatch();
    useEffect(() => {
        var _a;
        logger.log('GridLayout', 'Parts prop reference changed.', { partsLength: parts.length, firstPartPk: (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.pk });
    }, [parts]);
    const locatingPartId = useSelector((state) => selectLocatingPartId(state));
    const parameterConfigGlobal = useSelector(selectParameterConfig);
    const allLoadingStatuses = useSelector((state) => state.parameters.loadingStatus || {});
    const allParameterValuesGlobal = useSelector((state) => state.parameters.parameterValues || {});
    // Moved selector: parameterActionsForPart is not dependent on individual part in the loop
    const parameterActions = useSelector((state) => { var _a; return ((_a = state.parameters.config) === null || _a === void 0 ? void 0 : _a.actions) || []; });
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
                if (match && match[1]) {
                    const id = parseInt(match[1], 10);
                    if (!isNaN(id))
                        ids.add(id);
                }
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
        var _a, _b, _c;
        if (!((_a = config === null || config === void 0 ? void 0 : config.direct_api) === null || _a === void 0 ? void 0 : _a.enabled) || requiredPartIds.size === 0) {
            logger.log('GridLayout', 'FetchParameters Effect: Skipped (Direct API disabled or no required part IDs)', { directApiEnabled: (_b = config === null || config === void 0 ? void 0 : config.direct_api) === null || _b === void 0 ? void 0 : _b.enabled, requiredPartIdsSize: requiredPartIds.size });
            return;
        }
        const idsToFetch = [];
        const reasonsForFetching = {};
        requiredPartIds.forEach(id => {
            const status = allLoadingStatuses[id] || 'idle';
            reasonsForFetching[id] = status; // Log current status for all required IDs
            if (status === 'idle' || status === 'failed') {
                idsToFetch.push(id);
            }
        });
        logger.log('GridLayout', 'FetchParameters Effect: Evaluation', {
            requiredPartIds: Array.from(requiredPartIds),
            allStatuses: reasonsForFetching,
            idsBeingFetchedThisCycle: idsToFetch,
            directApiEnabled: (_c = config === null || config === void 0 ? void 0 : config.direct_api) === null || _c === void 0 ? void 0 : _c.enabled
        });
        if (idsToFetch.length > 0) {
            logger.log('GridLayout', `FetchParameters Effect: Dispatching fetchParametersForReferencedParts for IDs: ${idsToFetch.join(', ')}`);
            dispatch(fetchParametersForReferencedParts(idsToFetch));
        }
        else {
            logger.log('GridLayout', 'FetchParameters Effect: No IDs to fetch in this cycle.');
        }
    }, [dispatch, (_b = config === null || config === void 0 ? void 0 : config.direct_api) === null || _b === void 0 ? void 0 : _b.enabled, requiredPartIds]);
    const filteredAndSortedParts = useMemo(() => {
        var _a;
        if (!parts)
            return [];
        let processedParts = parts;
        if (((_a = config === null || config === void 0 ? void 0 : config.parameters) === null || _a === void 0 ? void 0 : _a.enabled) && config.parameters.conditions) {
            processedParts = parts.filter(part => part && checkPartVisibility(part.pk, config.parameters, allLoadingStatuses, allParameterValuesGlobal));
        }
        // Placeholder for sorting logic (e.g., by priority modifier)
        processedParts.sort((a, b) => a.pk - b.pk);
        return processedParts;
    }, [parts, config === null || config === void 0 ? void 0 : config.parameters, allLoadingStatuses, allParameterValuesGlobal]);
    const handleLocateGridItem = useCallback((partId) => {
        dispatch(locatePartById(partId));
    }, [dispatch]);
    const handleParameterActionClick = useCallback((currentPartId, action) => {
        dispatch(updateParameterValue({ partId: currentPartId, parameterName: action.parameter, value: action.value }));
    }, [dispatch]);
    if (!config)
        return _jsx("div", { className: "grid-layout loading", children: _jsx("p", { children: "Loading config..." }) });
    if (!parts || parts.length === 0)
        return _jsx("div", { className: "grid-layout no-parts", children: _jsx("p", { children: "No parts to display." }) });
    if (isLoadingParameters && ((_c = config.parameters) === null || _c === void 0 ? void 0 : _c.enabled))
        return _jsx("div", { className: "grid-layout loading", children: _jsx("p", { children: "Loading parameters..." }) });
    if (filteredAndSortedParts.length === 0)
        return _jsx("div", { className: "grid-layout no-parts", children: _jsx("p", { children: "All parts filtered out." }) });
    const displayConfig = config.display || {};
    const columns = config.columns || 3;
    const gridSpacing = config.grid_spacing || 8;
    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gridSpacing}px`,
        padding: '8px',
    };
    return (_jsx("div", { className: "grid-layout", style: gridStyles, children: filteredAndSortedParts.map(part => {
            if (!part)
                return null;
            const partId = part.pk;
            const isCurrentlyLocating = locatingPartId === partId;
            return (_jsx(GridItem, { part: part, config: config, hass: hass, isCurrentlyLocating: isCurrentlyLocating, parameterActions: parameterActions, handleLocateGridItem: handleLocateGridItem, handleParameterActionClick: handleParameterActionClick }, partId));
        }) }));
};
export default GridLayout;
//# sourceMappingURL=GridLayout.js.map