<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Create New Recipe</h1>
    
    <form @submit.prevent="createRecipe" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Recipe Title
        </label>
        <input
          v-model="recipe.title"
          type="text"
          required
          class="w-full p-2 border rounded-md"
          placeholder="Enter recipe title"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cuisine Type
        </label>
        <select
          v-model="recipe.cuisine"
          required
          class="w-full p-2 border rounded-md"
        >
          <option value="">Select Cuisine</option>
          <option value="italian">Italian</option>
          <option value="mexican">Mexican</option>
          <option value="indian">Indian</option>
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ingredients
        </label>
        <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="flex gap-2 mb-2">
          <input
            v-model="recipe.ingredients[index]"
            type="text"
            required
            class="flex-1 p-2 border rounded-md"
            placeholder="Enter ingredient"
          />
          <button
            type="button"
            @click="removeIngredient(index)"
            class="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            :disabled="recipe.ingredients.length <= 1"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="addIngredient"
          class="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Ingredient
        </button>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          v-model="recipe.instructions"
          required
          rows="4"
          class="w-full p-2 border rounded-md"
          placeholder="Enter cooking instructions"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <input
          v-model="recipe.imageUrl"
          type="url"
          required
          class="w-full p-2 border rounded-md"
          placeholder="Enter image URL"
        />
      </div>

      <div class="flex justify-end gap-4">
        <NuxtLink
          to="/"
          class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? 'Creating...' : 'Create Recipe' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Recipe } from '~/composables/useRecipes'

const router = useRouter()
const { addRecipe } = useRecipes()
const { showNotification } = useNotification()
const loading = ref(false)

const recipe = ref<Omit<Recipe, 'id' | 'userId'>>({
  title: '',
  cuisine: '',
  ingredients: [''],
  instructions: '',
  imageUrl: ''
})

const addIngredient = () => {
  recipe.value.ingredients.push('')
}

const removeIngredient = (index: number) => {
  if (recipe.value.ingredients.length > 1) {
    recipe.value.ingredients.splice(index, 1)
  }
}

const createRecipe = async () => {
  loading.value = true
  try {
    await addRecipe(recipe.value)
    showNotification('Recipe created successfully!', 'success')
    router.push('/saved-recipes')
  } catch (error) {
    console.error('Error creating recipe:', error)
    showNotification('Failed to create recipe', 'error')
  } finally {
    loading.value = false
  }
}
</script> 