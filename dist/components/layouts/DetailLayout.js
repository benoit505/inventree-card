import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useSelector } from 'react-redux';
import { selectPartsLoading } from '../../store/slices/partsSlice';
import { selectAnyParameterLoading } from '../../store/selectors/parameterSelectors';
import { Logger } from '../../utils/logger';
// Import the PartView component
import PartView from '../part/PartView';
const DetailLayout = ({ hass, config, selectedPartId }) => {
    const logger = React.useMemo(() => Logger.getInstance(), []);
    const isLoadingParts = useSelector(selectPartsLoading);
    const isLoadingParameters = useSelector(selectAnyParameterLoading);
    React.useEffect(() => {
        logger.log('DetailLayout', 'Props update', { hasHass: !!hass, hasConfig: !!config, selectedPartId });
    }, [hass, config, selectedPartId, logger]);
    if (!config) {
        logger.log('DetailLayout', 'Warn - No config provided', { config });
        return _jsx("div", { children: "Error: Configuration is missing." });
    }
    const layoutStyle = {
        padding: '1rem',
        background: 'var(--ha-card-background, var(--card-background-color, white))',
        borderRadius: 'var(--ha-card-border-radius, 4px)',
    };
    return (_jsx("div", { style: layoutStyle, children: selectedPartId ? (_jsx(PartView, { partId: selectedPartId, config: config, hass: hass })) : (_jsx("div", { children: isLoadingParts || isLoadingParameters ? ("Loading initial data...") : (_jsxs(_Fragment, { children: [_jsx("div", { children: "No part selected or available for the configured entities." }), _jsx("div", { children: "Please check your card configuration and ensure entities have associated parts." })] })) })) }));
};
export default DetailLayout;
//# sourceMappingURL=DetailLayout.js.map