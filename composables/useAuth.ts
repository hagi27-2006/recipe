import { 
  signInWithPopup, 
  FacebookAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  type User 
} from 'firebase/auth'
import { ref } from 'vue'

// Create global state
const user = ref<User | null>(null)
const loading = ref(true)
let unsubscribe: (() => void) | null = null

export const useAuth = () => {
  const { $auth } = useNuxtApp()

  // Initialize auth state listener only once on client
  if (process.client && !unsubscribe) {
    unsubscribe = onAuthStateChanged($auth, (newUser) => {
      user.value = newUser
      loading.value = false
    })
  }

  const signInWithFacebook = async () => {
    try {
      loading.value = true
      const provider = new FacebookAuthProvider()
      await signInWithPopup($auth, provider)
    } catch (error) {
      console.error('Facebook sign in error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      loading.value = true
      await firebaseSignOut($auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    signInWithFacebook,
    signOut
  }
} 