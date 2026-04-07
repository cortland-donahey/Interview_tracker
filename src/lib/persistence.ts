import type { Candidate, CandidateStatusConfig, InterviewQuestion, Job, Skill } from '@/types/domain'

export const STORAGE_KEY = 'interview-tracker:v1'

export interface PersistedV1 {
  version: 1
  jobs: Job[]
  candidates: Candidate[]
  questions: InterviewQuestion[]
  skills: Skill[]
  statuses: CandidateStatusConfig[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function loadV1(): PersistedV1 | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as unknown
    if (!isRecord(data) || data.version !== 1) return null
    const jobs = Array.isArray(data.jobs) ? (data.jobs as Job[]) : []
    const candidates = Array.isArray(data.candidates) ? (data.candidates as Candidate[]) : []
    const questions = Array.isArray(data.questions) ? (data.questions as InterviewQuestion[]) : []
    const skills = Array.isArray(data.skills) ? (data.skills as Skill[]) : []
    const statuses = Array.isArray(data.statuses) ? (data.statuses as CandidateStatusConfig[]) : []
    return { version: 1, jobs, candidates, questions, skills, statuses }
  } catch {
    return null
  }
}

export function saveV1(payload: PersistedV1): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota or private mode */
  }
}
