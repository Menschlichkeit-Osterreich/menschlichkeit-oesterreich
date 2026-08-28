module.exports = {
  root: true,
  env: {
    // es2022 is not recognized by older ESLint analyzers (e.g. Codacy).
    // Use es6 + ecmaVersion in parserOptions instead.
    es6: true,
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
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
