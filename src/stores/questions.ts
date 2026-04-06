import { defineStore } from 'pinia'

import { newId } from '@/lib/id'
import type { InterviewQuestion } from '@/types/domain'

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

export const useQuestionsStore = defineStore('questions', {
  state: () => ({
    questions: [] as InterviewQuestion[],
  }),
  getters: {
    getById: (state) => {
      return (id: string) => state.questions.find((q) => q.id === id)
    },
    sortedByUpdated: (state) => {
      return [...state.questions].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      )
    },
    allTags: (state) => {
      const set = new Set<string>()
      for (const q of state.questions) {
        for (const t of q.tags ?? []) set.add(t)
      }
      return [...set].sort((a, b) => a.localeCompare(b))
    },
  },
  actions: {
    add(input: { jobId?: string; prompt: string; tags?: string[] }) {
      const t = nowIso()
      const q: InterviewQuestion = {
        id: newId(),
        jobId: input.jobId || undefined,
        prompt: input.prompt,
        tags: normalizeTags(input.tags),
        createdAt: t,
        updatedAt: t,
      }
      this.questions.push(q)
      return q
    },
    update(
      id: string,
      patch: Partial<Pick<InterviewQuestion, 'jobId' | 'prompt' | 'tags'>>,
    ) {
      const q = this.questions.find((x) => x.id === id)
      if (!q) return
      if (patch.jobId !== undefined) q.jobId = patch.jobId || undefined
      if (patch.prompt !== undefined) q.prompt = patch.prompt
      if (patch.tags !== undefined) q.tags = normalizeTags(patch.tags)
      q.updatedAt = nowIso()
    },
    remove(id: string) {
      const i = this.questions.findIndex((x) => x.id === id)
      if (i !== -1) this.questions.splice(i, 1)
    },
  },
})
