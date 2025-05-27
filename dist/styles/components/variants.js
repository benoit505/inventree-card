import { css } from 'lit';
export const variantStyles = css `
  /* Common styles */
  :host {
    display: block;
    width: 100%;
  }
  
  /* GRID VIEW */
  :host([variant-view="grid"]) .variant-grid {
    display: flex;
    flex-direction: column;
    gap: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="grid"]) .variant-template {
    margin-bottom: var(--grid-spacing, 8px);
    padding: 12px;
    border-radius: 8px;
    background: var(--primary-background-color, #f0f0f0);
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
  }
  
  :host([variant-view="grid"]) .template-details {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  :host([variant-view="grid"]) .template-info {
    flex: 1;
  }
  
  :host([variant-view="grid"]) .template-stock {
    font-weight: bold;
    color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="grid"]) .variants-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="grid"]) .variant-item {
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
  }
  
  :host([variant-view="grid"]) .variant-item:hover {
    transform: translateY(-2px);
  }
  
  /* LIST VIEW */
  :host([variant-view="list"]) .variant-list {
    display: flex;
    flex-direction: column;
    gap: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="list"]) .variant-template {
    padding: 12px;
    border-radius: 8px;
    background: var(--primary-background-color, #f0f0f0);
    margin-bottom: var(--grid-spacing, 8px);
  }
  
  :host([variant-view="list"]) .template-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  :host([variant-view="list"]) .template-stock {
    font-weight: bold;
    color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="list"]) .variants-list {
    border-radius: 8px;
    overflow: hidden;
    background: var(--card-background-color, #fff);
  }
  
  :host([variant-view="list"]) .variant-list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 3fr;
    padding: 8px 12px;
    background: var(--secondary-background-color, #f0f0f0);
    font-weight: bold;
  }
  
  :host([variant-view="list"]) .variant-list-item {
    display: grid;
    grid-template-columns: 2fr 1fr 3fr;
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  
  :host([variant-view="list"]) .variant-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  /* TREE VIEW */
  :host([variant-view="tree"]) .variant-tree {
    display: flex;
    flex-direction: column;
  }
  
  :host([variant-view="tree"]) .tree-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  :host([variant-view="tree"]) .tree-template {
    padding: 12px;
    border-radius: 8px;
    background: var(--primary-background-color, #f0f0f0);
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
    margin-left: 24px;
  }
  
  :host([variant-view="tree"]) .tree-variants {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-left: 48px;
  }
  
  :host([variant-view="tree"]) .tree-variant-item {
    display: flex;
    position: relative;
  }
  
  :host([variant-view="tree"]) .tree-line-container {
    position: absolute;
    left: -24px;
    top: 0;
    bottom: 0;
    width: 24px;
  }
  
  :host([variant-view="tree"]) .tree-line-vertical {
    position: absolute;
    left: 0;
    top: -16px;
    bottom: 50%;
    width: 2px;
    background-color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="tree"]) .tree-line-horizontal {
    position: absolute;
    left: 0;
    top: 50%;
    width: 24px;
    height: 2px;
    background-color: var(--primary-color, #03a9f4);
  }
  
  :host([variant-view="tree"]) .variant-child-content {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    background: var(--secondary-background-color, #f0f0f0);
  }
`;
//# sourceMappingURL=variants.js.map