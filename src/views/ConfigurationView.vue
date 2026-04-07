<script setup lang="ts">
import { computed, ref } from 'vue'

import AppModal from '@/components/AppModal.vue'
import { useCandidatesStore } from '@/stores/candidates'
import { useJobsStore } from '@/stores/jobs'
import { useQuestionsStore } from '@/stores/questions'
import { useSkillsStore } from '@/stores/skills'
import { useStatusConfigStore } from '@/stores/statusConfig'
import type { CandidateStatusConfig, InterviewQuestion, Skill } from '@/types/domain'

// ── collapse state ────────────────────────────────────────────────────────────
const questionsOpen = ref(true)
const skillsOpen = ref(true)
const statusesOpen = ref(true)

// ── questions ─────────────────────────────────────────────────────────────────
const jobsStore = useJobsStore()
const questionsStore = useQuestionsStore()

const filterJobId = ref<string>('')
const filterTag = ref<string>('')

const qModalOpen = ref(false)
const qEditingId = ref<string | null>(null)
const formJobId = ref<string>('')
const formPrompt = ref('')
const formTagsRaw = ref('')

const sortedJobs = computed(() => jobsStore.sortedByUpdated)
const allQTags = computed(() => questionsStore.allTags)

const filteredQuestions = computed(() => {
  let list = questionsStore.sortedByUpdated
  if (filterJobId.value === '__global__')
    list = list.filter((q) => !q.jobId)
  else if (filterJobId.value)
    list = list.filter((q) => q.jobId === filterJobId.value)
  if (filterTag.value)
    list = list.filter((q) =>
      (q.tags ?? []).some((t) => t.toLowerCase() === filterTag.value.toLowerCase()),
    )
  return list
})

function jobLabel(jobId: string | undefined) {
  if (!jobId) return 'All roles'
  return jobsStore.getById(jobId)?.title ?? '(unknown job)'
}

function parseQTags(raw: string): string[] {
  return raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
}

function openQCreate() {
  qEditingId.value = null
  formJobId.value = ''
  formPrompt.value = ''
  formTagsRaw.value = ''
  qModalOpen.value = true
}

function openQEdit(q: InterviewQuestion) {
  qEditingId.value = q.id
  formJobId.value = q.jobId ?? ''
  formPrompt.value = q.prompt
  formTagsRaw.value = (q.tags ?? []).join(', ')
  qModalOpen.value = true
}

function closeQModal() {
  qModalOpen.value = false
}

function saveQuestion() {
  const prompt = formPrompt.value.trim()
  if (!prompt) return
  const tags = parseQTags(formTagsRaw.value)
  const jobId = formJobId.value || undefined
  if (qEditingId.value) {
    questionsStore.update(qEditingId.value, { jobId, prompt, tags })
  } else {
    questionsStore.add({ jobId, prompt, tags })
  }
  closeQModal()
}

function removeQuestion(q: InterviewQuestion) {
  if (confirm('Delete this question?')) questionsStore.remove(q.id)
}

// ── skills ────────────────────────────────────────────────────────────────────
const skillsStore = useSkillsStore()

const filterCategory = ref<'' | Skill['category']>('')
const filterPriority = ref<'' | Skill['priority']>('')
const filterSkillTag = ref<string>('')

const skModalOpen = ref(false)
const skEditingId = ref<string | null>(null)
const formName = ref('')
const formCategory = ref<Skill['category']>('technical')
const formPriority = ref<Skill['priority']>('must-have')
const formWeight = ref(5)
const formDescription = ref('')
const formSkillTagsRaw = ref('')

const allSkillTags = computed(() => skillsStore.allTags)

const filteredSkills = computed(() => {
  let list = skillsStore.sortedByUpdated
  if (filterCategory.value) list = list.filter((s) => s.category === filterCategory.value)
  if (filterPriority.value) list = list.filter((s) => s.priority === filterPriority.value)
  if (filterSkillTag.value)
    list = list.filter((s) =>
      (s.tags ?? []).some((t) => t.toLowerCase() === filterSkillTag.value.toLowerCase()),
    )
  return list
})

function parseSkillTags(raw: string): string[] {
  return raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
}

function openSkCreate() {
  skEditingId.value = null
  formName.value = ''
  formCategory.value = 'technical'
  formPriority.value = 'must-have'
  formWeight.value = 5
  formDescription.value = ''
  formSkillTagsRaw.value = ''
  skModalOpen.value = true
}

