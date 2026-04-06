import { defineStore } from 'pinia'

import { newId } from '@/lib/id'
import type { Skill } from '@/types/domain'

function nowIso(): string {
  return new Date().toISOString()
}

function normalizeTags(tags: string[] | undefined): string[] | undefined {
  if (!tags?.length) return undefined
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tags) {
    const s = t.trim()
    if (!s) continue
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out.length ? out : undefined
}

export const useSkillsStore = defineStore('skills', {
  state: () => ({
    skills: [] as Skill[],
  }),
  getters: {
    getById: (state) => {
      return (id: string) => state.skills.find((s) => s.id === id)
    },
    sortedByUpdated: (state) => {
      return [...state.skills].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    allTags: (state) => {
      const set = new Set<string>()
      for (const s of state.skills) {
        for (const t of s.tags ?? []) set.add(t)
      }
      return [...set].sort((a, b) => a.localeCompare(b))
    },
  },
  actions: {
    add(input: {
      name: string
      category: Skill['category']
      priority: Skill['priority']
      weight: number
      description?: string
      tags?: string[]
    }) {
      const t = nowIso()
      const skill: Skill = {
        id: newId(),
        name: input.name.trim(),
        category: input.category,
        priority: input.priority,
        weight: Math.min(10, Math.max(1, input.weight)),
        description: input.description?.trim() || undefined,
        tags: normalizeTags(input.tags),
        createdAt: t,
        updatedAt: t,
      }
      this.skills.push(skill)
      return skill
    },
    update(
      id: string,
      patch: Partial<Pick<Skill, 'name' | 'category' | 'priority' | 'weight' | 'description' | 'tags'>>,
    ) {
      const skill = this.skills.find((s) => s.id === id)
      if (!skill) return
      if (patch.name !== undefined) skill.name = patch.name.trim()
      if (patch.category !== undefined) skill.category = patch.category
      if (patch.priority !== undefined) skill.priority = patch.priority
      if (patch.weight !== undefined) skill.weight = Math.min(10, Math.max(1, patch.weight))
      if ('description' in patch) skill.description = patch.description?.trim() || undefined
      if (patch.tags !== undefined) skill.tags = normalizeTags(patch.tags)
      skill.updatedAt = nowIso()
    },
    remove(id: string) {
      const i = this.skills.findIndex((s) => s.id === id)
      if (i !== -1) this.skills.splice(i, 1)
    },
  },
})
