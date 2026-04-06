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
    add(input: {
      title: string
      reqId: string
      postedDate?: string
      descriptionFileName?: string
      descriptionFileData?: string
    }) {
      const t = nowIso()
      const job: Job = {
        id: newId(),
        title: input.title.trim(),
        reqId: input.reqId.trim(),
        postedDate: input.postedDate || undefined,
        descriptionFileName: input.descriptionFileName || undefined,
        descriptionFileData: input.descriptionFileData || undefined,
        createdAt: t,
        updatedAt: t,
      }
      this.jobs.push(job)
      return job
    },
    update(
      id: string,
      patch: Partial<Pick<Job, 'title' | 'reqId' | 'postedDate' | 'descriptionFileName' | 'descriptionFileData'>>,
    ) {
      const job = this.jobs.find((j) => j.id === id)
      if (!job) return
      if (patch.title !== undefined) job.title = patch.title.trim()
      if (patch.reqId !== undefined) job.reqId = patch.reqId.trim()
      if ('postedDate' in patch) job.postedDate = patch.postedDate || undefined
      if ('descriptionFileName' in patch) job.descriptionFileName = patch.descriptionFileName || undefined
      if ('descriptionFileData' in patch) job.descriptionFileData = patch.descriptionFileData || undefined
      job.updatedAt = nowIso()
    },
    remove(id: string) {
      const i = this.jobs.findIndex((j) => j.id === id)
      if (i !== -1) this.jobs.splice(i, 1)
    },
  },
})
