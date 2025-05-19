# Testing Redux Components

## Overview

This document outlines the testing infrastructure for Redux components in the InvenTree Card project. Testing Redux components presents unique challenges due to their interaction with the global store, component adapters, and feature flag dependencies.

## Test Directory Structure

```
inventree-card/
├── tests/
│   ├── unit/
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── parts-slice.test.ts
│   │   │   │   ├── parameters-slice.test.ts
│   │   │   │   └── ...
│   │   │   └── index.test.ts
│   │   ├── adapters/
│   │   │   ├── base-layout-adapter.test.ts
│   │   │   ├── grid-layout-adapter.test.ts
│   │   │   ├── list-layout-adapter.test.ts
│   │   │   ├── parts-layout-adapter.test.ts
│   │   │   └── ...
│   │   └── components/
│   │       ├── redux-lit-element.test.ts
│   │       └── ...
│   ├── integration/
│   │   ├── feature-flags.test.ts
│   │   ├── adapter-registry.test.ts
│   │   └── component-interaction.test.ts
│   └── helpers/
│       ├── redux-test-utils.ts
│       ├── mock-store.ts
│       └── mock-components.ts
└── jest.config.js
```

## Testing Strategy

### 1. Unit Testing Redux Store

- **Store Configuration**: Test that the store is properly initialized with all required reducers
- **Action Creators**: Test that each action creator produces the expected action object
- **Reducers**: Test that each reducer properly handles its actions and updates state correctly
- **Selectors**: Test that selectors correctly extract the intended data from state

### 2. Unit Testing Adapters

- **Component Creation**: Test that adapters properly create their delegated component
- **Property Forwarding**: Test that properties are correctly forwarded to delegated components
- **Redux Connection**: Test that the adapter connects to the Redux store when appropriate
- **Feature Flag Handling**: Test behavior when feature flags are enabled/disabled
- **Cleanup**: Test that proper cleanup happens in disconnectedCallback

### 3. Integration Testing

- **Feature Flag Integration**: Test that components respond correctly to feature flag changes
- **Component Registration**: Test the component registry with various feature flag configurations
- **Store Synchronization**: Test that changes in Redux state propagate to components
- **Component Interaction**: Test interaction between connected and non-connected components

## Testing Utilities

### 1. Redux Test Helpers

```typescript
// tests/helpers/redux-test-utils.ts

import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../src/store';

/**
 * Create a test store with predefined state
 */
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  });
}

/**
 * Create a mock component that tracks property updates
 */
export function createMockComponent() {
  const updates = [];
  const component = {
    hass: undefined,
    config: undefined,
    parts: undefined,
    propertyUpdated(name, value) {
      updates.push({ name, value });
      this[name] = value;
    }
  };
  
  return { component, updates };
}

/**
 * Create a mock store subscriber
 */
export function createMockStoreSubscriber() {
  const calls = [];
  const subscriber = jest.fn(() => {
    calls.push(Date.now());
  });
  
  return { subscriber, calls };
}
```

### 2. Feature Flag Test Helpers

```typescript
// tests/helpers/feature-flag-utils.ts

import { setFeatureFlag, resetFeatureFlags } from '../../src/adapters/feature-flags';

/**
 * Set up feature flags for testing
 */
export function setupTestFeatureFlags(flags = {}) {
  resetFeatureFlags();
  
  Object.entries(flags).forEach(([flag, value]) => {
    setFeatureFlag(flag, !!value);
  });
}

/**
 * Clean up after feature flag tests
 */
export function cleanupFeatureFlags() {
  resetFeatureFlags();
}
```

## Example Tests

### Unit Test for Adapter

