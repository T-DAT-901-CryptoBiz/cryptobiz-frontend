<template>
  <div :id="id" class="h-[480px] w-full rounded-2xl overflow-hidden border border-white/5" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ symbol: string; interval?: string; theme?: 'light' | 'dark' }>(),
  {
    interval: '60',
    theme: 'dark',
  },
)
const id = `tv_${Math.random().toString(36).slice(2)}`

onMounted(() => {
  const i = setInterval(() => {
    // @ts-ignore
    if (window.TradingView) {
      clearInterval(i)
      // @ts-ignore
      new window.TradingView.widget({
        symbol: props.symbol,
        interval: props.interval,
        container_id: id,
        autosize: true,
        timezone: 'Etc/UTC',
        theme: props.theme,
        style: '1',
        locale: 'en',
        hide_top_toolbar: false,
        allow_symbol_change: false,
      })
    }
  }, 50)
})
</script>