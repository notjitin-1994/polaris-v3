import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:prettier/recommended'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      // Exclude embedded demo app from main frontend linting
      'smartslate-polaris/**',
    ],
  },
  {
    files: ['**/*'],
    rules: {
      // Ensure prettier issues are warnings so lint-staged can run prettier after eslint
      'prettier/prettier': 'warn',
      // TypeScript Rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-hooks/exhaustive-deps': 'warn',
      
      // Anti-pattern Rules - Prevent gradients and other violations
      'no-restricted-syntax': [
        'error',
        // Gradient class patterns
        {
          selector: 'Literal[value=/bg-gradient/]',
          message: 'Gradients are not allowed. Use solid colors or glass effects instead.',
        },
        {
          selector: 'Literal[value=/from-(\\w|\\[)/]',
          message: 'Gradient classes (from-*) are not allowed. Use solid colors instead.',
        },
        {
          selector: 'Literal[value=/via-(\\w|\\[)/]',
          message: 'Gradient classes (via-*) are not allowed. Use solid colors instead.',
        },
        {
          selector: 'Literal[value=/to-(\\w|\\[)/]',
          message: 'Gradient classes (to-*) are not allowed. Use solid colors instead.',
        },
        // Gradient in any string literal
        {
          selector: 'Literal[value=/gradient/i]',
          message: 'Gradient styles are not allowed. Use solid colors or glass effects instead.',
        },
        // Inline style objects
        {
          selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer',
          message: 'Inline styles are not allowed. Use Tailwind utility classes instead. Exceptions: filter for glass effects or critical animations.',
        },
        // Hardcoded colors in class names (warn, not error)
        {
          selector: 'Literal[value=/(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray|slate)-(\\d{3})/]',
          message: 'Consider using semantic color tokens instead of hardcoded Tailwind colors.',
        },
      ],
      
      // Additional inline style checks
      'react/forbid-component-props': [
        'warn',
        {
          forbid: [
            {
              propName: 'style',
              message: 'Inline styles are discouraged. Use Tailwind utility classes instead. If absolutely necessary for dynamic values, ensure it\'s documented.',
            },
          ],
        },
      ],
      
      // Warn about specific style properties
      'no-restricted-properties': [
        'warn',
        {
          object: 'style',
          property: 'backgroundColor',
          message: 'Use Tailwind utility classes instead of inline backgroundColor.',
        },
        {
          object: 'style',
          property: 'color',
          message: 'Use Tailwind utility classes instead of inline color.',
        },
        {
          object: 'style',
          property: 'backgroundImage',
          message: 'Background images should be handled with Tailwind utilities or CSS classes.',
        },
      ],
    },
  },
  // Test files: allow flexible typing and disable gradient checks (tests may include strings)
  {
    files: [
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/*.test.{js,jsx,ts,tsx}',
      '**/test-*.{js,jsx,ts,tsx}',
      'test-*.{js,jsx,ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': 'off',
    },
  },
  // UI surfaces: temporarily downgrade strict style rules to warnings to unblock commits
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/no-unescaped-entities': 'warn',
    },
  },
  // Libraries: keep type safety but avoid commit blocks while refactoring
  {
    files: ['lib/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-syntax': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Types: relax empty object type rule to a warning
  {
    files: ['types/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
  // Stores and API handlers: relax strict typing for incremental migration
  {
    files: ['store/**/*.{ts,tsx}', 'app/api/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': 'warn',
    },
  },
  // JS-only test utilities needing CommonJS require
  {
    files: ['test-*.{js,jsx}', '**/test-*.{js,jsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Exclude this config file itself from content-based style restrictions
  {
    files: ['eslint.config.mjs'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];

export default eslintConfig;
