<script setup lang="ts">
import { computed, ref } from 'vue'

import AppModal from '@/components/AppModal.vue'
import { useSkillsStore } from '@/stores/skills'
import type { Skill } from '@/types/domain'

const skillsStore = useSkillsStore()

// ── filters ──────────────────────────────────────────────────────────────────
const filterCategory = ref<'' | Skill['category']>('')
const filterPriority = ref<'' | Skill['priority']>('')
const filterTag = ref<string>('')

// ── form state ────────────────────────────────────────────────────────────────
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const formName = ref('')
const formCategory = ref<Skill['category']>('technical')
const formPriority = ref<Skill['priority']>('must-have')
const formWeight = ref(5)
const formDescription = ref('')
const formTagsRaw = ref('')

const allTags = computed(() => skillsStore.allTags)

const filteredSkills = computed(() => {
  let list = skillsStore.sortedByUpdated
  if (filterCategory.value) list = list.filter((s) => s.category === filterCategory.value)
  if (filterPriority.value) list = list.filter((s) => s.priority === filterPriority.value)
  if (filterTag.value)
    list = list.filter((s) =>
      (s.tags ?? []).some((t) => t.toLowerCase() === filterTag.value.toLowerCase()),
    )
  return list
})

function parseTags(raw: string): string[] {
  return raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
}

function openCreate() {
  editingId.value = null
  formName.value = ''
  formCategory.value = 'technical'
  formPriority.value = 'must-have'
  formWeight.value = 5
  formDescription.value = ''
  formTagsRaw.value = ''
  modalOpen.value = true
}

function openEdit(skill: Skill) {
  editingId.value = skill.id
  formName.value = skill.name
  formCategory.value = skill.category
  formPriority.value = skill.priority
  formWeight.value = skill.weight
  formDescription.value = skill.description ?? ''
  formTagsRaw.value = (skill.tags ?? []).join(', ')
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function save() {
  const name = formName.value.trim()
  if (!name) return
  const payload = {
    name,
    category: formCategory.value,
    priority: formPriority.value,
    weight: formWeight.value,
    description: formDescription.value || undefined,
    tags: parseTags(formTagsRaw.value),
  }
  if (editingId.value) {
    skillsStore.update(editingId.value, payload)
  } else {
    skillsStore.add(payload)
  }
  closeModal()
}

function remove(skill: Skill) {
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
</script>

<template>
  <div class="space-y-6">
    <!-- header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">
          Skills
        </h2>
        <p class="text-sm text-slate-600">
          Define and weight the skills you care about for any role.
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        @click="openCreate"
      >
        Add skill
      </button>
    </div>

    <!-- filters -->
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
          v-model="filterTag"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        >
          <option value="">Any tag</option>
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

    <!-- empty state -->
    <div
      v-if="filteredSkills.length === 0"
      class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600"
    >
      No skills match these filters. Add a skill or adjust filters.
    </div>

    <!-- list -->
    <ul
      v-else
      class="space-y-3"
      role="list"
    >
      <li
        v-for="skill in filteredSkills"
        :key="skill.id"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1 space-y-2">
            <!-- name + weight -->
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
            <!-- weight bar -->
            <div class="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-indigo-500"
                :style="{ width: `${skill.weight * 10}%` }"
              />
            </div>
            <!-- description -->
            <p
              v-if="skill.description"
              class="text-sm text-slate-600"
            >
              {{ skill.description }}
            </p>
            <!-- badges -->
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
              @click="openEdit(skill)"
            >
              Edit
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              @click="remove(skill)"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- modal -->
    <AppModal
      :open="modalOpen"
      :title="editingId ? 'Edit skill' : 'Add skill'"
      @close="closeModal"
    >
      <div class="space-y-4">
        <!-- name -->
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
        <!-- category + priority -->
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
        <!-- weight -->
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
        <!-- description -->
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
        <!-- tags -->
        <div>
          <label
            for="sk-tags"
            class="mb-1 block text-sm font-medium text-slate-700"
          >Tags</label>
          <input
            id="sk-tags"
            v-model="formTagsRaw"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            placeholder="e.g. backend, leadership, cloud"
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
          :disabled="!formName.trim()"
          @click="save"
        >
          Save
        </button>
      </template>
    </AppModal>
  </div>
</template>
