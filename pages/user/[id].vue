<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <!-- Profile Header -->
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
          <h1 class="text-2xl font-bold">
            {{ profile?.displayName || userEmail?.split('@')[0] }}
          </h1>
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

      <!-- User's Recipes -->
      <div class="space-y-4 border-t border-gray-200 pt-6">
        <h2 class="text-xl font-semibold">{{ t('profile.recipes') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="recipe in userRecipes" 
            :key="recipe.id"
            class="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <img
              :src="recipe.imageUrl"
              :alt="recipe.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-medium mb-2">{{ recipe.title }}</h3>
              <div class="flex items-center gap-2 mb-3">
                <div class="text-yellow-400">
                  {{ '★'.repeat(Math.round(recipe.avgRating || 0)) }}
                  <span class="text-gray-300">{{ '★'.repeat(5 - Math.round(recipe.avgRating || 0)) }}</span>
                </div>
                <span class="text-sm text-gray-500">
                  ({{ recipe.ratingCount || 0 }})
                </span>
              </div>
              <NuxtLink
                :to="`/recipe/${recipe.id}`"
                class="text-blue-500 hover:text-blue-700 font-medium"
              >
                {{ t('common.viewMore') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import type { Recipe } from '~/composables/useRecipes'

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

const route = useRoute()
const { t } = useTranslations()
const { $firestore } = useNuxtApp()

const profile = ref<Profile | null>(null)
const userEmail = ref<string | null>(null)
const userRecipes = ref<Recipe[]>([])
const userStats = ref<UserStats>({
  recipeCount: 0,
  totalLikes: 0,
  avgRating: 0
})

const fetchUserProfile = async () => {
  if (!$firestore || !route.params.id) return

  try {
    // Get user profile
    const docRef = doc($firestore, 'users', route.params.id as string)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      profile.value = docSnap.data() as Profile
    }

    // Get user email
    const userDoc = await getDoc(doc($firestore, 'users', route.params.id as string))
    if (userDoc.exists()) {
      userEmail.value = userDoc.data().email
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchUserRecipes = async () => {
  if (!$firestore || !route.params.id) return

  try {
    const recipesQuery = query(
      collection($firestore, 'recipes'),
      where('userId', '==', route.params.id)
    )
    const snapshot = await getDocs(recipesQuery)
    
    let totalLikes = 0
    let totalRating = 0
    let ratedRecipes = 0

    userRecipes.value = snapshot.docs.map(doc => {
      const data = doc.data()
      totalLikes += data.likesCount || 0
      if (data.avgRating) {
        totalRating += data.avgRating
        ratedRecipes++
      }
      return {
        id: doc.id,
        ...data
      }
    }) as Recipe[]

    userStats.value = {
      recipeCount: snapshot.size,
      totalLikes,
      avgRating: ratedRecipes ? totalRating / ratedRecipes : 0
    }
  } catch (error) {
    console.error('Error fetching user recipes:', error)
  }
}

onMounted(() => {
  fetchUserProfile()
  fetchUserRecipes()
})
</script> 