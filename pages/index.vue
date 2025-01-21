<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('nav.home') }}</h1>

    <SearchBar @search="handleSearch" ref="searchBar" />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 text-lg mb-4">
        {{ indexBuilding ? t('search.indexBuilding') : t('common.error') }}
      </p>
      <button
        v-if="!indexBuilding"
        @click="retrySearch"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
      >
        {{ t('common.tryAgain') }}
      </button>
    </div>

    <!-- No Results -->
    <div v-else-if="recipes.length === 0" class="text-center py-12">
      <p class="text-gray-600 text-lg mb-4">{{ t('common.noResults') }}</p>
      <button
        @click="clearSearch"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
      >
        {{ t('common.clearSearch') }}
      </button>
    </div>

    <!-- Recipe Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
      >
        <div class="relative pb-[60%]">
          <img
            :src="recipe.imageUrl"
            :alt="recipe.title"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{{ recipe.title }}</h2>
          <p class="text-gray-600 mb-4">{{ t(`search.cuisines.${recipe.cuisine}`) }}</p>
          <div class="flex justify-between items-center">
            <NuxtLink
              :to="`/recipe/${recipe.id}`"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              {{ t('recipe.viewFullRecipe') }}
            </NuxtLink>
            <div class="flex items-center gap-2">
              <button
                @click="handleLike(recipe)"
                class="flex items-center gap-1 px-3 py-1 rounded-md transition-colors"
                :class="[
                  recipeLikes[recipe.id || ''] 
                    ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                <svg 
                  class="w-5 h-5" 
                  :class="{ 'fill-current': recipeLikes[recipe.id || ''] }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                <span>{{ recipe.likesCount || 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Recipe } from '~/composables/useRecipes'
import { useTranslations } from '~/utils/translations'
import { useRouter } from 'vue-router'

const { t } = useTranslations()

const searchBar = ref<{ clearFilters: () => void } | null>(null)
const { user } = useAuth()
const { recipes, loading, error, searchRecipes, indexBuilding } = useRecipeSearch()
const { addRecipe, toggleLike, isLiked } = useRecipes()
const { showNotification } = useNotification()
const router = useRouter()

const recipeLikes = ref<Record<string, boolean>>({})

const handleSearch = async (params: { query: string; cuisine: string; sort: string }) => {
  try {
    await searchRecipes(params)
  } catch (error) {
    console.error('Search error:', error)
    showNotification(t('common.error'), 'error')
  }
}

const saveRecipe = async (recipe: Recipe) => {
  try {
    await addRecipe(recipe)
    showNotification(t('recipe.saveSuccess'), 'success')
    router.push('/saved-recipes')
  } catch (error) {
    showNotification(t('recipe.saveError'), 'error')
    console.error('Error saving recipe:', error)
  }
}

const clearSearch = () => {
  searchBar.value?.clearFilters()
}

const retrySearch = () => {
  handleSearch({ query: '', cuisine: '', sort: 'newest' })
}

const handleLike = async (recipe: Recipe) => {
  if (!user.value) {
    showNotification(t('auth.loginRequired'), 'error')
    return
  }
  
  try {
    await toggleLike(recipe.id!)
    recipeLikes.value[recipe.id!] = !recipeLikes.value[recipe.id!]
    // Update likes count in UI
    recipe.likesCount = (recipe.likesCount || 0) + (recipeLikes.value[recipe.id!] ? 1 : -1)
  } catch (error) {
    console.error('Error toggling like:', error)
    showNotification(t('recipe.likeError'), 'error')
  }
}

// Check liked status for all recipes
watch(() => recipes.value, async (newRecipes) => {
  if (!user.value) return
  
  for (const recipe of newRecipes) {
    if (!recipe.id) continue
    try {
      recipeLikes.value[recipe.id] = await isLiked(recipe.id)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }
}, { immediate: true })

onMounted(() => {
  handleSearch({ query: '', cuisine: '', sort: 'newest' })
})
</script> 