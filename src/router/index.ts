import { createRouter, createWebHistory } from 'vue-router'

import CandidatesView from '@/views/CandidatesView.vue'
import JobsView from '@/views/JobsView.vue'
import QuestionsView from '@/views/QuestionsView.vue'
import SkillsView from '@/views/SkillsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/jobs' },
    { path: '/jobs', name: 'jobs', component: JobsView },
    { path: '/candidates', name: 'candidates', component: CandidatesView },
    { path: '/questions', name: 'questions', component: QuestionsView },
    { path: '/skills', name: 'skills', component: SkillsView },
  ],
})

export default router
