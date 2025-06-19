<!-- ModelDropdown.vue -->
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiChevronDown, mdiCheck } from '@mdi/js'

defineProps<{
  model: string
  options: { value: string; label: string; description: string }[]
  onSelect: (value: string) => void
}>()

const isOpen = ref(false)
const openUp = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => (isOpen.value = false))

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      if (!triggerRef.value || !menuRef.value) return
      const { top, bottom } = triggerRef.value.getBoundingClientRect()
      const spaceBelow = window.innerHeight - bottom
      const spaceAbove = top
      const menuHeight = menuRef.value.offsetHeight
      openUp.value = spaceBelow < menuHeight && spaceAbove > spaceBelow
    })
  }
}
</script>

<template>
  <div class="relative w-full max-w-xs" ref="dropdownRef">
    <!-- 트리거 버튼 -->
    <button ref="triggerRef" @click="toggle"
      class="w-full border rounded px-2 py-1 text-left dark:bg-gray-800 dark:border-gray-600 dark:text-white flex justify-between items-center">
      <div>
        {{options.find(o => o.value === model)?.label || 'Select model'}}
      </div>
      <BaseIcon :path="mdiChevronDown" class="w-4 h-4 ml-2" />
    </button>

    <!-- 드롭다운 목록 -->
    <div v-if="isOpen" ref="menuRef" :class="[
      'absolute z-10 w-72 bg-white dark:bg-gray-800 border rounded shadow-lg overflow-y-auto max-h-[calc(100vh-4rem)]',
      openUp ? 'bottom-full mb-1' : 'top-full mt-1'
    ]">
      <div v-for="option in options" :key="option.value" @click="onSelect(option.value); isOpen = false"
        class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center">
        <div>
          <div class="font-medium text-xs">{{ option.label }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ option.description }}</div>
        </div>
        <BaseIcon v-if="option.value === model" :path="mdiCheck" class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>
