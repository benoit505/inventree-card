import { css } from 'lit';
export const gridLayoutStyles = css `
    .grid-container {
        display: grid;
        width: 100%;
        box-sizing: border-box;
    }

    .grid-item {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background-color, #fff);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
        position: relative;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .grid-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--ha-card-box-shadow, 0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12));
    }

    .grid-item-content {
        display: flex;
        flex: 1;
        padding: 12px;
        overflow: hidden;
    }

    .grid-item-image {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin-right: 12px;
    }

    .grid-item-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .grid-item-details {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }

    .grid-item-name {
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .grid-item-stock {
        font-size: 0.9rem;
        margin-bottom: 4px;
    }

    .grid-item-description {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .grid-item-category {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
    }

    .grid-item-parameters {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 4px;
        font-size: 0.85rem;
    }

    .grid-item-parameter {
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

    .grid-item-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background-color: var(--secondary-background-color, #f5f5f5);
    }

    .parameter-actions {
        display: flex;
        gap: 4px;
    }

    .parameter-action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;
    }

    .parameter-action-button:hover {
        background-color: var(--primary-color-light);
    }

    .parameter-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 2px 6px;
        border-radius: 12px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        font-size: 0.8rem;
        font-weight: 500;
        z-index: 1;
    }

    .parameter-icon {
        position: absolute;
        top: 8px;
        left: 8px;
        color: var(--primary-color);
        --mdc-icon-size: 24px;
        z-index: 1;
    }

    .no-parts {
        padding: 16px;
        text-align: center;
        color: var(--primary-text-color);
        font-style: italic;
    }

    @media (max-width: 600px) {
        .grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }

    @media (max-width: 400px) {
        .grid-container {
            grid-template-columns: 1fr !important;
        }
    }
`;
//# sourceMappingURL=grid-layout.js.map