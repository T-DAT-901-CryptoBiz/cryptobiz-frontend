import { ref, computed } from 'vue'
import type { PortfolioTransaction, UserPortfolio } from '~/server/utils/portfolio'

export function usePortfolio() {
  const portfolio = ref<UserPortfolio | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      const data = await $fetch<UserPortfolio>('/api/portfolio')
      portfolio.value = data
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to load portfolio'
      portfolio.value = null
    } finally {
      pending.value = false
    }
  }

  async function addTransaction(data: {
    symbol: string
    type: 'buy' | 'sell'
    quantity: number
    price: number
    fee?: number
    notes?: string
    date?: string
  }) {
    pending.value = true
    error.value = null
    try {
      const result = await $fetch<{ transaction: PortfolioTransaction }>(
        '/api/portfolio/transactions',
        {
          method: 'POST',
          body: data,
        },
      )
      await load() // Recharger le portfolio
      return result.transaction
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to add transaction'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function updateTransaction(
    id: string,
    updates: Partial<Omit<PortfolioTransaction, 'id'>> & {
      originalQuantity?: number
      originalPrice?: number
      originalFee?: number
    },
  ) {
    pending.value = true
    error.value = null
    try {
      const result = await $fetch<{ transaction: PortfolioTransaction }>(
        `/api/portfolio/transactions/${id}`,
        {
          method: 'PUT',
          body: updates,
        },
      )
      await load() // Recharger le portfolio
      return result.transaction
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to update transaction'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function removeTransaction(id: string) {
    pending.value = true
    error.value = null
    try {
      await $fetch(`/api/portfolio/transactions/${id}`, {
        method: 'DELETE',
      })
      await load() // Recharger le portfolio
    } catch (e: unknown) {
      error.value = (e as Error).message || 'Failed to delete transaction'
      throw e
    } finally {
      pending.value = false
    }
  }

  const positions = computed(() => portfolio.value?.positions || [])
  const transactions = computed(() => portfolio.value?.transactions || [])

  return {
    portfolio,
    positions,
    transactions,
    pending,
    error,
    load,
    addTransaction,
    updateTransaction,
    removeTransaction,
  }
}
