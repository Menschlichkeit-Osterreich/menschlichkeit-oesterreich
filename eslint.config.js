import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  // Global ignores (applies to all configurations)
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      '**/*.d.ts',
      'frontend/dist/**',
      'frontend/.next/**',
      'api.menschlichkeit-oesterreich.at/dist/**',
      'api.menschlichkeit-oesterreich.at/.venv/**',
      '**/.venv/**',
      '**/__pycache__/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/vendor/**',
      'crm.menschlichkeit-oesterreich.at/vendor/**',
      'crm.menschlichkeit-oesterreich.at/web/core/**',
      '**/web/core/**',
      'automation/n8n/webhook-client.js',
      '**/sw.js',
      '**/*.config.{js,ts}',
      // Vendor / external tooling – not linted
      'codacy-analysis-cli-master/**',
      'codacy-analysis-cli/**',
      // Game assets – legacy browser-global scripts (THREE.js etc.)
      'apps/game/**',
      'web/**',
      // Generated Figma design-system components
      'figma-design-system/components/**',
      // Legacy website assets (non-bundled)
      'website/assets/**',
      // Build outputs
      'out/**',
      '**/.next/**',
      // Quality/test reports
      'quality-reports/**',
      'playwright-results/**',
      // Cache / tooling dirs
      '.cache/**',
      '.trunk/**',
      '.trivycache/**',
      '.mcp/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // TypeScript handles type checking; no-undef causes false positives for DOM types (RequestInit, etc.)
      'no-undef': 'off',
      'no-console': 'off',
    },
  },
  // Test files – jest globals
  {
    files: ['**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}', 'tests/**', 'website/tests/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];
