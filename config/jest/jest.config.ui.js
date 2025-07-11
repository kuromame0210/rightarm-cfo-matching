const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    'src/components/**/*.test.tsx',
    'src/app/__tests__/**/*.test.tsx',
    'src/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/app/**/*.{js,jsx,ts,tsx}',
    '!src/app/api/**/*',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/app/api/',
  ],
}

module.exports = createJestConfig(customJestConfig)