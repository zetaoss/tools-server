<!-- App.vue -->
<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  mdiHome,
  mdiDice6,
  mdiImageOutline,
  mdiCreation,
  mdiGithub,
} from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import ThemeSelector from '@/components/ThemeSelector.vue'

const version = __APP_VERSION__

const route = useRoute()

const navItems = [
  { to: '/', label: 'Home', icon: mdiHome },
  { to: '/gpt', label: 'GPT', icon: mdiCreation },
  { to: '/random', label: 'Random', icon: mdiDice6 },
  { to: '/svg', label: 'SVG', icon: mdiImageOutline },
]
</script>

<template>
  <div id="app">
    <header class="fixed top-0 left-0 right-0 bg-gray-200 dark:bg-gray-800 z-50">
      <nav class="max-w-4xl mx-auto flex flex-wrap justify-between items-center">
        <!-- Left Navigation -->
        <div class="flex h-14">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="flex items-center gap-1 px-5" :class="route.path === item.to
            ? 'bg-white dark:bg-gray-900'
            : 'hover:bg-gray-300 hover:dark:bg-gray-700'">
            <BaseIcon class="w-5 h-5" :path="item.icon" />
            {{ item.label }}
          </RouterLink>
        </div>

        <!-- Right Side -->
        <div class="flex items-center h-14">
          <!-- ThemeSelector component -->
          <div class="px-3">
            <ThemeSelector />
          </div>

          <!-- GitHub -->
          <div class="flex items-center gap-2 pr-3 text-xs">
            <a href="https://github.com/zetaoss/tools-server" target="_blank">
              <BaseIcon class="w-6 h-6" :path="mdiGithub" />
            </a>
            <span>v{{ version }}</span>
          </div>
        </div>
      </nav>
    </header>

    <main class="pt-24">
      <RouterView />
    </main>
  </div>
</template>
