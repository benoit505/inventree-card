import { css } from 'lit';
export const partsStyles = css `
    :host {
        display: block;
    }
    
    .parts-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .part-item {
        position: relative;
        background-color: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        overflow: visible;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
        transition: all 0.3s ease;
    }
    
    .part-item:hover {
        box-shadow: var(--ha-card-box-shadow, 0px 4px 8px rgba(0, 0, 0, 0.2));
    }
    
    .no-parts {
        padding: 32px;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }
    
    .no-config {
        padding: 16px;
        text-align: center;
        color: var(--error-color);
        font-weight: bold;
    }
    
    .filter-info {
        margin-bottom: 16px;
        padding: 8px 16px;
        background-color: var(--secondary-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        font-size: 0.9em;
    }
    
    .debug-info {
        margin-top: 16px;
        padding: 16px;
        background-color: var(--secondary-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        font-size: 0.9em;
    }
    
    .debug-info pre {
        overflow-x: auto;
        background-color: var(--primary-background-color);
        padding: 8px;
        border-radius: 4px;
    }

    /* Parameter badge and icon */
    .parameter-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: var(--primary-color);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 20;
    }

    .parameter-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        z-index: 20;
    }

    /* Parameter action buttons */
    .parameter-actions {
        position: absolute;
        bottom: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        z-index: 20;
        padding: 4px;
        background-color: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.9);
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }

    .parameter-action-button {
        padding: 4px 8px;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s ease;
        font-size: 0.8em;
    }

    .parameter-action-button:hover {
        filter: brightness(1.1);
    }

    .parameter-action-button ha-icon {
        --mdc-icon-size: 16px;
    }

    .empty-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 32px;
        color: var(--secondary-text-color);
    }

    .part-card {
        background: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, none);
        padding: 16px;
    }

    .part-card.error {
        border: 1px solid var(--error-color);
    }

    .part-card.empty {
        border: 1px dashed var(--divider-color);
    }

    .part-header {
        margin-bottom: 16px;
    }

    .part-header h3 {
        margin: 0;
        font-size: 1.2em;
        color: var(--primary-text-color);
    }

    .part-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .part-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .part-name {
        font-weight: 500;
    }

    .part-stock {
        color: var(--secondary-text-color);
    }
`;
//# sourceMappingURL=parts-layout.js.map