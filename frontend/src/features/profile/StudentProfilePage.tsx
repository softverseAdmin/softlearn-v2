import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useAuth } from '../../auth/useAuth'
import { Link } from 'react-router-dom'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentEducationRecord, StudentExperienceRecord, StudentProfile, StudentSkillsResponse } from './types'
import { Award, BriefcaseBusiness, ChevronRight, GraduationCap, Image as ImageIcon, Mail, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getStoredProfileImages, saveStoredProfileImages, type StoredProfileImages } from '@/lib/profileImages'

function getInitials(name: string) {
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

function readImageFile(file: File) {
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

function formatExperienceDate(value: string | null) {
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

function formatExperienceType(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

type ExperienceDraft = Omit<StudentExperienceRecord, 'id'> & { end_date: string }
type ExperienceSkillMap = Record<number, number[]>
type EducationDraft = Omit<StudentEducationRecord, 'id'> & { end_date: string }
type EducationDetailDraft = {
  grade: string
  activities: string
  description: string
  skillIds: number[]
}
type EducationDetailMap = Record<number, EducationDetailDraft>
type CertificateRecord = {
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

function toExperienceDraft(record: StudentExperienceRecord): ExperienceDraft {
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

function normalizeExperienceDraft(draft: ExperienceDraft) {
  return {
    ...draft,
    end_date: draft.is_current ? null : draft.end_date || null,
  }
}

function toEducationDraft(record: StudentEducationRecord): EducationDraft {
  return {
    institution: record.institution,
    field_of_study: record.field_of_study,
    start_date: record.start_date,
    end_date: record.end_date ?? '',
    completion_status: record.completion_status,
  }
}

function normalizeEducationDraft(draft: EducationDraft) {
  return {
    ...draft,
    end_date: draft.end_date || null,
  }
}

function formatCompletionStatus(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function parseStoredExperienceSkills(value: string | null): ExperienceSkillMap {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([recordId, skillIds]) => {
        const numericRecordId = Number(recordId)
        if (!Number.isInteger(numericRecordId) || !Array.isArray(skillIds)) {
          return []
        }

        return [
          [
            numericRecordId,
            skillIds
              .map((skillId) => Number(skillId))
              .filter((skillId) => Number.isInteger(skillId)),
          ],
        ]
      }),
    )
  } catch {
    return {}
  }
}

function parseStoredEducationDetails(value: string | null): EducationDetailMap {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([recordId, details]) => {
        const numericRecordId = Number(recordId)
        if (!Number.isInteger(numericRecordId) || !details || typeof details !== 'object') {
          return []
        }

        const typedDetails = details as Partial<EducationDetailDraft>
        return [
          [
            numericRecordId,
            {
              grade: typeof typedDetails.grade === 'string' ? typedDetails.grade : '',
              activities: typeof typedDetails.activities === 'string' ? typedDetails.activities : '',
              description: typeof typedDetails.description === 'string' ? typedDetails.description : '',
              skillIds: Array.isArray(typedDetails.skillIds)
                ? typedDetails.skillIds
                    .map((skillId) => Number(skillId))
                    .filter((skillId) => Number.isInteger(skillId))
                : [],
            },
          ],
        ]
      }),
    )
  } catch {
    return {}
  }
}

function parseStoredCertificates(value: string | null): CertificateRecord[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') {
        return []
      }

      const certificate = entry as Partial<CertificateRecord>
      if (!Number.isInteger(certificate.id)) {
        return []
      }

      return [
        {
          id: certificate.id,
          name: typeof certificate.name === 'string' ? certificate.name : '',
          issuer: typeof certificate.issuer === 'string' ? certificate.issuer : '',
          issueDate: typeof certificate.issueDate === 'string' ? certificate.issueDate : '',
          expiryDate: typeof certificate.expiryDate === 'string' ? certificate.expiryDate : '',
          credentialId: typeof certificate.credentialId === 'string' ? certificate.credentialId : '',
          credentialUrl: typeof certificate.credentialUrl === 'string' ? certificate.credentialUrl : '',
          description: typeof certificate.description === 'string' ? certificate.description : '',
          skillIds: Array.isArray(certificate.skillIds)
            ? certificate.skillIds.map((skillId) => Number(skillId)).filter((skillId) => Number.isInteger(skillId))
            : [],
        },
      ]
    })
  } catch {
    return []
  }
}

