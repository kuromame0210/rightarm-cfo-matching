const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.realdb.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/app/api/**/*.realdb.test.ts',
    '<rootDir>/src/__tests__/database/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/app/api/**/*.{js,jsx,ts,tsx}',
    '!src/app/api/**/*.d.ts',
  ],
  testTimeout: 30000, // 30 seconds for database operations
  // No mocking - use real Supabase
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase)/)',
  ],
}

module.exports = createJestConfig(customJestConfig)