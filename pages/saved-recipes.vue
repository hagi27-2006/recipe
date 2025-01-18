<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('nav.savedRecipes') }}</h1>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- No Saved Recipes -->
    <div v-else-if="savedRecipes.length === 0" class="text-center py-12">
      <p class="text-gray-600 text-lg mb-4">{{ t('common.noResults') }}</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
      >
        {{ t('recipe.backToRecipes') }}
      </NuxtLink>
    </div>

    <!-- Recipe Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="recipe in savedRecipes"
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
              @click="deleteRecipe(recipe.id)"
              class="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150 ease-in-out"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { savedRecipes, getSavedRecipes, deleteRecipe: removeRecipe } = useRecipes()
const { showNotification } = useNotification()
const { t } = useTranslations()
const loading = ref(true)

const deleteRecipe = async (recipeId: string) => {
  try {
    await removeRecipe(recipeId)
    showNotification(t('recipe.deleteSuccess'), 'success')
  } catch (error) {
    console.error('Error deleting recipe:', error)
    showNotification(t('recipe.deleteError'), 'error')
  }
}

onMounted(async () => {
  try {
    await getSavedRecipes()
  } finally {
    loading.value = false
  }
})
</script> 