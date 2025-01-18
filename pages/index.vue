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
            <button
              v-if="user"
              @click="saveRecipe(recipe)"
              class="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-150 ease-in-out"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Recipe } from '~/composables/useRecipes'
import { useTranslations } from '~/utils/translations'
import { useRouter } from 'vue-router'

const { t } = useTranslations()

const searchBar = ref<{ clearFilters: () => void } | null>(null)
const { user } = useAuth()
const { recipes, loading, error, searchRecipes, indexBuilding } = useRecipeSearch()
const { addRecipe } = useRecipes()
const { showNotification } = useNotification()
const router = useRouter()

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

onMounted(() => {
  handleSearch({ query: '', cuisine: '', sort: 'newest' })
})
</script> 