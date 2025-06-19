<!-- CopyButton.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  text: string
}>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => copied.value = false, 3000)
  } catch (e) {
    console.error('복사 실패:', e)
  }
}
</script>

<template>
  <BaseButton size="xs" @click="copy">
    {{ copied ? '✔ Copied' : 'Copy' }}
  </BaseButton>
</template>
