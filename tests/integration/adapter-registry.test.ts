import { registerComponentAdapter, safeRegisterComponent, resetRegistry, getRegisteredComponents } from '../../src/adapters/component-registry';
import { setupTestFeatureFlags, cleanupFeatureFlags } from '../helpers/feature-flag-utils';
import '@testing-library/jest-dom';

describe('Component Registry', () => {
  beforeEach(() => {
    resetRegistry();
    setupTestFeatureFlags({
      useConnectedComponents: true
    });
    
    // Mock customElements.define
    window.customElements.define = jest.fn();
  });
  
  afterEach(() => {
    cleanupFeatureFlags();
    resetRegistry();
    jest.resetAllMocks();
  });
  
  test('should register adapter component when feature flag enabled', () => {
    class TestAdapter extends HTMLElement {}
    
    registerComponentAdapter(
      'test-adapter',
      TestAdapter,
      'original-component',
      'useConnectedComponents'
    );
    
    expect(window.customElements.define).toHaveBeenCalledWith('test-adapter', TestAdapter);
    expect(getRegisteredComponents().has('test-adapter')).toBe(true);
  });
  
  test('should not register adapter component when feature flag disabled', () => {
    setupTestFeatureFlags({
      useConnectedComponents: false
    });
    
    class TestAdapter extends HTMLElement {}
    
    registerComponentAdapter(
      'test-adapter',
      TestAdapter,
      'original-component',
      'useConnectedComponents'
    );
    
    expect(window.customElements.define).not.toHaveBeenCalled();
    expect(getRegisteredComponents().has('test-adapter')).toBe(false);
  });
  
  test('should not register original component when adapter exists', () => {
    class TestAdapter extends HTMLElement {}
    class OriginalComponent extends HTMLElement {}
    
    // Register adapter first
    registerComponentAdapter(
      'test-adapter',
      TestAdapter,
      'original-component',
      'useConnectedComponents'
    );
    
    // Try to register original
    safeRegisterComponent('original-component', OriginalComponent);
    
    // Should only register the adapter
    expect(window.customElements.define).toHaveBeenCalledTimes(1);
    expect(window.customElements.define).toHaveBeenCalledWith('test-adapter', TestAdapter);
    expect(getRegisteredComponents().has('test-adapter')).toBe(true);
    expect(getRegisteredComponents().has('original-component')).toBe(false);
  });
}); 