<template>
  <div>
    <div v-if="images.length > 0" class="mb-6">
      <div class="relative">
        <!-- Main Image -->
        <img 
          :src="images[currentIndex]" 
          :alt="title"
          class="w-full h-96 object-cover rounded-lg"
        />
        
        <!-- Navigation Arrows -->
        <button 
          v-if="images.length > 1"
          @click="prevImage" 
          class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          ←
        </button>
        <button 
          v-if="images.length > 1"
          @click="nextImage" 
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          →
        </button>
      </div>
      
      <!-- Thumbnails -->
      <div v-if="images.length > 1" class="flex gap-2 mt-4 overflow-x-auto">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="currentIndex = index"
          class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
          :class="{ 'ring-2 ring-blue-500': currentIndex === index }"
        >
          <img :src="image" :alt="title" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  images: string[]
  title: string
}>()

const currentIndex = ref(0)

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevImage = () => {
  currentIndex.value = currentIndex.value === 0 
    ? props.images.length - 1 
    : currentIndex.value - 1
}
</script> 