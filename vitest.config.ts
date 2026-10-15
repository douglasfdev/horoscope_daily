import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Explicitly include test files - more specific pattern
    include: [
      'src/application/__tests__/**/*.test.ts',
      'src/**/*.test.ts'
    ],
    exclude: [
      'node_modules',
      'dist',
      'src/application/use-cases/generate-advanced-natal-chart.use-case.ts',
      'src/application/use-cases/get-daily-horoscope.use-case.ts',
      'src/infrastructure/**'
    ],
    // CI/CD: run once and exit, don't watch
    watch: false,
    // Test timeout
    testTimeout: 10000, // 10 seconds
  },
})
