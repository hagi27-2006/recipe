<template>
  <div class="mb-8 bg-white p-6 rounded-xl shadow-sm">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('search.searchLabel') }}
        </label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('search.placeholder')"
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            @input="handleSearch"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
      
      <!-- Cuisine Filter -->
      <div class="w-full md:w-48">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('search.filterByCuisine') }}
        </label>
        <select
          v-model="selectedCuisine"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          @change="handleSearch"
        >
          <option value="">{{ t('search.allCuisines') }}</option>
          <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">
            {{ t(`search.cuisines.${cuisine}`) }}
          </option>
        </select>
      </div>

      <!-- Sort Options -->
      <div class="w-full md:w-48">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('search.sortBy.label') }}
        </label>
        <select
          v-model="sortBy"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          @change="handleSearch"
        >
          <option value="newest">{{ t('search.sortBy.newest') }}</option>
          <option value="oldest">{{ t('search.sortBy.oldest') }}</option>
          <option value="title">{{ t('search.sortBy.titleAsc') }}</option>
          <option value="title-desc">{{ t('search.sortBy.titleDesc') }}</option>
        </select>
      </div>
    </div>

    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <div 
        v-if="searchQuery"
        class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
      >
        {{ t('search.searchingFor') }}: {{ searchQuery }}
        <button
          @click="clearSearch"
          class="ml-2 text-blue-600 hover:text-blue-800"
        >
          <span class="sr-only">{{ t('search.clear') }}</span>
          ×
        </button>
      </div>
      
      <div 
        v-if="selectedCuisine"
        class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
      >
        {{ t('search.cuisines.' + selectedCuisine) }}
        <button
          @click="clearCuisine"
          class="ml-2 text-blue-600 hover:text-blue-800"
        >
          <span class="sr-only">{{ t('search.clear') }}</span>
          ×
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {{ t('search.clearAll') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from '~/utils/debounce'
import { useTranslations } from '~/utils/translations'

const { t } = useTranslations()

const searchQuery = ref('')
const selectedCuisine = ref('')
const sortBy = ref('newest')

const cuisines = [
  'italian',
  'mexican',
  'indian',
  'chinese',
  'japanese',
  'thai',
  'mediterranean'
]

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCuisine.value || sortBy.value !== 'newest'
})

const emit = defineEmits<{
  (e: 'search', params: { query: string; cuisine: string; sort: string }): void
}>()

const emitSearch = () => {
  const trimmedQuery = searchQuery.value.trim()
  
  emit('search', {
    query: trimmedQuery,
    cuisine: selectedCuisine.value,
    sort: sortBy.value
  })
}

const handleSearch = debounce(emitSearch, 500)

const clearSearch = () => {
  searchQuery.value = ''
  emitSearch()
}

const clearCuisine = () => {
  selectedCuisine.value = ''
  emitSearch()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCuisine.value = ''
  sortBy.value = 'newest'
  emitSearch()
}

defineExpose({
  clearFilters: clearAllFilters
})
</script> 