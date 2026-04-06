import { defineStore } from 'pinia'

import { newId } from '@/lib/id'
import type { Candidate, CandidateStatus } from '@/types/domain'

function nowIso(): string {
  return new Date().toISOString()
}

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    candidates: [] as Candidate[],
  }),
  getters: {
    getById: (state) => {
      return (id: string) => state.candidates.find((c) => c.id === id)
    },
    sortedByUpdated: (state) => {
      return [...state.candidates].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      )
    },
    countForJob: (state) => {
      return (jobId: string) =>
        state.candidates.filter((c) => c.jobId === jobId).length
    },
  },
  actions: {
    add(input: {
      jobId: string
      name: string
      email?: string
      status: CandidateStatus
      notes?: string
    }) {
      const t = nowIso()
      const c: Candidate = {
        id: newId(),
        jobId: input.jobId,
        name: input.name.trim(),
        email: input.email?.trim() || undefined,
        status: input.status,
        notes: input.notes?.trim() || undefined,
        createdAt: t,
        updatedAt: t,
      }
      this.candidates.push(c)
      return c
    },
    update(
      id: string,
      patch: Partial<
        Pick<Candidate, 'jobId' | 'name' | 'email' | 'status' | 'notes'>
      >,
    ) {
      const c = this.candidates.find((x) => x.id === id)
      if (!c) return
      if (patch.jobId !== undefined) c.jobId = patch.jobId
      if (patch.name !== undefined) c.name = patch.name.trim()
      if (patch.email !== undefined) c.email = patch.email.trim() || undefined
      if (patch.status !== undefined) c.status = patch.status
      if (patch.notes !== undefined) c.notes = patch.notes.trim() || undefined
      c.updatedAt = nowIso()
    },
    remove(id: string) {
      const i = this.candidates.findIndex((c) => c.id === id)
      if (i !== -1) this.candidates.splice(i, 1)
    },
  },
})
