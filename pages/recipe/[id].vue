<template>
  <div class="min-h-screen bg-gray-50">
    <DeleteConfirmModal
      :show="showDeleteModal"
      @confirm="deleteAndNavigate"
      @cancel="showDeleteModal = false"
    />
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="recipe" class="max-w-5xl mx-auto py-8 px-4">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Left Column: Images and Video -->
        <div class="space-y-6">
          <ImageGallery 
            :images="recipe.images || [recipe.imageUrl]" 
            :title="recipe.title" 
          />
          <VideoPlayer 
            v-if="recipe.videoUrl"
            :video-url="recipe.videoUrl" 
          />
        </div>

        <!-- Right Column: Recipe Info -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-3xl font-bold mb-2">{{ recipe.title }}</h1>
                <div class="space-y-2">
                  <p class="text-gray-600">{{ t(`search.cuisines.${recipe.cuisine}`) }}</p>
                  
                  <!-- Rating Display -->
                  <div class="flex items-center gap-2">
                    <div class="text-yellow-400 text-xl">
                      {{ '★'.repeat(Math.round(recipe.avgRating || 0)) }}
                      <span class="text-gray-300">{{ '★'.repeat(5 - Math.round(recipe.avgRating || 0)) }}</span>
                    </div>
                    <span class="text-sm text-gray-500">
                      ({{ recipe.ratingCount || 0 }} {{ t('recipe.ratings') }})
                    </span>
                  </div>
                  
                  <div class="text-sm text-gray-500 space-y-1">
                    <p>
                      {{ t('recipe.createdBy') }}:
                      <NuxtLink 
                        :to="`/user/${recipe.userId}`"
                        class="text-blue-500 hover:text-blue-700"
                      >
                        {{ recipeAuthor }}
                      </NuxtLink>
                    </p>
                    <p>{{ t('recipe.createdAt') }}: {{ formatDate(recipe.createdAt) }}</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <ShareButton :title="recipe.title" />
                <div v-if="user && recipe.userId === user.uid" class="flex gap-2">
                  <button
                    @click="showEditForm = true"
                    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    {{ t('common.edit') }}
                  </button>
                  <button
                    @click="confirmDelete"
                    class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                  >
                    {{ t('common.delete') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Recipe Content -->
            <div v-if="!showEditForm" class="space-y-6">
              <div>
                <h2 class="text-xl font-semibold mb-3">{{ t('recipe.ingredients') }}</h2>
                <ul class="list-disc pl-5 space-y-2">
                  <li 
                    v-for="ingredient in recipe.ingredients" 
                    :key="ingredient"
                    class="text-gray-700"
                  >
                    {{ ingredient }}
                  </li>
                </ul>
              </div>

              <div>
                <h2 class="text-xl font-semibold mb-3">{{ t('recipe.instructions') }}</h2>
                <p class="whitespace-pre-line text-gray-700">{{ recipe.instructions }}</p>
              </div>
            </div>

            <!-- Edit Form -->
            <form v-else @submit.prevent="handleUpdate" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.title') }}
                </label>
                <input
                  v-model="editForm.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.cuisine') }}
                </label>
                <select
                  v-model="editForm.cuisine"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">
                    {{ t(`search.cuisines.${cuisine}`) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.ingredients') }}
                </label>
                <div v-for="(ingredient, index) in editForm.ingredients" :key="index" class="flex gap-2 mb-2">
                  <input
                    v-model="editForm.ingredients[index]"
                    type="text"
                    required
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    @click="removeIngredient(index)"
                    class="px-3 py-2 bg-red-500 text-white rounded-md"
                    :disabled="editForm.ingredients.length <= 1"
                  >
                    {{ t('recipe.removeIngredient') }}
                  </button>
                </div>
                <button
                  type="button"
                  @click="addIngredient"
                  class="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  {{ t('recipe.addIngredient') }}
                </button>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.instructions') }}
                </label>
                <textarea
                  v-model="editForm.instructions"
                  required
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.imageUrl') }}
                </label>
                <input
                  v-model="editForm.imageUrl"
                  type="url"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <!-- Add Video URL -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.videoUrl') }}
                </label>
                <input
                  v-model="editForm.videoUrl"
                  type="url"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md"
                  :placeholder="t('recipe.videoUrl')"
                />
              </div>

              <!-- Add Multiple Images -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('recipe.addImages') }}
                </label>
                <div class="flex flex-wrap gap-2">
                  <input
                    v-for="(image, index) in editForm.images"
                    :key="index"
                    v-model="editForm.images[index]"
                    type="url"
                    class="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md"
                    :placeholder="`${t('recipe.imageUrl')} ${index + 1}`"
                  />
                  <button
                    type="button"
                    @click="editForm.images.push('')"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  :disabled="updating"
                >
                  {{ updating ? t('common.saving') : t('common.save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <Comments :recipe-id="recipe.id!" />
      </div>

      <!-- Similar Recipes -->
      <div v-if="similarRecipes.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold mb-6">{{ t('recipe.similarRecipes') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="similar in similarRecipes" 
            :key="similar.id"
            class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <img
              :src="similar.imageUrl"
              :alt="similar.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-lg mb-2">{{ similar.title }}</h3>
              <div class="flex items-center gap-2 mb-3">
                <div class="text-yellow-400">
                  {{ '★'.repeat(Math.round(similar.avgRating || 0)) }}
                  <span class="text-gray-300">{{ '★'.repeat(5 - Math.round(similar.avgRating || 0)) }}</span>
                </div>
                <span class="text-sm text-gray-500">
                  ({{ similar.ratingCount || 0 }})
                </span>
              </div>
              <NuxtLink
                :to="`/recipe/${similar.id}`"
                class="text-blue-500 hover:text-blue-700 font-medium"
              >
                {{ t('common.viewMore') }}
              </NuxtLink>
            </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { doc, getDoc, getDoc as getFirestoreDoc } from 'firebase/firestore'
import type { Recipe } from '~/composables/useRecipes'
import { useTranslations } from '~/utils/translations'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { deleteRecipe, updateRecipe, getSimilarRecipes } = useRecipes()
const { showNotification } = useNotification()
const { t } = useTranslations()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)
const recipeAuthor = ref('')
const showEditForm = ref(false)
const updating = ref(false)
const similarRecipes = ref<Recipe[]>([])
const editForm = ref({
  title: '',
  cuisine: '',
  ingredients: [''],
  instructions: '',
  imageUrl: '',
  videoUrl: '',
  images: ['']
})

const cuisines = [
  'italian',
  'mexican',
  'indian',
  'chinese',
  'japanese',
  'thai',
  'mediterranean'
]

// Format date helper function
const formatDate = (timestamp: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

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
      
      // Fetch author info
      const userDocRef = doc($firestore, 'users', recipe.value.userId)
      const userDocSnap = await getFirestoreDoc(userDocRef)
      if (userDocSnap.exists()) {
        recipeAuthor.value = userDocSnap.data().email?.split('@')[0] || t('recipe.unknownAuthor')
      } else {
        recipeAuthor.value = t('recipe.unknownAuthor')
      }
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
    // Show loading state
    loading.value = true
    await deleteRecipe(recipe.value.id)
    showNotification(t('recipe.deleteSuccess'), 'success')
    router.push('/')
  } catch (error) {
    console.error('Error deleting recipe:', error)
    showNotification(t('recipe.deleteError'), 'error')
  } finally {
    showDeleteModal.value = false
    loading.value = false
  }
}

const initEditForm = () => {
  if (!recipe.value) return
  editForm.value = {
    title: recipe.value.title,
    cuisine: recipe.value.cuisine,
    ingredients: [...recipe.value.ingredients],
    instructions: recipe.value.instructions,
    imageUrl: recipe.value.imageUrl,
    videoUrl: recipe.value.videoUrl || '',
    images: recipe.value.images ? [...recipe.value.images] : []
  }
}

const addIngredient = () => {
  editForm.value.ingredients.push('')
}

const removeIngredient = (index: number) => {
  if (editForm.value.ingredients.length > 1) {
    editForm.value.ingredients.splice(index, 1)
  }
}

const cancelEdit = () => {
  showEditForm.value = false
  initEditForm()
}

const handleUpdate = async () => {
  if (!recipe.value?.id) return
  
  updating.value = true
  try {
    await updateRecipe(recipe.value.id, {
      ...editForm.value,
      titleLower: editForm.value.title.toLowerCase()
    })
    showEditForm.value = false
    // Refresh recipe data
    await fetchRecipe()
    showNotification(t('recipe.updateSuccess'), 'success')
  } catch (error) {
    console.error('Error updating recipe:', error)
    showNotification(t('recipe.updateError'), 'error')
  } finally {
    updating.value = false
  }
}

const fetchSimilarRecipes = async () => {
  if (!recipe.value?.id) return
  try {
    similarRecipes.value = await getSimilarRecipes(recipe.value.id)
  } catch (error) {
    console.error('Error fetching similar recipes:', error)
  }
}

// Initialize edit form when recipe is loaded
watch(() => recipe.value, (newRecipe) => {
  if (newRecipe) {
    initEditForm()
  }
}, { immediate: true })

onMounted(async () => {
  await fetchRecipe()
  if (recipe.value) {
    await fetchSimilarRecipes()
  }
})
</script> 