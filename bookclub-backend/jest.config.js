export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'NODE_ENV': 'test'
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'esnext',
      },
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    '**/*.ts',
    '!__tests__/**',
    '!node_modules/**',
    '!**/*.config.ts',
    '!generated/**',
  ],
}