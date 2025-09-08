export function useToast() {
  const { $toast } = useNuxtApp()
  return $toast as {
    show: (msg: string) => void
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    clear: () => void
  }
}
