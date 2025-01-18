<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('nav.createRecipe') }}</h1>
    
    <form @submit.prevent="createRecipe" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.title') }}
        </label>
        <input
          v-model="recipe.title"
          type="text"
          required
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          :placeholder="t('recipe.title')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.cuisine') }}
        </label>
        <select
          v-model="recipe.cuisine"
          required
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        >
          <option value="">{{ t('search.allCuisines') }}</option>
          <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">
            {{ t(`search.cuisines.${cuisine}`) }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.ingredients') }}
        </label>
        <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="flex gap-2 mb-2">
          <input
            v-model="recipe.ingredients[index]"
            type="text"
            required
            class="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            :placeholder="t('recipe.ingredients')"
          />
          <button
            type="button"
            @click="removeIngredient(index)"
            class="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150 ease-in-out"
            :disabled="recipe.ingredients.length <= 1"
          >
            {{ t('recipe.removeIngredient') }}
          </button>
        </div>
        <button
          type="button"
          @click="addIngredient"
          class="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-150 ease-in-out"
        >
          {{ t('recipe.addIngredient') }}
        </button>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.instructions') }}
        </label>
        <textarea
          v-model="recipe.instructions"
          required
          rows="4"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          :placeholder="t('recipe.instructions')"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.imageUrl') }}
        </label>
        <input
          v-model="recipe.imageUrl"
          type="url"
          required
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          :placeholder="t('recipe.imageUrl')"
        />
      </div>

      <div class="flex justify-end gap-4">
        <NuxtLink
          to="/"
          class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition duration-150 ease-in-out"
        >
          {{ t('common.cancel') }}
        </NuxtLink>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
          :disabled="loading"
        >
          {{ loading ? t('common.loading') : t('common.create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Recipe } from '~/composables/useRecipes'

const router = useRouter()
const { addRecipe } = useRecipes()
const { showNotification } = useNotification()
const { t } = useTranslations()
const loading = ref(false)

const cuisines = [
  'italian',
  'mexican',
  'indian',
  'chinese',
  'japanese',
  'thai',
  'mediterranean'
]

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
    showNotification(t('recipe.createSuccess'), 'success')
    router.push('/saved-recipes')
  } catch (error) {
    console.error('Error creating recipe:', error)
    showNotification(t('recipe.createError'), 'error')
  } finally {
    loading.value = false
  }
}
</script> 