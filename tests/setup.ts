// Test setup file
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder if needed
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock environment variables
process.env.GROQ_API_KEY = 'test-api-key';
process.env.PLAYWRIGHT_HEADLESS = 'true';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fs operations if needed
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

// Mock clipboardy
jest.mock('clipboardy', () => ({
  write: jest.fn(),
  read: jest.fn(),
}));
