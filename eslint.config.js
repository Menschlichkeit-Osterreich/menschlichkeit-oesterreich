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
      '**/sw.js', // Service workers use special globals
      '**/*.config.{js,ts}', // Config files have their own patterns
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
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
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
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  },
];
