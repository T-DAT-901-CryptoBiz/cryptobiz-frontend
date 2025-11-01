import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  { ignores: ['.nuxt/**', 'node_modules/**', 'dist/**', 'coverage/**'] },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        $fetch: 'readonly',
      },
    },
    plugins: { vue },
    rules: {
      ...vue.configs['flat/recommended'].rules,
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        global: {
          ...globals.browser,
          ...globals.es2021,
        },
      },
    },
  },

  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
]
