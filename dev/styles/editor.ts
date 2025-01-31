import { css } from 'lit';
import { InventreeCardConfig, InventreeCardConfigKey } from "../types/types";

export const editorStyles = css`
  .editor-container {
    padding: 16px;
  }
  
  .form-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }

  .form-row label {
    flex: 1;
    padding-right: 8px;
  }

  .form-row ha-switch {
    --mdc-theme-secondary: var(--switch-checked-color);
  }

  .form-row ha-textfield {
    width: 100%;
  }
`;
