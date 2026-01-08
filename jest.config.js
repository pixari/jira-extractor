module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  maxWorkers: 1,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/types/**', '!src/cli/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: ['node_modules/(?!(p-queue|p-retry|p-timeout|eventemitter3)/)'],
  extensionsToTreatAsEsm: ['.ts'],
};