```typescript
// tests/unit/adapters/parts-layout-adapter.test.ts

import { PartsLayoutAdapter } from '../../../src/adapters/parts-layout-adapter';
import { setupTestFeatureFlags, cleanupFeatureFlags } from '../../helpers/feature-flag-utils';
import { createTestStore } from '../../helpers/redux-test-utils';

describe('PartsLayoutAdapter', () => {
  beforeEach(() => {
    setupTestFeatureFlags({
      useReduxForParts: true,
      useConnectedComponents: true
    });
  });
  
  afterEach(() => {
    cleanupFeatureFlags();
  });
  
  test('should create an instance of InvenTreePartsLayout', () => {
    const adapter = new PartsLayoutAdapter();
    
    // Connect to DOM to trigger connectedCallback
    document.body.appendChild(adapter);
    
    // Check internal component created
    expect(adapter._partsLayout).toBeDefined();
    expect(adapter._partsLayout instanceof HTMLElement).toBe(true);
    expect(adapter._partsLayout.tagName.toLowerCase()).toBe('inventree-parts-layout');
    
    // Clean up
    document.body.removeChild(adapter);
  });
  
  test('should forward properties to internal component', () => {
    const adapter = new PartsLayoutAdapter();
    const mockHass = { states: {} };
    const mockConfig = { entity: 'test.entity' };
    const mockParts = [{ pk: 1, name: 'Test Part' }];
    
    // Connect to DOM
    document.body.appendChild(adapter);
    
    // Set properties
    adapter.hass = mockHass;
    adapter.config = mockConfig;
    adapter.parts = mockParts;
    
    // Check properties forwarded
    expect(adapter._partsLayout.hass).toBe(mockHass);
    expect(adapter._partsLayout.config).toBe(mockConfig);
    expect(adapter._partsLayout.parts).toBe(mockParts);
    
    // Clean up
    document.body.removeChild(adapter);
  });
  
  test('should connect to Redux store when feature flag enabled', () => {
    const adapter = new PartsLayoutAdapter();
    
    // Connect to DOM
    document.body.appendChild(adapter);
    
    // Should have store subscription
    expect(adapter._storeUnsubscribe).toBeDefined();
    expect(typeof adapter._storeUnsubscribe).toBe('function');
    
    // Clean up
    document.body.removeChild(adapter);
  });
  
  test('should use legacy parts when feature flag disabled', () => {
    // Disable Redux for parts
    setupTestFeatureFlags({
      useReduxForParts: false,
      useConnectedComponents: true
    });
    
    const adapter = new PartsLayoutAdapter();
    const mockParts = [{ pk: 1, name: 'Test Part' }];
    
    // Connect to DOM
    document.body.appendChild(adapter);
    
    // Set parts
    adapter.parts = mockParts;
    
    // Should forward legacy parts
    expect(adapter._partsLayout.parts).toBe(mockParts);
    
    // Clean up
    document.body.removeChild(adapter);
  });
});
```

### Integration Test for Component Registry

```typescript
// tests/integration/adapter-registry.test.ts

import { registerComponentAdapter, safeRegisterComponent, resetRegistry, getRegisteredComponents } from '../../src/adapters/component-registry';
import { setupTestFeatureFlags, cleanupFeatureFlags } from '../helpers/feature-flag-utils';

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
```

## Setting Up Jest

Add the following dependencies to package.json:

```json
"devDependencies": {
  "@testing-library/jest-dom": "^5.16.5",
  "jest": "^29.3.1",
  "jest-environment-jsdom": "^29.3.1",
  "ts-jest": "^29.0.3",
  "@types/jest": "^29.2.4"
}
```

Create jest.config.js in the project root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**/*'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

Create tests/setup.js:

```javascript
// Mock window.customElements
window.customElements = {
  define: jest.fn(),
  get: jest.fn(),
};

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

// Adding missing properties that would be in a real browser
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock SafeTimer functions
global.safeSetTimeout = jest.fn().mockImplementation((fn, time) => setTimeout(fn, time));
global.safeClearTimeout = jest.fn().mockImplementation(id => clearTimeout(id));
global.safeSetInterval = jest.fn().mockImplementation((fn, time) => setInterval(fn, time));
global.safeClearInterval = jest.fn().mockImplementation(id => clearInterval(id));
```

## Running Tests

Add these scripts to package.json:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Continuous Integration

Set up GitHub Actions to run tests on pull requests and pushes to the main branch:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

## Next Steps

1. Implement the test infrastructure as described
2. Add unit tests for all Redux components
3. Add integration tests for component interaction
4. Set up continuous integration to run tests automatically
5. Add code coverage reporting to track test coverage 