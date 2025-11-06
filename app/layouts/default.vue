<template>
  <div class="min-h-screen bg-neutral-950 text-white flex">
    <aside
      id="sidebar"
      class="fixed z-30 inset-y-0 left-0 bg-neutral-900/85 border-r border-white/10 transition-[width,transform] duration-300 ease-out flex flex-col"
      :class="[
        isCollapsed ? 'w-16' : 'w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
      aria-label="Main navigation"
    >
      <div
        class="h-14 px-3 flex items-center justify-between border-b border-white/10 sticky top-0 bg-neutral-900/85"
      >
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="h-9 w-9 rounded-xl bg-neutral-700 grid place-items-center">
            <img src="/cryptobiz-logo.png" alt="CryptoBiz" class="h-9 w-9" />
          </div>
          <span v-if="!isCollapsed" class="font-semibold tracking-tight">CryptoBiz</span>
        </NuxtLink>

        <button
          v-if="!isCollapsed"
          class="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          @click="isCollapsed = true"
          aria-label="Reduce sidebar"
        >
          <Icon name="lucide:chevron-left" class="h-4 w-4" />
          <span class="text-xs">Collapse</span>
        </button>
      </div>

      <nav
        class="flex-1 p-2 space-y-1 pr-2 scrollbar-thin"
        :class="isCollapsed ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'"
      >
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :title="item.label"
          class="group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          :class="isActive(item.to) ? 'bg-white/10' : ''"
        >
          <div class="relative">
            <Icon :name="item.icon" class="h-5 w-5 shrink-0 text-white/80 group-hover:text-white" />
          </div>

          <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>

          <span
            v-if="isCollapsed"
            class="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-neutral-800 border border-white/10 text-xs whitespace-nowrap"
          >
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <!-- User section with logout at bottom -->
      <div
        v-if="isAuthenticated"
        class="mt-auto border-t border-white/10 p-2"
        :class="isCollapsed ? '' : 'space-y-1'"
      >
        <div v-if="!isCollapsed && user?.name" class="px-3 py-2">
          <div class="text-xs text-white/50 mb-1">User</div>
          <div class="text-sm text-white truncate font-medium">{{ user.name }}</div>
        </div>
        <button
          @click="handleLogout"
          :title="isCollapsed ? 'Logout' : ''"
          class="group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors text-white/80 hover:text-white"
        >
          <Icon name="lucide:log-out" class="h-5 w-5 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">Logout</span>
          <span
            v-if="isCollapsed"
            class="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-neutral-800 border border-white/10 text-xs whitespace-nowrap"
          >
            Logout
          </span>
        </button>
      </div>
    </aside>

    <button
      v-show="isCollapsed && !isMobileOpen"
      class="hidden lg:flex fixed z-40 top-1/2 -translate-y-1/2 left-8 -translate-x-1/2 h-10 w-10 rounded-full bg-neutral-800 border border-white/10 shadow hover:bg-neutral-700 items-center justify-center transition-colors"
      @click="isCollapsed = false"
      aria-label="Open sidebar"
      title="Open sidebar"
    >
      <Icon name="lucide:chevrons-right" class="h-5 w-5" />
    </button>

    <div
      class="fixed inset-0 bg-black/60 z-20 lg:hidden"
      v-show="isMobileOpen"
      @click="isMobileOpen = false"
      aria-hidden="true"
    />

    <div
      class="flex-1 min-w-0 flex flex-col"
      :class="isMobileOpen ? '' : isCollapsed ? 'lg:ml-16' : 'lg:ml-64'"
    >
      <header
        class="h-14 border-b border-white/10 flex items-center px-4 sticky top-0 bg-neutral-950 z-10"
      >
        <button
          class="lg:hidden inline-flex items-center justify-center p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 mr-2"
          @click="isMobileOpen = !isMobileOpen"
          :aria-expanded="isMobileOpen"
          aria-controls="sidebar"
          aria-label="Toggle sidebar"
        >
          <Icon v-if="!isMobileOpen" name="lucide:menu" class="h-5 w-5" />
          <Icon v-else name="lucide:x" class="h-5 w-5" />
        </button>

        <div class="flex items-center gap-3">
          <h1 class="text-sm font-medium text-white/80 truncate">
            {{ pageTitle }}
          </h1>
          <span
            class="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60"
            :title="fullDate"
          >
            {{ timeHHMM }}
          </span>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <slot name="top-actions" />
          <button
            class="p-2 rounded-lg bg-white/5 hover:bg-white/10"
            @click="toggleTheme"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="h-5 w-5" />
          </button>
          <div v-if="isAuthenticated && user?.name" class="text-sm text-white/70">
            {{ user.name }}
          </div>
        </div>
      </header>

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useState } from '#app'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()
const { isDark, toggleTheme } = useTheme()
const isMobileOpen = useState<boolean>('sb:mobileOpen', () => false)
const isCollapsed = useState<boolean>('sb:collapsed', () => false)

async function handleLogout() {
  await logout()
  await router.push('/login')
}

type NavItem = { to: string; label: string; icon: string }
const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { to: '/markets', label: 'Markets', icon: 'lucide:line-chart' },
  { to: '/watchlist', label: 'Watchlist', icon: 'lucide:star' },
  { to: '/news', label: 'News', icon: 'lucide:newspaper' },
  { to: '/compare', label: 'Compare', icon: 'lucide:git-compare' },
  { to: '/portfolio', label: 'Portfolio', icon: 'lucide:wallet' },
  { to: '/alerts', label: 'Alerts', icon: 'lucide:bell' },
  { to: '/screener', label: 'Screener', icon: 'lucide:filter' },
  { to: '/events', label: 'Events', icon: 'lucide:calendar' },
  { to: '/sentiment', label: 'Sentiment', icon: 'lucide:trending-up' },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/markets': 'Markets',
  '/watchlist': 'Watchlist',
  '/news': 'News',
  '/compare': 'Compare',
  '/portfolio': 'Portfolio',
  '/alerts': 'Alerts',
  '/screener': 'Screener',
  '/events': 'Events',
  '/sentiment': 'Sentiment',
}
const pageTitle = computed(() => (route.meta.title as string) || titles[route.path] || 'CryptoBiz')

const now = ref<Date>(new Date())
let t: number | null = null
onMounted(() => {
  t = window.setInterval(() => (now.value = new Date()), 1000) as unknown as number
})
onBeforeUnmount(() => {
  if (t) clearInterval(t)
})

const timeHHMM = computed(() =>
  now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
)
const fullDate = computed(() =>
  now.value.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
)
</script>
