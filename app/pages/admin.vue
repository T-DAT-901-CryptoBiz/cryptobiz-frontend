<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Admin Panel</h1>
        <p class="text-sm text-white/60 mt-1.5">
          Manage users, alerts, portfolios and system settings
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-white/10">
      <nav class="flex space-x-8 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="
            activeTab === tab.id
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/20'
          "
        >
          <Icon :name="tab.icon" class="h-4 w-4 inline-block mr-2" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-blue-500/10">
              <Icon name="lucide:users" class="h-6 w-6 text-blue-400" />
            </div>
            <div class="text-xs text-white/40">{{ dashboardStats.adminUsers }} admins</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ dashboardStats.totalUsers }}</div>
          <div class="text-sm text-white/60">Total Users</div>
          <div class="mt-3 pt-3 border-t border-white/5">
            <div class="flex items-center gap-2 text-xs text-white/50">
              <Icon name="lucide:trending-up" class="h-3 w-3" />
              <span>{{ dashboardStats.newUsersLast7Days }} new this week</span>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-emerald-500/10">
              <Icon name="lucide:bell" class="h-6 w-6 text-emerald-400" />
            </div>
            <div class="text-xs text-white/40">{{ dashboardStats.activeAlerts }} active</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ dashboardStats.totalAlerts }}</div>
          <div class="text-sm text-white/60">Total Alerts</div>
          <div class="mt-3 pt-3 border-t border-white/5">
            <div class="flex items-center gap-2 text-xs text-white/50">
              <Icon name="lucide:check-circle" class="h-3 w-3 text-emerald-400" />
              <span>{{ dashboardStats.triggeredAlerts }} triggered</span>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-purple-500/10">
              <Icon name="lucide:wallet" class="h-6 w-6 text-purple-400" />
            </div>
            <div class="text-xs text-white/40">{{ dashboardStats.totalTransactions }} txns</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ dashboardStats.totalPortfolios }}</div>
          <div class="text-sm text-white/60">Active Portfolios</div>
          <div class="mt-3 pt-3 border-t border-white/5">
            <div class="flex items-center gap-2 text-xs text-white/50">
              <Icon name="lucide:activity" class="h-3 w-3" />
              <span>{{ dashboardStats.uniqueCryptoInPortfolios }} unique cryptos</span>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-xl bg-yellow-500/10">
              <Icon name="lucide:star" class="h-6 w-6 text-yellow-400" />
            </div>
            <div class="text-xs text-white/40">{{ dashboardStats.cryptoFavorites }} crypto</div>
          </div>
          <div class="text-3xl font-bold mb-1">{{ dashboardStats.totalFavorites }}</div>
          <div class="text-sm text-white/60">Total Favorites</div>
          <div class="mt-3 pt-3 border-t border-white/5">
            <div class="flex items-center gap-2 text-xs text-white/50">
              <Icon name="lucide:newspaper" class="h-3 w-3" />
              <span>{{ dashboardStats.newsFavorites }} news</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-blue-500/10">
              <Icon name="lucide:user-check" class="h-4 w-4 text-blue-400" />
            </div>
            <div class="text-sm text-white/60">Admin Users</div>
          </div>
          <div class="text-2xl font-bold">{{ dashboardStats.adminUsers }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-emerald-500/10">
              <Icon name="lucide:bell-ring" class="h-4 w-4 text-emerald-400" />
            </div>
            <div class="text-sm text-white/60">Active Alerts</div>
          </div>
          <div class="text-2xl font-bold">{{ dashboardStats.activeAlerts }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-rose-500/10">
              <Icon name="lucide:check-circle-2" class="h-4 w-4 text-rose-400" />
            </div>
            <div class="text-sm text-white/60">Triggered Alerts</div>
          </div>
          <div class="text-2xl font-bold">{{ dashboardStats.triggeredAlerts }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-lg bg-purple-500/10">
              <Icon name="lucide:arrow-left-right" class="h-4 w-4 text-purple-400" />
            </div>
            <div class="text-sm text-white/60">Transactions</div>
          </div>
          <div class="text-2xl font-bold">{{ dashboardStats.totalTransactions }}</div>
        </div>
      </div>

      <!-- Recent Activity & Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Users -->
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Recent Users</h3>
            <NuxtLink
              to="/admin"
              @click="activeTab = 'users'"
              class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </NuxtLink>
          </div>
          <div v-if="usersPending" class="p-8 text-center">
            <div
              class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"
            ></div>
          </div>
          <div v-else-if="recentUsers.length === 0" class="p-8 text-center text-sm text-white/60">
            No users yet
          </div>
          <div v-else class="divide-y divide-white/5">
            <div
              v-for="user in recentUsers"
              :key="user.id"
              class="px-6 py-4 hover:bg-white/5 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="h-10 w-10 rounded-full bg-neutral-700 flex items-center justify-center"
                  >
                    <Icon name="lucide:user" class="h-5 w-5 text-white/60" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-white">{{ user.name }}</div>
                    <div class="text-xs text-white/50">{{ user.email }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="
                      user.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-neutral-700/50 text-white/70 border border-white/10'
                    "
                  >
                    {{ user.role }}
                  </span>
                  <div class="text-xs text-white/40 mt-1">
                    {{ formatRelativeTime(user.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Alerts -->
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 class="text-lg font-semibold">Recent Alerts</h3>
            <NuxtLink
              to="/admin"
              @click="activeTab = 'alerts'"
              class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </NuxtLink>
          </div>
          <div v-if="alertsPending" class="p-8 text-center">
            <div
              class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"
            ></div>
          </div>
          <div v-else-if="recentAlerts.length === 0" class="p-8 text-center text-sm text-white/60">
            No alerts yet
          </div>
          <div v-else class="divide-y divide-white/5">
            <div
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="px-6 py-4 hover:bg-white/5 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium text-white">{{ alert.symbol }}</span>
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium capitalize"
                      :class="
                        alert.triggered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : alert.isActive
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-neutral-700/50 text-white/70 border border-white/10'
                      "
                    >
                      {{ alert.triggered ? 'Triggered' : alert.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <div class="text-xs text-white/50">
                    {{
                      alert.type === 'change'
                        ? `${alert.changePercent}% change`
                        : `$${alert.targetPrice?.toLocaleString()}`
                    }}
                    · {{ getUserName(alert.userId) }}
                  </div>
                </div>
                <div class="text-xs text-white/40 ml-4">
                  {{ formatRelativeTime(alert.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Provider Stats & Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Provider Distribution -->
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-white/10">
            <h3 class="text-lg font-semibold">User Providers</h3>
          </div>
          <div class="p-6">
            <div v-if="usersPending" class="text-center py-8">
              <div
                class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"
              ></div>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="provider in providerStats"
                :key="provider.name"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="p-2 rounded-lg"
                    :class="provider.name === 'Google' ? 'bg-blue-500/10' : 'bg-neutral-700/50'"
                  >
                    <Icon
                      :name="provider.name === 'Google' ? 'lucide:globe' : 'lucide:key'"
                      class="h-4 w-4"
                      :class="provider.name === 'Google' ? 'text-blue-400' : 'text-white/60'"
                    />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-white capitalize">{{ provider.name }}</div>
                    <div class="text-xs text-white/50">{{ provider.count }} users</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-white">{{ provider.percentage }}%</div>
                  <div class="w-24 h-2 bg-neutral-700 rounded-full overflow-hidden mt-1">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="provider.name === 'Google' ? 'bg-blue-500' : 'bg-neutral-600'"
                      :style="{ width: `${provider.percentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alert Types Distribution -->
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-white/10">
            <h3 class="text-lg font-semibold">Alert Types</h3>
          </div>
          <div class="p-6">
            <div v-if="alertsPending" class="text-center py-8">
              <div
                class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"
              ></div>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="type in alertTypeStats"
                :key="type.name"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="p-2 rounded-lg"
                    :class="
                      type.name === 'above'
                        ? 'bg-emerald-500/10'
                        : type.name === 'below'
                          ? 'bg-rose-500/10'
                          : 'bg-yellow-500/10'
                    "
                  >
                    <Icon
                      :name="
                        type.name === 'above'
                          ? 'lucide:trending-up'
                          : type.name === 'below'
                            ? 'lucide:trending-down'
                            : 'lucide:activity'
                      "
                      class="h-4 w-4"
                      :class="
                        type.name === 'above'
                          ? 'text-emerald-400'
                          : type.name === 'below'
                            ? 'text-rose-400'
                            : 'text-yellow-400'
                      "
                    />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-white capitalize">{{ type.name }}</div>
                    <div class="text-xs text-white/50">{{ type.count }} alerts</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-white">{{ type.percentage }}%</div>
                  <div class="w-24 h-2 bg-neutral-700 rounded-full overflow-hidden mt-1">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="
                        type.name === 'above'
                          ? 'bg-emerald-500'
                          : type.name === 'below'
                            ? 'bg-rose-500'
                            : 'bg-yellow-500'
                      "
                      :style="{ width: `${type.percentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="space-y-6">
      <div
        class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Users Management</h2>
          <div class="flex items-center gap-3">
            <button
              @click="showCreateUserModal = true"
              class="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium transition-colors border border-blue-500/30"
            >
              <Icon name="lucide:user-plus" class="h-4 w-4 inline-block mr-2" />
              Create User
            </button>
            <button
              @click="loadUsers"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors"
            >
              <Icon name="lucide:refresh-cw" class="h-4 w-4 inline-block mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div v-if="usersPending" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="text-sm text-white/60 mt-4">Loading users...</p>
        </div>

        <div v-else-if="users.length === 0" class="p-12 text-center">
          <Icon name="lucide:users" class="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p class="text-sm text-white/60">No users found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/5 border-b border-white/10">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Provider
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="user in users" :key="user.id" class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-10 w-10 rounded-full bg-neutral-700 flex items-center justify-center"
                    >
                      <Icon name="lucide:user" class="h-5 w-5 text-white/60" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-white">{{ user.name }}</div>
                      <div class="text-xs text-white/50">{{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white/90">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="
                      user.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-neutral-700/50 text-white/70 border border-white/10'
                    "
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-white/70 capitalize">{{ user.provider }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white/70">
                    {{ new Date(user.createdAt).toLocaleDateString() }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editUser(user)"
                      class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium transition-colors border border-white/10"
                      title="Edit User"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4" />
                    </button>
                    <button
                      v-if="user.role !== 'admin'"
                      @click="toggleUserRole(user.id, 'admin')"
                      class="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-colors border border-blue-500/30"
                      title="Make Admin"
                    >
                      <Icon name="lucide:shield" class="h-4 w-4" />
                    </button>
                    <button
                      v-else-if="user.id !== currentUser?.id"
                      @click="toggleUserRole(user.id, 'user')"
                      class="px-3 py-1.5 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 text-white/70 text-xs font-medium transition-colors border border-white/10"
                      title="Remove Admin"
                    >
                      <Icon name="lucide:shield-off" class="h-4 w-4" />
                    </button>
                    <button
                      v-if="user.id !== currentUser?.id"
                      @click="deleteUser(user.id)"
                      class="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors border border-rose-500/30"
                      title="Delete User"
                    >
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                    <span v-if="user.id === currentUser?.id" class="text-xs text-white/40"
                      >Current</span
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Alerts Tab -->
    <div v-if="activeTab === 'alerts'" class="space-y-6">
      <div
        class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-lg font-semibold">All Alerts</h2>
          <button
            @click="loadAlerts"
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors"
          >
            <Icon name="lucide:refresh-cw" class="h-4 w-4 inline-block mr-2" />
            Refresh
          </button>
        </div>

        <div v-if="alertsPending" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="text-sm text-white/60 mt-4">Loading alerts...</p>
        </div>

        <div v-else-if="alerts.length === 0" class="p-12 text-center">
          <Icon name="lucide:bell-off" class="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p class="text-sm text-white/60">No alerts found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/5 border-b border-white/10">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Symbol
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Target
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="alert in alerts"
                :key="alert.id"
                class="hover:bg-white/5 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white/90">{{ getUserName(alert.userId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ alert.symbol }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-white/70 capitalize">{{ alert.type }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white/90">
                    <span v-if="alert.targetPrice">${{ alert.targetPrice.toLocaleString() }}</span>
                    <span v-else-if="alert.changePercent"
                      >{{ alert.changePercent > 0 ? '+' : '' }}{{ alert.changePercent }}%</span
                    >
                    <span v-else>-</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="alert.triggered"
                      class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      Triggered
                    </span>
                    <span
                      v-else-if="alert.isActive"
                      class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      Active
                    </span>
                    <span
                      v-else
                      class="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-700/50 text-white/70 border border-white/10"
                    >
                      Inactive
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white/70">
                    {{ new Date(alert.createdAt).toLocaleDateString() }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editAlert(alert)"
                      class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium transition-colors border border-white/10"
                      title="Edit Alert"
                    >
                      <Icon name="lucide:edit" class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteAlert(alert.id)"
                      class="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors border border-rose-500/30"
                      title="Delete Alert"
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

    <!-- Portfolios Tab -->
    <div v-if="activeTab === 'portfolios'" class="space-y-6">
      <div
        class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-lg font-semibold">All Portfolios</h2>
          <button
            @click="loadPortfolios"
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors"
          >
            <Icon name="lucide:refresh-cw" class="h-4 w-4 inline-block mr-2" />
            Refresh
          </button>
        </div>

        <div v-if="portfoliosPending" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="text-sm text-white/60 mt-4">Loading portfolios...</p>
        </div>

        <div v-else-if="portfolios.length === 0" class="p-12 text-center">
          <Icon name="lucide:wallet" class="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p class="text-sm text-white/60">No portfolios found</p>
        </div>

        <div v-else class="divide-y divide-white/5">
          <div
            v-for="portfolio in portfolios"
            :key="portfolio.userId"
            class="p-6 hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm font-medium text-white">
                  {{ getUserName(portfolio.userId) }}
                </div>
                <div class="text-xs text-white/50">{{ portfolio.userId }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-white/60">Positions: {{ portfolio.positions.length }}</div>
                <div class="text-sm text-white/60">
                  Transactions: {{ portfolio.transactions.length }}
                </div>
              </div>
            </div>
            <div v-if="portfolio.positions.length > 0" class="mt-4 mb-4">
              <div class="text-xs text-white/60 mb-2">Positions:</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="position in portfolio.positions"
                  :key="position.id"
                  class="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/80 border border-white/10"
                >
                  {{ position.symbol }}: {{ position.quantity }}
                </span>
              </div>
            </div>
            <div v-if="portfolio.transactions.length > 0" class="mt-4">
              <div class="text-xs text-white/60 mb-2 flex items-center justify-between">
                <span>Transactions:</span>
                <button
                  @click="
                    expandedTransactions[portfolio.userId] = !expandedTransactions[portfolio.userId]
                  "
                  class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {{ expandedTransactions[portfolio.userId] ? 'Hide' : 'Show' }}
                </button>
              </div>
              <div v-if="expandedTransactions[portfolio.userId]" class="space-y-2 mt-2">
                <div
                  v-for="transaction in portfolio.transactions"
                  :key="transaction.id"
                  class="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-white">{{ transaction.symbol }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-xs font-medium capitalize"
                        :class="
                          transaction.type === 'buy'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        "
                      >
                        {{ transaction.type }}
                      </span>
                    </div>
                    <div class="text-xs text-white/50">
                      Qty: {{ transaction.quantity }} @ ${{ transaction.price.toLocaleString() }} =
                      ${{ transaction.total.toLocaleString() }}
                      <span v-if="transaction.fee">
                        · Fee: ${{ transaction.fee.toLocaleString() }}</span
                      >
                    </div>
                    <div v-if="transaction.notes" class="text-xs text-white/40 mt-1">
                      {{ transaction.notes }}
                    </div>
                    <div class="text-xs text-white/40 mt-1">
                      {{ new Date(transaction.createdAt).toLocaleString() }}
                    </div>
                  </div>
                  <button
                    @click="editTransaction(transaction, portfolio.userId)"
                    class="ml-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium transition-colors border border-white/10"
                    title="Edit Transaction"
                  >
                    <Icon name="lucide:edit" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorites Tab -->
    <div v-if="activeTab === 'favorites'" class="space-y-6">
      <div
        class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 class="text-lg font-semibold">All Favorites</h2>
          <button
            @click="loadFavorites"
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors"
          >
            <Icon name="lucide:refresh-cw" class="h-4 w-4 inline-block mr-2" />
            Refresh
          </button>
        </div>

        <div v-if="favoritesPending" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="text-sm text-white/60 mt-4">Loading favorites...</p>
        </div>

        <div v-else-if="favorites.length === 0" class="p-12 text-center">
          <Icon name="lucide:star-off" class="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p class="text-sm text-white/60">No favorites found</p>
        </div>

        <div v-else class="divide-y divide-white/5">
          <div
            v-for="fav in favorites"
            :key="fav.userId"
            class="p-6 hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm font-medium text-white">{{ getUserName(fav.userId) }}</div>
                <div class="text-xs text-white/50">{{ fav.userId }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-white/60">Crypto: {{ fav.crypto.length }}</div>
                <div class="text-sm text-white/60">News: {{ fav.news.length }}</div>
              </div>
            </div>
            <div v-if="fav.crypto.length > 0" class="mt-4">
              <div class="text-xs text-white/60 mb-2">Crypto Favorites:</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="symbol in fav.crypto"
                  :key="symbol"
                  class="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/80 border border-white/10"
                >
                  {{ symbol }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete User Modal -->
    <div
      v-if="deleteUserModal.show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="deleteUserModal.show = false"
    >
      <div
        class="bg-neutral-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10"
        >
          <Icon name="lucide:alert-triangle" class="h-8 w-8 text-rose-400" />
        </div>
        <h3 class="text-xl font-bold text-center mb-2">Delete User</h3>
        <p class="text-sm text-white/70 text-center mb-6">
          Are you sure you want to delete
          <span class="font-semibold text-white">{{ deleteUserModal.userName }}</span
          >? This action cannot be undone.
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="confirmDeleteUser"
            class="flex-1 px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium transition-colors border border-rose-500/30 flex items-center justify-center gap-2"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" />
            Delete User
          </button>
          <button
            @click="deleteUserModal.show = false"
            class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Alert Modal -->
    <div
      v-if="deleteAlertModal.show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="deleteAlertModal.show = false"
    >
      <div
        class="bg-neutral-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10"
        >
          <Icon name="lucide:alert-triangle" class="h-8 w-8 text-rose-400" />
        </div>
        <h3 class="text-xl font-bold text-center mb-2">Delete Alert</h3>
        <p class="text-sm text-white/70 text-center mb-6">
          Are you sure you want to delete this alert for
          <span class="font-semibold text-white">{{ deleteAlertModal.symbol }}</span
          >? This action cannot be undone.
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="confirmDeleteAlert"
            class="flex-1 px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium transition-colors border border-rose-500/30 flex items-center justify-center gap-2"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" />
            Delete Alert
          </button>
          <button
            @click="deleteAlertModal.show = false"
            class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Change Role Modal -->
    <div
      v-if="changeRoleModal.show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="changeRoleModal.show = false"
    >
      <div
        class="bg-neutral-900 border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10"
        >
          <Icon
            :name="changeRoleModal.newRole === 'admin' ? 'lucide:shield' : 'lucide:shield-off'"
            class="h-8 w-8 text-blue-400"
          />
        </div>
        <h3 class="text-xl font-bold text-center mb-2">
          {{ changeRoleModal.newRole === 'admin' ? 'Grant Admin Access' : 'Remove Admin Access' }}
        </h3>
        <p class="text-sm text-white/70 text-center mb-6">
          Are you sure you want to
          <span class="font-semibold text-white">
            {{ changeRoleModal.newRole === 'admin' ? 'grant admin access' : 'remove admin access' }}
          </span>
          to <span class="font-semibold text-white">{{ changeRoleModal.userName }}</span
          >?
        </p>
        <div
          v-if="changeRoleModal.newRole === 'admin'"
          class="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
        >
          <div class="flex items-start gap-3">
            <Icon name="lucide:info" class="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div class="text-xs text-blue-300/90">
              Admin users have full access to the admin panel, including user management, alerts,
              portfolios, and system settings.
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="confirmChangeRole"
            class="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors border border-blue-500/30 flex items-center justify-center gap-2"
          >
            <Icon
              :name="changeRoleModal.newRole === 'admin' ? 'lucide:shield' : 'lucide:shield-off'"
              class="h-4 w-4"
            />
            {{ changeRoleModal.newRole === 'admin' ? 'Make Admin' : 'Remove Admin' }}
          </button>
          <button
            @click="changeRoleModal.show = false"
            class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div
      v-if="editUserModal.show && editUserModal.user"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="editUserModal.show = false"
    >
      <div class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">Edit User</h3>
          <button
            @click="editUserModal.show = false"
            class="text-white/60 hover:text-white transition-colors"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Name</label>
            <input
              v-model="editUserModal.user.name"
              type="text"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Email</label>
            <input
              v-model="editUserModal.user.email"
              type="email"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Role</label>
            <select
              v-model="editUserModal.user.role"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors border border-blue-500/30"
            >
              Save Changes
            </button>
            <button
              type="button"
              @click="editUserModal.show = false"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Alert Modal -->
    <div
      v-if="editAlertModal.show && editAlertModal.alert"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="editAlertModal.show = false"
    >
      <div
        class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">Edit Alert</h3>
          <button
            @click="editAlertModal.show = false"
            class="text-white/60 hover:text-white transition-colors"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
        <form @submit.prevent="saveAlert" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Symbol</label>
            <input
              v-model="editAlertModal.alert.symbol"
              type="text"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Type</label>
            <select
              v-model="editAlertModal.alert.type"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
              <option value="change">Change</option>
            </select>
          </div>
          <div
            v-if="editAlertModal.alert.type === 'above' || editAlertModal.alert.type === 'below'"
          >
            <label class="block text-sm font-medium text-white/70 mb-2">Target Price</label>
            <input
              v-model.number="editAlertModal.alert.targetPrice"
              type="number"
              step="any"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div v-if="editAlertModal.alert.type === 'change'">
            <label class="block text-sm font-medium text-white/70 mb-2">Change Percent</label>
            <input
              v-model.number="editAlertModal.alert.changePercent"
              type="number"
              step="any"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="editAlertModal.alert.isActive"
                type="checkbox"
                class="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/50"
              />
              <span class="text-sm text-white/70">Active</span>
            </label>
          </div>
          <div class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors border border-blue-500/30"
            >
              Save Changes
            </button>
            <button
              type="button"
              @click="editAlertModal.show = false"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Transaction Modal -->
    <div
      v-if="editTransactionModal.show && editTransactionModal.transaction"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="editTransactionModal.show = false"
    >
      <div
        class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">Edit Transaction</h3>
          <button
            @click="editTransactionModal.show = false"
            class="text-white/60 hover:text-white transition-colors"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
        <form @submit.prevent="saveTransaction" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Symbol</label>
            <input
              v-model="editTransactionModal.transaction.symbol"
              type="text"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Type</label>
            <select
              v-model="editTransactionModal.transaction.type"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Quantity</label>
            <input
              v-model.number="editTransactionModal.transaction.quantity"
              type="number"
              step="any"
              required
              min="0"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Price</label>
            <input
              v-model.number="editTransactionModal.transaction.price"
              type="number"
              step="any"
              required
              min="0"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Total</label>
            <input
              v-model.number="editTransactionModal.transaction.total"
              type="number"
              step="any"
              required
              min="0"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Fee (optional)</label>
            <input
              v-model.number="editTransactionModal.transaction.fee"
              type="number"
              step="any"
              min="0"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Notes (optional)</label>
            <textarea
              v-model="editTransactionModal.transaction.notes"
              rows="3"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Date</label>
            <input
              :value="
                editTransactionModal.transaction.createdAt
                  ? new Date(editTransactionModal.transaction.createdAt).toISOString().slice(0, 16)
                  : ''
              "
              @input="
                editTransactionModal.transaction.createdAt = ($event.target as HTMLInputElement)
                  .value
                  ? new Date(($event.target as HTMLInputElement).value).toISOString()
                  : new Date().toISOString()
              "
              type="datetime-local"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors border border-blue-500/30"
            >
              Save Changes
            </button>
            <button
              type="button"
              @click="editTransactionModal.show = false"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="showCreateUserModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showCreateUserModal = false"
    >
      <div class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">Create New User</h3>
          <button
            @click="showCreateUserModal = false"
            class="text-white/60 hover:text-white transition-colors"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Name</label>
            <input
              v-model="newUser.name"
              type="text"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input
              v-model="newUser.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Role</label>
            <select
              v-model="newUser.role"
              class="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors border border-blue-500/30"
            >
              Create User
            </button>
            <button
              type="button"
              @click="showCreateUserModal = false"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Types
interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  provider: 'local' | 'google'
  createdAt: string
  updatedAt: string
}

interface PriceAlert {
  id: string
  userId: string
  symbol: string
  type: 'above' | 'below' | 'change'
  targetPrice?: number
  changePercent?: number
  isActive: boolean
  triggered: boolean
  createdAt: string
}

interface UserPortfolio {
  userId: string
  positions: Array<{
    id: string
    symbol: string
    quantity: number
    averagePrice: number
    totalCost: number
    createdAt: string
    updatedAt: string
  }>
  transactions: Array<{
    id: string
    symbol: string
    type: 'buy' | 'sell'
    quantity: number
    price: number
    total: number
    fee?: number
    notes?: string
    createdAt: string
  }>
  updatedAt: string
}

interface UserFavorites {
  userId: string
  crypto: string[]
  news: string[]
}

definePageMeta({
  middleware: 'admin',
})

const { user: currentUser } = useAuth()

const activeTab = ref('dashboard')
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { id: 'users', label: 'Users', icon: 'lucide:users' },
  { id: 'alerts', label: 'Alerts', icon: 'lucide:bell' },
  { id: 'portfolios', label: 'Portfolios', icon: 'lucide:wallet' },
  { id: 'favorites', label: 'Favorites', icon: 'lucide:star' },
]

// Users
const users = ref<User[]>([])
const usersPending = ref(false)
const showCreateUserModal = ref(false)
const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'user' as 'user' | 'admin',
})

// Alerts
const alerts = ref<PriceAlert[]>([])
const alertsPending = ref(false)

// Delete Modals
const deleteUserModal = ref({
  show: false,
  userId: '',
  userName: '',
})

const deleteAlertModal = ref({
  show: false,
  alertId: '',
  symbol: '',
})

const changeRoleModal = ref({
  show: false,
  userId: '',
  userName: '',
  currentRole: 'user' as 'user' | 'admin',
  newRole: 'admin' as 'user' | 'admin',
})

const editUserModal = ref<{
  show: boolean
  user: User | null
}>({
  show: false,
  user: null,
})

const editAlertModal = ref<{
  show: boolean
  alert: PriceAlert | null
}>({
  show: false,
  alert: null,
})

interface Transaction {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  total: number
  fee?: number
  notes?: string
  createdAt: string
}

const editTransactionModal = ref<{
  show: boolean
  transaction: Transaction | null
  userId: string
}>({
  show: false,
  transaction: null,
  userId: '',
})

const expandedTransactions = ref<Record<string, boolean>>({})

// Portfolios
const portfolios = ref<UserPortfolio[]>([])
const portfoliosPending = ref(false)

// Favorites
const favorites = ref<UserFavorites[]>([])
const favoritesPending = ref(false)

// Dashboard Stats
const dashboardStats = computed(() => {
  const totalUsers = users.value.length
  const adminUsers = users.value.filter((u) => u.role === 'admin').length
  const totalAlerts = alerts.value.length
  const activeAlerts = alerts.value.filter((a) => a.isActive && !a.triggered).length
  const triggeredAlerts = alerts.value.filter((a) => a.triggered).length
  const totalPortfolios = portfolios.value.length
  const totalTransactions = portfolios.value.reduce((sum, p) => sum + p.transactions.length, 0)
  const totalFavorites = favorites.value.reduce(
    (sum, f) => sum + f.crypto.length + f.news.length,
    0,
  )
  const cryptoFavorites = favorites.value.reduce((sum, f) => sum + f.crypto.length, 0)
  const newsFavorites = favorites.value.reduce((sum, f) => sum + f.news.length, 0)

  // Users created in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const newUsersLast7Days = users.value.filter((u) => new Date(u.createdAt) >= sevenDaysAgo).length

  // Unique cryptos in portfolios
  const uniqueCryptoInPortfolios = new Set(
    portfolios.value.flatMap((p) => p.positions.map((pos) => pos.symbol)),
  ).size

  return {
    totalUsers,
    adminUsers,
    totalAlerts,
    activeAlerts,
    triggeredAlerts,
    totalPortfolios,
    totalTransactions,
    totalFavorites,
    cryptoFavorites,
    newsFavorites,
    newUsersLast7Days,
    uniqueCryptoInPortfolios,
  }
})

// Recent Users (last 5)
const recentUsers = computed(() => {
  return [...users.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// Recent Alerts (last 5)
const recentAlerts = computed(() => {
  return [...alerts.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// Provider Stats
const providerStats = computed(() => {
  const googleCount = users.value.filter((u) => u.provider === 'google').length
  const localCount = users.value.filter((u) => u.provider === 'local').length
  const total = users.value.length

  if (total === 0) {
    return [
      { name: 'Google', count: 0, percentage: 0 },
      { name: 'Local', count: 0, percentage: 0 },
    ]
  }

  return [
    {
      name: 'Google',
      count: googleCount,
      percentage: Math.round((googleCount / total) * 100),
    },
    {
      name: 'Local',
      count: localCount,
      percentage: Math.round((localCount / total) * 100),
    },
  ]
})

// Alert Type Stats
const alertTypeStats = computed(() => {
  const aboveCount = alerts.value.filter((a) => a.type === 'above').length
  const belowCount = alerts.value.filter((a) => a.type === 'below').length
  const changeCount = alerts.value.filter((a) => a.type === 'change').length
  const total = alerts.value.length

  if (total === 0) {
    return [
      { name: 'above', count: 0, percentage: 0 },
      { name: 'below', count: 0, percentage: 0 },
      { name: 'change', count: 0, percentage: 0 },
    ]
  }

  return [
    {
      name: 'above',
      count: aboveCount,
      percentage: Math.round((aboveCount / total) * 100),
    },
    {
      name: 'below',
      count: belowCount,
      percentage: Math.round((belowCount / total) * 100),
    },
    {
      name: 'change',
      count: changeCount,
      percentage: Math.round((changeCount / total) * 100),
    },
  ]
})

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getUserName(userId: string): string {
  const user = users.value.find((u) => u.id === userId)
  return user?.name || userId
}

// Load functions
async function loadUsers() {
  try {
    usersPending.value = true
    const response = await $fetch<{ users: User[] }>('/api/admin/users')
    users.value = response.users
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    usersPending.value = false
  }
}

async function loadAlerts() {
  try {
    alertsPending.value = true
    const response = await $fetch<{ alerts: PriceAlert[] }>('/api/admin/alerts')
    alerts.value = response.alerts
  } catch (error) {
    console.error('Error loading alerts:', error)
  } finally {
    alertsPending.value = false
  }
}

async function loadPortfolios() {
  try {
    portfoliosPending.value = true
    const response = await $fetch<{ portfolios: UserPortfolio[] }>('/api/admin/portfolios')
    portfolios.value = response.portfolios
  } catch (error) {
    console.error('Error loading portfolios:', error)
  } finally {
    portfoliosPending.value = false
  }
}

async function loadFavorites() {
  try {
    favoritesPending.value = true
    const response = await $fetch<{ favorites: UserFavorites[] }>('/api/admin/favorites')
    favorites.value = response.favorites
  } catch (error) {
    console.error('Error loading favorites:', error)
  } finally {
    favoritesPending.value = false
  }
}

async function loadDashboard() {
  await Promise.all([loadUsers(), loadAlerts(), loadPortfolios(), loadFavorites()])
}

// User actions
function editUser(user: User) {
  editUserModal.value = {
    show: true,
    user: { ...user },
  }
}

async function saveUser() {
  if (!editUserModal.value.user) return
  try {
    await $fetch(`/api/admin/users/${editUserModal.value.user.id}`, {
      method: 'PUT',
      body: {
        name: editUserModal.value.user.name,
        email: editUserModal.value.user.email,
        role: editUserModal.value.user.role,
      },
    })
    editUserModal.value.show = false
    await loadUsers()
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

function toggleUserRole(userId: string, newRole: 'admin' | 'user') {
  const user = users.value.find((u) => u.id === userId)
  if (user) {
    changeRoleModal.value = {
      show: true,
      userId,
      userName: user.name,
      currentRole: user.role,
      newRole,
    }
  }
}

async function confirmChangeRole() {
  try {
    await $fetch(`/api/admin/users/${changeRoleModal.value.userId}/role`, {
      method: 'PUT',
      body: { role: changeRoleModal.value.newRole },
    })
    changeRoleModal.value.show = false
    await loadUsers()
  } catch (error) {
    console.error('Error updating user role:', error)
  }
}

function deleteUser(userId: string) {
  const user = users.value.find((u) => u.id === userId)
  if (user) {
    deleteUserModal.value = {
      show: true,
      userId,
      userName: user.name,
    }
  }
}

async function confirmDeleteUser() {
  try {
    await $fetch(`/api/admin/users/${deleteUserModal.value.userId}`, {
      method: 'DELETE',
    })
    deleteUserModal.value.show = false
    await loadUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

async function createUser() {
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: newUser.value,
    })
    showCreateUserModal.value = false
    newUser.value = { name: '', email: '', password: '', role: 'user' }
    await loadUsers()
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

// Alert actions
function editAlert(alert: PriceAlert) {
  editAlertModal.value = {
    show: true,
    alert: { ...alert },
  }
}

async function saveAlert() {
  if (!editAlertModal.value.alert) return
  try {
    await $fetch(`/api/admin/alerts/${editAlertModal.value.alert.id}`, {
      method: 'PUT',
      body: {
        symbol: editAlertModal.value.alert.symbol,
        type: editAlertModal.value.alert.type,
        targetPrice: editAlertModal.value.alert.targetPrice,
        changePercent: editAlertModal.value.alert.changePercent,
        isActive: editAlertModal.value.alert.isActive,
      },
    })
    editAlertModal.value.show = false
    await loadAlerts()
  } catch (error) {
    console.error('Error updating alert:', error)
  }
}

function deleteAlert(alertId: string) {
  const alert = alerts.value.find((a) => a.id === alertId)
  if (alert) {
    deleteAlertModal.value = {
      show: true,
      alertId,
      symbol: alert.symbol,
    }
  }
}

async function confirmDeleteAlert() {
  try {
    await $fetch(`/api/admin/alerts/${deleteAlertModal.value.alertId}`, {
      method: 'DELETE',
    })
    deleteAlertModal.value.show = false
    await loadAlerts()
  } catch (error) {
    console.error('Error deleting alert:', error)
  }
}

// Transaction actions
function editTransaction(transaction: Transaction, userId: string) {
  editTransactionModal.value = {
    show: true,
    transaction: { ...transaction },
    userId,
  }
}

async function saveTransaction() {
  if (!editTransactionModal.value.transaction) return
  try {
    await $fetch(
      `/api/admin/portfolios/transactions/${editTransactionModal.value.transaction.id}`,
      {
        method: 'PUT',
        body: {
          symbol: editTransactionModal.value.transaction.symbol,
          type: editTransactionModal.value.transaction.type,
          quantity: editTransactionModal.value.transaction.quantity,
          price: editTransactionModal.value.transaction.price,
          total: editTransactionModal.value.transaction.total,
          fee: editTransactionModal.value.transaction.fee || null,
          notes: editTransactionModal.value.transaction.notes || '',
          createdAt: editTransactionModal.value.transaction.createdAt,
        },
      },
    )
    editTransactionModal.value.show = false
    await loadPortfolios()
  } catch (error) {
    console.error('Error updating transaction:', error)
  }
}

// Load data when tab changes
watch(activeTab, (tab) => {
  if (tab === 'users' && users.value.length === 0) loadUsers()
  if (tab === 'alerts' && alerts.value.length === 0) loadAlerts()
  if (tab === 'portfolios' && portfolios.value.length === 0) loadPortfolios()
  if (tab === 'favorites' && favorites.value.length === 0) loadFavorites()
})

onMounted(() => {
  loadDashboard()
})
</script>
