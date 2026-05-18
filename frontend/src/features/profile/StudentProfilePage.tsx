import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useAuth } from '../../auth/useAuth'
import { Link } from 'react-router-dom'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentProfile, StudentSkillsResponse } from './types'
import { Award, BriefcaseBusiness, ChevronRight, GraduationCap, Image as ImageIcon, Mail, MapPin, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { emitStoredProfileImages, type StoredProfileImages } from '@/lib/profileImages'
import {
  CertificateDialog,
  EducationDialog,
  ExperienceDialog,
  SkillsDialog,
} from './student-profile/StudentProfileDialogs'
import {
  aboutPreviewLimit,
  buildCertificateRecords,
  buildEducationDetailMap,
  buildExperienceSkillMap,
  defaultAboutMe,
  emptyCertificate,
  emptyEducationDetailDraft,
  emptyEducationDraft,
  emptyExperienceDraft,
  emptyProfile,
  emptySkillsResponse,
  formatCompletionStatus,
  formatExperienceDate,
  formatExperienceType,
  getInitials,
  normalizeEducationDraft,
  normalizeExperienceDraft,
  readImageFile,
  toEducationDraft,
  toExperienceDraft,
  toStoredProfileImages,
  type CertificateRecord,
  type EducationDetailDraft,
  type EducationDetailMap,
  type EducationDraft,
  type ExperienceDraft,
  type ExperienceSkillMap,
} from './student-profile/shared'

export function StudentProfilePage() {
  const { user, csrfToken, refreshSession } = useAuth()
  const displayName = user?.name?.trim() || 'Student Profile'
  const initials = getInitials(displayName)
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
  const [expandedExperienceIds, setExpandedExperienceIds] = useState<number[]>([])
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
        setAboutMe(profileData.about_me || defaultAboutMe)
        setAboutDraft(profileData.about_me || defaultAboutMe)
        setIsAboutExpanded(false)
        setSavedImages(toStoredProfileImages(profileData))
        setDraftImages(toStoredProfileImages(profileData))
        const nextEducationDetails = buildEducationDetailMap(profileData.education_records)
        setEducationDetails(nextEducationDetails)
        setEducationDetailDrafts(nextEducationDetails)
        const nextExperienceSkills = buildExperienceSkillMap(profileData.experience_records)
        setExperienceSkills(nextExperienceSkills)
        setExperienceSkillDrafts(nextExperienceSkills)
        const nextCertificates = buildCertificateRecords(profileData.certificates)
        setCertificates(nextCertificates)
        setCertificateDrafts(Object.fromEntries(nextCertificates.map((certificate) => [certificate.id, certificate])))
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

  function buildStudentProfilePayload(overrides?: Partial<{
    name: string
    about_me: string
    profile_image: string
    cover_image: string
  }>) {
    return {
      name: overrides?.name ?? (profile.name || displayName),
      desired_job_type: profile.desired_job_type,
      desired_work_location: profile.desired_work_location,
      japanese_level: profile.japanese_level,
      english_level: profile.english_level,
      about_me: overrides?.about_me ?? (aboutMe === defaultAboutMe ? '' : aboutMe),
      profile_image: overrides?.profile_image ?? (savedImages.profileImage ?? ''),
      cover_image: overrides?.cover_image ?? (savedImages.coverImage ?? ''),
    }
  }

  function syncProfile(updatedProfile: StudentProfile) {
    setProfile(updatedProfile)
    setEducationDrafts(
      Object.fromEntries(updatedProfile.education_records.map((record) => [record.id, toEducationDraft(record)])),
    )
    const nextEducationDetails = buildEducationDetailMap(updatedProfile.education_records)
    setEducationDetails(nextEducationDetails)
    setEducationDetailDrafts(nextEducationDetails)
    setExperienceDrafts(
      Object.fromEntries(updatedProfile.experience_records.map((record) => [record.id, toExperienceDraft(record)])),
    )
    const nextExperienceSkills = buildExperienceSkillMap(updatedProfile.experience_records)
    setExperienceSkills(nextExperienceSkills)
    setExperienceSkillDrafts(nextExperienceSkills)
    const nextCertificates = buildCertificateRecords(updatedProfile.certificates)
    setCertificates(nextCertificates)
    setCertificateDrafts(Object.fromEntries(nextCertificates.map((certificate) => [certificate.id, certificate])))
    setNameDraft(updatedProfile.name || displayName)
    setExpandedExperienceIds((current) =>
      current.filter((recordId) => updatedProfile.experience_records.some((record) => record.id === recordId)),
    )
  }

  async function handleSaveImages() {
    setSaving(true)

    try {
      const response = await apiRequest<StudentProfile>('/student/profile', {
        method: 'PUT',
        body: buildStudentProfilePayload({
          profile_image: draftImages.profileImage ?? '',
          cover_image: draftImages.coverImage ?? '',
        }),
        csrfToken,
      })
      syncProfile(response)
      const nextImages = toStoredProfileImages(response)
      setSavedImages(nextImages)
      setDraftImages(nextImages)
      emitStoredProfileImages(user?.user_id, nextImages)
      toast.success('Profile images saved successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to save profile images.')
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
        body: buildStudentProfilePayload({ name: trimmedName }),
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

  async function handleSaveAbout() {
    const trimmedAbout = aboutDraft.trim()
    if (!trimmedAbout) {
      toast.error('About me cannot be empty.')
      return
    }

    setSavingAbout(true)

    try {
      const response = await apiRequest<StudentProfile>('/student/profile', {
        method: 'PUT',
        body: buildStudentProfilePayload({ about_me: trimmedAbout }),
        csrfToken,
      })
      syncProfile(response)
      const nextAbout = response.about_me || defaultAboutMe
      setAboutMe(nextAbout)
      setAboutDraft(nextAbout)
      setIsEditingAbout(false)
      toast.success('About me saved successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to save your about me section.')
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
        body: {
          ...normalizeExperienceDraft(newExperience),
          skill_ids: newExperienceSkillIds,
        },
        csrfToken,
      })
      syncProfile(response)
      const createdRecord = response.experience_records.find((record) => !previousExperienceIds.has(record.id))
      if (createdRecord) {
        setExpandedExperienceIds((current) => current.filter((recordId) => recordId !== createdRecord.id))
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
      const response = await apiRequest<StudentProfile>('/student/profile/education', {
        method: 'POST',
        body: {
          ...normalizeEducationDraft(newEducation),
          grade: newEducationDetails.grade,
          activities: newEducationDetails.activities,
          description: newEducationDetails.description,
          skill_ids: newEducationDetails.skillIds,
        },
        csrfToken,
      })
      syncProfile(response)
      setNewEducation(emptyEducationDraft)
      setNewEducationDetails(emptyEducationDetailDraft)
      toast.success('Education added successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to add education.')
    } finally {
      setSavingEducation(false)
    }
  }

  async function handleCreateCertificate() {
    if (!newCertificate.name.trim() || !newCertificate.issuer.trim() || !newCertificate.issueDate) {
      toast.error('Please complete the required certificate fields.')
      return
    }

    setSavingCertificates(true)
    try {
      const response = await apiRequest<StudentProfile>('/student/profile/certificates', {
        method: 'POST',
        body: {
          name: newCertificate.name,
          issuer: newCertificate.issuer,
          issue_date: newCertificate.issueDate,
          expiry_date: newCertificate.expiryDate || null,
          credential_id: newCertificate.credentialId,
          credential_url: newCertificate.credentialUrl,
          description: newCertificate.description,
          skill_ids: newCertificate.skillIds,
        },
        csrfToken,
      })
      syncProfile(response)
      setNewCertificate(emptyCertificate)
      toast.success('Certificate added successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to save certificate.')
    } finally {
      setSavingCertificates(false)
    }
  }

  async function handleUpdateCertificate(recordId: number) {
    const draft = certificateDrafts[recordId]
    if (!draft || !draft.name.trim() || !draft.issuer.trim() || !draft.issueDate) {
      toast.error('Please complete the required certificate fields.')
      return
    }

    setSavingCertificates(true)
    try {
      const response = await apiRequest<StudentProfile>(`/student/profile/certificates/${recordId}`, {
        method: 'PUT',
        body: {
          name: draft.name,
          issuer: draft.issuer,
          issue_date: draft.issueDate,
          expiry_date: draft.expiryDate || null,
          credential_id: draft.credentialId,
          credential_url: draft.credentialUrl,
          description: draft.description,
          skill_ids: draft.skillIds,
        },
        csrfToken,
      })
      syncProfile(response)
      toast.success('Certificate updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update certificate.')
    } finally {
      setSavingCertificates(false)
    }
  }

  async function handleDeleteCertificate(recordId: number) {
    setSavingCertificates(true)
    try {
      const response = await apiRequest<StudentProfile>(`/student/profile/certificates/${recordId}`, {
        method: 'DELETE',
        csrfToken,
      })
      syncProfile(response)
      toast.success('Certificate removed successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to remove certificate.')
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
        body: {
          ...normalizeEducationDraft(draft),
          grade: (educationDetailDrafts[recordId] ?? emptyEducationDetailDraft).grade,
          activities: (educationDetailDrafts[recordId] ?? emptyEducationDetailDraft).activities,
          description: (educationDetailDrafts[recordId] ?? emptyEducationDetailDraft).description,
          skill_ids: (educationDetailDrafts[recordId] ?? emptyEducationDetailDraft).skillIds,
        },
        csrfToken,
      })
      syncProfile(response)
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
        body: {
          ...normalizeExperienceDraft(draft),
          skill_ids: experienceSkillDrafts[recordId] ?? [],
        },
        csrfToken,
      })
      syncProfile(response)
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

      <SkillsDialog
        open={isSkillsDialogOpen}
        onOpenChange={setIsSkillsDialogOpen}
        availableSkills={skillsData.available_skills}
        skillDraftIds={skillDraftIds}
        saving={savingSkills}
        onToggleSkillDraft={toggleSkillDraft}
        onSave={() => void handleSaveSkills()}
      />

      <EducationDialog
        open={isEducationDialogOpen}
        onOpenChange={setIsEducationDialogOpen}
        hasEducation={hasEducation}
        records={profile.education_records}
        educationDrafts={educationDrafts}
        setEducationDrafts={setEducationDrafts}
        educationDetails={educationDetails}
        educationDetailDrafts={educationDetailDrafts}
        setEducationDetailDrafts={setEducationDetailDrafts}
        newEducation={newEducation}
        setNewEducation={setNewEducation}
        newEducationDetails={newEducationDetails}
        setNewEducationDetails={setNewEducationDetails}
        availableSkills={skillsData.available_skills}
        saving={savingEducation}
        onToggleEducationSkill={toggleEducationSkill}
        onToggleNewEducationSkill={toggleNewEducationSkill}
        onDeleteEducation={(recordId) => void handleDeleteEducation(recordId)}
        onUpdateEducation={(recordId) => void handleUpdateEducation(recordId)}
        onCreateEducation={() => void handleCreateEducation()}
      />

      <CertificateDialog
        open={isCertificateDialogOpen}
        onOpenChange={setIsCertificateDialogOpen}
        hasCertificates={hasCertificates}
        certificates={certificates}
        certificateDrafts={certificateDrafts}
        setCertificateDrafts={setCertificateDrafts}
        newCertificate={newCertificate}
        setNewCertificate={setNewCertificate}
        availableSkills={skillsData.available_skills}
        saving={savingCertificates}
        onToggleCertificateSkill={toggleCertificateSkill}
        onToggleNewCertificateSkill={toggleNewCertificateSkill}
        onDeleteCertificate={handleDeleteCertificate}
        onUpdateCertificate={(recordId) => void handleUpdateCertificate(recordId)}
        onCreateCertificate={() => void handleCreateCertificate()}
      />

      <ExperienceDialog
        open={isExperienceDialogOpen}
        onOpenChange={setIsExperienceDialogOpen}
        hasExperience={hasExperience}
        records={profile.experience_records}
        experienceDrafts={experienceDrafts}
        setExperienceDrafts={setExperienceDrafts}
        experienceSkills={experienceSkills}
        experienceSkillDrafts={experienceSkillDrafts}
        newExperience={newExperience}
        setNewExperience={setNewExperience}
        newExperienceSkillIds={newExperienceSkillIds}
        availableSkills={skillsData.available_skills}
        saving={savingExperience}
        onToggleExperienceSkill={toggleExperienceSkill}
        onToggleNewExperienceSkill={toggleNewExperienceSkill}
        onDeleteExperience={(recordId) => void handleDeleteExperience(recordId)}
        onUpdateExperience={(recordId) => void handleUpdateExperience(recordId)}
        onCreateExperience={() => void handleCreateExperience()}
      />

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
                (() => {
                  const shouldShowExperienceToggle = record.summary.length > aboutPreviewLimit
                  const isExperienceExpanded = expandedExperienceIds.includes(record.id)
                  const displayedExperienceSummary =
                    isExperienceExpanded || !shouldShowExperienceToggle
                      ? record.summary
                      : `${record.summary.slice(0, aboutPreviewLimit).trimEnd()}...`

                  return (
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
                        <div className="space-y-3">
                          <p className="text-sm leading-6 text-slate-600">{displayedExperienceSummary || 'No experience summary added yet.'}</p>
                          {shouldShowExperienceToggle ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedExperienceIds((current) =>
                                  current.includes(record.id)
                                    ? current.filter((recordId) => recordId !== record.id)
                                    : [...current, record.id],
                                )
                              }
                              className="text-sm font-medium text-primary transition hover:underline"
                            >
                              {isExperienceExpanded ? 'Show less' : 'Show more'}
                            </button>
                          ) : null}
                        </div>
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
                  )
                })()
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
