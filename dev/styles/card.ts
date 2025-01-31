import { css } from 'lit';

export const cardStyles = css`
  :host {
    --default-spacing: 16px;
    --default-height: 64px;
  }

  ha-card {
    padding: 16px;
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
  }

  .item-frame {
    width: 100%;
    height: var(--item-height, var(--default-height));
  }

  .main-box {
    height: 100%;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .name {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .stock {
    font-size: 14px;
  }

  .minimum {
    font-size: 12px;
    opacity: 0.8;
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
`; 