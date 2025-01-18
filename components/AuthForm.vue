<template>
  <div class="relative">
    <!-- Auth Trigger Button -->
    <button
      @click="showModal = true"
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
    >
      {{ t('nav.signIn') }}
    </button>

    <!-- Auth Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Auth Form Content -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isLogin ? t('auth.signIn') : t('auth.register') }}
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            {{ isLogin ? t('auth.welcomeBack') : t('auth.createAccount') }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t('auth.email') }}</label>
            <input
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('auth.emailPlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t('auth.password') }}</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="t('auth.passwordPlaceholder')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  :viewBox="showPassword ? '0 0 24 24' : '0 0 24 24'"
                >
                  <path
                    v-if="showPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    v-if="showPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ isLogin ? t('auth.signIn') : t('auth.register') }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">{{ t('auth.orContinueWith') }}</span>
            </div>
          </div>

          <button
            @click="signInWithFacebook"
            :disabled="loading"
            class="mt-6 w-full flex justify-center items-center gap-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4267B2] hover:bg-[#365899] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- Facebook Icon -->
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            {{ t('auth.continueWithFacebook') }}
          </button>
        </div>

        <div class="mt-6 text-center">
          <button
            @click="isLogin = !isLogin"
            class="text-sm text-blue-600 hover:text-blue-500"
          >
            {{ isLogin ? t('auth.needAccount') : t('auth.alreadyHaveAccount') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTranslations } from '~/utils/translations'

const { t } = useTranslations()
const { register, signIn, signInWithFacebook, loading } = useAuth()

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const showPassword = ref(false)
const showModal = ref(false)

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
    } else {
      await register(email.value, password.value)
    }
    email.value = ''
    password.value = ''
    showModal.value = false
  } catch (error) {
    console.error('Auth error:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  email.value = ''
  password.value = ''
  showPassword.value = false
}
</script> 