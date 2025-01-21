<template>
  <div v-if="videoId" class="aspect-w-16 aspect-h-9 mb-6">
    <iframe
      :src="`https://www.youtube.com/embed/${videoId}`"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      class="rounded-lg"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  videoUrl: string
}>()

const videoId = computed(() => {
  if (!props.videoUrl) return null
  
  const url = new URL(props.videoUrl)
  if (url.hostname.includes('youtube.com')) {
    return url.searchParams.get('v')
  } else if (url.hostname === 'youtu.be') {
    return url.pathname.slice(1)
  }
  return null
})
</script> 