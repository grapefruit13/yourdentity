import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      import: eslintPluginImport,
      react: eslintPluginReact,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      'require-await': 'error',
      'no-console': 'warn',
      'import/prefer-default-export': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-trailing-spaces': 'error',
    },
  },
];

export default eslintConfig;
