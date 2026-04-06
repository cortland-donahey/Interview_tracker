import { createApp, watch } from 'vue'

import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/main.css'
import { loadV1, saveV1 } from './lib/persistence'
import router from './router'
import { useCandidatesStore } from './stores/candidates'
import { useJobsStore } from './stores/jobs'
import { useQuestionsStore } from './stores/questions'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

const jobsStore = useJobsStore()
const candidatesStore = useCandidatesStore()
const questionsStore = useQuestionsStore()

const loaded = loadV1()
if (loaded) {
  jobsStore.$patch({ jobs: loaded.jobs })
  candidatesStore.$patch({ candidates: loaded.candidates })
  questionsStore.$patch({ questions: loaded.questions })
}

watch(
  () => ({
    jobs: jobsStore.jobs,
    candidates: candidatesStore.candidates,
    questions: questionsStore.questions,
  }),
  (state) => {
    saveV1({
      version: 1,
      jobs: state.jobs,
      candidates: state.candidates,
      questions: state.questions,
    })
  },
  { deep: true },
)

app.mount('#app')
