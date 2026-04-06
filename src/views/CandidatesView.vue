<script setup lang="ts">
import { computed, ref } from 'vue'

import AppModal from '@/components/AppModal.vue'
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABELS,
} from '@/constants/candidateStatus'
import { useCandidatesStore } from '@/stores/candidates'
import { useJobsStore } from '@/stores/jobs'
import type { Candidate, CandidateStatus } from '@/types/domain'

const jobsStore = useJobsStore()
const candidatesStore = useCandidatesStore()

const filterJobId = ref<string>('')
const filterStatus = ref<CandidateStatus | ''>('')

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const formJobId = ref('')
const formName = ref('')
const formEmail = ref('')
const formStatus = ref<CandidateStatus>('applied')
const formNotes = ref('')

const sortedJobs = computed(() => jobsStore.sortedByUpdated)

const filteredCandidates = computed(() => {
  let list = candidatesStore.sortedByUpdated
  if (filterJobId.value)
    list = list.filter((c) => c.jobId === filterJobId.value)
  if (filterStatus.value)
    list = list.filter((c) => c.status === filterStatus.value)
  return list
})

function jobTitle(jobId: string) {
  return jobsStore.getById(jobId)?.title ?? '(unknown job)'
}

function statusClass(status: CandidateStatus): string {
  const map: Record<CandidateStatus, string> = {
    applied: 'bg-slate-100 text-slate-800',
    screening: 'bg-blue-100 text-blue-800',
    phone: 'bg-violet-100 text-violet-800',
    onsite: 'bg-indigo-100 text-indigo-800',
    offer: 'bg-amber-100 text-amber-900',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-slate-200 text-slate-700',
  }
  return map[status]
}

function openCreate() {
  editingId.value = null
  formJobId.value = sortedJobs.value[0]?.id ?? ''
  formName.value = ''
  formEmail.value = ''
  formStatus.value = 'applied'
  formNotes.value = ''
  modalOpen.value = true
}

function openEdit(c: Candidate) {
  editingId.value = c.id
  formJobId.value = c.jobId
  formName.value = c.name
  formEmail.value = c.email ?? ''
  formStatus.value = c.status
  formNotes.value = c.notes ?? ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function save() {
  const name = formName.value.trim()
  const jobId = formJobId.value
  if (!name || !jobId) return
  if (editingId.value) {
    candidatesStore.update(editingId.value, {
      jobId,
      name,
      email: formEmail.value,
      status: formStatus.value,
      notes: formNotes.value,
    })
  } else {
    candidatesStore.add({
      jobId,
      name,
      email: formEmail.value || undefined,
      status: formStatus.value,
      notes: formNotes.value || undefined,
    })
  }
  closeModal()
}

function remove(c: Candidate) {
  if (confirm(`Remove candidate “${c.name}”?`)) candidatesStore.remove(c.id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">
          Candidates
        </h2>
        <p class="text-sm text-slate-600">
          Pipeline per person, linked to a job and status.
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="sortedJobs.length === 0"
        @click="openCreate"
      >
        Add candidate
      </button>
    </div>

    <div
      v-if="sortedJobs.length === 0"
      class="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600"
    >
      Add at least one job before you can add candidates.
    </div>

    <template v-else>
      <div class="flex flex-wrap gap-3">
        <div>
          <label
            for="filter-job"
            class="mb-1 block text-xs font-medium text-slate-600"
          >Job</label>
          <select
            id="filter-job"
            v-model="filterJobId"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          >
            <option value="">
              All jobs
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
            for="filter-status"
            class="mb-1 block text-xs font-medium text-slate-600"
          >Status</label>
          <select
            id="filter-status"
            v-model="filterStatus"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          >
            <option value="">
              All statuses
            </option>
            <option
              v-for="s in CANDIDATE_STATUSES"
              :key="s"
              :value="s"
            >
              {{ CANDIDATE_STATUS_LABELS[s] }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="filteredCandidates.length === 0"
        class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600"
      >
        No candidates match these filters.
      </div>

      <div
        v-else
        class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th
                scope="col"
                class="px-4 py-3"
              >
                Name
              </th>
              <th
                scope="col"
                class="px-4 py-3"
              >
                Job
              </th>
              <th
                scope="col"
                class="px-4 py-3"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-4 py-3"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-4 py-3"
              >
                Notes
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-right"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="c in filteredCandidates"
              :key="c.id"
              class="hover:bg-slate-50/80"
            >
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ c.name }}
              </td>
              <td class="px-4 py-3 text-slate-700">
                {{ jobTitle(c.jobId) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="statusClass(c.status)"
                >{{ CANDIDATE_STATUS_LABELS[c.status] }}</span>
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ c.email || '—' }}
              </td>
              <td class="max-w-xs truncate px-4 py-3 text-slate-600">
                {{ c.notes || '—' }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  class="mr-2 text-indigo-600 hover:underline"
                  @click="openEdit(c)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-red-600 hover:underline"
                  @click="remove(c)"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <AppModal
      :open="modalOpen"
      :title="editingId ? 'Edit candidate' : 'Add candidate'"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label
            for="cand-job"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Job <span class="text-red-600">*</span></label>
          <select
            id="cand-job"
            v-model="formJobId"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            required
          >
            <option
              disabled
              value=""
            >
              Select a job
            </option>
            <option
              v-for="j in sortedJobs"
              :key="j.id"
              :value="j.id"
            >
              {{ j.title }}{{ j.company ? ` — ${j.company}` : '' }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="cand-name"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Name <span class="text-red-600">*</span></label>
          <input
            id="cand-name"
            v-model="formName"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            required
          >
        </div>
        <div>
          <label
            for="cand-email"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Email</label>
          <input
            id="cand-email"
            v-model="formEmail"
            type="email"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            autocomplete="email"
          >
        </div>
        <div>
          <label
            for="cand-status"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Status</label>
          <select
            id="cand-status"
            v-model="formStatus"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          >
            <option
              v-for="s in CANDIDATE_STATUSES"
              :key="s"
              :value="s"
            >
              {{ CANDIDATE_STATUS_LABELS[s] }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="cand-notes"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Notes</label>
          <textarea
            id="cand-notes"
            v-model="formNotes"
            rows="4"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
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
          :disabled="!formName.trim() || !formJobId"
          @click="save"
        >
          Save
        </button>
      </template>
    </AppModal>
  </div>
</template>
