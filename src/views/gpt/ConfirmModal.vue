<!-- ConfirmModal.vue -->
<script setup lang="ts">
defineProps<{
  show: boolean
  onCancel: () => void
  onConfirm: () => void
}>()
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
      <h2 class="text-lg font-semibold mb-2 dark:text-white">⚠️ 저장 확인</h2>
      <p class="text-sm dark:text-gray-300">
        로컬스토리지에 히스토리를 저장합니다.<br />
      </p>
      <div class="flex justify-end mt-4 gap-2">
        <button class="px-3 py-1 text-sm border rounded dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="onCancel">
          취소
        </button>
        <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" @click="onConfirm">
          확인
        </button>
      </div>
    </div>
  </div>
</template>
