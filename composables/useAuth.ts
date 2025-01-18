import { 
  signInWithPopup, 
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
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
  const { showNotification } = useNotification()

  // Initialize auth state listener only once on client
  if (process.client && !unsubscribe) {
    unsubscribe = onAuthStateChanged($auth, (newUser) => {
      user.value = newUser
      loading.value = false
    })
  }

  const register = async (email: string, password: string) => {
    try {
      loading.value = true
      await createUserWithEmailAndPassword($auth, email, password)
      showNotification('Registration successful!', 'success')
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          showNotification('Email already in use', 'error')
        } else {
          showNotification('Registration failed. Please try again.', 'error')
        }
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      await signInWithEmailAndPassword($auth, email, password)
      showNotification('Signed in successfully!', 'success')
    } catch (error) {
      console.error('Sign in error:', error)
      showNotification('Invalid email or password', 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  const signInWithFacebook = async () => {
    try {
      loading.value = true
      const provider = new FacebookAuthProvider()
      await signInWithPopup($auth, provider)
    } catch (error) {
      console.error('Facebook sign in error:', error)
      if (error instanceof Error && error.message.includes('auth/unauthorized-domain')) {
        showNotification('This domain is not authorized for sign-in. Please try again later.', 'error')
      } else {
        showNotification('Failed to sign in with Facebook. Please try again.', 'error')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      loading.value = true
      await firebaseSignOut($auth)
      showNotification('Signed out successfully', 'success')
    } catch (error) {
      console.error('Sign out error:', error)
      showNotification('Failed to sign out', 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    register,
    signIn,
    signInWithFacebook,
    signOut
  }
} 