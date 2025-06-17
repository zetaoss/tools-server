<!-- HomeView.vue -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiCreation, mdiDice6, mdiImageOutline } from '@mdi/js'
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12 text-center">
    <h1 class="text-3xl font-bold mb-6">Welcome to tools server</h1>
    <p class="text-lg leading-relaxed mb-10">
      A collection of simple tools.
    </p>

    <table class="w-full text-left text-lg">
      <tbody>
        <tr class="border-t">
          <td colspan="2" class="py-4">
            <RouterLink to="/gpt"
              class="group flex items-start gap-4 no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-2 transition">
              <BaseIcon :path="mdiCreation" class="w-6 h-6 mt-1 opacity-80 group-hover:opacity-100" />
              <div>
                <div class="font-medium">GPT</div>
                <div class="text-gray-600 dark:text-gray-400 text-sm">
                  Interact with AI to generate text, ideas, and more.
                </div>
              </div>
            </RouterLink>
          </td>
        </tr>

        <tr class="border-t">
          <td colspan="2" class="py-4">
            <RouterLink to="/random"
              class="group flex items-start gap-4 no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-2 transition">
              <BaseIcon :path="mdiDice6" class="w-6 h-6 mt-1 opacity-80 group-hover:opacity-100" />
              <div>
                <div class="font-medium">Random</div>
                <div class="text-gray-600 dark:text-gray-400 text-sm">
                  Create random strings, numbers, choices, and patterns.
                </div>
              </div>
            </RouterLink>
          </td>
        </tr>

        <tr class="border-t border-b">
          <td colspan="2" class="py-4">
            <RouterLink to="/svg"
              class="group flex items-start gap-4 no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-2 transition">
              <BaseIcon :path="mdiImageOutline" class="w-6 h-6 mt-1 opacity-80 group-hover:opacity-100" />
              <div>
                <div class="font-medium">SVG</div>
                <div class="text-gray-600 dark:text-gray-400 text-sm">
                  Edit, preview, and optimize SVG graphics with ease.
                </div>
              </div>
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
