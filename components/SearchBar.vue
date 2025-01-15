<template>
  <div class="mb-8">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search.placeholder')"
          class="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="handleSearch"
        />
      </div>
      
      <div class="w-full md:w-48">
        <select
          v-model="selectedCuisine"
          class="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @change="handleSearch"
        >
          <option value="">{{ t('search.allCuisines') }}</option>
          <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">
            {{ t(`search.cuisines.${cuisine}`) }}
          </option>
        </select>
      </div>

      <div class="w-full md:w-48">
        <select
          v-model="sortBy"
          class="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @change="handleSearch"
        >
          <option value="newest">{{ t('search.sortBy.newest') }}</option>
          <option value="oldest">{{ t('search.sortBy.oldest') }}</option>
          <option value="title">{{ t('search.sortBy.titleAsc') }}</option>
          <option value="title-desc">{{ t('search.sortBy.titleDesc') }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const emit = defineEmits<{
  (e: 'search', params: { query: string; cuisine: string; sort: string }): void
}>()

const emitSearch = () => {
  emit('search', {
    query: searchQuery.value,
    cuisine: selectedCuisine.value,
    sort: sortBy.value
  })
}

const handleSearch = debounce(emitSearch, 300)

const clearFilters = () => {
  searchQuery.value = ''
  selectedCuisine.value = ''
  sortBy.value = 'newest'
  emitSearch()
}

defineExpose({
  clearFilters
})
</script> 