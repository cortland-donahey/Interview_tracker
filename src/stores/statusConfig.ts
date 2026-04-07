import { defineStore } from 'pinia'

import { newId } from '@/lib/id'
import type { CandidateStatusConfig } from '@/types/domain'

export const DEFAULT_STATUSES: CandidateStatusConfig[] = [
  { id: 'applied', label: 'Applied', order: 0 },
  { id: 'screening', label: 'Screening', order: 1 },
  { id: 'phone', label: 'Phone', order: 2 },
  { id: 'onsite', label: 'On-site', order: 3 },
  { id: 'offer', label: 'Offer', order: 4 },
  { id: 'hired', label: 'Hired', order: 5 },
  { id: 'rejected', label: 'Rejected', order: 6 },
  { id: 'withdrawn', label: 'Withdrawn', order: 7 },
]

export const useStatusConfigStore = defineStore('statusConfig', {
  state: () => ({
    statuses: DEFAULT_STATUSES.map((s) => ({ ...s })) as CandidateStatusConfig[],
  }),
  getters: {
    sorted: (state) => [...state.statuses].sort((a, b) => a.order - b.order),
    getById: (state) => (id: string) => state.statuses.find((s) => s.id === id),
    labelMap: (state): Record<string, string> => {
      const map: Record<string, string> = {}
      for (const s of state.statuses) map[s.id] = s.label
      return map
    },
  },
  actions: {
    add(input: { label: string; description?: string }) {
      const label = input.label.trim()
      if (!label) return
      const maxOrder = this.statuses.length
        ? Math.max(...this.statuses.map((s) => s.order))
        : -1
      this.statuses.push({
        id: newId(),
        label,
        description: input.description?.trim() || undefined,
        order: maxOrder + 1,
      })
    },
    update(id: string, patch: Partial<Pick<CandidateStatusConfig, 'label' | 'description'>>) {
      const s = this.statuses.find((s) => s.id === id)
      if (!s) return
      if (patch.label !== undefined) s.label = patch.label.trim()
      if ('description' in patch) s.description = patch.description?.trim() || undefined
    },
    remove(id: string) {
      const i = this.statuses.findIndex((s) => s.id === id)
      if (i !== -1) this.statuses.splice(i, 1)
    },
    reorder(draggedId: string, targetId: string) {
      if (draggedId === targetId) return
      const sorted = [...this.statuses].sort((a, b) => a.order - b.order)
      const fromIdx = sorted.findIndex((s) => s.id === draggedId)
      const toIdx = sorted.findIndex((s) => s.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return
      const [moved] = sorted.splice(fromIdx, 1)
      sorted.splice(toIdx, 0, moved)
      sorted.forEach((s, i) => {
        const found = this.statuses.find((st) => st.id === s.id)
        if (found) found.order = i
      })
    },
  },
})
