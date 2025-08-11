module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/', '<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts', '**/tests/simple-test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/jestSetup.ts', '<rootDir>/tests/setup.ts'],
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true
}
