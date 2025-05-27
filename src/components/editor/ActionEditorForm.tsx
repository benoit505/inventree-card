import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { CustomAction } from '../../types';
import { Logger } from '../../utils/logger';
import CustomEntityPicker from './CustomEntityPicker';
import HaIconPickerWrapper from './HaIconPickerWrapper';   // Import HaIconPickerWrapper

const logger = Logger.getInstance();

const ACTION_TYPES: CustomAction['type'][] = ['ha-service', 'navigate', 'internal-function'];

interface ActionEditorFormProps {
  hass: HomeAssistant; // Made hass required as it's needed by pickers
  initialAction?: CustomAction;
  onSave: (action: CustomAction) => void;
  onCancel: () => void;
}

const ActionEditorForm: React.FC<ActionEditorFormProps> = ({
  hass, // Now required
  initialAction,
  onSave,
  onCancel,
}) => {
  const [action, setAction] = useState<Partial<CustomAction>>(initialAction || {
    label: '',
    type: 'ha-service',
    icon: '',
    confirmation: false,
    service_data: {},
  });
  const [serviceDataString, setServiceDataString] = useState<string>('');

  useEffect(() => {
    if (initialAction) {
      setAction(initialAction);
      setServiceDataString(typeof initialAction.service_data === 'object' ? JSON.stringify(initialAction.service_data, null, 2) : initialAction.service_data || '');
    } else {
      const defaultAction = { label: '', type: 'ha-service' as CustomAction['type'], icon: '', confirmation: false, service_data: {} };
      setAction(defaultAction);
      setServiceDataString('{}');
    }
  }, [initialAction]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const isCheckbox = type === 'checkbox';
    setAction(prevAction => ({ ...prevAction, [name]: isCheckbox ? (event.target as HTMLInputElement).checked : value }));
  }, []);

  const handleIconChange = useCallback((newIcon: string) => {
    setAction(prevAction => ({ ...prevAction, icon: newIcon }));
  }, []);

  const handleTargetEntityChange = useCallback((newEntityId: string) => {
    setAction(prevAction => ({ ...prevAction, target_entity_id: newEntityId }));
  }, []);

  const handleServiceDataChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setServiceDataString(event.target.value);
  }, []);

  const handleSave = useCallback(() => {
    if (!action.label) {
      alert('Action label is required.');
      return;
    }
    let finalAction = { ...action };
    if (action.type === 'ha-service') {
      try {
        finalAction.service_data = serviceDataString ? JSON.parse(serviceDataString) : {};
      } catch (e) {
        logger.error('Editor:ActionForm', 'Invalid JSON in service_data', { serviceDataString, error: e });
        alert('Invalid JSON in Service Data. Please correct it.');
        return;
      }
    }
    onSave(finalAction as CustomAction);
  }, [action, onSave, serviceDataString]);

  return (
    <div className="action-editor-form" style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
      <div className="form-field" style={{ marginBottom: '12px' }}>
        <label htmlFor="action-label" style={{ display: 'block', marginBottom: '4px' }}>Label*:</label>
        <input
          type="text"
          id="action-label"
          name="label"
          value={action.label || ''}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>

      <div className="form-field" style={{ marginBottom: '12px' }}>
        <label htmlFor="action-icon" style={{ display: 'block', marginBottom: '4px' }}>Icon:</label>
        <HaIconPickerWrapper
          hass={hass}
          value={action.icon || ''}
          onValueChanged={handleIconChange}
          // label="Icon"
          // placeholder="e.g., mdi:play"
        />
      </div>

      <div className="form-field" style={{ marginBottom: '12px' }}>
        <label htmlFor="action-type" style={{ display: 'block', marginBottom: '4px' }}>Action Type:</label>
        <select
          id="action-type"
          name="type"
          value={action.type || 'ha-service'}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
        >
          {ACTION_TYPES.map(typeOpt => (
            <option key={typeOpt} value={typeOpt}>
              {typeOpt.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {action.type === 'ha-service' && (
        <div className="service-fields" style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px'}}>
          <h4>HA Service Details</h4>
          <div className="form-field" style={{ marginBottom: '12px' }}>
            <label htmlFor="action-service" style={{ display: 'block', marginBottom: '4px' }}>Service Call*:</label>
            <input
              type="text"
              id="action-service"
              name="service"
              value={action.service || ''}
              onChange={handleChange}
              placeholder="e.g., light.turn_on"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div className="form-field" style={{ marginBottom: '12px' }}>
            <label htmlFor="action-target_entity_id" style={{ display: 'block', marginBottom: '4px' }}>Target Entity ID:</label>
            <CustomEntityPicker
              hass={hass}
              value={action.target_entity_id || ''}
              onValueChanged={handleTargetEntityChange}
              placeholder="Select target entity..."
            />
          </div>
          <div className="form-field" style={{ marginBottom: '12px' }}>
            <label htmlFor="action-service_data" style={{ display: 'block', marginBottom: '4px' }}>Service Data (JSON):</label>
            <textarea
              id="action-service_data"
              name="service_data"
              value={serviceDataString}
              onChange={handleServiceDataChange}
              placeholder='{ "brightness_pct": 50 }'
              rows={4}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
            <small>Enter as JSON. Will be parsed when saving.</small>
          </div>
        </div>
      )}

      {action.type === 'navigate' && (
        <div className="navigate-fields" style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px'}}>
          <h4>Navigation Details</h4>
          <div className="form-field" style={{ marginBottom: '12px' }}>
            <label htmlFor="action-navigation_path" style={{ display: 'block', marginBottom: '4px' }}>Navigation Path*:</label>
            <input
              type="text"
              id="action-navigation_path"
              name="navigation_path"
              value={action.navigation_path || ''}
              onChange={handleChange}
              placeholder="e.g., /lovelace/my-view"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {action.type === 'internal-function' && (
         <div className="internal-fn-fields" style={{ border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '4px'}}>
          <h4>Internal Function Details (Future)</h4>
          <p>Configuration for internal card functions will go here.</p>
        </div>
      )}

      <div className="form-field" style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="action-confirmation"
          name="confirmation"
          checked={action.confirmation || false}
          onChange={handleChange}
          style={{ marginRight: '8px' }}
        />
        <label htmlFor="action-confirmation">Require Confirmation</label>
      </div>

      {action.confirmation && (
        <div className="form-field" style={{ marginTop: '8px', marginBottom: '12px' }}>
          <label htmlFor="action-confirmation_text" style={{ display: 'block', marginBottom: '4px' }}>Confirmation Text:</label>
          <input
            type="text"
            id="action-confirmation_text"
            name="confirmation_text"
            value={action.confirmation_text || ''}
            onChange={handleChange}
            placeholder="Are you sure?"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <div className="form-buttons" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ marginRight: '10px', padding: '8px 16px' }}>Cancel</button>
        <button type="button" onClick={handleSave} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none' }}>Save Action</button>
      </div>
    </div>
  );
};

export default ActionEditorForm; 