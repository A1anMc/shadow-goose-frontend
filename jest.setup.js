// Jest setup file
import '@testing-library/jest-dom';

// Polyfill fetch for Node.js environment
global.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
});
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
