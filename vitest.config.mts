import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/application/__tests__/**/*.test.ts',
      'src/**/*.test.ts'
    ],
    exclude: ['node_modules', 'dist'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'node_modules', 'dist'],
    },
    watch: false,

    testTimeout: 10000, // 10 seconds
  },
})
