import { ref, watch, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(true)

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    saveTheme()
  }

  function applyTheme() {
    if (import.meta.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  }

  function saveTheme() {
    if (import.meta.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  function loadTheme() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      if (saved) {
        isDark.value = saved === 'dark'
      } else {
        // Default to dark
        isDark.value = true
      }
      applyTheme()
    }
  }

  onMounted(() => {
    loadTheme()
  })

  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    toggleTheme,
  }
}
