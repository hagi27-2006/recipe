<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex items-center">
              <span class="text-xl font-bold">{{ t('nav.home') }}</span>
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="!loading">
              <template v-if="user">
                <NuxtLink 
                  to="/create-recipe" 
                  class="text-gray-700 hover:text-gray-900"
                >
                  {{ t('nav.createRecipe') }}
                </NuxtLink>
                <NuxtLink 
                  to="/saved-recipes" 
                  class="text-gray-700 hover:text-gray-900"
                >
                  {{ t('nav.savedRecipes') }}
                </NuxtLink>
                <button 
                  @click="signOut" 
                  class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  {{ t('nav.signOut') }}
                </button>
              </template>
              <button 
                v-else 
                @click="signInWithFacebook"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {{ t('nav.signIn') }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div v-if="loading" class="text-center py-8">
        <p>{{ t('common.loading') }}</p>
      </div>
      <slot v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, loading, signInWithFacebook, signOut } = useAuth()
const { t } = useTranslations()
</script> 