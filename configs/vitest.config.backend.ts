import { defineConfig } from 'vitest/config'

import { sharedAlias } from './vitest.shared'

export default defineConfig({
  resolve: {
    alias: sharedAlias
  },
  test: {
    coverage: {
      exclude: [
        'prisma/generated/**',
        'prisma/api/prisma.ts',
        '**/*.test.{ts,tsx}',
        '**/__mocks__/**'
      ],
      include: ['prisma/api/**/*.ts', 'src/pages/api/**/*.ts', 'ts/parsers.ts'],
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
    include: ['prisma/**/*.test.ts', 'src/pages/api/**/*.test.ts', 'ts/parsers.test.ts'],
    name: 'backend'
  }
})
