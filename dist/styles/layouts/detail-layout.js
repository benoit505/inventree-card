import { css } from 'lit';
export const detailStyles = css `
    .detail-container {
        display: flex;
        flex-direction: column;
        padding: 16px;
        background-color: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, none);
    }

    .detail-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 8px;
    }

    .detail-header h2 {
        margin: 0 0 8px 0;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .category {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
    }

    .detail-content {
        display: flex;
        flex-direction: row;
        gap: 16px;
    }

    .image-section {
        flex: 0 0 auto;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--secondary-background-color, #f0f0f0);
        border-radius: 4px;
        overflow: hidden;
    }

    .image-section img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .info-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .stock-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background-color: var(--secondary-background-color, #f0f0f0);
        border-radius: 4px;
    }

    .stock-info.low-stock {
        background-color: var(--warning-color, #ffa726);
        color: var(--text-primary-color, #fff);
    }

    .stock-level, .minimum-stock, .pending-adjustment {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .label {
        font-weight: 500;
        min-width: 80px;
    }

    .value {
        font-weight: 400;
    }

    .low-stock-indicator {
        background-color: var(--error-color, #f44336);
        color: var(--text-primary-color, #fff);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-left: auto;
    }

    .pending-adjustment .positive {
        color: var(--success-color, #4caf50);
    }

    .pending-adjustment .negative {
        color: var(--error-color, #f44336);
    }

    .description {
        margin-top: 8px;
    }

    .description p {
        margin: 0;
        color: var(--primary-text-color);
    }

    .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
    }

    .parameter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
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

    .parameters-section {
        margin-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 8px;
    }

    .parameters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }

    .parameters-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 500;
    }

    .parameters-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
        margin-top: 8px;
    }

    .parameter-item {
        display: flex;
        flex-direction: column;
        padding: 8px;
        background-color: var(--secondary-background-color, #f0f0f0);
        border-radius: 4px;
    }

    .parameter-name {
        font-weight: 500;
        margin-bottom: 4px;
    }

    .parameter-value {
        font-family: monospace;
    }

    .stock-adjust-section {
        margin-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 8px;
    }

    .stock-adjust-form {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }

    .stock-adjust-form input {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
    }

    .stock-adjust-form button {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        color: var(--text-primary-color);
        cursor: pointer;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
        .detail-content {
            flex-direction: column;
        }

        .image-section {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            max-height: 200px;
        }
    }
`;
//# sourceMappingURL=detail-layout.js.map