import { defineConfig } from 'vitest/config'

import { sharedAlias } from './vitest.shared'

export default defineConfig({
  resolve: {
    alias: sharedAlias
  },
  test: {
    coverage: {
      exclude: ['src/pages/api/**', '**/*.test.{ts,tsx}', '**/__mocks__/**'],
      include: ['src/**/*.{ts,tsx}', 'ts/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      reportsDirectory: 'coverage/frontend',
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95
      }
    },
    environment: 'jsdom',
    exclude: ['src/pages/api/**'],
    globals: false,
    include: ['src/**/*.test.{ts,tsx}', 'ts/**/*.test.ts'],
    name: 'frontend',
    setupFiles: ['./vitest.setup.frontend.ts']
  }
})
