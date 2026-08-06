import { defineConfig } from 'vitest/config'

import { sharedAlias } from './vitest.shared'

export default defineConfig({
  envPrefix: 'JWT_SECRET',
  resolve: {
    alias: sharedAlias
  },
  test: {
    coverage: {
      exclude: [
        'backend/prisma/generated/**',
        'backend/prisma/index.ts',
        '**/*.test.{ts,tsx}',
        '**/mocks/**'
      ],
      include: [
        'backend/api/**/*.ts',
        'src/pages/api/**/*.ts',
        'ts/helpers.ts',
        'ts/parsers.ts',
        'ts/tokens.ts'
      ],
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      reportsDirectory: 'coverage/backend',
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95
      }
    },
    environment: 'node',
    globals: false,
    include: ['backend/**/*.test.ts', 'src/pages/api/**/*.test.ts', 'ts/tests/**/*.test.ts'],
    name: 'backend'
  }
})
