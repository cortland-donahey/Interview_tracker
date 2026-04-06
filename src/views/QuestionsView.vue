<script setup lang="ts">
import { computed, ref } from 'vue'

import AppModal from '@/components/AppModal.vue'
import { useJobsStore } from '@/stores/jobs'
import { useQuestionsStore } from '@/stores/questions'
import type { InterviewQuestion } from '@/types/domain'

const jobsStore = useJobsStore()
const questionsStore = useQuestionsStore()

const filterJobId = ref<string>('')
const filterTag = ref<string>('')

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const formJobId = ref<string>('')
const formPrompt = ref('')
const formTagsRaw = ref('')

const sortedJobs = computed(() => jobsStore.sortedByUpdated)
const allTags = computed(() => questionsStore.allTags)

const filteredQuestions = computed(() => {
  let list = questionsStore.sortedByUpdated
  if (filterJobId.value === '__global__')
    list = list.filter((q) => !q.jobId)
  else if (filterJobId.value)
    list = list.filter((q) => q.jobId === filterJobId.value)
  if (filterTag.value)
    list = list.filter((q) =>
      (q.tags ?? []).some(
        (t) => t.toLowerCase() === filterTag.value.toLowerCase(),
      ),
    )
  return list
})

function jobLabel(jobId: string | undefined) {
  if (!jobId) return 'All roles'
  return jobsStore.getById(jobId)?.title ?? '(unknown job)'
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function openCreate() {
  editingId.value = null
  formJobId.value = ''
  formPrompt.value = ''
  formTagsRaw.value = ''
  modalOpen.value = true
}

function openEdit(q: InterviewQuestion) {
  editingId.value = q.id
  formJobId.value = q.jobId ?? ''
  formPrompt.value = q.prompt
  formTagsRaw.value = (q.tags ?? []).join(', ')
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function save() {
  const prompt = formPrompt.value.trim()
  if (!prompt) return
  const tags = parseTags(formTagsRaw.value)
  const jobId = formJobId.value || undefined
  if (editingId.value) {
    questionsStore.update(editingId.value, {
      jobId,
      prompt,
      tags,
    })
  } else {
    questionsStore.add({ jobId, prompt, tags })
  }
  closeModal()
}

function remove(q: InterviewQuestion) {
  if (confirm('Delete this question?')) questionsStore.remove(q.id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">
          Interview questions
        </h2>
        <p class="text-sm text-slate-600">
          Build a bank of prompts. Leave role empty for questions that apply to every job.
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        @click="openCreate"
      >
        Add question
      </button>
    </div>

    <div class="flex flex-wrap gap-3">
      <div>
        <label
          for="q-filter-job"
          class="mb-1 block text-xs font-medium text-slate-600"
        >Scope</label>
        <select
          id="q-filter-job"
          v-model="filterJobId"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        >
          <option value="">
            All questions
          </option>
          <option value="__global__">
            Global only
          </option>
          <option
            v-for="j in sortedJobs"
            :key="j.id"
            :value="j.id"
          >
            {{ j.title }}
          </option>
        </select>
      </div>
      <div>
        <label
          for="q-filter-tag"
          class="mb-1 block text-xs font-medium text-slate-600"
        >Tag</label>
        <select
          id="q-filter-tag"
          v-model="filterTag"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        >
          <option value="">
            Any tag
          </option>
          <option
            v-for="t in allTags"
            :key="t"
            :value="t"
          >
            {{ t }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="filteredQuestions.length === 0"
      class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600"
    >
      No questions match these filters. Add a question or adjust filters.
    </div>

    <ul
      v-else
      class="space-y-3"
      role="list"
    >
      <li
        v-for="q in filteredQuestions"
        :key="q.id"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1 space-y-2">
            <p class="whitespace-pre-wrap text-sm text-slate-800">
              {{ q.prompt }}
            </p>
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span class="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {{ jobLabel(q.jobId) }}
              </span>
              <span
                v-for="t in q.tags ?? []"
                :key="t"
                class="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-800"
              >{{ t }}</span>
            </div>
          </div>
          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="openEdit(q)"
            >
              Edit
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              @click="remove(q)"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>

    <AppModal
      :open="modalOpen"
      :title="editingId ? 'Edit question' : 'Add question'"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label
            for="q-job"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Role (optional)</label>
          <select
            id="q-job"
            v-model="formJobId"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          >
            <option value="">
              Global — all roles
            </option>
            <option
              v-for="j in sortedJobs"
              :key="j.id"
              :value="j.id"
            >
              {{ j.title }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="q-prompt"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Question <span class="text-red-600">*</span></label>
          <textarea
            id="q-prompt"
            v-model="formPrompt"
            rows="6"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            required
          />
        </div>
        <div>
          <label
            for="q-tags"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Tags</label>
          <input
            id="q-tags"
            v-model="formTagsRaw"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            placeholder="e.g. system design, behavior, coding"
          >
          <p class="mt-1 text-xs text-slate-500">
            Separate tags with commas.
          </p>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          :disabled="!formPrompt.trim()"
          @click="save"
        >
          Save
        </button>
      </template>
    </AppModal>
  </div>
</template>
