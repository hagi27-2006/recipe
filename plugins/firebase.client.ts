import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { FirebaseOptions } from 'firebase/app'

export default defineNuxtPlugin(() => {
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
  if (!config.public.firebaseApiKey) {
    console.error('Firebase API key is missing')
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
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const firestore = getFirestore(app)

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