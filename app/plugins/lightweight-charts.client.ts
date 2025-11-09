import { createChart, ColorType } from 'lightweight-charts'

export default defineNuxtPlugin(() => {
  // Lightweight Charts n'a pas besoin d'initialisation globale
  // On l'exporte pour l'utiliser dans les composants
  return {
    provide: {
      lightweightCharts: {
        createChart,
        ColorType,
      },
    },
  }
})