function openSkEdit(skill: Skill) {
  skEditingId.value = skill.id
  formName.value = skill.name
  formCategory.value = skill.category
  formPriority.value = skill.priority
  formWeight.value = skill.weight
  formDescription.value = skill.description ?? ''
  formSkillTagsRaw.value = (skill.tags ?? []).join(', ')
  skModalOpen.value = true
}

function closeSkModal() {
  skModalOpen.value = false
}

function saveSkill() {
  const name = formName.value.trim()
  if (!name) return
  const payload = {
    name,
    category: formCategory.value,
    priority: formPriority.value,
    weight: formWeight.value,
    description: formDescription.value || undefined,
    tags: parseSkillTags(formSkillTagsRaw.value),
  }
  if (skEditingId.value) {
    skillsStore.update(skEditingId.value, payload)
  } else {
    skillsStore.add(payload)
  }
  closeSkModal()
}

function removeSkill(skill: Skill) {
  if (confirm(`Delete skill "${skill.name}"?`)) skillsStore.remove(skill.id)
}

const categoryLabel: Record<Skill['category'], string> = {
  technical: 'Technical',
  soft: 'Soft skill',
  other: 'Other',
}

const categoryClass: Record<Skill['category'], string> = {
  technical: 'bg-blue-50 text-blue-800',
  soft: 'bg-emerald-50 text-emerald-800',
  other: 'bg-slate-100 text-slate-700',
}

const priorityClass: Record<Skill['priority'], string> = {
  'must-have': 'bg-red-50 text-red-700',
  'nice-to-have': 'bg-amber-50 text-amber-700',
}

// ── candidate statuses ────────────────────────────────────────────────────────
const statusConfigStore = useStatusConfigStore()
const candidatesStore = useCandidatesStore()

const stModalOpen = ref(false)
const stEditingId = ref<string | null>(null)
const formStLabel = ref('')
const formStDescription = ref('')

const draggedId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

function candidateCountForStatus(id: string): number {
  return candidatesStore.candidates.filter((c) => c.status === id).length
}

function openStCreate() {
  stEditingId.value = null
  formStLabel.value = ''
  formStDescription.value = ''
  stModalOpen.value = true
}

function openStEdit(s: CandidateStatusConfig) {
  stEditingId.value = s.id
  formStLabel.value = s.label
  formStDescription.value = s.description ?? ''
  stModalOpen.value = true
}

function closeStModal() {
  stModalOpen.value = false
}

function saveStatus() {
  const label = formStLabel.value.trim()
  if (!label) return
  if (stEditingId.value) {
    statusConfigStore.update(stEditingId.value, {
      label,
      description: formStDescription.value,
    })
  } else {
    statusConfigStore.add({ label, description: formStDescription.value })
  }
  closeStModal()
}

