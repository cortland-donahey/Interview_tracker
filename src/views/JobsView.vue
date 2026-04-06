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
const formReqId = ref('')
const formPostedDate = ref('')
const formDescriptionFileName = ref('')
const formDescriptionFileData = ref('')
const deleteError = ref('')

const sortedJobs = computed(() => jobsStore.sortedByUpdated)

function openCreate() {
  editingId.value = null
  formTitle.value = ''
  formReqId.value = ''
  formPostedDate.value = ''
  formDescriptionFileName.value = ''
  formDescriptionFileData.value = ''
  deleteError.value = ''
  modalOpen.value = true
}

function openEdit(job: Job) {
  editingId.value = job.id
  formTitle.value = job.title
  formReqId.value = job.reqId
  formPostedDate.value = job.postedDate ?? ''
  formDescriptionFileName.value = job.descriptionFileName ?? ''
  formDescriptionFileData.value = job.descriptionFileData ?? ''
  deleteError.value = ''
  modalOpen.value = true
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  formDescriptionFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    formDescriptionFileData.value = (e.target?.result as string) ?? ''
  }
  reader.readAsDataURL(file)
}

function clearFile() {
  formDescriptionFileName.value = ''
  formDescriptionFileData.value = ''
  const input = document.getElementById('job-desc-file') as HTMLInputElement | null
  if (input) input.value = ''
}

function closeModal() {
  modalOpen.value = false
}

function save() {
  const title = formTitle.value.trim()
  const reqId = formReqId.value.trim()
  if (!title || !reqId) return
  if (editingId.value) {
    jobsStore.update(editingId.value, {
      title,
      reqId,
      postedDate: formPostedDate.value || undefined,
      descriptionFileName: formDescriptionFileName.value || undefined,
      descriptionFileData: formDescriptionFileData.value || undefined,
    })
  } else {
    jobsStore.add({
      title,
      reqId,
      postedDate: formPostedDate.value || undefined,
      descriptionFileName: formDescriptionFileName.value || undefined,
      descriptionFileData: formDescriptionFileData.value || undefined,
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
            <p class="text-sm text-slate-500">
              Req ID: {{ job.reqId }}
            </p>
            <p
              v-if="job.postedDate"
              class="text-sm text-slate-500"
            >
              Posted: {{ job.postedDate }}
            </p>
            <p
              v-if="job.descriptionFileName"
              class="text-sm text-slate-700"
            >
              {{ job.descriptionFileName }}
            </p>
            <p
              v-else
              class="text-sm text-slate-400"
            >
              No description uploaded
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
            autocomplete="off"
            required
          >
        </div>
        <div>
          <label
            for="job-req-id"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Req ID <span class="text-red-600">*</span></label>
          <input
            id="job-req-id"
            v-model="formReqId"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            autocomplete="off"
            required
          >
        </div>
        <div>
          <label
            for="job-posted-date"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Posted Date</label>
          <input
            id="job-posted-date"
            v-model="formPostedDate"
            type="date"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          >
        </div>
        <div>
          <label
            for="job-desc-file"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Job Description</label>
          <input
            id="job-desc-file"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            @change="onFileChange"
          >
          <div
            v-if="formDescriptionFileName"
            class="mt-2 flex items-center gap-2 text-sm text-slate-600"
          >
            <span class="truncate">{{ formDescriptionFileName }}</span>
            <button
              type="button"
              class="shrink-0 text-xs text-red-600 hover:underline"
              @click="clearFile"
            >
              Remove
            </button>
          </div>
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
          :disabled="!formTitle.trim() || !formReqId.trim()"
          @click="save"
        >
          Save
        </button>
      </template>
    </AppModal>
  </div>
</template>
