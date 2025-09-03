import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import react from 'eslint-plugin-react'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import jest from 'eslint-plugin-jest'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: [
      'src/data/**',
      'test/**',
      '**/wdio.conf.js',
      'src/**/*.test.ts',
      'src/**/*.test.js',
      'src/**/*.test.tsx',
      'src/**/*.test.jsx'
    ]
  },
  js.configs.recommended,
  ...fixupConfigRules(
    compat.extends(
      'plugin:react-hooks/recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended'
    )
  ),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: fixupPluginRules(react),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      'react-hooks': fixupPluginRules(reactHooks),
      prettier: fixupPluginRules(prettier),
      jest: fixupPluginRules(jest)
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
        process: true
      },
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect'
      }
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'none',
          printWidth: 120
        }
      ],
      'max-statements': [
        1,
        {
          max: 30
        }
      ],
      'react/no-unknown-property': 0,
      'react/prop-types': 0,
      '@typescript-eslint/no-explicit-any': 1,
      '@typescript-eslint/camelcase': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      'react/no-unescaped-entities': 0,
      '@typescript-eslint/ban-ts-ignore': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/prefer-as-const': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      'react-hooks/rules-of-hooks': 1,
      'react-hooks/exhaustive-deps': 1,
      'ban-ts-ignore': 0,
      'react/display-name': 0,
      'no-extra-boolean-cast': 0,
      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: false
        }
      ]
    }
  }
]
