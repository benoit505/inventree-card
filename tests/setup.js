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