import { css } from 'lit';

export const buttonStyles = css`
    .button-container {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        justify-content: center;
    }

    .action-button {
        padding: 8px 12px;
        border-radius: 4px;
        border: none;
        background: var(--button-color, var(--primary-color));
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }

    .action-button:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.14), 0 2px 3px rgba(0,0,0,0.28);
    }

    .action-button:active {
        filter: brightness(0.9);
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.20);
    }

    .action-button.compact {
        padding: 4px 8px;
        font-size: 12px;
    }

    .action-button.icon {
        border-radius: 50%;
        width: 36px;
        height: 36px;
        padding: 0;
        min-width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .action-button.icon ha-icon {
        --mdc-icon-size: 20px;
    }

    .action-button.active {
        box-shadow: 0 0 8px var(--button-color, var(--primary-color));
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 8px var(--button-color, var(--primary-color));
        }
        50% {
            box-shadow: 0 0 16px var(--button-color, var(--primary-color));
        }
        100% {
            box-shadow: 0 0 8px var(--button-color, var(--primary-color));
        }
    }
`;
