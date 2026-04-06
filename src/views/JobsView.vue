<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AppModal from '@/components/AppModal.vue'
import { useCandidatesStore } from '@/stores/candidates'
import { useJobsStore } from '@/stores/jobs'
import type { Job } from '@/types/domain'

const jobsStore = useJobsStore()
const candidatesStore = useCandidatesStore()

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const formTitle = ref('')
const formCompany = ref('')
const formDescription = ref('')
const deleteError = ref('')

const sortedJobs = computed(() => jobsStore.sortedByUpdated)

function openCreate() {
  editingId.value = null
  formTitle.value = ''
  formCompany.value = ''
  formDescription.value = ''
  deleteError.value = ''
  modalOpen.value = true
}

function openEdit(job: Job) {
  editingId.value = job.id
  formTitle.value = job.title
  formCompany.value = job.company ?? ''
  formDescription.value = job.description
  deleteError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function save() {
  const title = formTitle.value.trim()
  if (!title) return
  if (editingId.value) {
    jobsStore.update(editingId.value, {
      title,
      company: formCompany.value,
      description: formDescription.value,
    })
  } else {
    jobsStore.add({
      title,
      company: formCompany.value || undefined,
      description: formDescription.value,
    })
  }
  closeModal()
}

function candidateCount(jobId: string) {
  return candidatesStore.countForJob(jobId)
}

function tryDelete(job: Job) {
  deleteError.value = ''
  const n = candidateCount(job.id)
  if (n > 0) {
    deleteError.value = `Cannot delete: ${n} candidate(s) are linked to this job. Reassign or remove them first.`
    return
  }
  if (confirm(`Delete job “${job.title}”?`)) jobsStore.remove(job.id)
}

watch(modalOpen, (open) => {
  if (!open) deleteError.value = ''
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">
          Job descriptions
        </h2>
        <p class="text-sm text-slate-600">
          Roles you are hiring for. Candidates must be linked to a job.
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        @click="openCreate"
      >
        Add job
      </button>
    </div>

    <p
      v-if="deleteError"
      class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
      role="alert"
    >
      {{ deleteError }}
    </p>

    <div
      v-if="sortedJobs.length === 0"
      class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600"
    >
      No jobs yet. Add one to start tracking candidates and questions per role.
    </div>

    <ul
      v-else
      class="space-y-3"
      role="list"
    >
      <li
        v-for="job in sortedJobs"
        :key="job.id"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1 space-y-1">
            <h3 class="font-semibold text-slate-900">
              {{ job.title }}
            </h3>
            <p
              v-if="job.company"
              class="text-sm text-slate-500"
            >
              {{ job.company }}
            </p>
            <p class="whitespace-pre-wrap text-sm text-slate-700 line-clamp-3">
              {{ job.description || '—' }}
            </p>
            <p class="text-xs text-slate-500">
              {{ candidateCount(job.id) }} candidate(s)
            </p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="openEdit(job)"
            >
              Edit
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              @click="tryDelete(job)"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>

    <AppModal
      :open="modalOpen"
      :title="editingId ? 'Edit job' : 'Add job'"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label
            for="job-title"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Title <span class="text-red-600">*</span></label>
          <input
            id="job-title"
            v-model="formTitle"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            autocomplete="organization-title"
            required
          >
        </div>
        <div>
          <label
            for="job-company"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Company</label>
          <input
            id="job-company"
            v-model="formCompany"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            autocomplete="organization"
          >
        </div>
        <div>
          <label
            for="job-desc"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Description</label>
          <textarea
            id="job-desc"
            v-model="formDescription"
            rows="8"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            placeholder="Paste or write the job description…"
          />
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
          :disabled="!formTitle.trim()"
          @click="save"
        >
          Save
        </button>
      </template>
    </AppModal>
  </div>
</template>
