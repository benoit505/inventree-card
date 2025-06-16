import React, { useCallback, useState } from 'react';
import { LayoutConfig, LayoutColumn, ActionDefinition, ButtonColumnItem } from '../../types';

const AVAILABLE_COLUMNS: { value: LayoutColumn['content'], label: string }[] = [
  { value: 'name', label: 'Part Name' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'description', label: 'Description' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'pk', label: 'Part ID (PK)' },
  { value: 'IPN', label: 'IPN' },
  { value: 'SKU', label: 'SKU' },
  { value: 'category_detail.name', label: 'Category Name' },
  { value: 'location_detail.name', label: 'Location' },
  { value: 'buttons', label: 'Action Button' },
  { value: 'attribute', label: 'Part Attribute' },
  { value: 'template', label: 'Custom Template' },
];

interface LayoutBuilderProps {
  layoutConfig: LayoutConfig;
  onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
  actions: ActionDefinition[];
}

const LayoutBuilder: React.FC<LayoutBuilderProps> = ({ layoutConfig, onLayoutConfigChanged, actions }) => {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [draftColumn, setDraftColumn] = useState<LayoutColumn | null>(null);

  // State for the sub-editor for buttons within a column
  const [editingButton, setEditingButton] = useState<ButtonColumnItem | null>(null);
  const [isAddingNewButton, setIsAddingNewButton] = useState<boolean>(false);

  const partFooterActions = React.useMemo(() => actions.filter(a => a.trigger?.ui?.placement === 'part_footer'), [actions]);

  const handleAddColumn = useCallback(() => {
    const newColumn: LayoutColumn = {
      id: `col_${new Date().getTime()}`, // Simple unique ID
      content: 'name', // Default content
      header: 'Part Name',
      width: '1fr',
    };

    const newColumns = [...(layoutConfig.columns || []), newColumn];

    onLayoutConfigChanged({
      ...layoutConfig,
      columns: newColumns,
    });
  }, [layoutConfig, onLayoutConfigChanged]);

  const handleDeleteColumn = useCallback((columnId: string) => {
    const newColumns = (layoutConfig.columns || []).filter(col => col.id !== columnId);
    onLayoutConfigChanged({
      ...layoutConfig,
      columns: newColumns,
    });
  }, [layoutConfig, onLayoutConfigChanged]);

  const handleEditColumn = (column: LayoutColumn) => {
    setEditingColumnId(column.id);
    setDraftColumn(column);
  };

  const handleCancelEdit = () => {
    setEditingColumnId(null);
    setDraftColumn(null);
  };

  const handleSaveColumn = () => {
    if (!draftColumn) return;
    const newColumns = (layoutConfig.columns || []).map(col =>
      col.id === editingColumnId ? draftColumn : col
    );
    onLayoutConfigChanged({ ...layoutConfig, columns: newColumns });
    setEditingColumnId(null);
    setDraftColumn(null);
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!draftColumn) return;
    const { name, value } = e.target;
    // This function now only handles top-level column properties like header and width
    setDraftColumn({ ...draftColumn, [name]: value });
  };

  const handleToggleFiltering = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLayoutConfigChanged({
      ...layoutConfig,
      enableFiltering: e.target.checked,
    });
  };

  // --- Button Sub-Editor Handlers ---

  const handleAddButton = () => {
    setIsAddingNewButton(true);
    setEditingButton({ id: `btn_${new Date().getTime()}`, actionId: '' });
  };

  const handleEditButton = (button: ButtonColumnItem) => {
    setIsAddingNewButton(false);
    setEditingButton(button);
  };
  
  const handleCancelEditButton = () => {
    setEditingButton(null);
    setIsAddingNewButton(false);
  };
  
  const handleDraftButtonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingButton) return;
    const { name, value } = e.target;

    if (name === 'targetPartPks') {
        const pks = value.split(',')
                         .map(pk => parseInt(pk.trim(), 10))
                         .filter(pk => !isNaN(pk));
        setEditingButton({ ...editingButton, targetPartPks: pks.length > 0 ? pks : undefined });
    } else {
        setEditingButton({ ...editingButton, [name]: value });
    }
  };

  const handleSaveButton = () => {
    if (!draftColumn || !editingButton || !editingButton.actionId) return;
    
    const existingButtons = draftColumn.buttons || [];
    let newButtons;

    if (isAddingNewButton) {
      newButtons = [...existingButtons, editingButton];
    } else {
      newButtons = existingButtons.map(btn => btn.id === editingButton.id ? editingButton : btn);
    }
    
    setDraftColumn({ ...draftColumn, buttons: newButtons });
    handleCancelEditButton();
  };
  
  const handleDeleteButton = (buttonId: string) => {
      if (!draftColumn) return;
      const newButtons = (draftColumn.buttons || []).filter(btn => btn.id !== buttonId);
      setDraftColumn({ ...draftColumn, buttons: newButtons });
  };

  return (
    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
      <h4>Layout Builder</h4>
      <div style={{ padding: '5px 0' }}>
        <input
          type="checkbox"
          id="enableFiltering"
          checked={!!layoutConfig.enableFiltering}
          onChange={handleToggleFiltering}
        />
        <label htmlFor="enableFiltering" style={{ marginLeft: '8px' }}>
          Enable Filter/Search Bar
        </label>
      </div>
      <p style={{ fontSize: '0.9em', color: 'gray' }}>
        Define the columns for your layout. This will replace the static grid options above.
      </p>

      <div className="layout-columns-list" style={{ margin: '10px 0' }}>
        {(layoutConfig.columns || []).map((col) => {
          const isEditing = editingColumnId === col.id;
          return (
            <div key={col.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', padding: '5px', background: isEditing ? '#eef' : '#f9f9f9', borderRadius: '4px' }}>
              {isEditing ? (
                <>
                  <input type="text" name="header" value={draftColumn?.header || ''} onChange={handleDraftChange} style={{ flex: 1, marginRight: '10px' }} placeholder="Header Text" />
                  <select
                    name="content"
                    value={draftColumn?.content || ''}
                    onChange={handleDraftChange}
                    style={{ flex: 1, marginRight: '10px' }}
                  >
                    <option value="" disabled>-- Select Content --</option>
                    {AVAILABLE_COLUMNS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {draftColumn?.content === 'buttons' && (
                    <div className="config-item" style={{ flex: 2, marginRight: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* List of current buttons */}
                        {(draftColumn.buttons || []).map(btn => {
                            // If this button is being edited, show the form
                            if (editingButton && editingButton.id === btn.id) {
                                return (
                                    <div key={btn.id} style={{ border: '1px solid #007bff', padding: '8px', borderRadius: '4px', background: '#f0f8ff' }}>
                                        <select name="actionId" value={editingButton.actionId} onChange={handleDraftButtonChange} style={{ width: '100%', marginBottom: '5px' }}>
                                            <option value="">-- Select Action --</option>
                                            {partFooterActions.map(action => (
                                                <option key={action.id} value={action.id}>{action.name || action.id}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text" name="targetPartPks"
                                            value={(editingButton.targetPartPks || []).join(', ')}
                                            onChange={handleDraftButtonChange}
                                            placeholder="Target Part PKs (optional)"
                                            style={{ width: 'calc(100% - 10px)' }}
                                        />
                                        <div style={{marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '5px'}}>
                                            <button type="button" onClick={handleSaveButton}>Save</button>
                                            <button type="button" onClick={handleCancelEditButton}>Cancel</button>
                                        </div>
                                    </div>
                                );
                            }
                            // Otherwise, show the display view
                            return (
                                <div key={btn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#f0f0f0', borderRadius: '4px' }}>
                                    <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {actions.find(a => a.id === btn.actionId)?.name || btn.actionId}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ha-icon icon="mdi:pencil" onClick={() => handleEditButton(btn)} style={{ cursor: 'pointer' }} title="Edit"></ha-icon>
                                        <ha-icon icon="mdi:delete" onClick={() => handleDeleteButton(btn.id)} style={{ cursor: 'pointer', color: '#db4437' }} title="Delete"></ha-icon>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Form for adding a NEW button */}
                        {isAddingNewButton && (
                            <div style={{ border: '1px solid #28a745', padding: '8px', borderRadius: '4px', background: '#f0fff4' }}>
                                <h5 style={{margin: '0 0 8px 0'}}>Add New Button</h5>
                                <select name="actionId" value={editingButton?.actionId || ''} onChange={handleDraftButtonChange} style={{ width: '100%', marginBottom: '5px' }}>
                                    <option value="">-- Select Action --</option>
                                    {partFooterActions.map(action => (
                                        <option key={action.id} value={action.id}>{action.name || action.id}</option>
                                    ))}
                                </select>
                                <input
                                    type="text" name="targetPartPks"
                                    value={(editingButton?.targetPartPks || []).join(', ')}
                                    onChange={handleDraftButtonChange}
                                    placeholder="Target Part PKs (optional, e.g. 1, 5)"
                                    style={{ width: 'calc(100% - 10px)' }}
                                />
                                <div style={{marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '5px'}}>
                                    <button type="button" onClick={handleSaveButton}>Add Button</button>
                                    <button type="button" onClick={handleCancelEditButton}>Cancel</button>
                                </div>
                            </div>
                        )}
                        
                        {!editingButton && <button type="button" onClick={handleAddButton} style={{marginTop: '5px', padding: '4px 8px', fontSize: '0.9em'}}>+ Add Button</button>}
                    </div>
                  )}
                  {draftColumn?.content === 'attribute' && (
                    <div className="config-item" style={{ flex: 2, marginRight: '10px' }}>
                        <input type="text" name="attributeName" value={draftColumn?.attributeName || ''} onChange={handleDraftChange} style={{ width: '100%' }} placeholder="e.g. location.name" />
                    </div>
                  )}
                  {draftColumn?.content === 'template' && (
                    <div className="config-item" style={{ flex: 2, marginRight: '10px' }}>
                        <input type="text" name="template" value={draftColumn?.template || ''} onChange={handleDraftChange} style={{ width: '100%' }} placeholder="e.g. Stock: %%part.in_stock%%" />
                    </div>
                  )}
                  <input type="text" name="width" value={draftColumn?.width || ''} onChange={handleDraftChange} style={{ width: '80px', marginRight: '10px' }} placeholder="Width (1fr, 150px, 25%)" />
                  <button onClick={handleSaveColumn}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, marginRight: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.header}</span>
                  <code style={{ flex: 1, marginRight: '10px', background: '#eee', padding: '2px 5px', borderRadius: '3px' }}>
                    {AVAILABLE_COLUMNS.find(opt => opt.value === col.content)?.label || col.content}
                  </code>
                  <span style={{ width: '80px', marginRight: '10px' }}>{col.width || 'auto'}</span>
                  <button onClick={() => handleEditColumn(col)}>Edit</button>
                  <button onClick={() => handleDeleteColumn(col.id)}>Delete</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={handleAddColumn}>
        Add Column
      </button>
    </div>
  );
};

export default LayoutBuilder; 