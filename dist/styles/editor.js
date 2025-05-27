import { css } from 'lit';
export const editorStyles = css `
  ha-form {
    display: block;
    padding: 16px;
  }

  .parts-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .part-entry {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
    align-items: center;
  }

  .add-part,
  .remove-part {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: none;
    border-radius: 4px;
    background: var(--primary-color);
    color: var(--text-primary-color);
    cursor: pointer;
  }

  .remove-part {
    background: var(--error-color);
  }

  .add-part:hover,
  .remove-part:hover {
    opacity: 0.9;
  }
`;
//# sourceMappingURL=editor.js.map