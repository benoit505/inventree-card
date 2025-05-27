import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { selectPartById } from '../../store/slices/partsSlice';
// Styles adapted from the Lit component
const styles = {
    partDetails: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflow: 'hidden',
    },
    partName: {
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    partDescription: {
        fontSize: '0.9em',
        opacity: 0.8,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    partStock: {
        fontSize: '0.9em',
        fontWeight: '500',
    },
    partParameters: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '4px',
        fontSize: '0.8em',
    },
    partParameter: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    paramName: {
        fontWeight: '500',
        marginRight: '4px',
    },
    paramValue: {},
};
const PartDetails = ({ partId, config }) => {
    const partData = useSelector((state) => partId ? selectPartById(state, partId) : undefined);
    if (!partData) {
        return null; // Or some placeholder if partId is provided but data not found
    }
    const display = (config === null || config === void 0 ? void 0 : config.display) || {};
    return (_jsxs("div", { style: styles.partDetails, children: [display.show_name !== false && (_jsx("div", { style: styles.partName, children: partData.name })), display.show_description && partData.description && (_jsx("div", { style: styles.partDescription, children: partData.description })), display.show_stock !== false && (_jsxs("div", { style: styles.partStock, children: ["Stock: ", partData.in_stock, partData.minimum_stock && partData.minimum_stock > 0 ? ` / Min: ${partData.minimum_stock}` : '', partData.units ? ` ${partData.units}` : ''] })), display.show_parameters !== false && partData.parameters && partData.parameters.length > 0 && (_jsx("div", { style: styles.partParameters, children: partData.parameters.map((param) => {
                    var _a, _b, _c;
                    return (_jsxs("div", { style: styles.partParameter, children: [_jsxs("span", { style: styles.paramName, children: [((_a = param.template_detail) === null || _a === void 0 ? void 0 : _a.name) || 'Param', ":"] }), _jsxs("span", { style: styles.paramValue, children: [param.data, ((_b = param.template_detail) === null || _b === void 0 ? void 0 : _b.units) ? ` ${param.template_detail.units}` : ''] })] }, param.pk || ((_c = param.template_detail) === null || _c === void 0 ? void 0 : _c.name) || Math.random()));
                }) }))] }));
};
export default PartDetails;
//# sourceMappingURL=PartDetails.js.map