import { css } from 'lit';

export const partStyles = css`
  .part-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border-radius: var(--ha-card-border-radius, 4px);
    background: var(--ha-card-background, var(--card-background-color, white));
  }

  .part-container.grid {
    width: 100%;
    max-width: 200px;
  }

  .part-container.list {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .part-container.detail {
    width: 100%;
    max-width: 600px;
  }
`;

export const thumbnailStyles = css`
  .thumbnail-container {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
  }

  .thumbnail-container.grid {
    aspect-ratio: 1;
  }

  .thumbnail-container.list {
    width: 60px;
    height: 60px;
  }

  .thumbnail-container.detail {
    width: 100%;
    max-width: 300px;
    aspect-ratio: 16/9;
  }

  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
  }
`;

export const detailsStyles = css`
  .details-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .part-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    font-size: 0.9em;
    color: var(--secondary-text-color);
  }

  .info-value {
    font-size: 1.1em;
  }

  .stock-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stock-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.9em;
  }

  .no-stock { background: var(--error-color); color: white; }
  .low-stock { background: var(--warning-color); color: white; }
  .in-stock { background: var(--success-color); color: white; }

  .full-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .metadata {
    display: flex;
    gap: 1rem;
    font-size: 0.9em;
    color: var(--secondary-text-color);
  }
`;