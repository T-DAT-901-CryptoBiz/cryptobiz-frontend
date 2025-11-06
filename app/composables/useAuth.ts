import { computed } from 'vue'
import type { User } from '~/server/utils/users'

interface AuthState {
  user: User | null
  pending: boolean
}

export function useAuth() {
  const authState = useState<AuthState>('auth', () => ({
    user: null,
    pending: true,
  }))

  const user = computed(() => authState.value.user)
  const isAuthenticated = computed(() => !!authState.value.user)
  const isAdmin = computed(() => authState.value.user?.role === 'admin')
  const pending = computed(() => authState.value.pending)

  async function fetchUser() {
    if (import.meta.server) {
      return
    }

    try {
      authState.value.pending = true
      const { user: userData } = await $fetch<{ user: User }>('/api/auth/me')
      authState.value.user = userData
    } catch {
      authState.value.user = null
    } finally {
      authState.value.pending = false
    }
  }

  async function login(email: string, password: string) {
    const { user: userData } = await $fetch<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    authState.value.user = userData
    return userData
  }

  async function register(name: string, email: string, password: string) {
    const { user: userData } = await $fetch<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    authState.value.user = userData
    return userData
  }

  async function logout() {
    await $fetch('/api/auth/logout', {
      method: 'POST',
    })
    authState.value.user = null
  }

  function loginWithGoogle() {
    if (import.meta.server) return
    // Simplement rediriger vers l'endpoint, l'URI de redirection sera construite côté serveur
    window.location.href = '/api/auth/google'
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    pending,
    login,
    register,
    logout,
    loginWithGoogle,
    refresh: fetchUser,
  }
}
