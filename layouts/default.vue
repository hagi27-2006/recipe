<template>
  <div class="min-h-screen flex flex-col">
    <nav class="bg-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <span class="text-2xl font-bold text-blue-600">{{ t('nav.home') }}</span>
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="!loading">
              <template v-if="user">
                <NuxtLink 
                  to="/create-recipe" 
                  class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {{ t('nav.createRecipe') }}
                </NuxtLink>
                <NuxtLink 
                  to="/my-recipes" 
                  class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {{ t('nav.myRecipes') }}
                </NuxtLink>
                <NuxtLink 
                  to="/saved-recipes" 
                  class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {{ t('nav.savedRecipes') }}
                </NuxtLink>
                <NuxtLink 
                  to="/profile" 
                  class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {{ t('nav.profile') }}
                </NuxtLink>
                <button 
                  @click="signOut" 
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  {{ t('nav.signOut') }}
                </button>
              </template>
              <template v-else>
                <AuthForm />
              </template>
            </template>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="flex-grow container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center items-center min-h-[50vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <NuxtPage v-else />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const { user, loading, signInWithFacebook, signOut } = useAuth()
const { t } = useTranslations()
</script> 