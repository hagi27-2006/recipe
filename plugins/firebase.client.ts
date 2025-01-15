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
  const firebaseConfig: FirebaseOptions = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  // Initialize Firebase only once
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
}) 