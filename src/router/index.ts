import { createRouter, createWebHistory } from 'vue-router'

import CandidatesView from '@/views/CandidatesView.vue'
import ConfigurationView from '@/views/ConfigurationView.vue'
import JobsView from '@/views/JobsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/jobs' },
    { path: '/jobs', name: 'jobs', component: JobsView },
    { path: '/candidates', name: 'candidates', component: CandidatesView },
    { path: '/configuration', name: 'configuration', component: ConfigurationView },
  ],
})

export default router
