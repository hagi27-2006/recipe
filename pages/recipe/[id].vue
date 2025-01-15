<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <p>{{ t('recipe.loading') }}</p>
    </div>
    
    <div v-else-if="recipe" class="max-w-4xl mx-auto">
      <div class="mb-6">
        <img 
          :src="recipe.imageUrl" 
          :alt="recipe.title"
          class="w-full h-64 object-cover rounded-lg shadow-lg"
        />
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ recipe.title }}</h1>
            <p class="text-gray-600">{{ t(`search.cuisines.${recipe.cuisine}`) }}</p>
          </div>
          <button
            v-if="user && recipe.userId === user.uid"
            @click="confirmDelete"
            class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            {{ t('recipe.deleteRecipe') }}
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h2 class="text-xl font-semibold mb-4">{{ t('recipe.ingredients') }}</h2>
            <ul class="list-disc pl-5 space-y-2">
              <li v-for="ingredient in recipe.ingredients" :key="ingredient">
                {{ ingredient }}
              </li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-4">{{ t('recipe.instructions') }}</h2>
            <p class="whitespace-pre-line">{{ recipe.instructions }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">{{ t('recipe.notFound') }}</p>
      <NuxtLink
        to="/"
        class="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
      >
        {{ t('recipe.backToRecipes') }}
      </NuxtLink>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">{{ t('recipe.deleteConfirm') }}</h3>
        <div class="flex justify-end gap-4">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="deleteAndNavigate"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import type { Recipe } from '~/composables/useRecipes'
import { useTranslations } from '~/utils/translations'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { deleteRecipe } = useRecipes()
const { showNotification } = useNotification()
const { t } = useTranslations()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)

const fetchRecipe = async () => {
  const { $firestore } = useNuxtApp()
  try {
    const docRef = doc($firestore, 'recipes', route.params.id as string)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      recipe.value = {
        id: docSnap.id,
        ...docSnap.data()
      } as Recipe
    }
  } catch (error) {
    console.error('Error fetching recipe:', error)
    showNotification(t('recipe.error'), 'error')
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteAndNavigate = async () => {
  if (!recipe.value?.id) return
  
  try {
    await deleteRecipe(recipe.value.id)
    showNotification(t('recipe.deleteSuccess'), 'success')
    router.push('/')
  } catch (error) {
    console.error('Error deleting recipe:', error)
    showNotification(t('recipe.deleteError'), 'error')
  } finally {
    showDeleteModal.value = false
  }
}

onMounted(() => {
  fetchRecipe()
})
</script> 