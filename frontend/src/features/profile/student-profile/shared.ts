import type {
  StudentCertificateRecord,
  StudentEducationRecord,
  StudentExperienceRecord,
  StudentProfile,
  StudentSkillsResponse,
} from '../types'
import type { StoredProfileImages } from '@/lib/profileImages'

export function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'ST'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

export function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to read image file.'))
    }
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.readAsDataURL(file)
  })
}

export function formatExperienceDate(value: string | null) {
  if (!value) {
    return 'Present'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatExperienceType(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatCompletionStatus(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export type ExperienceDraft = Omit<StudentExperienceRecord, 'id' | 'skill_ids'> & { end_date: string }
export type ExperienceSkillMap = Record<number, number[]>
export type EducationDraft = Omit<StudentEducationRecord, 'id' | 'grade' | 'activities' | 'description' | 'skill_ids'> & { end_date: string }
export type EducationDetailDraft = {
  grade: string
  activities: string
  description: string
  skillIds: number[]
}
export type EducationDetailMap = Record<number, EducationDetailDraft>
export type CertificateRecord = {
  id: number
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
  description: string
  skillIds: number[]
}

export function toExperienceDraft(record: StudentExperienceRecord): ExperienceDraft {
  return {
    organization: record.organization,
    role_title: record.role_title,
    experience_type: record.experience_type,
    start_date: record.start_date,
    end_date: record.end_date ?? '',
    is_current: record.is_current,
    summary: record.summary,
  }
}

export function normalizeExperienceDraft(draft: ExperienceDraft) {
  return {
    ...draft,
    end_date: draft.is_current ? null : draft.end_date || null,
  }
}

export function toEducationDraft(record: StudentEducationRecord): EducationDraft {
  return {
    institution: record.institution,
    field_of_study: record.field_of_study,
    start_date: record.start_date,
    end_date: record.end_date ?? '',
    completion_status: record.completion_status,
  }
}

export function normalizeEducationDraft(draft: EducationDraft) {
  return {
    ...draft,
    end_date: draft.end_date || null,
  }
}

export function toEducationDetailDraft(record: StudentEducationRecord): EducationDetailDraft {
  return {
    grade: record.grade,
    activities: record.activities,
    description: record.description,
    skillIds: record.skill_ids,
  }
}

export function buildEducationDetailMap(records: StudentEducationRecord[]): EducationDetailMap {
  return Object.fromEntries(records.map((record) => [record.id, toEducationDetailDraft(record)]))
}

export function buildExperienceSkillMap(records: StudentExperienceRecord[]): ExperienceSkillMap {
  return Object.fromEntries(records.map((record) => [record.id, record.skill_ids]))
}

export function toCertificateRecord(record: StudentCertificateRecord): CertificateRecord {
  return {
    id: record.id,
    name: record.name,
    issuer: record.issuer,
    issueDate: record.issue_date,
    expiryDate: record.expiry_date ?? '',
    credentialId: record.credential_id,
    credentialUrl: record.credential_url,
    description: record.description,
    skillIds: record.skill_ids,
  }
}

export function buildCertificateRecords(records: StudentCertificateRecord[]): CertificateRecord[] {
  return records.map(toCertificateRecord)
}

export function toStoredProfileImages(profile: StudentProfile): StoredProfileImages {
  return {
    profileImage: profile.profile_image,
    coverImage: profile.cover_image,
  }
}

export const emptyProfile: StudentProfile = {
  student_id: 0,
  name: '',
  desired_job_type: '',
  desired_work_location: '',
  japanese_level: '',
  english_level: '',
  about_me: '',
  profile_image: null,
  cover_image: null,
  profile_complete: false,
  education_records: [],
  experience_records: [],
  certificates: [],
  resumes: [],
  availability: {
    job_search_status: '',
    earliest_start_date: null,
    interview_availability: '',
    scheduling_notes: '',
    availability_set: false,
    updated_at: '',
  },
  profile_extension_summary: {
    education_count: 0,
    experience_count: 0,
    resume_count: 0,
    has_active_resume: false,
    availability_set: false,
  },
}

export const defaultAboutMe =
  "Share a short introduction about your background, strengths, and the kind of opportunities you're looking for."
export const aboutPreviewLimit = 320
export const emptySkillsResponse: StudentSkillsResponse = {
  skills: [],
  available_skills: [],
  skill_count: 0,
}
export const emptyExperienceDraft: ExperienceDraft = {
  organization: '',
  role_title: '',
  experience_type: 'work',
  start_date: '',
  end_date: '',
  is_current: false,
  summary: '',
}
export const emptyEducationDraft: EducationDraft = {
  institution: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  completion_status: 'in_progress',
}
export const emptyEducationDetailDraft: EducationDetailDraft = {
  grade: '',
  activities: '',
  description: '',
  skillIds: [],
}
export const emptyCertificate: CertificateRecord = {
  id: 0,
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
  description: '',
  skillIds: [],
}
