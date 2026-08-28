module.exports = {
  root: true,
  env: {
    // Legacy Codacy Analysis CLI compatibility. The authoritative ESLint 9
    // configuration is eslint.config.js and keeps ecmaVersion at "latest".
    es2021: true,
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/.venv/**',
    '**/coverage/**',
    'quality-reports/**',
    '.cache/**',
    'figma-design-system/**',
    'codacy-analysis-cli/**',
    'codacy-analysis-cli-master/**',
  ],
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
};
