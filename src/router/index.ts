// index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/gpt',
      name: 'gpt',
      component: () => import('../views/gpt/GptView.vue'),
    },
    {
      path: '/svg',
      name: 'svg',
      component: () => import('../views/SvgView.vue'),
    },
    {
      path: '/random',
      name: 'random',
      component: () => import('../views/RandomView.vue'),
    },
  ],
})

export default router