const emptyProfile: StudentProfile = {
  student_id: 0,
  name: '',
  desired_job_type: '',
  desired_work_location: '',
  japanese_level: '',
  english_level: '',
  profile_complete: false,
  education_records: [],
  experience_records: [],
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

const defaultAboutMe =
  "Share a short introduction about your background, strengths, and the kind of opportunities you're looking for."
const aboutPreviewLimit = 320
const emptySkillsResponse: StudentSkillsResponse = {
  skills: [],
  available_skills: [],
  skill_count: 0,
}
const emptyExperienceDraft: ExperienceDraft = {
  organization: '',
  role_title: '',
  experience_type: 'work',
  start_date: '',
  end_date: '',
  is_current: false,
  summary: '',
}
const emptyEducationDraft: EducationDraft = {
  institution: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  completion_status: 'in_progress',
}
const emptyEducationDetailDraft: EducationDetailDraft = {
  grade: '',
  activities: '',
  description: '',
  skillIds: [],
}
const emptyCertificate: CertificateRecord = {
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

export function StudentProfilePage() {
  const { user, csrfToken, refreshSession } = useAuth()
  const displayName = user?.name?.trim() || 'Student Profile'
  const initials = getInitials(displayName)
  const aboutStorageKey = `student-profile-about:${user?.user_id ?? 'anonymous'}`
  const experienceSkillsStorageKey = `student-profile-experience-skills:${user?.user_id ?? 'anonymous'}`
  const educationDetailsStorageKey = `student-profile-education-details:${user?.user_id ?? 'anonymous'}`
  const certificatesStorageKey = `student-profile-certificates:${user?.user_id ?? 'anonymous'}`
  const profileInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile)
  const [skillsData, setSkillsData] = useState<StudentSkillsResponse>(emptySkillsResponse)
  const [savedImages, setSavedImages] = useState<StoredProfileImages>({ profileImage: null, coverImage: null })
  const [draftImages, setDraftImages] = useState<StoredProfileImages>({ profileImage: null, coverImage: null })
  const [certificates, setCertificates] = useState<CertificateRecord[]>([])
  const [certificateDrafts, setCertificateDrafts] = useState<Record<number, CertificateRecord>>({})
  const [newCertificate, setNewCertificate] = useState<CertificateRecord>(emptyCertificate)
  const [educationDrafts, setEducationDrafts] = useState<Record<number, EducationDraft>>({})
  const [educationDetails, setEducationDetails] = useState<EducationDetailMap>({})
  const [educationDetailDrafts, setEducationDetailDrafts] = useState<EducationDetailMap>({})
  const [newEducation, setNewEducation] = useState<EducationDraft>(emptyEducationDraft)
  const [newEducationDetails, setNewEducationDetails] = useState<EducationDetailDraft>(emptyEducationDetailDraft)
  const [experienceSkills, setExperienceSkills] = useState<ExperienceSkillMap>({})
  const [experienceSkillDrafts, setExperienceSkillDrafts] = useState<ExperienceSkillMap>({})
  const [experienceDrafts, setExperienceDrafts] = useState<Record<number, ExperienceDraft>>({})
  const [newExperience, setNewExperience] = useState<ExperienceDraft>(emptyExperienceDraft)
  const [newExperienceSkillIds, setNewExperienceSkillIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(displayName)
  const [savingName, setSavingName] = useState(false)
  const [aboutMe, setAboutMe] = useState(defaultAboutMe)
  const [aboutDraft, setAboutDraft] = useState(defaultAboutMe)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false)
  const [skillDraftIds, setSkillDraftIds] = useState<number[]>([])
  const [savingSkills, setSavingSkills] = useState(false)
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false)
  const [savingCertificates, setSavingCertificates] = useState(false)
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false)
  const [savingEducation, setSavingEducation] = useState(false)
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false)
  const [savingExperience, setSavingExperience] = useState(false)

  useEffect(() => {
    const nextImages = getStoredProfileImages(user?.user_id)
    setSavedImages(nextImages)
    setDraftImages(nextImages)
  }, [user?.user_id])

  useEffect(() => {
    const storedAbout = localStorage.getItem(aboutStorageKey)
    const nextAbout = storedAbout?.trim() ? storedAbout : defaultAboutMe
    setAboutMe(nextAbout)
    setAboutDraft(nextAbout)
    setIsAboutExpanded(false)
  }, [aboutStorageKey])

  useEffect(() => {
    const nextExperienceSkills = parseStoredExperienceSkills(localStorage.getItem(experienceSkillsStorageKey))
    setExperienceSkills(nextExperienceSkills)
    setExperienceSkillDrafts(nextExperienceSkills)
    setNewExperienceSkillIds([])
  }, [experienceSkillsStorageKey])

  useEffect(() => {
    const nextEducationDetails = parseStoredEducationDetails(localStorage.getItem(educationDetailsStorageKey))
    setEducationDetails(nextEducationDetails)
    setEducationDetailDrafts(nextEducationDetails)
    setNewEducationDetails(emptyEducationDetailDraft)
  }, [educationDetailsStorageKey])

  useEffect(() => {
    const nextCertificates = parseStoredCertificates(localStorage.getItem(certificatesStorageKey))
    setCertificates(nextCertificates)
    setCertificateDrafts(Object.fromEntries(nextCertificates.map((certificate) => [certificate.id, certificate])))
    setNewCertificate(emptyCertificate)
  }, [certificatesStorageKey])

  useEffect(() => {
    setNameDraft(displayName)
  }, [displayName])

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const [profileData, studentSkills] = await Promise.all([
          apiRequest<StudentProfile>('/student/profile'),
          apiRequest<StudentSkillsResponse>('/student/skills'),
        ])
        if (!active) {
          return
        }

        setProfile(profileData)
        setEducationDrafts(
          Object.fromEntries(profileData.education_records.map((record) => [record.id, toEducationDraft(record)])),
        )
        setExperienceDrafts(
          Object.fromEntries(profileData.experience_records.map((record) => [record.id, toExperienceDraft(record)])),
        )
        setNewEducation(emptyEducationDraft)
        setNewExperience(emptyExperienceDraft)
        setNameDraft(profileData.name || displayName)
        setSkillsData(studentSkills)
        setSkillDraftIds(studentSkills.skills.map((skill) => skill.skill_id))
      } catch (error) {
        if (active) {
          toast.error(error instanceof ApiError ? error.message : 'Unable to load profile details.')
        }
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [displayName])

  const hasUnsavedChanges =
    draftImages.profileImage !== savedImages.profileImage || draftImages.coverImage !== savedImages.coverImage

  async function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>,
    field: keyof StoredProfileImages,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file for your profile header.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 5 MB.')
      return
    }

    try {
      const imageDataUrl = await readImageFile(file)
      setDraftImages((current) => ({
        ...current,
        [field]: imageDataUrl,
      }))
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'Unable to load the selected image.')
    }
  }

  function openProfilePicker() {
    profileInputRef.current?.click()
  }

  function openCoverPicker() {
    coverInputRef.current?.click()
  }

  function syncProfile(updatedProfile: StudentProfile) {
    setProfile(updatedProfile)
    setEducationDrafts(
      Object.fromEntries(updatedProfile.education_records.map((record) => [record.id, toEducationDraft(record)])),
    )
    setExperienceDrafts(
      Object.fromEntries(updatedProfile.experience_records.map((record) => [record.id, toExperienceDraft(record)])),
    )
    setNameDraft(updatedProfile.name || displayName)
  }

  function handleSaveImages() {
    setSaving(true)

    try {
      saveStoredProfileImages(user?.user_id, draftImages)
      setSavedImages(draftImages)
      toast.success('Profile images saved successfully.')
    } catch {
      toast.error('Unable to save profile images on this device.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveName() {
    const trimmedName = nameDraft.trim()
    if (!trimmedName) {
      toast.error('Name cannot be empty.')
      return
    }

    setSavingName(true)

    try {
      const response = await apiRequest<StudentProfile>('/student/profile', {
        method: 'PUT',
        body: {
          name: trimmedName,
          desired_job_type: profile.desired_job_type,
          desired_work_location: profile.desired_work_location,
          japanese_level: profile.japanese_level,
          english_level: profile.english_level,
        },
        csrfToken,
      })

      syncProfile(response)
      setIsEditingName(false)
      await refreshSession()
      toast.success('Name updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update name.')
    } finally {
      setSavingName(false)
    }
  }

  function handleCancelNameEdit() {
    setNameDraft(profile.name || displayName)
    setIsEditingName(false)
  }

  function handleCancelAboutEdit() {
    setAboutDraft(aboutMe)
    setIsEditingAbout(false)
  }

  function handleSaveAbout() {
    const trimmedAbout = aboutDraft.trim()
    if (!trimmedAbout) {
      toast.error('About me cannot be empty.')
      return
    }

    setSavingAbout(true)

    try {
      localStorage.setItem(aboutStorageKey, trimmedAbout)
      setAboutMe(trimmedAbout)
      setAboutDraft(trimmedAbout)
      setIsEditingAbout(false)
      toast.success('About me saved successfully.')
    } catch {
      toast.error('Unable to save your about me section on this device.')
    } finally {
      setSavingAbout(false)
    }
  }

  const shouldShowAboutToggle = aboutMe.length > aboutPreviewLimit
  const displayedAbout = isAboutExpanded || !shouldShowAboutToggle ? aboutMe : `${aboutMe.slice(0, aboutPreviewLimit).trimEnd()}...`
  const skillSummary = skillsData.skills.map((skill) => skill.skill_name).join(' | ')
  const hasCertificates = certificates.length > 0
  const hasEducation = profile.education_records.length > 0
  const hasExperience = profile.experience_records.length > 0
  const skillNameById = new Map([
    ...skillsData.available_skills.map((skill) => [skill.id, skill.name] as const),
    ...skillsData.skills.map((skill) => [skill.skill_id, skill.skill_name] as const),
  ])

  function persistExperienceSkills(nextSkills: ExperienceSkillMap) {
    setExperienceSkills(nextSkills)
    setExperienceSkillDrafts(nextSkills)
    localStorage.setItem(experienceSkillsStorageKey, JSON.stringify(nextSkills))
  }

  function persistEducationDetails(nextDetails: EducationDetailMap) {
    setEducationDetails(nextDetails)
    setEducationDetailDrafts(nextDetails)
    localStorage.setItem(educationDetailsStorageKey, JSON.stringify(nextDetails))
  }

  function persistCertificates(nextCertificates: CertificateRecord[]) {
    setCertificates(nextCertificates)
    setCertificateDrafts(Object.fromEntries(nextCertificates.map((certificate) => [certificate.id, certificate])))
    localStorage.setItem(certificatesStorageKey, JSON.stringify(nextCertificates))
  }

  function toggleExperienceSkill(recordId: number, skillId: number) {
    setExperienceSkillDrafts((current) => {
      const currentSkillIds = current[recordId] ?? experienceSkills[recordId] ?? []
      return {
        ...current,
        [recordId]: currentSkillIds.includes(skillId)
          ? currentSkillIds.filter((currentSkillId) => currentSkillId !== skillId)
          : [...currentSkillIds, skillId],
      }
    })
  }

  function toggleNewExperienceSkill(skillId: number) {
    setNewExperienceSkillIds((current) =>
      current.includes(skillId) ? current.filter((currentSkillId) => currentSkillId !== skillId) : [...current, skillId],
    )
  }

  function openEducationDialog() {
    setEducationDrafts(
      Object.fromEntries(profile.education_records.map((record) => [record.id, toEducationDraft(record)])),
    )
    setEducationDetailDrafts(educationDetails)
    setNewEducation(emptyEducationDraft)
    setNewEducationDetails(emptyEducationDetailDraft)
    setIsEducationDialogOpen(true)
  }

  function toggleEducationSkill(recordId: number, skillId: number) {
    setEducationDetailDrafts((current) => {
      const existingDetails = current[recordId] ?? educationDetails[recordId] ?? emptyEducationDetailDraft
      const hasSkill = existingDetails.skillIds.includes(skillId)
      return {
        ...current,
        [recordId]: {
          ...existingDetails,
          skillIds: hasSkill
            ? existingDetails.skillIds.filter((currentSkillId) => currentSkillId !== skillId)
            : [...existingDetails.skillIds, skillId],
        },
      }
    })
  }

  function toggleNewEducationSkill(skillId: number) {
    setNewEducationDetails((current) => ({
      ...current,
      skillIds: current.skillIds.includes(skillId)
        ? current.skillIds.filter((currentSkillId) => currentSkillId !== skillId)
        : [...current.skillIds, skillId],
    }))
  }

  function openCertificateDialog() {
    setCertificateDrafts(Object.fromEntries(certificates.map((certificate) => [certificate.id, certificate])))
    setNewCertificate(emptyCertificate)
    setIsCertificateDialogOpen(true)
  }

  function toggleCertificateSkill(recordId: number, skillId: number) {
    setCertificateDrafts((current) => {
      const certificate = current[recordId]
      if (!certificate) {
        return current
      }

      return {
        ...current,
        [recordId]: {
          ...certificate,
          skillIds: certificate.skillIds.includes(skillId)
            ? certificate.skillIds.filter((currentSkillId) => currentSkillId !== skillId)
            : [...certificate.skillIds, skillId],
        },
      }
    })
  }

  function toggleNewCertificateSkill(skillId: number) {
    setNewCertificate((current) => ({
      ...current,
      skillIds: current.skillIds.includes(skillId)
        ? current.skillIds.filter((currentSkillId) => currentSkillId !== skillId)
        : [...current.skillIds, skillId],
    }))
  }

  function openSkillsDialog() {
    setSkillDraftIds(skillsData.skills.map((skill) => skill.skill_id))
    setIsSkillsDialogOpen(true)
  }

  function toggleSkillDraft(skillId: number) {
    setSkillDraftIds((current) =>
      current.includes(skillId) ? current.filter((currentId) => currentId !== skillId) : [...current, skillId],
    )
  }

  async function handleSaveSkills() {
    const currentSkillIds = new Set(skillsData.skills.map((skill) => skill.skill_id))
    const nextSkillIds = new Set(skillDraftIds)
    const skillsToRemove = skillsData.skills.filter((skill) => !nextSkillIds.has(skill.skill_id))
    const skillsToAdd = skillDraftIds.filter((skillId) => !currentSkillIds.has(skillId))

    if (skillsToRemove.length === 0 && skillsToAdd.length === 0) {
      setIsSkillsDialogOpen(false)
      return
    }

    setSavingSkills(true)

    try {
      let updatedSkills = skillsData

      for (const skill of skillsToRemove) {
        updatedSkills = await apiRequest<StudentSkillsResponse>(`/student/skills/${skill.id}`, {
          method: 'DELETE',
          csrfToken,
        })
      }

      for (const skillId of skillsToAdd) {
        updatedSkills = await apiRequest<StudentSkillsResponse>('/student/skills', {
          method: 'POST',
          body: {
            skill_id: skillId,
            proficiency_level: 'beginner',
          },
          csrfToken,
        })
      }

      setSkillsData(updatedSkills)
      setSkillDraftIds(updatedSkills.skills.map((skill) => skill.skill_id))
      setIsSkillsDialogOpen(false)
      toast.success('Skills updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update skills.')
    } finally {
      setSavingSkills(false)
    }
  }

  function openExperienceDialog() {
    setExperienceDrafts(
      Object.fromEntries(profile.experience_records.map((record) => [record.id, toExperienceDraft(record)])),
    )
    setExperienceSkillDrafts(experienceSkills)
    setNewExperience(emptyExperienceDraft)
    setNewExperienceSkillIds([])
    setIsExperienceDialogOpen(true)
  }

  async function handleCreateExperience() {
    if (!newExperience.organization.trim() || !newExperience.role_title.trim() || !newExperience.start_date) {
      toast.error('Please complete the required experience fields.')
      return
    }

    setSavingExperience(true)
    try {
      const previousExperienceIds = new Set(profile.experience_records.map((record) => record.id))
      const response = await apiRequest<StudentProfile>('/student/profile/experience', {
        method: 'POST',
        body: normalizeExperienceDraft(newExperience),
        csrfToken,
      })
      syncProfile(response)
      const createdRecord = response.experience_records.find((record) => !previousExperienceIds.has(record.id))
      if (createdRecord) {
        try {
          persistExperienceSkills({
            ...experienceSkills,
            [createdRecord.id]: newExperienceSkillIds,
          })
        } catch {
          toast.error('Experience added, but skills could not be saved on this device.')
        }
      }
      setNewExperience(emptyExperienceDraft)
      setNewExperienceSkillIds([])
      toast.success('Experience added successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to add experience.')
    } finally {
      setSavingExperience(false)
    }
  }

  async function handleCreateEducation() {
    if (!newEducation.institution.trim() || !newEducation.field_of_study.trim() || !newEducation.start_date) {
      toast.error('Please complete the required education fields.')
      return
    }

    setSavingEducation(true)
    try {
      const previousEducationIds = new Set(profile.education_records.map((record) => record.id))
      const response = await apiRequest<StudentProfile>('/student/profile/education', {
        method: 'POST',
        body: normalizeEducationDraft(newEducation),
        csrfToken,
      })
      syncProfile(response)
      const createdRecord = response.education_records.find((record) => !previousEducationIds.has(record.id))
      if (createdRecord) {
        try {
          persistEducationDetails({
            ...educationDetails,
            [createdRecord.id]: newEducationDetails,
          })
        } catch {
          toast.error('Education added, but extra details could not be saved on this device.')
        }
      }
      setNewEducation(emptyEducationDraft)
      setNewEducationDetails(emptyEducationDetailDraft)
      toast.success('Education added successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to add education.')
    } finally {
      setSavingEducation(false)
    }
  }

  function handleCreateCertificate() {
    if (!newCertificate.name.trim() || !newCertificate.issuer.trim() || !newCertificate.issueDate) {
      toast.error('Please complete the required certificate fields.')
      return
    }

    setSavingCertificates(true)
    try {
      const createdCertificate: CertificateRecord = {
        ...newCertificate,
        id: Date.now(),
      }
      persistCertificates([...certificates, createdCertificate])
      setNewCertificate(emptyCertificate)
      toast.success('Certificate added successfully.')
    } catch {
      toast.error('Unable to save certificate on this device.')
    } finally {
      setSavingCertificates(false)
    }
  }

  function handleUpdateCertificate(recordId: number) {
    const draft = certificateDrafts[recordId]
    if (!draft || !draft.name.trim() || !draft.issuer.trim() || !draft.issueDate) {
      toast.error('Please complete the required certificate fields.')
      return
    }

    setSavingCertificates(true)
    try {
      persistCertificates(certificates.map((certificate) => (certificate.id === recordId ? draft : certificate)))
      toast.success('Certificate updated successfully.')
    } catch {
      toast.error('Unable to update certificate on this device.')
    } finally {
      setSavingCertificates(false)
    }
  }

  function handleDeleteCertificate(recordId: number) {
    setSavingCertificates(true)
    try {
      persistCertificates(certificates.filter((certificate) => certificate.id !== recordId))
      toast.success('Certificate removed successfully.')
    } catch {
      toast.error('Unable to remove certificate on this device.')
    } finally {
      setSavingCertificates(false)
    }
  }

  async function handleUpdateEducation(recordId: number) {
    const draft = educationDrafts[recordId]
    if (!draft || !draft.institution.trim() || !draft.field_of_study.trim() || !draft.start_date) {
      toast.error('Please complete the required education fields.')
      return
    }

    setSavingEducation(true)
    try {
      const response = await apiRequest<StudentProfile>(`/student/profile/education/${recordId}`, {
        method: 'PUT',
        body: normalizeEducationDraft(draft),
        csrfToken,
      })
      syncProfile(response)
      try {
        persistEducationDetails({
          ...educationDetails,
          [recordId]: educationDetailDrafts[recordId] ?? emptyEducationDetailDraft,
        })
      } catch {
        toast.error('Education updated, but extra details could not be saved on this device.')
      }
      toast.success('Education updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update education.')
    } finally {
      setSavingEducation(false)
    }
  }

  async function handleDeleteEducation(recordId: number) {
    setSavingEducation(true)
    try {
      const response = await apiRequest<StudentProfile>(`/student/profile/education/${recordId}`, {
        method: 'DELETE',
        csrfToken,
      })
      syncProfile(response)
      const nextEducationDetails = Object.fromEntries(
        Object.entries(educationDetails).filter(([currentRecordId]) => Number(currentRecordId) !== recordId),
      )
      try {
        persistEducationDetails(nextEducationDetails)
      } catch {
        toast.error('Education removed, but local details could not be updated on this device.')
      }
      toast.success('Education removed successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to remove education.')
    } finally {
      setSavingEducation(false)
    }
  }

  async function handleUpdateExperience(recordId: number) {
    const draft = experienceDrafts[recordId]
    if (!draft || !draft.organization.trim() || !draft.role_title.trim() || !draft.start_date) {
      toast.error('Please complete the required experience fields.')
      return
    }

    setSavingExperience(true)
    try {
      const response = await apiRequest<StudentProfile>(`/student/profile/experience/${recordId}`, {
        method: 'PUT',
        body: normalizeExperienceDraft(draft),
        csrfToken,
      })
      syncProfile(response)
      try {
        persistExperienceSkills({
          ...experienceSkills,
          [recordId]: experienceSkillDrafts[recordId] ?? [],
        })
      } catch {
        toast.error('Experience updated, but skills could not be saved on this device.')
      }
      toast.success('Experience updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update experience.')
    } finally {
      setSavingExperience(false)
    }
  }

  async function handleDeleteExperience(recordId: number) {
    setSavingExperience(true)
    try {
      const response = await apiRequest<StudentProfile>(`/student/profile/experience/${recordId}`, {
        method: 'DELETE',
        csrfToken,
      })
      syncProfile(response)
      const nextExperienceSkills = Object.fromEntries(
        Object.entries(experienceSkills).filter(([currentRecordId]) => Number(currentRecordId) !== recordId),
      )
      try {
        persistExperienceSkills(nextExperienceSkills)
      } catch {
        toast.error('Experience removed, but local skill tags could not be updated on this device.')
      }
      toast.success('Experience removed successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to remove experience.')
    } finally {
      setSavingExperience(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Profile</span>
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleImageSelection(event, 'coverImage')}
      />
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleImageSelection(event, 'profileImage')}
      />

      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit skills</DialogTitle>
            <DialogDescription>Select the skills you want to show on your profile.</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {skillsData.available_skills.map((skill) => {
              const checked = skillDraftIds.includes(skill.id)
              return (
                <label
                  key={skill.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-primary/30 hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSkillDraft(skill.id)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
              )
            })}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSkillsDialogOpen(false)} disabled={savingSkills}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveSkills()} disabled={savingSkills}>
              {savingSkills ? 'Saving…' : 'Save skills'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{hasEducation ? 'Manage education' : 'Add education'}</DialogTitle>
            <DialogDescription>Update your education history and add a new education entry from one place.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {profile.education_records.map((record) => {
              const draft = educationDrafts[record.id] ?? toEducationDraft(record)
              const detailDraft = educationDetailDrafts[record.id] ?? educationDetails[record.id] ?? emptyEducationDetailDraft

              return (
                <div key={record.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{record.institution || 'Education entry'}</h3>
                      <p className="text-sm text-slate-500">{record.field_of_study || 'Field of study'}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDeleteEducation(record.id)}
                      disabled={savingEducation}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Institution</label>
                      <Input
                        value={draft.institution}
                        onChange={(event) =>
                          setEducationDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, institution: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Field of study</label>
                      <Input
                        value={draft.field_of_study}
                        onChange={(event) =>
                          setEducationDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, field_of_study: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Start date</label>
                      <Input
                        type="date"
                        value={draft.start_date}
                        onChange={(event) =>
                          setEducationDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, start_date: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">End date</label>
                      <Input
                        type="date"
                        value={draft.end_date}
                        onChange={(event) =>
                          setEducationDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, end_date: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Completion status</label>
                      <select
                        value={draft.completion_status}
                        onChange={(event) =>
                          setEducationDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, completion_status: event.target.value },
                          }))
                        }
                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Grade</label>
                      <Input
                        value={detailDraft.grade}
                        onChange={(event) =>
                          setEducationDetailDrafts((current) => ({
                            ...current,
                            [record.id]: { ...detailDraft, grade: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Activities and societies</label>
                      <Input
                        value={detailDraft.activities}
                        onChange={(event) =>
                          setEducationDetailDrafts((current) => ({
                            ...current,
                            [record.id]: { ...detailDraft, activities: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <span className="text-xs text-slate-500">Extra details saved on this device</span>
                    </div>
                    <Textarea
                      rows={4}
                      value={detailDraft.description}
                      onChange={(event) =>
                        setEducationDetailDrafts((current) => ({
                          ...current,
                          [record.id]: { ...detailDraft, description: event.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Skills</label>
                    {skillsData.available_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skillsData.available_skills.map((skill) => {
                          const isSelected = detailDraft.skillIds.includes(skill.id)
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleEducationSkill(record.id, skill.id)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
                              }`}
                            >
                              {skill.name}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => void handleUpdateEducation(record.id)} disabled={savingEducation}>
                      {savingEducation ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              )
            })}

            <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add education</h3>
                <p className="text-sm text-slate-500">Create a new education entry for your profile.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Institution</label>
                  <Input value={newEducation.institution} onChange={(event) => setNewEducation({ ...newEducation, institution: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Field of study</label>
                  <Input
                    value={newEducation.field_of_study}
                    onChange={(event) => setNewEducation({ ...newEducation, field_of_study: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start date</label>
                  <Input type="date" value={newEducation.start_date} onChange={(event) => setNewEducation({ ...newEducation, start_date: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">End date</label>
                  <Input type="date" value={newEducation.end_date} onChange={(event) => setNewEducation({ ...newEducation, end_date: event.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Completion status</label>
                  <select
                    value={newEducation.completion_status}
                    onChange={(event) => setNewEducation({ ...newEducation, completion_status: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Grade</label>
                  <Input
                    value={newEducationDetails.grade}
                    onChange={(event) => setNewEducationDetails((current) => ({ ...current, grade: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Activities and societies</label>
                  <Input
                    value={newEducationDetails.activities}
                    onChange={(event) => setNewEducationDetails((current) => ({ ...current, activities: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <span className="text-xs text-slate-500">Extra details saved on this device</span>
                </div>
                <Textarea
                  rows={4}
                  value={newEducationDetails.description}
                  onChange={(event) => setNewEducationDetails((current) => ({ ...current, description: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Skills</label>
                {skillsData.available_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsData.available_skills.map((skill) => {
                      const isSelected = newEducationDetails.skillIds.includes(skill.id)
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleNewEducationSkill(skill.id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
                          }`}
                        >
                          {skill.name}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEducationDialogOpen(false)} disabled={savingEducation}>
              Close
            </Button>
            <Button type="button" onClick={() => void handleCreateEducation()} disabled={savingEducation}>
              {savingEducation ? 'Saving…' : 'Add education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCertificateDialogOpen} onOpenChange={setIsCertificateDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{hasCertificates ? 'Manage certificates' : 'Add certificate'}</DialogTitle>
            <DialogDescription>Update your certificates, licenses, and achievements from one place.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {certificates.map((certificate) => {
              const draft = certificateDrafts[certificate.id] ?? certificate
              return (
                <div key={certificate.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{draft.name || 'Certificate entry'}</h3>
                      <p className="text-sm text-slate-500">{draft.issuer || 'Issuer'}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCertificate(certificate.id)}
                      disabled={savingCertificates}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Certificate name</label>
                      <Input
                        value={draft.name}
                        onChange={(event) =>
                          setCertificateDrafts((current) => ({
                            ...current,
                            [certificate.id]: { ...draft, name: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Issuer</label>
                      <Input
                        value={draft.issuer}
                        onChange={(event) =>
                          setCertificateDrafts((current) => ({
                            ...current,
                            [certificate.id]: { ...draft, issuer: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Issue date</label>
                      <Input
                        type="date"
                        value={draft.issueDate}
                        onChange={(event) =>
                          setCertificateDrafts((current) => ({
                            ...current,
                            [certificate.id]: { ...draft, issueDate: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Expiry date</label>
                      <Input
                        type="date"
                        value={draft.expiryDate}
                        onChange={(event) =>
                          setCertificateDrafts((current) => ({
                            ...current,
                            [certificate.id]: { ...draft, expiryDate: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Credential ID</label>
                      <Input
                        value={draft.credentialId}
                        onChange={(event) =>
                          setCertificateDrafts((current) => ({
                            ...current,
                            [certificate.id]: { ...draft, credentialId: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Credential URL</label>
                      <Input
                        type="url"
                        value={draft.credentialUrl}
                        onChange={(event) =>
                          setCertificateDrafts((current) => ({
                            ...current,
                            [certificate.id]: { ...draft, credentialUrl: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <Textarea
                      rows={4}
                      value={draft.description}
                      onChange={(event) =>
                        setCertificateDrafts((current) => ({
                          ...current,
                          [certificate.id]: { ...draft, description: event.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Skills</label>
                    {skillsData.available_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skillsData.available_skills.map((skill) => {
                          const isSelected = draft.skillIds.includes(skill.id)
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleCertificateSkill(certificate.id, skill.id)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
                              }`}
                            >
                              {skill.name}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => handleUpdateCertificate(certificate.id)} disabled={savingCertificates}>
                      {savingCertificates ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              )
            })}

            <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add certificate</h3>
                <p className="text-sm text-slate-500">Create a new certificate entry for your profile.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Certificate name</label>
                  <Input value={newCertificate.name} onChange={(event) => setNewCertificate({ ...newCertificate, name: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Issuer</label>
                  <Input value={newCertificate.issuer} onChange={(event) => setNewCertificate({ ...newCertificate, issuer: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Issue date</label>
                  <Input type="date" value={newCertificate.issueDate} onChange={(event) => setNewCertificate({ ...newCertificate, issueDate: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expiry date</label>
                  <Input type="date" value={newCertificate.expiryDate} onChange={(event) => setNewCertificate({ ...newCertificate, expiryDate: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Credential ID</label>
                  <Input value={newCertificate.credentialId} onChange={(event) => setNewCertificate({ ...newCertificate, credentialId: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Credential URL</label>
                  <Input type="url" value={newCertificate.credentialUrl} onChange={(event) => setNewCertificate({ ...newCertificate, credentialUrl: event.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea
                  rows={4}
                  value={newCertificate.description}
                  onChange={(event) => setNewCertificate({ ...newCertificate, description: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Skills</label>
                {skillsData.available_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsData.available_skills.map((skill) => {
                      const isSelected = newCertificate.skillIds.includes(skill.id)
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleNewCertificateSkill(skill.id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
                          }`}
                        >
                          {skill.name}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCertificateDialogOpen(false)} disabled={savingCertificates}>
              Close
            </Button>
            <Button type="button" onClick={handleCreateCertificate} disabled={savingCertificates}>
              {savingCertificates ? 'Saving…' : 'Add certificate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{hasExperience ? 'Edit experience' : 'Add experience'}</DialogTitle>
            <DialogDescription>Manage your work history and add a new experience entry from one place.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {profile.experience_records.map((record) => {
              const draft = experienceDrafts[record.id] ?? toExperienceDraft(record)
              return (
                <div key={record.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{record.role_title || 'Experience entry'}</h3>
                      <p className="text-sm text-slate-500">{record.organization || 'Organization'}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDeleteExperience(record.id)}
                      disabled={savingExperience}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Title</label>
                      <Input
                        value={draft?.role_title ?? ''}
                        onChange={(event) =>
                          setExperienceDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, role_title: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Company or organization</label>
                      <Input
                        value={draft?.organization ?? ''}
                        onChange={(event) =>
                          setExperienceDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, organization: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Experience type</label>
                      <select
                        value={draft?.experience_type ?? 'work'}
                        onChange={(event) =>
                          setExperienceDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, experience_type: event.target.value },
                          }))
                        }
                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="work">Work</option>
                        <option value="internship">Internship</option>
                        <option value="project">Project</option>
                        <option value="freelance">Freelance</option>
                        <option value="volunteer">Volunteer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Start date</label>
                      <Input
                        type="date"
                        value={draft?.start_date ?? ''}
                        onChange={(event) =>
                          setExperienceDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, start_date: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">End date</label>
                      <Input
                        type="date"
                        disabled={draft?.is_current}
                        value={draft?.end_date ?? ''}
                        onChange={(event) =>
                          setExperienceDrafts((current) => ({
                            ...current,
                            [record.id]: { ...draft, end_date: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 md:self-end">
                      <input
                        type="checkbox"
                        checked={draft?.is_current ?? false}
                        onChange={(event) =>
                          setExperienceDrafts((current) => ({
                            ...current,
                            [record.id]: {
                              ...draft,
                              is_current: event.target.checked,
                              end_date: event.target.checked ? '' : draft?.end_date ?? '',
                            },
                          }))
                        }
                      />
                      I am currently working in this role
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <Textarea
                      rows={5}
                      value={draft?.summary ?? ''}
                      onChange={(event) =>
                        setExperienceDrafts((current) => ({
                          ...current,
                          [record.id]: { ...draft, summary: event.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-slate-700">Skills</label>
                      <span className="text-xs text-slate-500">Saved on this device</span>
                    </div>
                    {skillsData.available_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skillsData.available_skills.map((skill) => {
                          const selectedSkillIds = experienceSkillDrafts[record.id] ?? experienceSkills[record.id] ?? []
                          const isSelected = selectedSkillIds.includes(skill.id)
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleExperienceSkill(record.id, skill.id)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
                              }`}
                            >
                              {skill.name}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => void handleUpdateExperience(record.id)} disabled={savingExperience}>
                      {savingExperience ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </div>
              )
            })}

            <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add experience</h3>
                <p className="text-sm text-slate-500">Create a new work history entry for your profile.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <Input value={newExperience.role_title} onChange={(event) => setNewExperience({ ...newExperience, role_title: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Company or organization</label>
                  <Input
                    value={newExperience.organization}
                    onChange={(event) => setNewExperience({ ...newExperience, organization: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Experience type</label>
                  <select
                    value={newExperience.experience_type}
                    onChange={(event) => setNewExperience({ ...newExperience, experience_type: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="work">Work</option>
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                    <option value="freelance">Freelance</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start date</label>
                  <Input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(event) => setNewExperience({ ...newExperience, start_date: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">End date</label>
                  <Input
                    type="date"
                    disabled={newExperience.is_current}
                    value={newExperience.end_date}
                    onChange={(event) => setNewExperience({ ...newExperience, end_date: event.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 md:self-end">
                  <input
                    type="checkbox"
                    checked={newExperience.is_current}
                    onChange={(event) =>
                      setNewExperience({
                        ...newExperience,
                        is_current: event.target.checked,
                        end_date: event.target.checked ? '' : newExperience.end_date,
                      })
                    }
                  />
                  I am currently working in this role
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea
                  rows={5}
                  value={newExperience.summary}
                  onChange={(event) => setNewExperience({ ...newExperience, summary: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-slate-700">Skills</label>
                  <span className="text-xs text-slate-500">Saved on this device</span>
                </div>
                {skillsData.available_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsData.available_skills.map((skill) => {
                      const isSelected = newExperienceSkillIds.includes(skill.id)
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleNewExperienceSkill(skill.id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-slate-900'
                          }`}
                        >
                          {skill.name}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Add profile skills first to tag them here.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsExperienceDialogOpen(false)} disabled={savingExperience}>
              Close
            </Button>
            <Button type="button" onClick={() => void handleCreateExperience()} disabled={savingExperience}>
              {savingExperience ? 'Saving…' : 'Add experience'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm pt-0">
        <div className="relative">
          <div className="relative h-40 overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-sky-500 md:h-52">
            {draftImages.coverImage ? (
              <img src={draftImages.coverImage} alt="Cover preview" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />
            <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10" />
            <button
              type="button"
              onClick={openCoverPicker}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Upload cover image"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <ImageIcon className="h-3.5 w-3.5" />
              Cover image
            </div>
          </div>

          <div className="absolute left-6 top-full -translate-y-1/2">
            <div className="relative rounded-full border-4 border-white bg-white shadow-lg">
              <Avatar className="h-28 w-28 md:h-32 md:w-32">
                {draftImages.profileImage ? <AvatarImage src={draftImages.profileImage} alt={`${displayName} profile`} /> : null}
                <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={openProfilePicker}
                className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm transition hover:bg-slate-700"
                aria-label="Upload profile image"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <CardContent className="pt-18 md:pt-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                {isEditingName ? (
                  <div className="space-y-3">
                    <Input
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void handleSaveName()
                        }
                        if (event.key === 'Escape') {
                          handleCancelNameEdit()
                        }
                      }}
                      className="h-14 max-w-2xl text-2xl font-bold md:h-16 md:text-4xl"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void handleSaveName()} disabled={savingName}>
                        {savingName ? 'Saving…' : 'Save name'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelNameEdit} disabled={savingName}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="inline-flex items-center gap-3 text-left text-5xl leading-none font-black tracking-tight text-slate-900 transition hover:text-primary md:text-6xl lg:text-7xl"
                    style={{ fontSize: 'xx-large' }}
                  >
                    <span>{displayName}</span>
                    <Pencil className="h-5 w-5 flex-shrink-0" />
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  {user?.email ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Student workspace
                  </span>
                </div>
                <div className="flex flex-wrap items-start gap-3 pt-1">
                  <p className="max-w-3xl text-sm leading-7 text-slate-700">
                    {skillSummary || 'Add skills to highlight your strengths on your profile.'}
                  </p>
                  <button
                    type="button"
                    onClick={openSkillsDialog}
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Edit skills"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

            {hasUnsavedChanges ? (
              <Button type="button" onClick={handleSaveImages} disabled={saving} className="min-w-28">
                {saving ? 'Saving…' : 'Save'}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-1">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">About</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingAbout(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Edit about me"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {isEditingAbout ? (
            <div className="space-y-4">
              <Textarea
                value={aboutDraft}
                onChange={(event) => setAboutDraft(event.target.value)}
                rows={8}
                className="resize-none"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleSaveAbout} disabled={savingAbout}>
                  {savingAbout ? 'Saving…' : 'Save about'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelAboutEdit} disabled={savingAbout}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{displayedAbout}</p>
              {shouldShowAboutToggle ? (
                <button
                  type="button"
                  onClick={() => setIsAboutExpanded((current) => !current)}
                  className="text-sm font-medium text-primary transition hover:underline"
                >
                  {isAboutExpanded ? 'Show less' : 'Show more'}
                </button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Certificates</h2>
              <p className="mt-1 text-sm text-slate-500">Show certifications, licenses, and verified achievements.</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openCertificateDialog}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Add certificate"
              >
                <Plus className="h-5 w-5" />
              </button>
              {hasCertificates ? (
                <button
                  type="button"
                  onClick={openCertificateDialog}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Edit certificates"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {hasCertificates ? (
            <div className="space-y-5">
              {certificates.map((certificate) => {
                const skillNames = certificate.skillIds.map((skillId) => skillNameById.get(skillId)).filter(Boolean)
                return (
                  <div key={certificate.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{certificate.name}</p>
                          <p className="text-sm text-slate-600">{certificate.issuer}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-sm text-slate-500">
                            {formatExperienceDate(certificate.issueDate)}
                            {certificate.expiryDate ? ` - ${formatExperienceDate(certificate.expiryDate)}` : ''}
                          </p>
                          {certificate.credentialId ? (
                            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              ID: {certificate.credentialId}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {certificate.description ? (
                        <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{certificate.description}</p>
                      ) : null}
                      {certificate.credentialUrl ? (
                        <a
                          href={certificate.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-sm font-medium text-primary transition hover:underline"
                        >
                          View credential
                        </a>
                      ) : null}
                      {skillNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {skillNames.map((skillName) => (
                            <span
                              key={`${certificate.id}-${skillName}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                            >
                              {skillName}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No certificates added yet.</p>
              <p className="mt-1 text-sm text-slate-500">Add certificates to highlight your verified achievements.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Experience</h2>
              <p className="mt-1 text-sm text-slate-500">Show your professional background, projects, and recent work.</p>
            </div>
            <button
              type="button"
              onClick={openExperienceDialog}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={hasExperience ? 'Edit experience' : 'Add experience'}
            >
              {hasExperience ? <Pencil className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>

          {hasExperience ? (
            <div className="space-y-5">
              {profile.experience_records.map((record, index) => (
                <div key={record.id} className="relative pl-14">
                  {index < profile.experience_records.length - 1 ? (
                    <div className="absolute left-[19px] top-12 h-[calc(100%-0.5rem)] w-px bg-slate-200" />
                  ) : null}
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{record.role_title}</p>
                          {record.is_current ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Current
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-500">
                          {record.organization} · {formatExperienceType(record.experience_type)}
                        </p>
                      </div>
                      <span className="text-sm text-slate-500">
                        {formatExperienceDate(record.start_date)} - {record.is_current ? 'Present' : formatExperienceDate(record.end_date)}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{record.summary || 'No experience summary added yet.'}</p>
                    {(experienceSkills[record.id] ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(experienceSkills[record.id] ?? [])
                          .map((skillId) => skillNameById.get(skillId))
                          .filter((skillName): skillName is string => Boolean(skillName))
                          .map((skillName) => (
                            <span
                              key={`${record.id}-${skillName}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                            >
                              {skillName}
                            </span>
                          ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No experience added yet.</p>
              <p className="mt-1 text-sm text-slate-500">Add experience records to highlight your background on your profile.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Education</h2>
              <p className="mt-1 text-sm text-slate-500">Show your academic background, training, and study achievements.</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openEducationDialog}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Add education"
              >
                <Plus className="h-5 w-5" />
              </button>
              {hasEducation ? (
                <button
                  type="button"
                  onClick={openEducationDialog}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Edit education"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {hasEducation ? (
            <div className="space-y-5">
              {profile.education_records.map((record) => {
                const educationDetail = educationDetails[record.id] ?? emptyEducationDetailDraft
                const skillNames = educationDetail.skillIds.map((skillId) => skillNameById.get(skillId)).filter(Boolean)

                return (
                  <div key={record.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{record.institution}</p>
                          <p className="text-sm text-slate-600">{record.field_of_study}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-sm text-slate-500">
                            {formatExperienceDate(record.start_date)} - {record.end_date ? formatExperienceDate(record.end_date) : 'Present'}
                          </p>
                          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                            {formatCompletionStatus(record.completion_status)}
                          </span>
                        </div>
                      </div>

                      {educationDetail.grade ? <p className="text-sm text-slate-700">Grade: {educationDetail.grade}</p> : null}
                      {educationDetail.activities ? (
                        <p className="text-sm text-slate-700">Activities and societies: {educationDetail.activities}</p>
                      ) : null}
                      {educationDetail.description ? (
                        <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{educationDetail.description}</p>
                      ) : null}
                      {skillNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {skillNames.map((skillName) => (
                            <span
                              key={`${record.id}-${skillName}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                            >
                              {skillName}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No education added yet.</p>
              <p className="mt-1 text-sm text-slate-500">Add your education history to highlight your academic background.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
