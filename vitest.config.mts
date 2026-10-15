import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'node_modules', 'dist'],
    },
    watch: false,
  },
})
