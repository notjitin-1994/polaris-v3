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
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
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
];

export default eslintConfig;
