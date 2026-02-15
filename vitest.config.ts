/**
 * Vitest configuration for Ipsumify.
 *
 * Uses happy-dom for browser environment simulation.
 * Configured for TypeScript support.
 *
 * @see https://vitest.dev/config/
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        '.output/',
        'vitest.config.ts',
        '**/*.config.*',
        '**/types.ts',
      ],
    },
    globals: true,
  },
})
