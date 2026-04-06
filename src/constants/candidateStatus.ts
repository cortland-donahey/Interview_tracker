import type { CandidateStatus } from '@/types/domain'

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  'applied',
  'screening',
  'phone',
  'onsite',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
]

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  phone: 'Phone',
  onsite: 'On-site',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}
