export function useNotifications() {
  function showNotification(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    duration = 5000,
  ) {
    // Créer un élément de notification
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-[9999] rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden ${
      type === 'success'
        ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-500/15 to-emerald-500/10 border-emerald-500/40 text-emerald-300'
        : type === 'error'
          ? 'bg-gradient-to-br from-rose-500/20 via-rose-500/15 to-rose-500/10 border-rose-500/40 text-rose-300'
          : type === 'warning'
            ? 'bg-gradient-to-br from-yellow-500/20 via-yellow-500/15 to-yellow-500/10 border-yellow-500/40 text-yellow-300'
            : 'bg-gradient-to-br from-blue-500/20 via-blue-500/15 to-blue-500/10 border-blue-500/40 text-blue-300'
    }`
    notification.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    notification.style.transform = 'translateX(400px)'
    notification.style.opacity = '0'

    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    notification.id = notificationId
    notification.classList.add('notification-item')

    // Icône avec animation
    const iconSvg =
      type === 'success'
        ? '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        : type === 'error'
          ? '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
          : type === 'warning'
            ? '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
            : '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'

    notification.innerHTML = `
      <div class="px-5 py-4 flex items-start gap-4">
        <div class="flex-shrink-0 mt-0.5">
          <div class="p-2 rounded-xl ${
            type === 'success'
              ? 'bg-emerald-500/20'
              : type === 'error'
                ? 'bg-rose-500/20'
                : type === 'warning'
                  ? 'bg-yellow-500/20'
                  : 'bg-blue-500/20'
          }">
            ${iconSvg}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3 mb-1">
            <p class="text-sm font-bold tracking-wide uppercase ${
              type === 'success'
                ? 'text-emerald-300'
                : type === 'error'
                  ? 'text-rose-300'
                  : type === 'warning'
                    ? 'text-yellow-300'
                    : 'text-blue-300'
            }">
              ${type === 'success' ? 'Price Alert' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}
            </p>
            <button class="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10" onclick="document.getElementById('${notificationId}')?.remove()">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm leading-relaxed opacity-95 font-medium">${message}</p>
        </div>
      </div>
      <div class="h-1 bg-gradient-to-r ${
        type === 'success'
          ? 'from-emerald-400 to-emerald-600'
          : type === 'error'
            ? 'from-rose-400 to-rose-600'
            : type === 'warning'
              ? 'from-yellow-400 to-yellow-600'
              : 'from-blue-400 to-blue-600'
      } opacity-50" style="animation: shrink ${duration}ms linear forwards;"></div>
    `

    // Gérer le positionnement des notifications multiples
    const existingNotifications = document.querySelectorAll('.notification-item')
    const topOffset = 4 + existingNotifications.length * 80 // 80px par notification
    notification.style.top = `${topOffset}px`

    // Ajouter le style d'animation pour la barre de progression
    const style = document.createElement('style')
    style.textContent = `
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `
    if (!document.head.querySelector('#notification-styles')) {
      style.id = 'notification-styles'
      document.head.appendChild(style)
    }

    document.body.appendChild(notification)

    // Animation d'entrée avec effet de rebond
    requestAnimationFrame(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateX(0)'
    })

    // Supprimer automatiquement après la durée spécifiée
    const timeout = setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateX(400px)'
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
          // Réorganiser les notifications restantes
          reorganizeNotifications()
        }
      }, 400)
    }, duration)

    // Permettre de fermer manuellement
    const closeBtn = notification.querySelector('button')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        clearTimeout(timeout)
        notification.style.opacity = '0'
        notification.style.transform = 'translateX(400px)'
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove()
            reorganizeNotifications()
          }
        }, 400)
      })
    }

    return notification
  }

  function reorganizeNotifications() {
    const notifications = document.querySelectorAll('.notification-item')
    notifications.forEach((notif, index) => {
      const topOffset = 4 + index * 80
      ;(notif as HTMLElement).style.top = `${topOffset}px`
    })
  }

  return {
    showNotification,
  }
}
