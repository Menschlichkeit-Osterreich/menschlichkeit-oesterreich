// Vitest Configuration
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['**/unit/**/*.{test,spec}.{js,ts}', 'tests/**/*.test.{js,ts}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      '**/e2e/**',
      '**/playwright/**',
      '.trunk/**',
      'crm.menschlichkeit-oesterreich.at/web/**',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/coverage/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@web': resolve(__dirname, './web'),
      '@games': resolve(__dirname, './web/games'),
      '@api': resolve(__dirname, './api.menschlichkeit-oesterreich.at'),
      '@crm': resolve(__dirname, './crm.menschlichkeit-oesterreich.at'),
    },
  },
});
