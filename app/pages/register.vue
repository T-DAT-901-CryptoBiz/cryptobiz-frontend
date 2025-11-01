<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div
            class="h-12 w-12 rounded-xl bg-neutral-800 border border-white/10 grid place-items-center"
          >
            <img src="/cryptobiz-logo.png" alt="CryptoBiz" class="h-10 w-10" />
          </div>
          <h1 class="text-3xl font-bold tracking-tight">CryptoBiz</h1>
        </div>
        <p class="text-sm text-white/50">Créez votre compte pour commencer</p>
      </div>

      <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
        <div class="px-6 py-6">
          <h2 class="text-lg font-semibold mb-6">Inscription</h2>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <div>
              <label class="block text-xs font-medium text-white/70 mb-2">Nom</label>
              <UInput
                v-model="form.name"
                type="text"
                placeholder="Votre nom"
                size="lg"
                required
                :disabled="loading"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-white/70 mb-2">Email</label>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="votre@email.com"
                size="lg"
                required
                :disabled="loading"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-white/70 mb-2">Mot de passe</label>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Minimum 6 caractères"
                size="lg"
                required
                :disabled="loading"
                class="w-full"
              />
              <p class="mt-1.5 text-xs text-white/40">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </div>

            <div
              v-if="error"
              class="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {{ error }}
            </div>

            <UButton
              type="submit"
              block
              size="lg"
              :loading="loading"
              :disabled="loading"
              class="mt-6"
            >
              <span v-if="!loading">Créer mon compte</span>
            </UButton>
          </form>

          <div class="mt-6 pt-6 border-t border-white/5">
            <div class="relative mb-5">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/10"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-3 bg-neutral-900/60 text-white/50">Ou continuer avec</span>
              </div>
            </div>

            <UButton
              type="button"
              variant="outline"
              block
              size="lg"
              :disabled="loading"
              class="border-white/10 hover:bg-white/5"
              @click="handleGoogleLogin"
            >
              <Icon name="lucide:chrome" class="w-5 h-5 mr-2" />
              Google
            </UButton>
          </div>

          <div class="mt-6 pt-6 border-t border-white/5 text-center">
            <p class="text-sm text-white/50">
              Déjà un compte ?
              <NuxtLink
                to="/login"
                class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors"
              >
                Se connecter
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { register, loginWithGoogle } = useAuth()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

async function handleRegister() {
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  loading.value = true
  error.value = null

  try {
    await register(form.value.name, form.value.email, form.value.password)
    await router.push('/')
  } catch (err: unknown) {
    error.value =
      err && typeof err === 'object' && 'data' in err
        ? String((err.data as { message?: string }).message || "Erreur lors de l'inscription")
        : "Erreur lors de l'inscription"
  } finally {
    loading.value = false
  }
}

function handleGoogleLogin() {
  loginWithGoogle()
}
</script>
