import { ref, computed } from 'vue'
import type { PriceAlert } from '~/server/utils/alerts'

export function usePriceAlerts() {
  const alerts = ref<PriceAlert[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      const data = await $fetch<{ alerts: PriceAlert[] }>('/api/alerts')
      alerts.value = data.alerts
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to load alerts'
      alerts.value = []
    } finally {
      pending.value = false
    }
  }

  async function createAlert(data: {
    symbol: string
    type: 'above' | 'below' | 'change'
    targetPrice?: number
    changePercent?: number
  }) {
    pending.value = true
    error.value = null
    try {
      const result = await $fetch<{ alert: PriceAlert }>('/api/alerts', {
        method: 'POST',
        body: data,
      })
      await load() // Recharger les alertes
      return result.alert
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to create alert'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function updateAlert(
    id: string,
    updates: Partial<Omit<PriceAlert, 'id' | 'userId' | 'createdAt'>>,
  ) {
    pending.value = true
    error.value = null
    try {
      const result = await $fetch<{ alert: PriceAlert }>(`/api/alerts/${id}`, {
        method: 'PUT',
        body: updates,
      })
      await load() // Recharger les alertes
      return result.alert
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to update alert'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function removeAlert(id: string) {
    pending.value = true
    error.value = null
    try {
      await $fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      })
      await load() // Recharger les alertes
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to delete alert'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function toggleAlert(id: string) {
    pending.value = true
    error.value = null
    try {
      const result = await $fetch<{ alert: PriceAlert }>(`/api/alerts/${id}/toggle`, {
        method: 'POST',
      })
      await load() // Recharger les alertes
      return result.alert
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to toggle alert'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function resetAlert(id: string) {
    pending.value = true
    error.value = null
    try {
      const result = await $fetch<{ alert: PriceAlert }>(`/api/alerts/${id}/reset`, {
        method: 'POST',
      })
      await load() // Recharger les alertes
      return result.alert
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to reset alert'
      throw e
    } finally {
      pending.value = false
    }
  }

  const activeAlerts = computed(() => alerts.value.filter((a) => a.isActive && !a.triggered))
  const triggeredAlerts = computed(() => alerts.value.filter((a) => a.triggered))
  const inactiveAlerts = computed(() => alerts.value.filter((a) => !a.isActive && !a.triggered))

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    inactiveAlerts,
    pending,
    error,
    load,
    createAlert,
    updateAlert,
    removeAlert,
    toggleAlert,
    resetAlert,
  }
}
