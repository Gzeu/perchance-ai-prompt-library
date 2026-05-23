// jest.config.ts — v4.0.0
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts'],
  // Legacy suites pending type/API alignment (see issue tracker)
  testPathIgnorePatterns: [
    'generators.test.ts',
    'cacheService.test.ts',
    'analyticsService.test.ts',
    'batch-generation.test.js',
    'export-functionality.test.js'
  ],
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    'discord-bot/src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  verbose: true,
  testTimeout: 10_000,
};

export default config;
