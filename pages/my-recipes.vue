<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('nav.myRecipes') }}</h1>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- No Recipes -->
    <div v-else-if="myRecipes.length === 0" class="text-center py-12">
      <p class="text-gray-600 text-lg mb-4">{{ t('recipe.noMyRecipes') }}</p>
      <NuxtLink
        to="/create-recipe"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-150 ease-in-out"
      >
        {{ t('nav.createRecipe') }}
      </NuxtLink>
    </div>

    <!-- Recipe Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="recipe in myRecipes"
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
              @click="handleDelete(recipe.id)"
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
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Firestore
} from 'firebase/firestore'
import type { Recipe } from '~/composables/useRecipes'

const { $firestore } = useNuxtApp()
const { t } = useTranslations()
const { user } = useAuth()
const { deleteRecipe } = useRecipes()
const { showNotification } = useNotification()
const loading = ref(true)
const myRecipes = ref<Recipe[]>([])

const fetchMyRecipes = async () => {
  if (!user.value) return
  
  try {
    const { $firestore } = useNuxtApp()
    if (!$firestore) return

    // Try to use existing index
    const q = query(
      collection($firestore as unknown as Firestore, 'recipes'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    myRecipes.value = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Recipe[]

  } catch (error) {
    // If index error occurs, try without sorting
    if (error instanceof Error && error.message.includes('index')) {
      try {
        const simpleQuery = query(
          collection($firestore as unknown as Firestore, 'recipes'),
          where('userId', '==', user.value.uid)
        )
        
        const snapshot = await getDocs(simpleQuery)
        // Sort in memory
        myRecipes.value = snapshot.docs
          .map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
          })) as Recipe[]
        
        // Sort by createdAt in memory
        myRecipes.value.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        
      } catch (fallbackError) {
        console.error('Error fetching my recipes:', fallbackError)
        showNotification(t('recipe.fetchError'), 'error')
      }
    } else {
      console.error('Error fetching my recipes:', error)
      showNotification(t('recipe.fetchError'), 'error')
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async (recipeId: string | undefined) => {
  if (!recipeId) return
  
  try {
    await deleteRecipe(recipeId)
    await fetchMyRecipes() // Refresh the list
  } catch (error) {
    console.error('Error deleting recipe:', error)
  }
}

onMounted(() => {
  fetchMyRecipes()
})

definePageMeta({
  middleware: ['auth']
})
</script> 