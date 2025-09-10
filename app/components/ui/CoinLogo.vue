<template>
  <div
    class="inline-flex items-center justify-center shrink-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :class="rounded ? 'rounded-full' : 'rounded-md'"
  >
    <img
      v-if="idx < srcs.length"
      :src="srcs[idx]"
      :alt="asset"
      :width="size"
      :height="size"
      class="w-full h-full object-contain"
      @error="onErr"
    />
    <div
      v-else
      class="w-full h-full grid place-items-center text-[10px] font-semibold bg-white/10 text-white/80"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ asset: string; size?: number; rounded?: boolean }>(), {
  size: 20,
  rounded: true,
})
const srcs = computed(() => {
  const a = props.asset?.toUpperCase() || 'COIN'
  const lower = a.toLowerCase()
  return [
    `https://assets.binance.com/image/currency/logo/${a}.png`,
    `https://static.coincap.io/assets/icons/${lower}@2x.png`,
    `https://cryptoicons.org/api/icon/${lower}/64`,
    `https://www.coingecko.com/coins/${lower}/logo.png`,
  ]
})
const idx = ref(0)
const onErr = () => {
  idx.value = Math.min(idx.value + 1, srcs.value.length)
}
const initials = computed(() => (props.asset || '?').slice(0, 3).toUpperCase())
</script>
