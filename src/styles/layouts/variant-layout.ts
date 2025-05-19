import { css } from 'lit';

export const variantLayoutStyles = css`
    :host {
        display: block;
    }

    .variant-grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }

    .variant-grid-item {
        background-color: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        overflow: hidden;
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
        transition: all 0.3s ease;
        position: relative;
    }

    .variant-grid-item:hover {
        box-shadow: var(--ha-card-box-shadow, 0px 4px 8px rgba(0, 0, 0, 0.2));
        transform: translateY(-2px);
    }

    .variant-header {
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
    }

    .variant-name {
        margin: 0;
        font-size: 1.1em;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .variant-content {
        display: flex;
        padding: 12px;
    }

    .variant-image-container {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
    }

    .variant-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .variant-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .variant-stock {
        font-weight: 500;
    }

    .variant-description {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .variant-actions {
        padding: 12px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 8px;
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
        z-index: 10;
    }

    .parameter-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        z-index: 10;
    }

    /* Parameter action buttons */
    .parameter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
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

    /* Dropdown view styles */
    .variant-dropdown {
        margin-bottom: 16px;
    }

    /* Tabs view styles */
    .variant-tabs {
        display: flex;
        overflow-x: auto;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
    }

    .variant-tab {
        padding: 8px 16px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
    }

    .variant-tab.active {
        border-bottom-color: var(--primary-color);
        color: var(--primary-color);
    }

    /* List view styles */
    .variant-list-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .variant-list-item {
        display: flex;
        padding: 12px;
        background-color: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
    }

    /* Tree view styles */
    .variant-tree {
        margin-bottom: 16px;
    }

    .variant-tree-item {
        margin-bottom: 8px;
    }

    .variant-tree-parent {
        font-weight: 500;
        margin-bottom: 4px;
        cursor: pointer;
    }

    .variant-tree-children {
        margin-left: 16px;
        padding-left: 8px;
        border-left: 1px solid var(--divider-color);
    }

    @media (max-width: 600px) {
        .variant-grid-container {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }

    @media (max-width: 400px) {
        .variant-grid-container {
            grid-template-columns: 1fr;
        }
    }
`;
