const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.api.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/app/api/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/app/api/**/*.{js,jsx,ts,tsx}',
    '!src/app/api/**/*.d.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/components/',
    '<rootDir>/src/app/__tests__/',
    '<rootDir>/src/__tests__/',
    '<rootDir>/src/app/api/__tests__/auth/login/route.test.ts',
    '<rootDir>/src/app/api/__tests__/cfos/route.test.ts',
    '<rootDir>/src/app/api/__tests__/contracts/route.test.ts',
    '<rootDir>/src/app/api/__tests__/auth/register/route.simple.test.ts',
    '<rootDir>/src/app/api/__tests__/auth.integration.test.ts',
    '<rootDir>/src/app/api/__tests__/contracts.integration.test.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)