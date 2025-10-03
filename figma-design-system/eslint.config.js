import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'build', 'crm/vendor', 'api/__pycache__'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // React Hooks Rules
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh Rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Security Rules (MANDATORY - PR Blocking)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Accessibility Rules (WCAG AA Compliance - MANDATORY)
      'jsx-a11y/accessible-emoji': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      
      // Performance Rules
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-no-bind': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Code Quality Rules (Maintainability ≥85%)
      'complexity': ['error', { max: 15 }],
      'max-depth': ['error', { max: 4 }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', { max: 5 }],
      'no-magic-numbers': ['warn', { 
        ignore: [0, 1, -1, 2, 24, 60, 1000], 
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true 
      }],
      
      // Austrian/German Specific Rules
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      
      // GDPR Compliance Rules
      'no-console': ['error', { allow: ['warn', 'error'] }], // Prevent PII logging
      
      // React Best Practices
      'react/prop-types': 'off', // Using TypeScript instead
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'error',
      'react/require-render-return': 'error',
      
      // TypeScript Specific Rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      
      // Import Rules
      'import/no-default-export': 'off',
      'import/prefer-default-export': 'off',
      
      // Prevent common mistakes
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
      'no-useless-catch': 'error',
      'no-useless-return': 'error',
      
      // Austrian Brand/Accessibility specific
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Override for test files
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Override for configuration files
  {
    files: ['**/*.config.{js,ts}', '**/vite.config.{js,ts}', '**/tailwind.config.{js,ts}'],
    rules: {
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Override for democracy game components (relaxed complexity for educational content)
  {
    files: [
      '**/components/BridgeBuilding*.tsx',
      '**/components/GameDataGenerator.tsx',
      '**/components/MinigameComponents.tsx',
      '**/components/AdvancedLevelVisualization.tsx'
    ],
    rules: {
      'max-lines': ['error', { max: 500 }], // Educational content can be longer
      'complexity': ['error', { max: 20 }], // Game logic can be more complex
      'max-lines-per-function': ['error', { max: 80 }], // Game functions can be longer
      'no-magic-numbers': 'off', // Game constants are acceptable
    },
  }
)