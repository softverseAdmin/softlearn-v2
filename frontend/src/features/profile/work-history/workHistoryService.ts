import { apiRequest } from '@/lib/api'

import type {
  StudentEducationRecord,
  StudentExperienceRecord,
  StudentProfile,
  StudentResumeRecord,
} from '../types'
import type {
  WorkHistoryFile,
  WorkHistoryInsightMetric,
  WorkHistoryNextStep,
  WorkHistoryPageData,
  WorkHistoryPreviewEducationEntry,
  WorkHistoryPreviewExperienceEntry,
  WorkHistoryTimelineItem,
} from './types'

type CsrfTokenResponse = {
  csrf_token: string
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Present'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function formatDateTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateRange(startDate: string, endDate: string | null, isCurrent = false) {
  return `${formatDate(startDate)} - ${isCurrent ? 'Present' : formatDate(endDate)}`
}

function summarizeLevels(profile: StudentProfile) {
  return [profile.desired_job_type, profile.desired_work_location, profile.japanese_level, profile.english_level]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(' • ')
}

function buildExperiencePreview(records: StudentExperienceRecord[]): WorkHistoryPreviewExperienceEntry[] {
  return records.map((record) => ({
    company: record.organization,
    role: record.role_title,
    dateRange: formatDateRange(record.start_date, record.end_date, record.is_current),
    bullets: record.summary
      .split('\n')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, 3),
  }))
}

function buildEducationPreview(records: StudentEducationRecord[]): WorkHistoryPreviewEducationEntry[] {
  return records.map((record) => ({
    institution: record.institution,
    detail: [record.field_of_study, record.completion_status].filter((value) => value.trim().length > 0).join(' • '),
    dateRange: formatDateRange(record.start_date, record.end_date),
  }))
}

function sortTimelineItems(items: WorkHistoryTimelineItem[]) {
  return [...items].sort((left, right) => right.dateLabel.localeCompare(left.dateLabel))
}

function buildTimeline(profile: StudentProfile): WorkHistoryTimelineItem[] {
  const workItems: WorkHistoryTimelineItem[] = profile.experience_records.map((record) => ({
    id: `work-${record.id}`,
    title: record.role_title,
    subtitle: record.organization,
    dateLabel: record.start_date,
    description: record.summary || `${record.experience_type} experience`,
    kind: 'work',
    isCurrent: record.is_current,
  }))
  const educationItems: WorkHistoryTimelineItem[] = profile.education_records.map((record) => ({
    id: `education-${record.id}`,
    title: record.field_of_study || 'Education record',
    subtitle: record.institution,
    dateLabel: record.start_date,
    description: record.description || record.completion_status || 'Education history',
    kind: 'education',
  }))

  return sortTimelineItems([...workItems, ...educationItems]).map((item) => ({
    ...item,
    dateLabel:
      item.kind === 'work'
        ? formatDateRange(
            item.dateLabel,
            profile.experience_records.find((record) => `work-${record.id}` === item.id)?.end_date ?? null,
            profile.experience_records.find((record) => `work-${record.id}` === item.id)?.is_current ?? false,
          )
        : formatDateRange(
            item.dateLabel,
            profile.education_records.find((record) => `education-${record.id}` === item.id)?.end_date ?? null,
          ),
  }))
}

function estimateExperienceMonths(records: StudentExperienceRecord[]) {
  return records.reduce((total, record) => {
    const start = new Date(record.start_date)
    const end = new Date(record.is_current ? new Date().toISOString() : (record.end_date ?? record.start_date))
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return total
    }

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
    return total + Math.max(months, 0)
  }, 0)
}

function formatExperienceTotal(months: number) {
  if (months <= 0) {
    return 'No experience added'
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years <= 0) {
    return `${remainingMonths} mo`
  }

  if (remainingMonths === 0) {
    return `${years} yr`
  }

  return `${years} yr ${remainingMonths} mo`
}

function buildInsightMetrics(profile: StudentProfile): WorkHistoryInsightMetric[] {
  return [
    { label: 'Resume versions', value: String(profile.resumes.length) },
    { label: 'Experience records', value: String(profile.experience_records.length) },
    { label: 'Education records', value: String(profile.education_records.length) },
    { label: 'Profile completeness', value: profile.profile_complete ? 'Ready' : 'Needs work' },
  ]
}

function mapResumeToFile(record: StudentResumeRecord): WorkHistoryFile {
  const extension = record.file_name.split('.').pop()?.toLowerCase()
  return {
    id: String(record.id),
    fileName: record.display_name || record.file_name,
    fileType: extension === 'docx' || extension === 'xlsx' ? extension : 'pdf',
    status: record.is_active ? 'active' : 'processed',
    uploadedAt: record.updated_at || record.created_at,
    sizeLabel: record.file_size_bytes > 0 ? `${Math.max(1, Math.round(record.file_size_bytes / 1024))} KB` : 'Profile record',
    sizeBytes: record.file_size_bytes,
    downloadUrl: record.download_url,
    isActive: record.is_active,
  }
}

