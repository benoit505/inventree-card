import React from 'react';
import { InventreeCardConfig, InventreeItem, VisualEffect } from '../../types';

interface PartDetailsProps {
  part: InventreeItem;
  config: InventreeCardConfig;
  visualEffect?: VisualEffect;
}

const stylesFactory = (visualEffect?: VisualEffect) => ({
  partDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '4px',
    overflow: 'hidden',
    color: visualEffect?.textColor,
  },
  partName: {
    fontWeight: 'bold' as 'bold',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  partDescription: {
    fontSize: '0.9em',
    opacity: visualEffect?.opacity ?? 0.8,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as 'vertical',
  },
  partStock: {
    fontSize: '0.9em',
    fontWeight: '500' as '500',
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
    fontWeight: '500' as '500',
    marginRight: '4px',
  },
  paramValue: {},
  detailItem: {
    marginBottom: '0.25rem',
    fontSize: '0.9em',
  },
});

const PartDetails: React.FC<PartDetailsProps> = ({
  part,
  config,
  visualEffect,
}) => {
  const styles = stylesFactory(visualEffect);
  const displayConfig = config.display || {};

  const {
    description,
    category_detail,
    IPN,
    location_detail,
    supplier_detail,
    manufacturer_detail,
    notes,
    parameters,
  } = part;

  const categoryName = category_detail?.name;
  const locationName = location_detail?.name;
  const supplierName = supplier_detail?.name;
  const manufacturerName = manufacturer_detail?.name;
  const ipn = IPN;
  const parametersData = parameters;

  if (!part) { 
    return null; 
  }

  const hasVisibleContent = 
    (displayConfig.show_description && description) ||
    (displayConfig.show_category && categoryName) ||
    (displayConfig.show_ipn && ipn) ||
    (displayConfig.show_location && locationName) ||
    (displayConfig.show_supplier && supplierName) ||
    (displayConfig.show_manufacturer && manufacturerName) ||
    (displayConfig.show_notes && notes) ||
    (displayConfig.show_parameters && parametersData);

  if (!hasVisibleContent) {
    return null;
  }

  return (
    <div style={styles.partDetails}>
      {/* Description */}
      {displayConfig.show_description && description && (
        <div style={styles.partDescription}>{description}</div>
      )}
      
      {/* Category */}
      {displayConfig.show_category && categoryName && (
        <div style={styles.detailItem}><strong>Category:</strong> {categoryName}</div>
      )}

      {/* IPN */}
      {displayConfig.show_ipn && ipn && (
        <div style={styles.detailItem}><strong>IPN:</strong> {ipn}</div>
      )}

      {/* Location */}
      {displayConfig.show_location && locationName && (
        <div style={styles.detailItem}><strong>Location:</strong> {locationName}</div>
      )}

      {/* Supplier */}
      {displayConfig.show_supplier && supplierName && (
        <div style={styles.detailItem}><strong>Supplier:</strong> {supplierName}</div>
      )}

      {/* Manufacturer */}
      {displayConfig.show_manufacturer && manufacturerName && (
        <div style={styles.detailItem}><strong>Manufacturer:</strong> {manufacturerName}</div>
      )}

      {/* Notes */}
      {displayConfig.show_notes && notes && (
        <div style={styles.detailItem}><strong>Notes:</strong> {notes}</div>
      )}
      
      {/* Parameters Display Logic */}
      {displayConfig.show_parameters && parametersData && (
        <div style={styles.partParameters}>
          {parametersData.map((param) => (
            <div key={param.pk} style={styles.partParameter}>
              <span style={styles.paramName}>{param.template_detail?.name}:</span>
              <span style={styles.paramValue}>{param.data}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartDetails; 