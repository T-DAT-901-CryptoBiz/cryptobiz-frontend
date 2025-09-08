import { useState } from '#app'

export function useAlertsCenter() {
  const unread = useState<number>('alerts:unread', () => 0)
  function addUnread(n = 1) {
    unread.value = Math.max(0, (unread.value || 0) + n)
  }
  function clearUnread() {
    unread.value = 0
  }
  return { unread, addUnread, clearUnread }
}
