import { ref } from 'vue'

interface Notification {
  message: string
  type: 'success' | 'error'
}

export const useNotification = () => {
  const notification = ref<Notification | null>(null)
  const timeout = ref<NodeJS.Timeout>()

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }

    notification.value = { message, type }
    timeout.value = setTimeout(() => {
      notification.value = null
    }, 3000)
  }

  onUnmounted(() => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
  })

  return {
    notification,
    showNotification
  }
} 