import React, { useState, useEffect, useMemo } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';

interface CustomEntityPickerProps {
  hass?: HomeAssistant;
  value?: string;
  label?: string;
  includeDomains?: string[];
  disabled?: boolean;
  onValueChanged: (value: string) => void;
  placeholder?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const CustomEntityPicker: React.FC<CustomEntityPickerProps> = ({
  hass,
  value,
  label,
  includeDomains,
  disabled,
  onValueChanged,
  placeholder,
}) => {
  const [entities, setEntities] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!hass || !hass.states) {
      setEntities([]);
      return;
    }

    let filteredEntities = Object.values(hass.states);

    if (includeDomains && includeDomains.length > 0) {
      filteredEntities = filteredEntities.filter((entity: any) =>
        includeDomains.some(domain => entity.entity_id.startsWith(`${domain}.`))
      );
    }

    const options = filteredEntities
      .map((entity: any) => ({
        value: entity.entity_id,
        label: entity.attributes.friendly_name || entity.entity_id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    setEntities(options);
  }, [hass, includeDomains]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChanged(event.target.value);
  };

  const selectId = useMemo(() => `custom-entity-picker-${label?.replace(/\s+/g, '-') || Math.random().toString(36).substring(7)}`, [label]);

  if (!hass) {
    return <div>Loading Home Assistant data...</div>;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={selectId} style={{ display: 'block', marginBottom: '4px' }}>{label}</label>}
      <select
        id={selectId}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || entities.length === 0}
        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {entities.length === 0 && !placeholder && (
            <option value="" disabled>
                No entities found{includeDomains ? ` for domains: ${includeDomains.join(', ')}` : ''}
            </option>
        )}
        {entities.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomEntityPicker; 