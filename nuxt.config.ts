// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  postcss: { plugins: { '@tailwindcss/postcss': {} } },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/eslint', 'unplugin-icons/nuxt'],
  runtimeConfig: {
    binanceApiKey: '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // API Klines (côté serveur uniquement)
    klineApiUrl: process.env.KLINE_API_URL || 'http://127.0.0.1:8004',
    public: {
      // Binance Spot API
      binanceRestBase: process.env.NUXT_PUBLIC_BINANCE_REST_BASE || 'https://api.binance.com',
      binanceWsBase: process.env.NUXT_PUBLIC_BINANCE_WS_BASE || 'wss://stream.binance.com:9443/ws',
      // Binance Futures API
      binanceFuturesRestBase: process.env.NUXT_PUBLIC_BINANCE_FUTURES_REST_BASE || 'https://fapi.binance.com',
      // API Klines (côté client)
      klineApiUrl: process.env.NUXT_PUBLIC_KLINE_API_URL || 'http://127.0.0.1:8004',
      klineWsUrl: process.env.NUXT_PUBLIC_KLINE_WS_URL || 'ws://127.0.0.1:8004',
    },
  },
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/cryptobiz-logo.png',
        },
      ],
    },
  },
  typescript: { strict: true },
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.nuxt/**',
          '**/.output/**',
        ],
      },
    },
  },
})
