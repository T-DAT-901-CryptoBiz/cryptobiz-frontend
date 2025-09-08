<!-- pages/alerts.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <header
        class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between"
    >
      <div>
        <h1 class="text-lg font-semibold">Alerts</h1>
        <p class="text-xs text-white/60">Crée des alertes prix en un instant.</p>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <span class="px-2 py-1 rounded-md bg-white/5 text-white/70">
          {{ alerts.length }} alertes
        </span>
        <button
            v-if="alerts.length"
            type="button"
            class="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-rose-300/90"
            @click="clearAll"
        >
          Tout supprimer
        </button>
      </div>
    </header>

    <!-- Create form -->
    <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h2 class="text-sm font-medium mb-3">Nouvelle alerte</h2>

      <form class="grid grid-cols-1 sm:grid-cols-[180px,160px,160px,auto] gap-3" @submit.prevent="create">
        <!-- Symbole -->
        <div class="space-y-1">
          <label class="text-xs text-white/60">Symbole</label>
          <input
              v-model="form.symbol"
              type="text"
              inputmode="text"
              placeholder="BTC ou BTCUSDT"
              class="h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-sm outline-none focus:bg-white/10"
          />
        </div>

        <!-- Opérateur -->
        <div class="space-y-1">
          <label class="text-xs text-white/60">Condition</label>
          <select
              v-model="form.op"
              class="h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-sm outline-none focus:bg-white/10"
          >
            <option value="above">≥ au prix</option>
            <option value="below">≤ au prix</option>
          </select>
        </div>

        <!-- Prix -->
        <div class="space-y-1">
          <label class="text-xs text-white/60">Prix (quote)</label>
          <input
              v-model.number="form.price"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="ex: 60000"
              class="h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-sm outline-none focus:bg-white/10"
          />
        </div>

        <!-- Action -->
        <div class="flex items-end">
          <button
              type="submit"
              class="h-9 px-4 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
              :disabled="submitting"
          >
            {{ submitting ? 'Création…' : 'Créer l’alerte' }}
          </button>
        </div>
      </form>

      <p v-if="formError" class="mt-2 text-xs text-rose-300/90">{{ formError }}</p>
    </section>

    <!-- List -->
    <section class="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div class="text-sm text-white/80">Mes alertes</div>
        <div class="text-xs text-white/50">Actives: {{ activeCount }} • Inactives: {{ inactiveCount }}</div>
      </div>

      <div v-if="!alerts.length" class="p-8 text-center text-white/70">
        Aucune alerte. Crée la première ci-dessus.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-white/60">
          <tr class="[&>th]:px-4 [&>th]:py-3 text-left">
            <th>Symbole</th>
            <th>Condition</th>
            <th>Créée</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="a in alerts"
              :key="a.id"
              class="border-t border-white/10 hover:bg-white/5"
          >
            <td class="px-4 py-3 font-medium">{{ a.symbol }}</td>
            <td class="px-4 py-3">
                <span class="tabular-nums">
                  {{ a.op === 'above' ? '≥' : '≤' }} {{ formatPrice(a.price) }}
                </span>
            </td>
            <td class="px-4 py-3 text-white/60 text-xs">{{ timeAgo(a.createdAt) }}</td>
            <td class="px-4 py-3">
                <span
                    :class="a.active ? 'text-emerald-300' : 'text-white/60'"
                    class="text-xs font-medium"
                >
                  {{ a.active ? 'Active' : 'Pause' }}
                </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                    class="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 text-xs"
                    @click="toggle(a.id)"
                >
                  {{ a.active ? 'Mettre en pause' : 'Activer' }}
                </button>
                <button
                    class="px-2 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/20 text-rose-200 text-xs"
                    @click="removeOne(a.id)"
                >
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'
import { useAlertsCenter } from '~/composables/useAlertsCenter'

type Op = 'above' | 'below'
type Alert = {
  id: string
  symbol: string   // ex: BTCUSDT ou BTC
  op: Op
  price: number
  active: boolean
  createdAt: number
}

const { success, error } = useToast()
const { addUnread, clearUnread } = useAlertsCenter()

/* ---------------- Form ---------------- */
const form = ref<{ symbol: string; op: Op; price: number | null }>({
  symbol: '',
  op: 'above',
  price: null,
})
const formError = ref<string | null>(null)
const submitting = ref(false)

/* ---------------- Storage ---------------- */
const STORAGE_KEY = 'alerts:v1'
const alerts = ref<Alert[]>([])

function load() {
  if (import.meta.server) return
  try {
    alerts.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    alerts.value = []
  }
}
function save() {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.value))
}
watch(alerts, save, { deep: true })

/* ---------------- Actions ---------------- */
function normalizeSymbol(raw: string): string {
  const s = (raw || '').trim().toUpperCase().replace(/\s+/g, '')
  if (!s) return ''
  // si l’utilisateur met juste “BTC”, ok. Si “BTCUSDT”, on garde tel quel.
  return s
}
function validate(): boolean {
  formError.value = null
  const sym = normalizeSymbol(form.value.symbol)
  if (!sym) {
    formError.value = 'Entre un symbole (ex: BTC ou BTCUSDT).'
    return false
  }
  if (form.value.price == null || isNaN(Number(form.value.price)) || Number(form.value.price) <= 0) {
    formError.value = 'Entre un prix valide (> 0).'
    return false
  }
  return true
}

async function create() {
  if (!validate()) return
  submitting.value = true
  try {
    const sym = normalizeSymbol(form.value.symbol)
    const a: Alert = {
      id: cryptoRandomId(),
      symbol: sym,
      op: form.value.op,
      price: Number(form.value.price),
      active: true,
      createdAt: Date.now(),
    }
    alerts.value.unshift(a)

    // Toast global + badge sidebar (+1 unread)
    success('Alert créée ✅')
    addUnread(1)

    // reset form
    form.value.symbol = ''
    form.value.price = null
    form.value.op = 'above'
  } catch (e) {
    error('Impossible de créer l’alerte')
  } finally {
    submitting.value = false
  }
}

function toggle(id: string) {
  const a = alerts.value.find((x) => x.id === id)
  if (!a) return
  a.active = !a.active
}

function removeOne(id: string) {
  alerts.value = alerts.value.filter((x) => x.id !== id)
}

function clearAll() {
  alerts.value = []
}

/* ---------------- Derived ---------------- */
const activeCount = computed(() => alerts.value.filter((a) => a.active).length)
const inactiveCount = computed(() => alerts.value.length - activeCount.value)

/* ---------------- Utils ---------------- */
function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-expect-error - TS ne sait pas trop
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}
function formatPrice(n: number) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 8 })
}
function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

/* ---------------- Lifecycle ---------------- */
onMounted(() => {
  load()
  // On ouvre la page Alerts -> on considère tout lu (badge sidebar disparaît)
  clearUnread()
})
</script>
