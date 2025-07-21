import React, { useState, useCallback, ChangeEvent } from 'react';
import { LayoutColumn, ActionDefinition, ButtonColumnItem } from '../../types';

// Define the specific type for LayoutColumn content to avoid ambiguity
type LayoutColumnContent = 'name' | 'thumbnail' | 'description' | 'in_stock' | 'pk' | 'IPN' | 'SKU' | 'category_detail.name' | 'location_detail.name' | 'buttons' | 'attribute' | 'template';

const AVAILABLE_COLUMNS: { value: LayoutColumnContent, label: string }[] = [
  { value: 'name', label: 'Part Name' },
  { value: 'description', label: 'Description' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'pk', label: 'Part ID (PK)' },
  { value: 'IPN', label: 'IPN' },
  { value: 'SKU', label: 'SKU' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'category_detail.name', label: 'Category Name' },
  { value: 'location_detail.name', label: 'Location Name' },
  { value: 'buttons', label: 'Action Buttons' },
  { value: 'attribute', label: 'Custom Attribute' },
  { value: 'template', label: 'Custom Template' },
];

const CONTENT_TYPE_OPTIONS = AVAILABLE_COLUMNS;

interface LayoutBuilderProps {
  columns: LayoutColumn[];
  onColumnsChanged: (newColumns: LayoutColumn[]) => void;
  actions: ActionDefinition[];
}

const LayoutBuilder: React.FC<LayoutBuilderProps> = ({ columns, onColumnsChanged, actions }) => {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [newColumnForm, setNewColumnForm] = useState<Omit<LayoutColumn, 'content'> & { content: LayoutColumnContent | string }>({ id: '', header: '', content: 'name' });

  const handleAddColumn = () => {
    if (newColumnForm.header && newColumnForm.id) {
      const finalNewColumn: LayoutColumn = {
        ...newColumnForm,
        content: newColumnForm.content as LayoutColumnContent,
      };
      onColumnsChanged([...columns, finalNewColumn]);
      // Reset form
      setNewColumnForm({ id: '', header: '', content: 'name' });
    } else {
      alert('Header and a unique ID are required for a new column.');
    }
  };

  const handleUpdateColumn = (index: number, updatedColumn: LayoutColumn) => {
    const newColumns = [...columns];
    newColumns[index] = updatedColumn;
    onColumnsChanged(newColumns);
  };

  const handleRemoveColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    onColumnsChanged(newColumns);
  };

  const handleEditColumn = (col: LayoutColumn) => {
    setEditingColumnId(col.id);
  };

  const handleSaveColumn = (index: number, col: LayoutColumn) => {
    handleUpdateColumn(index, col);
    setEditingColumnId(null);
  };

  const handleCancelEdit = () => {
    setEditingColumnId(null);
  };

  return (
    <div className="layout-builder" style={{ marginTop: '20px' }}>
      <h5 style={{ marginBottom: '10px' }}>Custom Layout Columns</h5>
      <div className="columns-list">
        {columns.map((col, index) => {
          const isEditing = editingColumnId === col.id;
          return (
            <div key={col.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={col.header}
                    onChange={(e) => handleUpdateColumn(index, { ...col, header: e.target.value })}
                    placeholder="Header"
                  />
                  <select
                    value={col.content}
                    onChange={(e) => handleUpdateColumn(index, { ...col, content: e.target.value as LayoutColumnContent })}
                  >
                    {CONTENT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>

                  {col.content === 'buttons' && (
                    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                      <h6>Configure Buttons</h6>
                      {(col.buttons || []).map((buttonItem, btnIndex) => (
                        <div key={buttonItem.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
                          <select
                            value={buttonItem.actionId}
                            onChange={(e) => {
                              const newButtons = [...(col.buttons || [])];
                              newButtons[btnIndex] = { ...newButtons[btnIndex], actionId: e.target.value };
                              handleUpdateColumn(index, { ...col, buttons: newButtons });
                            }}
                          >
                            <option value="">- Select Action -</option>
                            {actions.filter(a => a.trigger.type.startsWith('ui_')).map(action => (
                              <option key={action.id} value={action.id}>{action.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Override Icon"
                            value={buttonItem.icon || ''}
                            onChange={(e) => {
                              const newButtons = [...(col.buttons || [])];
                              newButtons[btnIndex] = { ...newButtons[btnIndex], icon: e.target.value };
                              handleUpdateColumn(index, { ...col, buttons: newButtons });
                            }}
                            style={{ flexShrink: 1 }}
                          />
                          <input
                            type="text"
                            placeholder="Override Label"
                            value={buttonItem.label || ''}
                            onChange={(e) => {
                              const newButtons = [...(col.buttons || [])];
                              newButtons[btnIndex] = { ...newButtons[btnIndex], label: e.target.value };
                              handleUpdateColumn(index, { ...col, buttons: newButtons });
                            }}
                            style={{ flexShrink: 1 }}
                          />
                          <input
                            type="text"
                            placeholder="Target PKs (e.g. 1,2)"
                            value={buttonItem.targetPartPks?.join(',') || ''}
                            onChange={(e) => {
                              const pks = e.target.value.split(',').map(pk => parseInt(pk.trim(), 10)).filter(pk => !isNaN(pk));
                              const newButtons = [...(col.buttons || [])];
                              newButtons[btnIndex] = { ...newButtons[btnIndex], targetPartPks: pks.length > 0 ? pks : undefined };
                              handleUpdateColumn(index, { ...col, buttons: newButtons });
                            }}
                            style={{ flexShrink: 1 }}
                          />
                          <button onClick={() => {
                            const newButtons = (col.buttons || []).filter((_, i) => i !== btnIndex);
                            handleUpdateColumn(index, { ...col, buttons: newButtons });
                          }}>Remove</button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newButton: ButtonColumnItem = { id: `btn-${Date.now()}`, actionId: '' };
                        const newButtons = [...(col.buttons || []), newButton];
                        handleUpdateColumn(index, { ...col, buttons: newButtons });
                      }}>Add Button</button>
                    </div>
                  )}

                  <button onClick={() => handleSaveColumn(index, col)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <i className="mdi mdi-drag" style={{ cursor: 'grab' }}></i>
                  <span style={{ marginLeft: '8px', flexGrow: 1 }}>
                    {col.header} ({col.id})
                  </span>
                  <button onClick={() => handleEditColumn(col)}>Edit</button>
                  <button onClick={() => handleRemoveColumn(index)}>Delete</button>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="add-column-form" style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          name="id"
          value={newColumnForm.id}
          onChange={(e) => setNewColumnForm({ ...newColumnForm, id: e.target.value })}
          placeholder="New Column ID"
        />
        <input
          type="text"
          name="header"
          value={newColumnForm.header}
          onChange={(e) => setNewColumnForm({ ...newColumnForm, header: e.target.value })}
          placeholder="New Column Header"
        />
        <select
          name="content"
          value={newColumnForm.content}
          onChange={(e) => setNewColumnForm({ ...newColumnForm, content: e.target.value as LayoutColumnContent })}
        >
          {CONTENT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button onClick={handleAddColumn}>Add Column</button>
      </div>
    </div>
  );
};

export default LayoutBuilder; 