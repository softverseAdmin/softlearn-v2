export type WorkHistoryTab = 'upload-manage' | 'experience-timeline' | 'experience-summary'

export type WorkHistoryFileStatus = 'active' | 'processed' | 'needs_review'

export interface WorkHistoryFile {
  id: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'xlsx'
  status: WorkHistoryFileStatus
  uploadedAt: string
  sizeLabel: string
  sizeBytes: number
  downloadUrl?: string | null
  isActive: boolean
}

export interface WorkHistoryLinks {
  linkedin: string
  github: string
  portfolio: string
}

export interface WorkHistoryInsightMetric {
  label: string
  value: string
}

export interface WorkHistoryPreviewExperienceEntry {
  company: string
  role: string
  dateRange: string
  bullets: string[]
}

export interface WorkHistoryPreviewEducationEntry {
  institution: string
  detail: string
  dateRange: string
}

export interface WorkHistoryPreviewData {
  title: string
  name: string
  contactLine: string
  summary: string
  experience: WorkHistoryPreviewExperienceEntry[]
  education: WorkHistoryPreviewEducationEntry[]
}

export interface WorkHistorySummary {
  totalExperience: string
  companies: number
  roles: number
  lastUpdated: string
}

export interface WorkHistoryTimelineItem {
  id: string
  title: string
  subtitle: string
  dateLabel: string
  description: string
  kind: 'work' | 'education'
  isCurrent?: boolean
}

export interface WorkHistoryNextStep {
  id: string
  title: string
  description: string
  href: string
}

export interface WorkHistoryPageData {
  files: WorkHistoryFile[]
  links: WorkHistoryLinks
  insightMetrics: WorkHistoryInsightMetric[]
  summary: WorkHistorySummary
  timeline: WorkHistoryTimelineItem[]
  preview: WorkHistoryPreviewData
  nextSteps: WorkHistoryNextStep[]
}
