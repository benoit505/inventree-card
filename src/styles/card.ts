import { css } from 'lit';

export const cardStyles = css`
    :host {
        --default-spacing: 16px;
        --default-height: 64px;
        display: block;
    }
    
    ha-card {
        height: auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .card-header {
        padding: var(--default-spacing);
        font-size: 16px;
        font-weight: bold;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, 2), 1fr);
        gap: var(--grid-spacing, var(--default-spacing));
        padding: var(--grid-spacing, var(--default-spacing));
        overflow-y: auto;
        box-sizing: border-box;
        min-height: 0;
    }

    .item-frame {
        width: 100%;
        min-height: var(--item-height, var(--default-height));
        height: auto;
        background: var(--card-background-color);
        border-radius: 12px;
        border: 1px solid var(--divider-color);
        transition: all 0.2s ease-in-out;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }

    .main-box {
        flex: 1;
        padding: 12px;
        border-radius: 12px 12px 0 0;
        display: flex;
        flex-direction: column;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .item-frame.compact {
        padding: 8px;
        gap: 8px;
    }

    .main-box:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .button-container {
        padding: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        background: var(--card-background-color);
        border-radius: 0 0 12px 12px;
        position: relative;
        z-index: 2;
    }

    .quick-add {
        display: flex;
        gap: 4px;
    }

    .adjust-button {
        min-width: 36px;
        height: 36px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .adjust-button.minus {
        color: var(--error-color);
        border-color: var(--error-color);
    }

    .adjust-button.plus {
        color: var(--success-color);
        border-color: var(--success-color);
    }

    .adjust-button:hover {
        background: var(--secondary-background-color);
        transform: translateY(-1px);
    }

    .name {
        font-size: 1.1em;
        font-weight: 500;
    }

    .stock {
        font-weight: 500;
        margin: 8px 0;
    }

    .minimum {
        font-size: 0.9em;
        opacity: 0.8;
    }

    .history {
        margin-top: 8px;
        padding: 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        text-align: center;
    }

    .item-frame.low-stock {
        border-color: var(--error-color);
        box-shadow: 0 0 0 1px var(--error-color);
    }

    .item-frame.warning {
        border-color: var(--warning-color);
        box-shadow: 0 0 0 1px var(--warning-color);
    }

    .out-of-stock {
        background-color: var(--error-color, #db4437);
        color: var(--text-primary-color, white);
    }

    .low-stock {
        background-color: var(--warning-color, #ffa726);
        color: var(--text-primary-color, white);
    }

    .good-stock {
        background-color: var(--success-color, #43a047);
        color: var(--text-primary-color, white);
    }

    .image-container {
        width: 100%;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 8px;
        background: var(--secondary-background-color);
        margin-bottom: 8px;
    }

    .image-container img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform 0.2s ease-in-out;
    }

    .image-container img:hover {
        transform: scale(1.05);
    }
`;