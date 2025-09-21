// Jest setup file
// This file runs before each test suite

// Global test utilities
global.testUtils = {
  // Helper to create test prompts
  createTestPrompt: (style = 'anime', subject = 'test subject') => ({
    style,
    subject,
    options: {
      quality: 8,
      count: 1
    }
  }),
  
  // Helper to validate prompt structure
  validatePrompt: (prompt) => {
    expect(prompt).toHaveProperty('text');
    expect(prompt).toHaveProperty('metadata');
    expect(prompt.text).toBeTruthy();
    expect(prompt.metadata).toHaveProperty('style');
    expect(prompt.metadata).toHaveProperty('quality');
  },
  
  // Helper to create mock CLI args
  createMockArgs: (command, ...args) => {
    const originalArgv = process.argv;
    process.argv = ['node', 'cli.js', command, ...args];
    return () => {
      process.argv = originalArgv;
    };
  }
};

// Mock console methods for testing
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console
  Object.assign(console, originalConsole);
});

// Global test configuration
jest.setTimeout(30000);

// Suppress specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('Warning: Could not load') ||
       message.includes('Warning: Could not save'))) {
    return;
  }
  originalWarn.apply(console, args);
};