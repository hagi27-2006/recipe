<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4">
        {{ t('recipe.deleteConfirm') }}
      </h2>
      <p class="text-gray-600 mb-6">
        {{ t('recipe.deleteWarning') }}
      </p>
      <div class="flex justify-end gap-4">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          {{ t('common.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { t } = useTranslations()
</script> 