function removeStatus(s: CandidateStatusConfig) {
  const count = candidateCountForStatus(s.id)
  const warning = count > 0 ? ` ${count} candidate${count === 1 ? '' : 's'} currently use this status.` : ''
  if (confirm(`Delete status "${s.label}"?${warning}`)) {
    statusConfigStore.remove(s.id)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-xl font-semibold text-slate-900">
        Configuration
      </h2>
      <p class="text-sm text-slate-600">
        Manage your interview questions and skills.
      </p>
    </div>

    <!-- Questions section -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        class="flex w-full items-center justify-between px-5 py-4 text-left"
        @click="questionsOpen = !questionsOpen"
      >
        <div>
          <span class="text-base font-semibold text-slate-900">Interview questions</span>
          <span class="ml-2 text-sm text-slate-500">{{ questionsStore.sortedByUpdated.length }} total</span>
        </div>
        <svg
          class="h-5 w-5 text-slate-400 transition-transform"
          :class="questionsOpen ? 'rotate-180' : ''"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div v-if="questionsOpen" class="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
                <option value="">All questions</option>
                <option value="__global__">Global only</option>
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
                <option value="">Any tag</option>
                <option
                  v-for="t in allQTags"
                  :key="t"
                  :value="t"
                >
                  {{ t }}
                </option>
              </select>
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            @click="openQCreate"
          >
            Add question
          </button>
        </div>

        <div
          v-if="filteredQuestions.length === 0"
          class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600"
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
            class="rounded-xl border border-slate-200 bg-slate-50 p-4"
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
                  @click="openQEdit(q)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  @click="removeQuestion(q)"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Skills section -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        class="flex w-full items-center justify-between px-5 py-4 text-left"
        @click="skillsOpen = !skillsOpen"
      >
        <div>
          <span class="text-base font-semibold text-slate-900">Skills</span>
          <span class="ml-2 text-sm text-slate-500">{{ skillsStore.sortedByUpdated.length }} total</span>
        </div>
        <svg
          class="h-5 w-5 text-slate-400 transition-transform"
          :class="skillsOpen ? 'rotate-180' : ''"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div v-if="skillsOpen" class="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex flex-wrap gap-3">
            <div>
              <label
                for="sk-filter-category"
                class="mb-1 block text-xs font-medium text-slate-600"
              >Category</label>
              <select
                id="sk-filter-category"
                v-model="filterCategory"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              >
                <option value="">All categories</option>
                <option value="technical">Technical</option>
                <option value="soft">Soft skill</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label
                for="sk-filter-priority"
                class="mb-1 block text-xs font-medium text-slate-600"
              >Priority</label>
              <select
                id="sk-filter-priority"
                v-model="filterPriority"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              >
                <option value="">Any priority</option>
                <option value="must-have">Must-have</option>
                <option value="nice-to-have">Nice-to-have</option>
              </select>
            </div>
            <div>
              <label
                for="sk-filter-tag"
                class="mb-1 block text-xs font-medium text-slate-600"
              >Tag</label>
              <select
                id="sk-filter-tag"
                v-model="filterSkillTag"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              >
                <option value="">Any tag</option>
                <option
                  v-for="t in allSkillTags"
                  :key="t"
                  :value="t"
                >
                  {{ t }}
                </option>
              </select>
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            @click="openSkCreate"
          >
            Add skill
          </button>
        </div>

        <div
          v-if="filteredSkills.length === 0"
          class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600"
        >
          No skills match these filters. Add a skill or adjust filters.
        </div>

        <ul
          v-else
          class="space-y-3"
          role="list"
        >
          <li
            v-for="skill in filteredSkills"
            :key="skill.id"
            class="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 flex-1 space-y-2">
                <div class="flex items-center gap-3">
                  <h3 class="font-semibold text-slate-900">
                    {{ skill.name }}
                  </h3>
                  <span
                    class="ml-auto shrink-0 text-sm font-semibold tabular-nums text-slate-700 sm:ml-0"
                    title="Weight"
                  >
                    {{ skill.weight }}/10
                  </span>
                </div>
                <div class="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-indigo-500"
                    :style="{ width: `${skill.weight * 10}%` }"
                  />
                </div>
                <p
                  v-if="skill.description"
                  class="text-sm text-slate-600"
                >
                  {{ skill.description }}
                </p>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    class="rounded-md px-2 py-0.5 font-medium"
                    :class="categoryClass[skill.category]"
                  >
                    {{ categoryLabel[skill.category] }}
                  </span>
                  <span
                    class="rounded-md px-2 py-0.5 font-medium"
                    :class="priorityClass[skill.priority]"
                  >
                    {{ skill.priority === 'must-have' ? 'Must-have' : 'Nice-to-have' }}
                  </span>
                  <span
                    v-for="t in skill.tags ?? []"
                    :key="t"
                    class="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-800"
                  >{{ t }}</span>
                </div>
              </div>
              <div class="flex shrink-0 gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="openSkEdit(skill)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  @click="removeSkill(skill)"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Candidate Statuses section -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        class="flex w-full items-center justify-between px-5 py-4 text-left"
        @click="statusesOpen = !statusesOpen"
      >
        <div>
          <span class="text-base font-semibold text-slate-900">Candidate statuses</span>
          <span class="ml-2 text-sm text-slate-500">{{ statusConfigStore.statuses.length }} total</span>
        </div>
        <svg
          class="h-5 w-5 text-slate-400 transition-transform"
          :class="statusesOpen ? 'rotate-180' : ''"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div v-if="statusesOpen" class="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            @click="openStCreate"
          >
            Add status
          </button>
        </div>

        <div
          v-if="statusConfigStore.sorted.length === 0"
          class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600"
        >
          No statuses configured. Add one to get started.
        </div>

        <ul v-else class="space-y-2" role="list">
          <li
            v-for="s in statusConfigStore.sorted"
            :key="s.id"
            draggable="true"
            class="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 transition-colors"
            :class="draggedId === s.id
              ? 'opacity-40 border-slate-200'
              : dragOverId === s.id
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200'"
            @dragstart="draggedId = s.id"
            @dragover.prevent="dragOverId = s.id"
            @drop.prevent="draggedId && dragOverId && statusConfigStore.reorder(draggedId, dragOverId); draggedId = null; dragOverId = null"
            @dragend="draggedId = null; dragOverId = null"
          >
            <!-- drag handle -->
            <span class="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
                <path d="M4 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM4 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>
            </span>

            <!-- label + description -->
            <div class="min-w-0 flex-1">
              <span class="font-medium text-slate-900">{{ s.label }}</span>
              <span v-if="s.description" class="ml-2 text-sm text-slate-500">{{ s.description }}</span>
              <span class="ml-2 text-xs text-slate-400">({{ candidateCountForStatus(s.id) }} candidate{{ candidateCountForStatus(s.id) === 1 ? '' : 's' }})</span>
            </div>

            <!-- actions -->
            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                @click="openStEdit(s)"
              >
                Edit
              </button>
              <button
                type="button"
                class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                @click="removeStatus(s)"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Questions modal -->
    <AppModal
      :open="qModalOpen"
      :title="qEditingId ? 'Edit question' : 'Add question'"
      @close="closeQModal"
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
            <option value="">Global — all roles</option>
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
          <p class="mt-1 text-xs text-slate-500">Separate tags with commas.</p>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="closeQModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          :disabled="!formPrompt.trim()"
          @click="saveQuestion"
        >
          Save
        </button>
      </template>
    </AppModal>

    <!-- Status modal -->
    <AppModal
      :open="stModalOpen"
      :title="stEditingId ? 'Edit status' : 'Add status'"
      @close="closeStModal"
    >
      <div class="space-y-4">
        <div>
          <label
            for="st-label"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Label <span class="text-red-600">*</span></label>
          <input
            id="st-label"
            v-model="formStLabel"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            autocomplete="off"
            required
          >
        </div>
        <div>
          <label
            for="st-description"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Description</label>
          <input
            id="st-description"
            v-model="formStDescription"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            placeholder="Optional — what does this stage mean?"
          >
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="closeStModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          :disabled="!formStLabel.trim()"
          @click="saveStatus"
        >
          Save
        </button>
      </template>
    </AppModal>

    <!-- Skills modal -->
    <AppModal
      :open="skModalOpen"
      :title="skEditingId ? 'Edit skill' : 'Add skill'"
      @close="closeSkModal"
    >
      <div class="space-y-4">
        <div>
          <label
            for="sk-name"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Name <span class="text-red-600">*</span></label>
          <input
            id="sk-name"
            v-model="formName"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            autocomplete="off"
            required
          >
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label
              for="sk-category"
              class="mb-1 block text-sm font-medium text-slate-700"
            >Category</label>
            <select
              id="sk-category"
              v-model="formCategory"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            >
              <option value="technical">Technical</option>
              <option value="soft">Soft skill</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label
              for="sk-priority"
              class="mb-1 block text-sm font-medium text-slate-700"
            >Priority</label>
            <select
              id="sk-priority"
              v-model="formPriority"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            >
              <option value="must-have">Must-have</option>
              <option value="nice-to-have">Nice-to-have</option>
            </select>
          </div>
        </div>
        <div>
          <label
            for="sk-weight"
            class="mb-1 flex items-center justify-between text-sm font-medium text-slate-700"
          >
            <span>Weight</span>
            <span class="tabular-nums text-indigo-600">{{ formWeight }}/10</span>
          </label>
          <input
            id="sk-weight"
            v-model.number="formWeight"
            type="range"
            min="1"
            max="10"
            step="1"
            class="w-full accent-indigo-600"
          >
          <div class="mt-1 flex justify-between text-xs text-slate-400">
            <span>1 — low</span>
            <span>10 — critical</span>
          </div>
        </div>
        <div>
          <label
            for="sk-description"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Description</label>
          <textarea
            id="sk-description"
            v-model="formDescription"
            rows="3"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            placeholder="Optional notes about this skill…"
          />
        </div>
        <div>
          <label
            for="sk-tags"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Tags</label>
          <input
            id="sk-tags"
            v-model="formSkillTagsRaw"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            placeholder="e.g. backend, leadership, cloud"
          >
          <p class="mt-1 text-xs text-slate-500">Separate tags with commas.</p>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="closeSkModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          :disabled="!formName.trim()"
          @click="saveSkill"
        >
          Save
        </button>
      </template>
    </AppModal>
  </div>
</template>
