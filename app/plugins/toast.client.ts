type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; type: ToastType; message: string; timeout: number }

export default defineNuxtPlugin(() => {
  const queue = useState<Toast[]>('toast:queue', () => [])
  let id = 1

  function push(message: string, type: ToastType = 'info', timeout = 3000) {
    const t: Toast = { id: id++, type, message, timeout }
    queue.value.push(t)
    // auto-remove
    const timer = setTimeout(() => remove(t.id), timeout)
    // @ts-ignore
    t._timer = timer
  }
  function remove(tid: number) {
    const i = queue.value.findIndex((t) => t.id === tid)
    if (i >= 0) {
      // @ts-ignore
      if (queue.value[i]?._timer) clearTimeout(queue.value[i]._timer)
      queue.value.splice(i, 1)
    }
  }
  function clear() {
    for (const t of queue.value) {
      // @ts-ignore
      if (t?._timer) clearTimeout(t._timer)
    }
    queue.value = []
  }

  return {
    provide: {
      toast: {
        show: (msg: string) => push(msg, 'info'),
        success: (msg: string) => push(msg, 'success'),
        error: (msg: string) => push(msg, 'error'),
        info: (msg: string) => push(msg, 'info'),
        remove,
        clear,
      },
    },
  }
})
