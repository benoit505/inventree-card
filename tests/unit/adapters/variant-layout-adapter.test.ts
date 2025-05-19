import { VariantLayoutAdapter } from '../../../src/adapters/variant-layout-adapter';
import { setupTestFeatureFlags, cleanupFeatureFlags } from '../../helpers/feature-flag-utils';
import { store } from '../../../src/store';
import { InventreeItem } from '../../../src/core/types';

// Mock the InvenTreeVariantLayout component
class MockInvenTreeVariantLayout extends HTMLElement {
  hass: any;
  config: any;
  parts: any;
}

// Register the mock custom element
customElements.define('inventree-variant-layout', MockInvenTreeVariantLayout);

// Mock store
jest.mock('../../../src/store', () => ({
  store: {
    subscribe: jest.fn(() => () => {}),
    getState: jest.fn(() => ({
      parts: {
        items: {
          'test.entity': [
            { pk: 1, name: 'Test Part 1', in_stock: 5, IPN: 'IPN1' } as InventreeItem,
            { pk: 2, name: 'Test Part 2', in_stock: 10, IPN: 'IPN2' } as InventreeItem
          ]
        }
      }
    })),
    dispatch: jest.fn()
  }
}));

describe('VariantLayoutAdapter', () => {
  beforeEach(() => {
    setupTestFeatureFlags({
      useReduxForParts: true,
      useConnectedComponents: true
    });
    
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation((tagName: string) => {
      if (tagName === 'inventree-variant-layout') {
        return new MockInvenTreeVariantLayout();
      }
      return document.createElement(tagName);
    });
  });
  
  afterEach(() => {
    cleanupFeatureFlags();
    jest.resetAllMocks();
  });
  
  test('should create an instance of InvenTreeVariantLayout', () => {
    const adapter = new VariantLayoutAdapter();
    
    // Mock connectedCallback
    adapter.connectedCallback();
    
    // Check internal component created
    expect(document.createElement).toHaveBeenCalledWith('inventree-variant-layout');
  });
  
  test('should forward properties to internal component', () => {
    const adapter = new VariantLayoutAdapter();
    const mockHass = { states: {} };
    const mockConfig = { entity: 'test.entity', type: 'custom:inventree-card' };
    const mockParts = [
      { pk: 1, name: 'Test Part 1', in_stock: 5, IPN: 'IPN1' } as InventreeItem,
      { pk: 2, name: 'Test Part 2', in_stock: 10, IPN: 'IPN2' } as InventreeItem
    ];
    
    // Mock connectedCallback
    adapter.connectedCallback();
    
    // Set properties
    adapter.hass = mockHass;
    adapter.config = mockConfig;
    adapter.parts = mockParts;
    
    // Get the internal component instance
    const variantLayout = (adapter as any)._variantLayout;
    
    // Check properties forwarded
    expect(variantLayout.hass).toBe(mockHass);
    expect(variantLayout.config).toBe(mockConfig);
    
    // If Redux is enabled, parts should come from the store
    expect(variantLayout.parts).toEqual([
      { pk: 1, name: 'Test Part 1', in_stock: 5, IPN: 'IPN1' },
      { pk: 2, name: 'Test Part 2', in_stock: 10, IPN: 'IPN2' }
    ]);
    
    // Check store subscription
    expect(store.subscribe).toHaveBeenCalled();
  });
  
  test('should use legacy parts when feature flag disabled', () => {
    // Disable Redux for parts
    setupTestFeatureFlags({
      useReduxForParts: false,
      useConnectedComponents: true
    });
    
    const adapter = new VariantLayoutAdapter();
    const mockParts = [
      { pk: 1, name: 'Test Part 1', in_stock: 5, IPN: 'IPN1' } as InventreeItem,
      { pk: 2, name: 'Test Part 2', in_stock: 10, IPN: 'IPN2' } as InventreeItem
    ];
    
    // Mock connectedCallback
    adapter.connectedCallback();
    
    // Set parts
    adapter.parts = mockParts;
    
    // Get the internal component instance and check properties
    const variantLayout = (adapter as any)._variantLayout;
    
    // Should forward legacy parts
    expect(variantLayout.parts).toBe(mockParts);
    
    // Should not subscribe to store
    expect(store.subscribe).not.toHaveBeenCalled();
  });
  
  test('should unsubscribe from store in disconnectedCallback', () => {
    const adapter = new VariantLayoutAdapter();
    const unsubscribeMock = jest.fn();
    
    // Mock store subscription
    (store.subscribe as jest.Mock).mockReturnValue(unsubscribeMock);
    
    // Connect to trigger subscription
    adapter.connectedCallback();
    
    // Disconnect
    adapter.disconnectedCallback();
    
    // Check unsubscribe was called
    expect(unsubscribeMock).toHaveBeenCalled();
  });
}); 