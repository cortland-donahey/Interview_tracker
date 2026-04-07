export type CandidateStatus = string

export interface CandidateStatusConfig {
  id: string
  label: string
  description?: string
  order: number
}

export interface Job {
  id: string
  title: string
  reqId: string
  postedDate?: string
  descriptionFileName?: string
  descriptionFileData?: string
  skillIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  email?: string
  status: CandidateStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InterviewQuestion {
  id: string
  jobId?: string
  prompt: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  category: 'technical' | 'soft' | 'other'
  priority: 'must-have' | 'nice-to-have'
  weight: number
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}
