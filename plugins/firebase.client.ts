import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  type Firestore
} from 'firebase/firestore'
import type { FirebaseOptions } from 'firebase/app'

export default defineNuxtPlugin(async () => {
  // Skip initialization on server
  if (process.server) {
    return {
      provide: {
        firebase: null,
        auth: null,
        firestore: null
      }
    }
  }

  const config = useRuntimeConfig()
  
  // Validate required Firebase config
  if (!config.public.firebaseApiKey || !config.public.firebaseProjectId) {
    console.error('Required Firebase configuration is missing')
    return {
      provide: {
        firebase: null,
        auth: null,
        firestore: null
      }
    }
  }

  const firebaseConfig: FirebaseOptions = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const firestore = getFirestore(app)

    // Initialize Firestore settings
    const initializeFirestore = async (db: Firestore) => {
      try {
        // Enable offline persistence with specific settings
        await enableIndexedDbPersistence(db, {
          synchronizeTabs: true
        })
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('multiple tabs')) {
            console.log('Persistence already enabled in another tab')
          } else {
            console.error('Failed to enable persistence:', err)
          }
        }
      }
    }

    // Initialize Firestore
    await initializeFirestore(firestore)

    return {
      provide: {
        firebase: app,
        auth,
        firestore
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    return {
      provide: {
        firebase: null,
        auth: null,
        firestore: null
      }
    }
  }
}) 