// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  postcss: { plugins: { '@tailwindcss/postcss': {} } },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/eslint', 'unplugin-icons/nuxt'],
  runtimeConfig: {
    binanceApiKey: '',
    public: {
      binanceRestBase: 'https://api.binance.com',
      binanceWsBase: 'wss://stream.binance.com:9443/ws',
    },
  },
  typescript: { strict: true },
})
