<!-- HistoryModal.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { mdiTrashCan, mdiContentCopy } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import { type EntryWithTimestamp } from '@/stores/history'

const props = defineProps<{
  title: string
  entries: EntryWithTimestamp[]
  onApply: (entry: EntryWithTimestamp) => void
  onDelete: (index: number) => void
  onClose: () => void
}>()

const modalRef = ref(null)
onClickOutside(modalRef, () => props.onClose())

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div ref="modalRef" class="bg-white dark:bg-gray-800 p-4 rounded max-w-2xl w-full max-h-[80vh] overflow-auto">
      <div class="flex justify-between items-center mb-2">
        <h2 class="font-semibold text-lg dark:text-white">{{ title }}</h2>
        <button @click="props.onClose"
          class="text-sm px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
          닫기
        </button>
      </div>

      <ul class="space-y-2 text-sm">
        <li v-for="(entry, index) in props.entries" :key="index"
          class="relative bg-gray-100 dark:bg-gray-700 rounded p-2">
          <!-- 버튼 그룹 (오른쪽 상단) -->
          <div class="absolute top-2 right-2 flex space-x-1">
            <button @click.stop="copyToClipboard(entry.value)"
              class="p-1 border rounded bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500" title="복사">
              <BaseIcon class="w-4 h-4" :path="mdiContentCopy" />
            </button>
            <button @click.stop="props.onDelete(index)"
              class="p-1 border rounded bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500" title="삭제">
              <BaseIcon class="w-4 h-4" :path="mdiTrashCan" />
            </button>
          </div>

          <!-- 텍스트 내용 -->
          <div class="whitespace-pre-wrap break-all dark:text-white cursor-pointer pr-14" @click="props.onApply(entry)"
            title="클릭하여 불러오기">
            {{ entry.value }}
          </div>

          <!-- 업데이트 일시 -->
          <div class="text-xs text-gray-500 mt-1">
            {{ new Date(entry.timestamp).toLocaleString() }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
