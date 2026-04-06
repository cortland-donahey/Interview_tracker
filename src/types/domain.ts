export type CandidateStatus =
  | 'applied'
  | 'screening'
  | 'phone'
  | 'onsite'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export interface Job {
  id: string
  title: string
  company?: string
  description: string
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
