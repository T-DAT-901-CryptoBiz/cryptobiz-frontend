import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      '.nuxt/**',
      'node_modules/**',
      'node_modules.backup/**',
      'dist/**',
      '.output/**',
      'coverage/**',
      '.git/**',
      '.data/**',
      '*.config.js',
      '*.config.ts',
    ],
  },

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
        useAuth: 'readonly',
        useRouter: 'readonly',
        useRoute: 'readonly',
        ref: 'readonly',
        definePageMeta: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onBeforeUnmount: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        useState: 'readonly',
        useRuntimeConfig: 'readonly',
        navigateTo: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useHead: 'readonly',
        useWatchlist: 'readonly',
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
