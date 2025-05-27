import { css } from 'lit';
export const listLayoutStyles = css `
    :host {
        display: block;
    }

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
    }

    .list-item {
        display: flex;
        align-items: center;
        background-color: var(--card-background-color, #fff);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
        position: relative;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        padding: 4px;
    }

    .list-item:hover {
        transform: translateY(-1px);
        box-shadow: var(--ha-card-box-shadow, 0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12));
    }

    .list-item-image {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin-right: 8px;
        overflow: hidden;
        background-color: var(--secondary-background-color, #f5f5f5);
        border-radius: 2px;
        flex-shrink: 0;
    }

    .list-item-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .list-item-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0; /* Ensures text truncation works properly */
        padding: 0 4px;
        overflow: hidden;
    }

    .list-item-name {
        font-size: 0.95rem;
        font-weight: 500;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .list-item-stock {
        font-size: 0.85rem;
        margin-bottom: 2px;
    }

    .list-item-description {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-bottom: 2px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }

    .list-item-category {
        font-size: 0.75rem;
        color: var(--secondary-text-color);
        margin-bottom: 2px;
    }

    /* Parameters display in list view */
    .list-item-parameters {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
        font-size: 0.8rem;
    }

    .list-item-parameter {
        display: flex;
        justify-content: space-between;
    }

    .param-name {
        font-weight: 500;
        margin-right: 8px;
    }

    .param-value {
        font-family: monospace;
    }

    .list-item-actions {
        display: flex;
        align-items: center;
        padding: 0 4px;
        margin-left: auto;
        flex-shrink: 0;
    }

    /* Parameter badge and icon */
    .parameter-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        padding: 1px 4px;
        border-radius: 8px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        font-size: 0.7rem;
        font-weight: 500;
        z-index: 1;
    }

    .parameter-icon {
        position: absolute;
        top: 4px;
        left: 4px;
        color: var(--primary-color);
        --mdc-icon-size: 16px;
        z-index: 1;
    }

    /* Parameter action buttons */
    .parameter-actions {
        display: flex;
        gap: 2px;
    }

    .parameter-action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 4px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.3s;
    }

    .parameter-action-button:hover {
        background-color: var(--primary-color-light);
    }

    .no-parts {
        padding: 32px;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }

    .empty-message {
        padding: 1rem;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }

    .error-hint {
        margin-top: 8px;
        color: var(--error-color, red);
        font-size: 0.9rem;
        opacity: 0.8;
    }

    @media (max-width: 600px) {
        .list-item {
            flex-direction: row; /* Keep row layout even on mobile */
        }
        
        .list-item-image {
            margin-right: 8px;
        }
        
        .list-item-actions {
            padding: 0 4px;
        }
    }
`;
//# sourceMappingURL=list-layout.js.map