<template>
  <div class="min-h-screen bg-neutral-950 text-white flex">
    <aside
      id="sidebar"
      class="fixed z-30 inset-y-0 left-0 bg-neutral-900/85 border-r border-white/10 transition-[width,transform] duration-300 ease-out lg:static"
      :class="[
        isCollapsed ? 'w-16' : 'w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
      aria-label="Main navigation"
    >
      <div class="h-14 px-3 flex items-center justify-between border-b border-white/10">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="h-9 w-9 rounded-xl bg-neutral-800 grid place-items-center">
            <Icon name="lucide:bitcoins" class="h-5 w-5" />
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

      <nav class="p-2 space-y-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :title="item.label"
          class="group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          :class="isActive(item.to) ? 'bg-white/10' : ''"
        >
          <Icon :name="item.icon" class="h-5 w-5 shrink-0 text-white/80 group-hover:text-white" />
          <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>

          <span
            v-if="isCollapsed"
            class="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-neutral-800 border border-white/10 text-xs whitespace-nowrap"
          >
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <div v-if="!isCollapsed" class="mt-auto p-3 border-t border-white/10">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-neutral-800 grid place-items-center">
            <Icon name="lucide:user" class="h-4 w-4" />
          </div>
          <div class="text-xs">
            <div class="font-medium">Guest</div>
            <div class="text-white/50">Dark</div>
          </div>
        </div>
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

    <div class="flex-1 min-w-0 flex flex-col">
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

        <div class="text-sm text-white/70">Welcome 👋</div>
        <div class="ml-auto flex items-center gap-2">
          <slot name="top-actions" />
        </div>
      </header>

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const route = useRoute()

type NavItem = { to: string; label: string; icon: string }
const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { to: '/markets', label: 'Markets', icon: 'lucide:line-chart' },
  { to: '/watchlist', label: 'Watchlist', icon: 'lucide:star' },
  { to: '/alerts', label: 'Alerts', icon: 'lucide:bell' },
]

const isMobileOpen = useState<boolean>('sb:mobileOpen', () => false)
const isCollapsed = useState<boolean>('sb:collapsed', () => false)

watch(
  () => route.fullPath,
  () => {
    isMobileOpen.value = false
  },
)

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>