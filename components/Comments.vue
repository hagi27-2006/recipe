<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">{{ t('recipe.comments') }}</h2>
      <select 
        v-model="sortBy" 
        class="px-3 py-1 border border-gray-300 rounded-md"
        @change="sortComments"
      >
        <option value="newest">{{ t('recipe.sortComments.newest') }}</option>
        <option value="oldest">{{ t('recipe.sortComments.oldest') }}</option>
        <option value="rating-high">{{ t('recipe.sortComments.highestRated') }}</option>
        <option value="rating-low">{{ t('recipe.sortComments.lowestRated') }}</option>
      </select>
    </div>
    
    <!-- Add Comment Form -->
    <form v-if="user" @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.rating') }}
        </label>
        <div class="flex gap-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="rating = star"
            class="text-2xl transition-colors"
            :class="star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'"
          >
            ★
          </button>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('recipe.comment') }}
        </label>
        <textarea
          v-model="commentText"
          required
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :placeholder="t('recipe.commentPlaceholder')"
        ></textarea>
      </div>
      
      <button
        type="submit"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        :disabled="submitting"
      >
        {{ submitting ? t('common.submitting') : t('common.submit') }}
      </button>
    </form>
    
    <div v-else class="bg-blue-50 p-4 rounded-md">
      <p class="text-blue-700">{{ t('auth.loginRequired') }}</p>
    </div>
    
    <!-- Comments List -->
    <div class="space-y-4">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="space-y-1">
            <p class="font-medium">{{ commentAuthors[comment.userId] }}</p>
            <div class="flex items-center gap-2">
              <div class="text-yellow-400">
                {{ '★'.repeat(comment.rating) }}
                <span class="text-gray-300">{{ '★'.repeat(5 - comment.rating) }}</span>
              </div>
              <span class="text-sm text-gray-500">
                {{ formatDate(comment.createdAt) }}
              </span>
            </div>
          </div>
        </div>
        <p class="text-gray-700 mt-2">{{ comment.text }}</p>
      </div>
      
      <div v-if="sortedComments.length === 0" class="text-center py-8">
        <p class="text-gray-500">{{ t('recipe.noComments') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import type { Comment } from '~/composables/useRecipes'

const props = defineProps<{
  recipeId: string
}>()

const { user } = useAuth()
const { addComment, getComments } = useRecipes()
const { showNotification } = useNotification()
const { t } = useTranslations()

const comments = ref<Comment[]>([])
const commentAuthors = ref<Record<string, string>>({})
const rating = ref(0)
const commentText = ref('')
const submitting = ref(false)
const sortBy = ref('newest')

const handleSubmit = async () => {
  if (!rating.value) {
    showNotification(t('recipe.ratingRequired'), 'error')
    return
  }
  
  submitting.value = true
  try {
    await addComment(props.recipeId, commentText.value, rating.value)
    await fetchComments()
    commentText.value = ''
    rating.value = 0
    showNotification(t('recipe.commentSuccess'), 'success')
  } catch (error) {
    console.error('Error submitting comment:', error)
    showNotification(t('recipe.commentError'), 'error')
  } finally {
    submitting.value = false
  }
}

const fetchComments = async () => {
  try {
    comments.value = await getComments(props.recipeId)
    // Fetch author names
    const { $firestore } = useNuxtApp()
    for (const comment of comments.value) {
      if (!commentAuthors.value[comment.userId]) {
        const userDoc = await getDoc(doc($firestore, 'users', comment.userId))
        if (userDoc.exists()) {
          commentAuthors.value[comment.userId] = userDoc.data().email?.split('@')[0] || t('recipe.unknownAuthor')
        }
      }
    }
  } catch (error) {
    console.error('Error fetching comments:', error)
  }
}

const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest':
        return a.createdAt - b.createdAt
      case 'rating-high':
        return b.rating - a.rating
      case 'rating-low':
        return a.rating - b.rating
      default: // newest
        return b.createdAt - a.createdAt
    }
  })
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortComments = () => {
  fetchComments()
}

onMounted(() => {
  fetchComments()
})
</script> 