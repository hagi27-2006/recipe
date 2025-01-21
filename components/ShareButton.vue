<template>
  <div class="relative share-dropdown">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      {{ t('common.share') }}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>
    
    <!-- Share Options Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
    >
      <div class="py-1">
        <button
          @click="copyLink"
          class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {{ t('recipe.copyLink') }}
        </button>
        <a
          :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`"
          target="_blank"
          class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        >
          Facebook
        </a>
        <a
          :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`"
          target="_blank"
          class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        >
          Twitter
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  title: string
}>()

const showDropdown = ref(false)
const { t } = useTranslations()
const { showNotification } = useNotification()

const pageUrl = window.location.href

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(pageUrl)
    showNotification(t('recipe.linkCopied'), 'success')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
  showDropdown.value = false
}

const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.share-dropdown')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script> 