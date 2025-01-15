<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">My Saved Recipes</h1>

    <div v-if="loading" class="text-center py-8">
      <p>Loading your recipes...</p>
    </div>

    <div v-else-if="savedRecipes.length === 0" class="text-center py-8">
      <p class="text-gray-600">You haven't saved any recipes yet.</p>
      <NuxtLink
        to="/"
        class="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
      >
        Browse Recipes
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="recipe in savedRecipes"
        :key="recipe.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <img
          :src="recipe.imageUrl"
          :alt="recipe.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">{{ recipe.title }}</h2>
          <p class="text-gray-600 mb-4">{{ recipe.cuisine }} Cuisine</p>
          <div class="flex justify-between items-center">
            <NuxtLink
              :to="`/recipe/${recipe.id}`"
              class="text-blue-600 hover:text-blue-800"
            >
              View Recipe
            </NuxtLink>
            <button
              @click="deleteRecipe(recipe.id)"
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { savedRecipes, getSavedRecipes, deleteRecipe } = useRecipes()
const loading = ref(true)

onMounted(async () => {
  try {
    await getSavedRecipes()
  } finally {
    loading.value = false
  }
})
</script> 