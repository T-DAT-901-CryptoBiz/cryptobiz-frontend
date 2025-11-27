<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Portfolio Tracker</h1>
        <p class="text-sm text-white/60 mt-1.5">
          Track your cryptocurrency investments and performance
        </p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors inline-flex items-center gap-2"
      >
        <Icon name="lucide:plus" class="h-4 w-4" />
        Add Transaction
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending && !portfolio" class="text-center py-12">
      <div
        class="inline-block h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"
      />
      <div class="text-sm text-white/60">Loading portfolio...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
      <div class="flex items-center gap-2 text-red-400">
        <Icon name="lucide:alert-circle" class="h-5 w-5" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Portfolio Content -->
    <div v-else class="space-y-6">
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">
              Total Value
            </div>
            <Icon name="lucide:wallet" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums mb-2">${{ formatCurrency(totalValue) }}</div>
          <div
            class="text-sm font-semibold inline-flex items-center gap-1.5"
            :class="totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            <Icon
              :name="totalPnL >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'"
              class="h-4 w-4"
            />
            <span>{{ totalPnL >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(totalPnL)) }}</span>
            <span class="text-white/60"
              >({{ totalPnL >= 0 ? '+' : '' }}{{ totalPnLPercent.toFixed(2) }}%)</span
            >
          </div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">
              Total Invested
            </div>
            <Icon name="lucide:dollar-sign" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums">${{ formatCurrency(totalInvested) }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">
              Active Positions
            </div>
            <Icon name="lucide:layers" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums">{{ positions.length }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">
              Transactions
            </div>
            <Icon name="lucide:list" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums">{{ transactions.length }}</div>
        </div>
      </div>

      <!-- Positions List -->
      <div class="rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden shadow-lg">
        <div
          class="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5"
        >
          <h3 class="font-semibold text-lg">Active Positions</h3>
          <span class="text-xs text-white/60 bg-white/5 px-2.5 py-1 rounded-full">
            {{ positions.length }} {{ positions.length === 1 ? 'position' : 'positions' }}
          </span>
        </div>

        <div v-if="positions.length === 0" class="p-12 text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4"
          >
            <Icon name="lucide:wallet" class="h-8 w-8 text-white/40" />
          </div>
          <p class="text-white/80 font-medium mb-1">No positions yet</p>
          <p class="text-sm text-white/50 mb-4">
            Add a transaction to start tracking your portfolio
          </p>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm transition-colors inline-flex items-center gap-2"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Add First Transaction
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-white/60 border-b border-white/10 bg-white/5">
              <tr>
                <th class="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">
                  Asset
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Avg Price
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Current Price
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Value
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  PnL
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  PnL %
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="position in positionsWithPrices"
                :key="position.id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <ui-coin-logo :asset="getBase(position.symbol)" :size="28" />
                    <div>
                      <div class="font-semibold">{{ getBase(position.symbol) }}</div>
                      <div class="text-xs text-white/50">{{ position.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-right tabular-nums font-medium">
                  {{ formatQuantity(position.quantity) }}
                </td>
                <td class="px-5 py-4 text-right tabular-nums text-white/80">
                  ${{ formatPrice(position.averagePrice) }}
                </td>
                <td class="px-5 py-4 text-right tabular-nums">
                  <span v-if="position.currentPrice" class="font-medium">
                    ${{ formatPrice(position.currentPrice) }}
                  </span>
                  <span v-else class="text-white/40">-</span>
                </td>
                <td class="px-5 py-4 text-right tabular-nums font-semibold">
                  <span v-if="position.currentValue">
                    ${{ formatCurrency(position.currentValue) }}
                  </span>
                  <span v-else class="text-white/40">-</span>
                </td>
                <td
                  class="px-5 py-4 text-right tabular-nums font-semibold"
                  :class="position.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  <span v-if="position.pnl !== null" class="inline-flex items-center gap-1">
                    <Icon
                      :name="position.pnl >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'"
                      class="h-4 w-4"
                    />
                    {{ position.pnl >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(position.pnl)) }}
                  </span>
                  <span v-else class="text-white/40">-</span>
                </td>
                <td
                  class="px-5 py-4 text-right tabular-nums font-semibold"
                  :class="position.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  <span v-if="position.pnlPercent !== null">
                    {{ position.pnlPercent >= 0 ? '+' : '' }}{{ position.pnlPercent.toFixed(2) }}%
                  </span>
                  <span v-else class="text-white/40">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Performance Chart -->
        <div class="rounded-2xl bg-neutral-900/60 border border-white/10 p-5 shadow-lg">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-lg">Portfolio Value</h3>
            <Icon name="lucide:trending-up" class="h-5 w-5 text-white/30" />
          </div>
          <div class="h-72">
            <ClientOnly>
              <apexchart
                v-if="chartData.length > 0"
                type="area"
                height="288"
                :options="chartOptions"
                :series="chartSeries"
              />
              <div
                v-else
                class="h-full flex flex-col items-center justify-center text-white/60 text-sm"
              >
                <Icon name="lucide:line-chart" class="h-12 w-12 mb-3 opacity-30" />
                <p>Add transactions to see performance chart</p>
              </div>
              <template #fallback>
                <div class="h-full flex items-center justify-center text-white/60">Loading...</div>
              </template>
            </ClientOnly>
          </div>
        </div>

        <!-- Asset Distribution -->
        <div class="rounded-2xl bg-neutral-900/60 border border-white/10 p-5 shadow-lg">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-lg">Asset Distribution</h3>
            <Icon name="lucide:pie-chart" class="h-5 w-5 text-white/30" />
          </div>
          <div class="h-72">
            <ClientOnly>
              <apexchart
                v-if="distributionData.length > 0"
                type="donut"
                height="288"
                :options="donutOptions"
                :series="distributionSeries"
              />
              <div
                v-else
                class="h-full flex flex-col items-center justify-center text-white/60 text-sm"
              >
                <Icon name="lucide:pie-chart" class="h-12 w-12 mb-3 opacity-30" />
                <p>No positions to display</p>
              </div>
              <template #fallback>
                <div class="h-full flex items-center justify-center text-white/60">Loading...</div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Transactions History -->
      <div class="rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden shadow-lg">
        <div
          class="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5"
        >
          <h3 class="font-semibold text-lg">Transaction History</h3>
          <span class="text-xs text-white/60 bg-white/5 px-2.5 py-1 rounded-full">
            {{ transactions.length }}
            {{ transactions.length === 1 ? 'transaction' : 'transactions' }}
          </span>
        </div>

        <div v-if="transactions.length === 0" class="p-12 text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4"
          >
            <Icon name="lucide:list" class="h-8 w-8 text-white/40" />
          </div>
          <p class="text-white/80 font-medium mb-1">No transactions yet</p>
          <p class="text-sm text-white/50 mb-4">Start tracking your crypto investments</p>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm transition-colors inline-flex items-center gap-2"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Add First Transaction
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-white/60 border-b border-white/10 bg-white/5">
              <tr>
                <th class="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">
                  Date
                </th>
                <th class="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">
                  Type
                </th>
                <th class="px-5 py-3.5 text-left font-medium text-xs uppercase tracking-wider">
                  Asset
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Price
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Total
                </th>
                <th class="px-5 py-3.5 text-right font-medium text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tx in sortedTransactions"
                :key="tx.id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td class="px-5 py-4 text-white/70 text-xs">
                  {{ formatDate(tx.createdAt) }}
                </td>
                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                    :class="
                      tx.type === 'buy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    "
                  >
                    <Icon
                      :name="tx.type === 'buy' ? 'lucide:arrow-down' : 'lucide:arrow-up'"
                      class="h-3.5 w-3.5"
                    />
                    {{ tx.type === 'buy' ? 'Buy' : 'Sell' }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2.5">
                    <ui-coin-logo :asset="getBase(tx.symbol)" :size="24" />
                    <div>
                      <span class="font-semibold">{{ getBase(tx.symbol) }}</span>
                      <span class="text-xs text-white/50 ml-1">{{ tx.symbol }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-right tabular-nums font-medium">
                  {{ formatQuantity(tx.quantity) }}
                </td>
                <td class="px-5 py-4 text-right tabular-nums text-white/80">
                  ${{ formatPrice(tx.price) }}
                </td>
                <td class="px-5 py-4 text-right tabular-nums font-semibold">
                  ${{ formatCurrency(tx.total) }}
                </td>
                <td class="px-5 py-4 text-right">
                  <div
                    class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      @click="editTransaction(tx)"
                      class="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Edit"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteTransaction(tx)"
                      class="p-1.5 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      aria-label="Delete"
                    >
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Transaction Modal -->
    <div
      v-if="showAddModal || editingTransaction"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="closeModal"
    >
      <div
        class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold">
              {{ editingTransaction ? 'Edit Transaction' : 'Add Transaction' }}
            </h3>
            <p class="text-xs text-white/50 mt-1">
              {{
                editingTransaction ? 'Update transaction details' : 'Track your crypto investment'
              }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="saveTransaction" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Symbol</label>
            <div class="relative symbol-input-container">
              <Icon
                name="lucide:search"
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
              />
              <input
                v-model="form.symbol"
                type="text"
                placeholder="Search symbol (e.g., BTCUSDC)"
                required
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                @input="onSymbolInput"
                @focus="showSymbolSuggestions = true"
              />
              <div
                v-if="showSymbolSuggestions && symbolSuggestions.length > 0"
                class="absolute z-20 w-full mt-1 bg-neutral-800 border border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto"
              >
                <button
                  v-for="suggestion in symbolSuggestions"
                  :key="suggestion.symbol"
                  type="button"
                  @click="selectSymbol(suggestion.symbol)"
                  class="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <ui-coin-logo :asset="suggestion.base" :size="24" />
                  <div class="flex-1">
                    <div class="text-sm font-medium">{{ suggestion.base }}</div>
                    <div class="text-xs text-white/50">{{ suggestion.symbol }}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Type</label>
            <div class="flex gap-3">
              <button
                type="button"
                @click="form.type = 'buy'"
                class="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                :class="
                  form.type === 'buy'
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                "
              >
                <Icon name="lucide:arrow-down" class="h-4 w-4 inline mr-2" />
                Buy
              </button>
              <button
                type="button"
                @click="form.type = 'sell'"
                class="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                :class="
                  form.type === 'sell'
                    ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/40 shadow-lg shadow-rose-500/10'
                    : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                "
              >
                <Icon name="lucide:arrow-up" class="h-4 w-4 inline mr-2" />
                Sell
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-white/70 mb-2">Quantity</label>
              <input
                v-model.number="form.quantity"
                type="number"
                step="any"
                placeholder="0.00"
                required
                min="0"
                class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-white/70 mb-2">Price (USDC)</label>
              <input
                v-model.number="form.price"
                type="number"
                step="any"
                placeholder="0.00"
                required
                min="0"
                class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Fee (optional)</label>
            <input
              v-model.number="form.fee"
              type="number"
              step="any"
              placeholder="0.00"
              min="0"
              class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Notes (optional)</label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Add a note about this transaction..."
              class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="pending"
              class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {{ editingTransaction ? 'Update Transaction' : 'Add Transaction' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal && transactionToDelete"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="cancelDelete"
    >
      <div
        class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10"
        >
          <Icon name="lucide:alert-triangle" class="h-8 w-8 text-rose-400" />
        </div>

        <h3 class="text-xl font-bold text-center mb-2">Delete Transaction</h3>
        <p class="text-sm text-white/60 text-center mb-6">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>

        <!-- Transaction Details -->
        <div class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div class="flex items-center gap-3 mb-3">
            <ui-coin-logo :asset="getBase(transactionToDelete.symbol)" :size="32" />
            <div class="flex-1">
              <div class="font-semibold">{{ getBase(transactionToDelete.symbol) }}</div>
              <div class="text-xs text-white/50">{{ transactionToDelete.symbol }}</div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
              :class="
                transactionToDelete.type === 'buy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              "
            >
              <Icon
                :name="transactionToDelete.type === 'buy' ? 'lucide:arrow-down' : 'lucide:arrow-up'"
                class="h-3.5 w-3.5"
              />
              {{ transactionToDelete.type === 'buy' ? 'Buy' : 'Sell' }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-white/60 text-xs mb-1">Quantity</div>
              <div class="font-medium">{{ formatQuantity(transactionToDelete.quantity) }}</div>
            </div>
            <div>
              <div class="text-white/60 text-xs mb-1">Price</div>
              <div class="font-medium">${{ formatPrice(transactionToDelete.price) }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-white/60 text-xs mb-1">Total</div>
              <div class="font-semibold text-lg">
                ${{ formatCurrency(transactionToDelete.total) }}
              </div>
            </div>
            <div class="col-span-2">
              <div class="text-white/60 text-xs mb-1">Date</div>
              <div class="font-medium">{{ formatDate(transactionToDelete.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="cancelDelete"
            class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDelete"
            :disabled="pending"
            class="flex-1 px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-sm font-semibold transition-colors disabled:opacity-50 text-rose-400"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4 inline mr-2" />
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePortfolio } from '~/composables/usePortfolio'
import { useAll24h } from '~/composables/useAll24h'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import type { PortfolioTransaction } from '~/server/utils/portfolio'

const { maps } = useSymbolsUniverse()
const showSymbolSuggestions = ref(false)
const symbolSuggestions = ref<Array<{ symbol: string; base: string }>>([])

const availableSymbols = computed(() => {
  const symbols: Array<{ symbol: string; base: string }> = []
  for (const [symbol, base] of Object.entries(maps.value.base)) {
    if (symbol.endsWith('USDC')) {
      symbols.push({ symbol, base })
    }
  }
  return symbols.sort((a, b) => a.base.localeCompare(b.base))
})

function onSymbolInput() {
  const query = form.value.symbol.toUpperCase().trim()
  if (query.length === 0) {
    symbolSuggestions.value = availableSymbols.value
    return
  }
  // Remove "USDC" from query if present to search in base symbol
  const cleanQuery = query.replace(/USDC$/, '')
  symbolSuggestions.value = availableSymbols.value.filter(
    (s) =>
      s.symbol.toUpperCase().includes(query) ||
      s.base.toUpperCase().includes(cleanQuery) ||
      s.symbol.toUpperCase().startsWith(cleanQuery),
  )
}

function selectSymbol(symbol: string) {
  form.value.symbol = symbol
  showSymbolSuggestions.value = false
}

useHead({
  title: 'Portfolio - CryptoBiz',
})

const { isAuthenticated, pending: authPending } = useAuth()
const {
  portfolio,
  positions,
  transactions,
  pending,
  error,
  load,
  addTransaction,
  updateTransaction,
  removeTransaction,
} = usePortfolio()
const { rows } = useAll24h()

onMounted(async () => {
  // Close suggestions when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.symbol-input-container')) {
      showSymbolSuggestions.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    // Restore body scroll on unmount
    document.body.style.overflow = ''
  })

  // Attendre que l'authentification soit vérifiée avant de charger le portfolio
  if (authPending.value) {
    await new Promise((resolve) => {
      const unwatch = watch(authPending, (pending) => {
        if (!pending) {
          unwatch()
          resolve(undefined)
        }
      })
    })
  }

  if (isAuthenticated.value) {
    await load()
  }
})

const showAddModal = ref(false)
const editingTransaction = ref<PortfolioTransaction | null>(null)
const showDeleteModal = ref(false)
const transactionToDelete = ref<PortfolioTransaction | null>(null)

// Block body scroll when modal is open
watch([showAddModal, editingTransaction, showDeleteModal], ([showModal, editing, showDelete]) => {
  if (showModal || editing || showDelete) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const form = ref({
  symbol: '',
  type: 'buy' as 'buy' | 'sell',
  quantity: 0,
  price: 0,
  fee: 0,
  notes: '',
  date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD for input[type="date"]
})

function getBase(symbol: string): string {
  return maps.value.base[symbol] || symbol.replace('USDC', '').replace('USDT', '')
}

// Get current prices for positions
const positionsWithPrices = computed(() => {
  return positions.value.map((pos) => {
    const ticker = rows.value.find((r) => r.symbol === pos.symbol)
    const currentPrice = ticker ? Number(ticker.lastPrice || 0) : null
    const currentValue = currentPrice ? pos.quantity * currentPrice : null
    const pnl = currentPrice ? currentValue! - pos.totalCost : null
    const pnlPercent =
      currentPrice && pos.averagePrice > 0
        ? ((currentPrice - pos.averagePrice) / pos.averagePrice) * 100
        : null

    return {
      ...pos,
      currentPrice,
      currentValue,
      pnl,
      pnlPercent,
    }
  })
})

const totalInvested = computed(() => {
  return positions.value.reduce((sum, pos) => sum + pos.totalCost, 0)
})

const totalValue = computed(() => {
  return positionsWithPrices.value.reduce((sum, pos) => sum + (pos.currentValue || 0), 0)
})

const totalPnL = computed(() => {
  return totalValue.value - totalInvested.value
})

const totalPnLPercent = computed(() => {
  if (totalInvested.value === 0) return 0
  return (totalPnL.value / totalInvested.value) * 100
})

// Chart data for performance
const chartData = computed(() => {
  // Simple chart based on transactions - calculate cumulative value over time
  const sortedTxs = [...transactions.value].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const data: Array<{ x: number; y: number }> = []
  let cumulativeValue = 0

  for (const tx of sortedTxs) {
    if (tx.type === 'buy') {
      cumulativeValue += tx.total
    } else {
      cumulativeValue -= tx.total
    }
    data.push({
      x: new Date(tx.createdAt).getTime(),
      y: cumulativeValue,
    })
  }

  // Add current value point
  if (data.length > 0) {
    data.push({
      x: Date.now(),
      y: totalValue.value,
    })
  }

  return data
})

const chartSeries = computed(() => [
  {
    name: 'Portfolio Value',
    data: chartData.value,
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 256,
    background: 'transparent',
    toolbar: { show: false },
  },
  theme: { mode: 'dark' },
  stroke: { width: 2, curve: 'smooth' },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1,
    },
  },
  xaxis: {
    type: 'datetime',
    labels: { style: { colors: '#ffffff80' } },
  },
  yaxis: {
    labels: {
      style: { colors: '#ffffff80' },
      formatter: (val: number) => '$' + val.toLocaleString(),
    },
  },
  grid: { borderColor: '#ffffff10' },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val: number) => '$' + val.toLocaleString() },
  },
}))

// Distribution chart
const distributionData = computed(() => {
  return positionsWithPrices.value
    .filter((pos) => pos.currentValue && pos.currentValue > 0)
    .map((pos) => ({
      label: getBase(pos.symbol),
      value: pos.currentValue!,
    }))
})

const distributionSeries = computed(() => distributionData.value.map((d) => d.value))

const donutOptions = computed(() => ({
  chart: {
    type: 'donut',
    height: 256,
    background: 'transparent',
  },
  theme: { mode: 'dark' },
  labels: distributionData.value.map((d) => d.label),
  legend: {
    labels: { colors: '#ffffff80' },
    position: 'bottom',
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val: number) => '$' + val.toLocaleString() },
  },
}))

const sortedTransactions = computed(() => {
  return [...transactions.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

function closeModal() {
  showAddModal.value = false
  editingTransaction.value = null
  showSymbolSuggestions.value = false
  document.body.style.overflow = ''
  form.value = {
    symbol: '',
    type: 'buy',
    quantity: 0,
    price: 0,
    fee: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  }
}

function editTransaction(tx: PortfolioTransaction) {
  editingTransaction.value = tx
  const txDate = new Date(tx.createdAt)
  form.value = {
    symbol: tx.symbol,
    type: tx.type,
    quantity: tx.quantity,
    price: tx.price,
    fee: tx.fee || 0,
    notes: tx.notes || '',
    date: txDate.toISOString().split('T')[0],
  }
}

async function saveTransaction() {
  try {
    const { date, ...transactionData } = form.value
    const dateToSend = date ? new Date(date).toISOString() : undefined

    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, {
        ...transactionData,
        createdAt: dateToSend,
        originalQuantity: editingTransaction.value.quantity,
        originalPrice: editingTransaction.value.price,
        originalFee: editingTransaction.value.fee || 0,
      })
    } else {
      await addTransaction({
        ...transactionData,
        date: dateToSend,
      })
    }
    closeModal()
  } catch (e) {
    console.error('Error saving transaction:', e)
  }
}

function deleteTransaction(tx: PortfolioTransaction) {
  transactionToDelete.value = tx
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!transactionToDelete.value) return

  try {
    await removeTransaction(transactionToDelete.value.id)
    showDeleteModal.value = false
    transactionToDelete.value = null
    document.body.style.overflow = ''
  } catch (e) {
    console.error('Error deleting transaction:', e)
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  transactionToDelete.value = null
  document.body.style.overflow = ''
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

function formatQuantity(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}
</script>
