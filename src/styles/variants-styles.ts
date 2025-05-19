import { css } from 'lit';

export const variantStyles = css`
    /* Grid View */
    .variant-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .variants-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .grid-item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 0.5rem;
        transition: transform 0.2s;
    }

    .grid-item:hover {
        transform: translateY(-2px);
    }

    .variant-thumbnail {
        width: 100%;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
    }

    /* List View */
    .variant-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .list-item {
        padding: 0.8rem;
        border-left: 3px solid var(--primary-color);
        background: var(--card-background-color);
    }

    .variant-parameters {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    /* Tree View */
    .variant-tree {
        padding-left: 1rem;
    }

    .tree-root {
        border-bottom: 2px solid var(--primary-color);
        padding-bottom: 0.5rem;
    }

    .tree-item {
        position: relative;
        padding-left: 2rem;
        margin: 0.5rem 0;
    }

    .tree-line {
        position: absolute;
        left: 0;
        top: -50%;
        bottom: 50%;
        width: 2px;
        background: var(--primary-color);
    }

    .tree-icon {
        margin-right: 0.5rem;
        color: var(--primary-color);
    }

    /* Common Styles */
    .template-item {
        font-weight: bold;
        margin-bottom: 1rem;
    }

    .variant-details h4 {
        margin: 0.5rem 0;
    }

    .stock-level {
        color: var(--primary-color);
    }
`;
