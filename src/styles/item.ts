import { css } from 'lit';

export const itemStyles = css`
    .item {
        display: flex;
        flex-direction: column;
        padding: var(--spacing, 8px);
        border-radius: 4px;
        background: var(--ha-card-background, var(--card-background-color, white));
    }

    .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    .image-container img {
        width: var(--image-size, 100px);
        height: var(--image-size, 100px);
        object-fit: contain;
    }

    .out-of-stock { color: var(--error-color, red); }
    .low-stock { color: var(--warning-color, orange); }
    .good-stock { color: var(--success-color, green); }

    .buttons {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }

    .parameters {
        font-size: 0.9em;
        opacity: 0.8;
    }
`;
