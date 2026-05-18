import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json', './tsconfig.app.json', './tsconfig.node.json'],
      },
    },
    settings: { react: { version: '19.0' } },
  },
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 'argsIgnorePattern': '^_' }
      ],
    },
  },
]);
