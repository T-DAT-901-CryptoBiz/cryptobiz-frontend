<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <nav class="flex gap-4" role="tablist" aria-label="Sections marchés">
        <button
          v-for="c in cats"
          :key="c.value"
          type="button"
          role="tab"
          :aria-selected="category === c.value"
          class="py-1 text-sm border-b-2 transition-colors"
          :class="
            category === c.value
              ? 'border-white text-white'
              : 'border-transparent text-white/60 hover:text-white'
          "
          @click="selectCategory(c.value)"
        >
          {{ c.label }}
        </button>
      </nav>

      <div class="relative h-9 group/search">
        <button
          type="button"
          class="absolute right-0 top-0 h-9 w-9 grid place-items-center rounded-md bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition z-10"
          @click="focusSearch"
          aria-label="Search"
        >
          <Icon name="lucide:search" class="h-4 w-4 text-white/80" />
        </button>

        <input
          ref="searchInput"
          v-model="localQuery"
          type="search"
          placeholder="Search Coin Name"
          class="absolute right-0 top-0 h-9 w-0 opacity-0 pointer-events-none rounded-md bg-white/5 border border-white/10 pl-3 pr-10 text-sm text-white placeholder:text-white/50 outline-none transition-all duration-200 group-hover/search:w-64 group-hover/search:opacity-100 group-hover/search:pointer-events-auto focus:w-64 focus:opacity-100 focus:pointer-events-auto focus:bg-white/10"
          @keydown.enter.prevent="emit('search', localQuery)"
          @keydown.esc.prevent="clearSearch"
          aria-label="Search Coin Name"
        />
      </div>
    </div>

    <nav class="flex gap-2 flex-wrap" role="tablist" aria-label="Filtres">
      <button
        v-for="t in tagsForCategory"
        :key="t.value"
        type="button"
        role="tab"
        :aria-selected="tag === t.value"
        class="px-3 py-1 text-xs rounded-md border transition-colors"
        :class="
          tag === t.value
            ? 'border-white/40 text-white'
            : 'border-white/10 text-white/60 hover:text-white'
        "
        @click="selectTag(t.value)"
      >
        {{ t.label }}
      </button>
    </nav>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'

type CatValue = 'favorites' | 'all'
type Cat = { label: string; value: CatValue }
type Tag = {
  label: string
  value: string
  cat?: CatValue | CatValue[]
}

const props = withDefaults(
  defineProps<{
    modelValue?: CatValue
    tagValue?: string
    categories?: Cat[]
    tags?: Tag[]
  }>(),
  {
    modelValue: 'all',
    tagValue: 'all',
    categories: () =>
      [
        { label: 'Favorites', value: 'favorites' },
        { label: 'All', value: 'all' },
      ] as Cat[],
    tags: () =>
      [
        { label: 'All', value: 'all', cat: 'all' },
        { label: 'Winners', value: 'gainers', cat: 'all' },
        { label: 'Losers', value: 'losers', cat: 'all' },
        { label: 'Volume', value: 'volume', cat: 'all' },
        { label: 'Volatility', value: 'volatility', cat: 'all' },
      ] as Tag[],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: CatValue]
  'update:tagValue': [value: string]
  change: [{ category: CatValue; tag: string }]
  search: [query: string]
}>()

const category = ref<CatValue>(props.modelValue)
const tag = ref<string>(props.tagValue)

watch(
  () => props.modelValue,
  (v) => {
    if (v && v !== category.value) category.value = v
  },
)
watch(
  () => props.tagValue,
  (v) => {
    if (typeof v === 'string' && v !== tag.value) tag.value = v
  },
)

const cats = computed(() => props.categories ?? [])

function tagMatchesCategory(t: Tag, c: CatValue): boolean {
  if (t.cat == null) return true
  if (Array.isArray(t.cat)) return t.cat.includes(c) || t.cat.includes('all')
  return t.cat === c || t.cat === 'all'
}

const tagsForCategory = computed(() => {
  const base = (props.tags ?? []).filter((t) => tagMatchesCategory(t, category.value))
  const first = base.find((t) => t.value === 'all')
  const rest = base.filter((t) => t.value !== 'all')
  return first ? [first, ...rest] : rest
})

function selectCategory(v: CatValue) {
  if (category.value === v) return
  category.value = v

  if (!tagsForCategory.value.some((t) => t.value === tag.value)) {
    tag.value = 'all'
  }

  emit('update:modelValue', v)
  emit('update:tagValue', tag.value)
  emit('change', { category: v, tag: tag.value })
}

function selectTag(v: string) {
  if (tag.value === v) return
  tag.value = v
  emit('update:tagValue', v)
  emit('change', { category: category.value, tag: v })
}

const localQuery = ref('')
watch(localQuery, (q) => emit('search', q ?? ''))

function clearSearch() {
  localQuery.value = ''
  emit('search', '')
}

const searchInput: Ref<HTMLInputElement | null> = ref(null)
function focusSearch() {
  searchInput.value?.focus()
}

defineExpose({ focusSearch })
</script>
