<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">{{ t('nav.home') }}</h1>

    <SearchBar @search="handleSearch" ref="searchBar" />

    <div v-if="loading" class="text-center py-8">
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ t('common.error') }}</p>
      <button
        @click="retrySearch"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {{ t('common.tryAgain') }}
      </button>
    </div>

    <div v-else-if="recipes.length === 0" class="text-center py-8">
      <p class="text-gray-600">{{ t('common.noResults') }}</p>
      <button
        @click="clearSearch"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {{ t('common.clearSearch') }}
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <img
          :src="recipe.imageUrl"
          :alt="recipe.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">{{ recipe.title }}</h2>
          <p class="text-gray-600 mb-4">{{ t(`search.cuisines.${recipe.cuisine}`) }}</p>
          <div class="flex justify-between items-center">
            <NuxtLink
              :to="`/recipe/${recipe.id}`"
              class="text-blue-600 hover:text-blue-800"
            >
              {{ t('recipe.viewFullRecipe') }}
            </NuxtLink>
            <button
              v-if="user"
              @click="saveRecipe(recipe)"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
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

const { t } = useTranslations()

const searchBar = ref<{ clearFilters: () => void } | null>(null)
const { user } = useAuth()
const { recipes, loading, error, searchRecipes } = useRecipeSearch()
const { addRecipe } = useRecipes()
const { showNotification } = useNotification()

const handleSearch = async (params: { query: string; cuisine: string; sort: string }) => {
  await searchRecipes(params)
}

const saveRecipe = async (recipe: Recipe) => {
  try {
    await addRecipe(recipe)
    showNotification('Recipe saved successfully!', 'success')
  } catch (error) {
    showNotification('Failed to save recipe', 'error')
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