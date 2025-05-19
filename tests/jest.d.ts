import '@testing-library/jest-dom';

declare global {
  const describe: (name: string, fn: () => void) => void;
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;
  const test: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void) => void;
  const expect: any;
  const jest: any;
}

export {}; 