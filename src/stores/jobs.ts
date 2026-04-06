import { defineStore } from 'pinia'

import { newId } from '@/lib/id'
import type { Job } from '@/types/domain'

function nowIso(): string {
  return new Date().toISOString()
}

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    jobs: [] as Job[],
  }),
  getters: {
    getById: (state) => {
      return (id: string) => state.jobs.find((j) => j.id === id)
    },
    sortedByUpdated: (state) => {
      return [...state.jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
  },
  actions: {
    add(input: { title: string; company?: string; description: string }) {
      const t = nowIso()
      const job: Job = {
        id: newId(),
        title: input.title.trim(),
        company: input.company?.trim() || undefined,
        description: input.description,
        createdAt: t,
        updatedAt: t,
      }
      this.jobs.push(job)
      return job
    },
    update(
      id: string,
      patch: Partial<Pick<Job, 'title' | 'company' | 'description'>>,
    ) {
      const job = this.jobs.find((j) => j.id === id)
      if (!job) return
      if (patch.title !== undefined) job.title = patch.title.trim()
      if (patch.company !== undefined)
        job.company = patch.company.trim() || undefined
      if (patch.description !== undefined) job.description = patch.description
      job.updatedAt = nowIso()
    },
    remove(id: string) {
      const i = this.jobs.findIndex((j) => j.id === id)
      if (i !== -1) this.jobs.splice(i, 1)
    },
  },
})
