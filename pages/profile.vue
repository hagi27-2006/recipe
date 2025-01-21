<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <!-- Profile Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ t('profile.title') }}</h1>
          <p class="text-gray-600">{{ user?.email }}</p>
        </div>
        <button
          v-if="!isEditing"
          @click="startEditing"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          {{ t('common.edit') }}
        </button>
      </div>

      <!-- Profile Form -->
      <form v-if="isEditing" @submit.prevent="handleUpdate" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.displayName') }}
          </label>
          <input
            v-model="editForm.displayName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            :placeholder="t('profile.displayNamePlaceholder')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.bio') }}
          </label>
          <textarea
            v-model="editForm.bio"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            :placeholder="t('profile.bioPlaceholder')"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.avatar') }}
          </label>
          <input
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="w-full"
          />
          <img
            v-if="editForm.avatarUrl"
            :src="editForm.avatarUrl"
            alt="Avatar preview"
            class="mt-2 w-24 h-24 object-cover rounded-full"
          />
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
            :disabled="updating"
          >
            {{ updating ? t('common.saving') : t('common.save') }}
          </button>
          <button
            type="button"
            @click="cancelEdit"
            class="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>

      <!-- Profile Display -->
      <div v-else class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            <template v-if="profile?.avatarUrl">
              <img
                :src="profile.avatarUrl"
                alt="Profile avatar"
                class="w-full h-full object-cover"
              />
            </template>
            <DefaultAvatar v-else />
          </div>
          <div>
            <h2 class="text-xl font-semibold">
              {{ profile?.displayName || user?.email?.split('@')[0] }}
            </h2>
            <p class="text-gray-600">{{ profile?.bio || t('profile.noBio') }}</p>
          </div>
        </div>

        <!-- User's Stats -->
        <div class="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
          <div class="text-center">
            <p class="text-2xl font-bold">{{ userStats.recipeCount }}</p>
            <p class="text-gray-600">{{ t('profile.recipes') }}</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold">{{ userStats.totalLikes }}</p>
            <p class="text-gray-600">{{ t('profile.totalLikes') }}</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold">{{ userStats.avgRating.toFixed(1) }}</p>
            <p class="text-gray-600">{{ t('profile.avgRating') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc 
} from 'firebase/firestore'
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'

interface Profile {
  displayName?: string
  bio?: string
  avatarUrl?: string
}

interface UserStats {
  recipeCount: number
  totalLikes: number
  avgRating: number
}

const { user } = useAuth()
const { showNotification } = useNotification()
const { t } = useTranslations()
const { $firestore } = useNuxtApp()

const profile = ref<Profile | null>(null)
const isEditing = ref(false)
const updating = ref(false)
const userStats = ref<UserStats>({
  recipeCount: 0,
  totalLikes: 0,
  avgRating: 0
})

const editForm = ref<Profile>({
  displayName: '',
  bio: '',
  avatarUrl: ''
})

const fetchProfile = async () => {
  if (!user.value || !$firestore) return

  try {
    const docRef = doc($firestore, 'users', user.value.uid)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      profile.value = docSnap.data() as Profile
      // Initialize edit form
      editForm.value = { ...profile.value }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    showNotification(t('profile.fetchError'), 'error')
  }
}

const fetchUserStats = async () => {
  if (!user.value || !$firestore) return

  try {
    const recipesQuery = query(
      collection($firestore, 'recipes'),
      where('userId', '==', user.value.uid)
    )
    const snapshot = await getDocs(recipesQuery)
    
    let totalLikes = 0
    let totalRating = 0
    let ratedRecipes = 0

    snapshot.forEach(doc => {
      const data = doc.data()
      totalLikes += data.likesCount || 0
      if (data.avgRating) {
        totalRating += data.avgRating
        ratedRecipes++
      }
    })

    userStats.value = {
      recipeCount: snapshot.size,
      totalLikes,
      avgRating: ratedRecipes ? totalRating / ratedRecipes : 0
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
}

const handleImageChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    const storage = getStorage()
    const imageRef = ref(storage, `avatars/${user.value?.uid}/profile.jpg`)
    
    // Show upload progress
    await uploadBytes(imageRef, file)
    
    // Get download URL
    const downloadUrl = await getDownloadURL(imageRef)
    editForm.value.avatarUrl = downloadUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    showNotification(t('profile.imageUploadError'), 'error')
  }
}

const startEditing = () => {
  editForm.value = { ...profile.value }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editForm.value = { ...profile.value }
}

const handleUpdate = async () => {
  if (!user.value || !$firestore) return
  
  updating.value = true
  try {
    const docRef = doc($firestore, 'users', user.value.uid)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      // Create new document if it doesn't exist
      await setDoc(docRef, editForm.value)
    } else {
      // Update existing document
      await updateDoc(docRef, editForm.value)
    }
    
    profile.value = { ...editForm.value }
    isEditing.value = false
    showNotification(t('profile.updateSuccess'), 'success')
  } catch (error) {
    console.error('Error updating profile:', error)
    showNotification(t('profile.updateError'), 'error')
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  fetchProfile()
  fetchUserStats()
})

definePageMeta({
  middleware: ['auth']
})
</script> 