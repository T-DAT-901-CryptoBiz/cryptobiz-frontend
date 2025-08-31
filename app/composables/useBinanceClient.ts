export function useBinanceClient() {
  const config = useRuntimeConfig()
  const baseURL = config.public.binanceRestBase

  const client = $fetch.create({
    baseURL,
    retry: 2,
    retryDelay: 300,
    onRequest({ options }) {
      options.headers = {
        ...(options.headers || {}),
        Accept: 'application/json',
      }
    },
  })

  return { client }
}