function buildNextSteps(profile: StudentProfile): WorkHistoryNextStep[] {
  const steps: WorkHistoryNextStep[] = []

  if (!profile.profile_extension_summary.has_active_resume) {
    steps.push({
      id: 'upload-resume',
      title: 'Upload an active resume',
      description: 'Keep one resume marked active so applications and recruiters see the right document first.',
      href: '/student/resume',
    })
  }

  if (!profile.profile_extension_summary.experience_count) {
    steps.push({
      id: 'add-experience',
      title: 'Add work experience',
      description: 'Populate the experience section in your profile so the timeline and matching data stop being empty.',
      href: '/student/profile',
    })
  }

  if (!profile.education_records.length) {
    steps.push({
      id: 'add-education',
      title: 'Add education history',
      description: 'Education records still drive timeline, readiness, and resume preview quality.',
      href: '/student/profile',
    })
  }

  if (!profile.profile_complete) {
    steps.push({
      id: 'complete-profile',
      title: 'Complete your profile',
      description: 'Fill out missing profile basics so the document workspace reflects credible candidate data.',
      href: '/student/profile',
    })
  }

  return steps.slice(0, 3)
}

export function mapStudentProfileToWorkHistoryPageData(profile: StudentProfile): WorkHistoryPageData {
  const previewExperience = buildExperiencePreview(profile.experience_records)
  const previewEducation = buildEducationPreview(profile.education_records)
  const totalExperienceMonths = estimateExperienceMonths(profile.experience_records)
  const lastUpdated =
    profile.resumes[0]?.updated_at ||
    profile.availability.updated_at ||
    new Date().toISOString()

  return {
    files: profile.resumes.map(mapResumeToFile),
    links: {
      linkedin: profile.linkedin_url ?? '',
      github: profile.github_url ?? '',
      portfolio: profile.portfolio_url ?? '',
    },
    insightMetrics: buildInsightMetrics(profile),
    summary: {
      totalExperience: formatExperienceTotal(totalExperienceMonths),
      companies: new Set(profile.experience_records.map((record) => record.organization).filter(Boolean)).size,
      roles: profile.experience_records.length,
      lastUpdated: formatDateTime(lastUpdated),
    },
    timeline: buildTimeline(profile),
    preview: {
      title: profile.profile_extension_summary.has_active_resume ? 'Active resume preview' : 'Profile-based resume preview',
      name: profile.name,
      contactLine: summarizeLevels(profile),
      summary:
        profile.about_me.trim() ||
        'Add a short summary in your student profile to generate a stronger preview for resumes and career documents.',
      experience: previewExperience,
      education: previewEducation,
    },
    nextSteps: buildNextSteps(profile),
  }
}

async function getCsrfToken(existingToken: string | null) {
  if (existingToken) {
    return existingToken
  }

  const response = await apiRequest<CsrfTokenResponse>('/auth/csrf', { notifyOnError: false })
  return response.csrf_token
}

export async function getWorkHistoryPageData(): Promise<WorkHistoryPageData> {
  const profile = await apiRequest<StudentProfile>('/student/profile', { notifyOnError: false })
  return mapStudentProfileToWorkHistoryPageData(profile)
}

export async function uploadWorkHistoryFile(file: File, csrfToken: string | null): Promise<WorkHistoryPageData> {
  const token = await getCsrfToken(csrfToken)
  const formData = new FormData()
  formData.set('file', file)
  formData.set('display_name', file.name)
  formData.set('file_name', file.name)
  formData.set('source_type', 'uploaded')
  formData.set('is_active', 'true')
  const profile = await apiRequest<StudentProfile>('/student/profile/resumes', {
    method: 'POST',
    csrfToken: token,
    notifyOnError: false,
    body: formData,
  })

  return mapStudentProfileToWorkHistoryPageData(profile)
}

export async function saveWorkHistoryLinks(
  links: { linkedin: string; github: string; portfolio: string },
  csrfToken: string | null,
): Promise<WorkHistoryPageData> {
  const token = await getCsrfToken(csrfToken)
  const currentProfile = await apiRequest<StudentProfile>('/student/profile', { notifyOnError: false })
  const profile = await apiRequest<StudentProfile>('/student/profile', {
    method: 'PUT',
    csrfToken: token,
    notifyOnError: false,
    body: {
      name: currentProfile.name,
      desired_job_type: currentProfile.desired_job_type,
      desired_work_location: currentProfile.desired_work_location,
      japanese_level: currentProfile.japanese_level,
      english_level: currentProfile.english_level,
      about_me: currentProfile.about_me,
      profile_image: currentProfile.profile_image ?? '',
      cover_image: currentProfile.cover_image ?? '',
      linkedin_url: links.linkedin,
      github_url: links.github,
      portfolio_url: links.portfolio,
    },
  })

  return mapStudentProfileToWorkHistoryPageData(profile)
}
