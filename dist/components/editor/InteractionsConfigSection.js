import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Logger } from '../../utils/logger';
import ActionEditorForm from './ActionEditorForm';
const logger = Logger.getInstance();
const InteractionsConfigSection = ({ hass, interactionsConfig = { buttons: [] }, onInteractionsConfigChanged, }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAction, setEditingAction] = useState(undefined);
    const [editingActionIndex, setEditingActionIndex] = useState(null);
    const openModal = useCallback((action, index) => {
        setEditingAction(action ? Object.assign({}, action) : undefined);
        setEditingActionIndex(index !== undefined ? index : null);
        setIsModalOpen(true);
        logger.log('Editor:InteractionsSection', 'Modal opened', { action, index });
    }, []);
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingAction(undefined);
        setEditingActionIndex(null);
        logger.log('Editor:InteractionsSection', 'Modal closed');
    }, []);
    const handleSaveAction = useCallback((savedAction) => {
        const currentActions = interactionsConfig.buttons || [];
        let updatedActions;
        if (editingActionIndex !== null) {
            updatedActions = currentActions.map((act, idx) => idx === editingActionIndex ? Object.assign(Object.assign({}, savedAction), { id: act.id || String(Date.now()) }) : act);
            logger.log('Editor:InteractionsSection', 'Action updated', { savedAction, index: editingActionIndex });
        }
        else {
            updatedActions = [...currentActions, Object.assign(Object.assign({}, savedAction), { id: String(Date.now()) })];
            logger.log('Editor:InteractionsSection', 'New action added', { savedAction });
        }
        onInteractionsConfigChanged(Object.assign(Object.assign({}, interactionsConfig), { buttons: updatedActions }));
        closeModal();
    }, [interactionsConfig, onInteractionsConfigChanged, closeModal, editingActionIndex]);
    const handleDeleteAction = useCallback((index) => {
        const currentActions = interactionsConfig.buttons || [];
        const updatedActions = currentActions.filter((_, idx) => idx !== index);
        onInteractionsConfigChanged(Object.assign(Object.assign({}, interactionsConfig), { buttons: updatedActions }));
        logger.log('Editor:InteractionsSection', 'Action deleted', { index });
    }, [interactionsConfig, onInteractionsConfigChanged]);
    return (_jsxs("div", { className: "interactions-section", style: { border: '1px solid #ccc', padding: '16px', margin: '10px 0' }, children: [_jsx("h4", { children: "Custom Interactions (Actions/Buttons)" }), interactionsConfig.buttons && interactionsConfig.buttons.length > 0 ? (_jsx("ul", { style: { listStyle: 'none', padding: 0 }, children: interactionsConfig.buttons.map((action, index) => (_jsxs("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee' }, children: [_jsxs("span", { children: [action.label, " (", action.type, ")"] }), _jsxs("div", { children: [_jsx("button", { onClick: () => openModal(action, index), style: { marginRight: '8px' }, children: "Edit" }), _jsx("button", { onClick: () => handleDeleteAction(index), children: "Delete" })] })] }, action.id || index))) })) : (_jsx("p", { children: "No custom actions defined yet." })), _jsx("button", { onClick: () => openModal(), style: { marginTop: '10px' }, children: "+ Add New Action" }), isModalOpen && (_jsx("div", { className: "modal-overlay", style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000, // Ensure modal is on top
                }, onClick: closeModal, children: _jsxs("div", { className: "modal-content", style: { background: 'white', padding: '20px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px' }, onClick: (e) => e.stopPropagation(), children: [_jsx("h5", { style: { marginTop: 0 }, children: editingAction ? 'Edit Action' : 'Add New Action' }), _jsx(ActionEditorForm, { hass: hass, initialAction: editingAction, onSave: handleSaveAction, onCancel: closeModal })] }) }))] }));
};
export default InteractionsConfigSection;
//# sourceMappingURL=InteractionsConfigSection.js.map