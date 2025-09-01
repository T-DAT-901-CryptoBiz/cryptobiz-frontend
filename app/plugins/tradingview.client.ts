export default defineNuxtPlugin(() => {
  if (document.getElementById('tv-widget-script')) return
  const s = document.createElement('script')
  s.id = 'tv-widget-script'
  s.src = 'https://s3.tradingview.com/tv.js'
  s.async = true
  document.head.appendChild(s)
})
