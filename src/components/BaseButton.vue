<!-- BaseButton.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'xs' | 'md'
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const baseClass = 'rounded transition font-medium'
const sizeClass = computed(() => { return props.size === 'md' ? 'text-sm px-4 py-2' : 'text-xs px-2 py-1' })

const variantClass = computed(() => {
  const map = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  return map[props.variant ?? 'secondary']
})

let locked = false
function handleClick(e: MouseEvent) {
  if (locked || props.disabled) return
  locked = true
  requestAnimationFrame(() => (locked = false))
  emit('click', e)
}
</script>

<template>
  <button :class="[baseClass, sizeClass, variantClass, { 'cursor-not-allowed opacity-50': disabled }]"
    :disabled="disabled" @click="handleClick">
    <slot />
  </button>
</template>
