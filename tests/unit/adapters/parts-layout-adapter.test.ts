import { PartsLayoutAdapter } from '../../../src/adapters/parts-layout-adapter';
import { setupTestFeatureFlags, cleanupFeatureFlags } from '../../helpers/feature-flag-utils';

// Mock the InvenTreePartsLayout component
class MockInvenTreePartsLayout extends HTMLElement {
  hass: any;
  config: any;
  parts: any;
  selectedEntities: string[] = [];
}

// Register the mock custom element
customElements.define('inventree-parts-layout', MockInvenTreePartsLayout);

describe('PartsLayoutAdapter', () => {
  beforeEach(() => {
    setupTestFeatureFlags({
      useReduxForParts: true,
      useConnectedComponents: true
    });
    
    // Mock the document methods
    document.createElement = jest.fn().mockImplementation((tagName: string) => {
      if (tagName === 'inventree-parts-layout') {
        return new MockInvenTreePartsLayout();
      }
      return document.createElement(tagName);
    });
  });
  
  afterEach(() => {
    cleanupFeatureFlags();
    jest.resetAllMocks();
  });
  
  test('should create an instance of InvenTreePartsLayout', () => {
    const adapter = new PartsLayoutAdapter();
    
    // Mock connectedCallback
    adapter.connectedCallback();
    
    // Check internal component created
    expect(adapter._partsLayout).toBeDefined();
    expect(document.createElement).toHaveBeenCalledWith('inventree-parts-layout');
  });
  
  test('should forward properties to internal component', () => {
    const adapter = new PartsLayoutAdapter();
    const mockHass = { states: {} };
    const mockConfig = { entity: 'test.entity' };
    const mockParts = [{ pk: 1, name: 'Test Part' }];
    const mockSelectedEntities = ['entity.1', 'entity.2'];
    
    // Mock connectedCallback
    adapter.connectedCallback();
    
    // Set properties
    adapter.hass = mockHass;
    adapter.config = mockConfig;
    adapter.parts = mockParts;
    adapter.selectedEntities = mockSelectedEntities;
    
    // Manually trigger _updateLayoutProps
    (adapter as any)._updateLayoutProps();
    
    // Check properties forwarded
    expect(adapter._partsLayout?.hass).toBe(mockHass);
    expect(adapter._partsLayout?.config).toBe(mockConfig);
    expect(adapter._partsLayout?.parts).toBe(mockParts);
    expect(adapter._partsLayout?.selectedEntities).toEqual(mockSelectedEntities);
  });
  
  test('should use legacy parts when feature flag disabled', () => {
    // Disable Redux for parts
    setupTestFeatureFlags({
      useReduxForParts: false,
      useConnectedComponents: true
    });
    
    const adapter = new PartsLayoutAdapter();
    const mockParts = [{ pk: 1, name: 'Test Part' }];
    
    // Mock connectedCallback
    adapter.connectedCallback();
    
    // Set parts
    adapter.parts = mockParts;
    
    // Manually trigger _updateLayoutProps
    (adapter as any)._updateLayoutProps();
    
    // Should forward legacy parts
    expect(adapter._partsLayout?.parts).toBe(mockParts);
  });
}); 