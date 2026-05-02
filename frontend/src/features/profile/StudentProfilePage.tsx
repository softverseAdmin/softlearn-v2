import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, GraduationCap, Briefcase, FileText, Clock, Plus, Trash2 } from 'lucide-react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type {
  StudentAvailabilityProfile,
  StudentEducationRecord,
  StudentExperienceRecord,
  StudentProfile,
  StudentResumeRecord,
} from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type EducationDraft = Omit<StudentEducationRecord, 'id'> & { end_date: string }
type ExperienceDraft = Omit<StudentExperienceRecord, 'id'> & { end_date: string }
type ResumeDraft = Omit<StudentResumeRecord, 'id' | 'created_at' | 'updated_at'>
type AvailabilityDraft = Omit<StudentAvailabilityProfile, 'availability_set' | 'updated_at'> & {
  earliest_start_date: string
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

const emptyEducationDraft: EducationDraft = {
  institution: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  completion_status: 'in_progress',
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

const emptyResumeDraft: ResumeDraft = {
  display_name: '',
  file_name: '',
  source_type: 'manual',
  is_active: true,
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

function toResumeDraft(record: StudentResumeRecord): ResumeDraft {
  return {
    display_name: record.display_name,
    file_name: record.file_name,
    source_type: record.source_type,
    is_active: record.is_active,
  }
}

function toAvailabilityDraft(profile: StudentAvailabilityProfile): AvailabilityDraft {
  return {
    job_search_status: profile.job_search_status,
    earliest_start_date: profile.earliest_start_date ?? '',
    interview_availability: profile.interview_availability,
    scheduling_notes: profile.scheduling_notes,
  }
}

export function StudentProfilePage() {
  const { csrfToken, refreshSession } = useAuth()
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile)
  const [educationDrafts, setEducationDrafts] = useState<Record<number, EducationDraft>>({})
  const [experienceDrafts, setExperienceDrafts] = useState<Record<number, ExperienceDraft>>({})
  const [resumeDrafts, setResumeDrafts] = useState<Record<number, ResumeDraft>>({})
  const [newEducation, setNewEducation] = useState<EducationDraft>(emptyEducationDraft)
  const [newExperience, setNewExperience] = useState<ExperienceDraft>(emptyExperienceDraft)
  const [newResume, setNewResume] = useState<ResumeDraft>(emptyResumeDraft)
  const [availabilityDraft, setAvailabilityDraft] = useState<AvailabilityDraft>(toAvailabilityDraft(emptyProfile.availability))
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function run() {
      try {
        const data = await apiRequest<StudentProfile>('/student/profile')
        if (!active) return
        setProfile(data)
        setEducationDrafts(Object.fromEntries(data.education_records.map((record) => [record.id, toEducationDraft(record)])))
        setExperienceDrafts(Object.fromEntries(data.experience_records.map((record) => [record.id, toExperienceDraft(record)])))
        setResumeDrafts(Object.fromEntries(data.resumes.map((record) => [record.id, toResumeDraft(record)])))
        setAvailabilityDraft(toAvailabilityDraft(data.availability))
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load profile.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [])

  async function runMutation(
    busyLabel: string,
    action: () => Promise<StudentProfile>,
    successMessage: string,
    shouldRefreshSession = false,
  ) {
    setBusyKey(busyLabel)
    setError(null)
    setSuccess(null)
    try {
      const updatedProfile = await action()
      setProfile(updatedProfile)
      setEducationDrafts(
        Object.fromEntries(updatedProfile.education_records.map((record) => [record.id, toEducationDraft(record)])),
      )
      setExperienceDrafts(
        Object.fromEntries(updatedProfile.experience_records.map((record) => [record.id, toExperienceDraft(record)])),
      )
      setResumeDrafts(Object.fromEntries(updatedProfile.resumes.map((record) => [record.id, toResumeDraft(record)])))
      setAvailabilityDraft(toAvailabilityDraft(updatedProfile.availability))
      if (shouldRefreshSession) {
        await refreshSession()
      }
      setSuccess(successMessage)
    } catch (mutationError) {
      setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to save profile changes.')
    } finally {
      setBusyKey(null)
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await runMutation(
      'profile',
      () =>
        apiRequest<StudentProfile>('/student/profile', {
          method: 'PUT',
          body: {
            name: profile.name,
            desired_job_type: profile.desired_job_type,
            desired_work_location: profile.desired_work_location,
            japanese_level: profile.japanese_level,
            english_level: profile.english_level,
          },
          csrfToken,
        }),
      'Basic profile updated successfully.',
      true,
    )
  }

  async function createEducation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await runMutation(
      'create-education',
      () =>
        apiRequest<StudentProfile>('/student/profile/education', {
          method: 'POST',
          body: { ...newEducation, end_date: newEducation.end_date || null },
          csrfToken,
        }),
      'Education record added.',
    )
    setNewEducation(emptyEducationDraft)
  }

  async function saveEducation(recordId: number) {
    const draft = educationDrafts[recordId]
    await runMutation(
      `education-${recordId}`,
      () =>
        apiRequest<StudentProfile>(`/student/profile/education/${recordId}`, {
          method: 'PUT',
          body: { ...draft, end_date: draft.end_date || null },
          csrfToken,
        }),
      'Education record updated.',
    )
  }

  async function deleteEducation(recordId: number) {
    await runMutation(
      `delete-education-${recordId}`,
      () =>
        apiRequest<StudentProfile>(`/student/profile/education/${recordId}`, {
          method: 'DELETE',
          csrfToken,
        }),
      'Education record removed.',
    )
  }

  async function createExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await runMutation(
      'create-experience',
      () =>
        apiRequest<StudentProfile>('/student/profile/experience', {
          method: 'POST',
          body: { ...newExperience, end_date: newExperience.end_date || null },
          csrfToken,
        }),
      'Experience record added.',
    )
    setNewExperience(emptyExperienceDraft)
  }

  async function saveExperience(recordId: number) {
    const draft = educationFreeCurrentEndDate(experienceDrafts[recordId])
    await runMutation(
      `experience-${recordId}`,
      () =>
        apiRequest<StudentProfile>(`/student/profile/experience/${recordId}`, {
          method: 'PUT',
          body: { ...draft, end_date: draft.end_date || null },
          csrfToken,
        }),
      'Experience record updated.',
    )
  }

  async function deleteExperience(recordId: number) {
    await runMutation(
      `delete-experience-${recordId}`,
      () =>
        apiRequest<StudentProfile>(`/student/profile/experience/${recordId}`, {
          method: 'DELETE',
          csrfToken,
        }),
      'Experience record removed.',
    )
  }

  async function createResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await runMutation(
      'create-resume',
      () =>
        apiRequest<StudentProfile>('/student/profile/resumes', {
          method: 'POST',
          body: newResume,
          csrfToken,
        }),
      'Resume metadata added.',
    )
    setNewResume(emptyResumeDraft)
  }

  async function saveResume(recordId: number) {
    const draft = resumeDrafts[recordId]
    await runMutation(
      `resume-${recordId}`,
      () =>
        apiRequest<StudentProfile>(`/student/profile/resumes/${recordId}`, {
          method: 'PUT',
          body: draft,
          csrfToken,
        }),
      'Resume metadata updated.',
    )
  }

  async function deleteResume(recordId: number) {
    await runMutation(
      `delete-resume-${recordId}`,
      () =>
        apiRequest<StudentProfile>(`/student/profile/resumes/${recordId}`, {
          method: 'DELETE',
          csrfToken,
        }),
      'Resume metadata removed.',
    )
  }

  async function saveAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await runMutation(
      'availability',
      () =>
        apiRequest<StudentProfile>('/student/profile/availability', {
          method: 'PUT',
          body: {
            ...availabilityDraft,
            earliest_start_date: availabilityDraft.earliest_start_date || null,
          },
          csrfToken,
        }),
      'Availability updated.',
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student profile</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Profile and readiness</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Keep your hiring profile current with structured education, experience, resume metadata, and interview
            availability.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Profile completeness</p>
            <Badge variant={profile.profile_complete ? 'default' : 'secondary'}>
              {profile.profile_complete ? 'Complete' : 'Incomplete'}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {profile.profile_extension_summary.education_count} education · {profile.profile_extension_summary.experience_count} experience
              · {profile.profile_extension_summary.resume_count} resumes
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {success ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Success</h3>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Basic Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Basic profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={profile.name}
                  onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Desired job type</label>
                <Input
                  value={profile.desired_job_type}
                  onChange={(event) => setProfile({ ...profile, desired_job_type: event.target.value })}
                  placeholder="Backend, frontend, QA, ..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Desired work location</label>
                <Input
                  value={profile.desired_work_location}
                  onChange={(event) => setProfile({ ...profile, desired_work_location: event.target.value })}
                  placeholder="Tokyo, remote, hybrid, ..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Japanese level</label>
                <Input
                  value={profile.japanese_level}
                  onChange={(event) => setProfile({ ...profile, japanese_level: event.target.value })}
                  placeholder="N3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">English level</label>
                <Input
                  value={profile.english_level}
                  onChange={(event) => setProfile({ ...profile, english_level: event.target.value })}
                  placeholder="B2"
                />
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <Button type="submit" disabled={busyKey === 'profile'}>
                {busyKey === 'profile' ? 'Saving…' : 'Save basic profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
          <Badge variant="secondary">{profile.education_records.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Education Records */}
          {profile.education_records.map((record) => {
            const draft = educationDrafts[record.id]
            return (
              <form
                key={record.id}
                className="space-y-4 rounded-lg border border-border p-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void saveEducation(record.id)
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Institution</label>
                    <Input
                      value={draft?.institution ?? ''}
                      onChange={(event) =>
                        setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, institution: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Field of study</label>
                    <Input
                      value={draft?.field_of_study ?? ''}
                      onChange={(event) =>
                        setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, field_of_study: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start date</label>
                    <Input
                      type="date"
                      value={draft?.start_date ?? ''}
                      onChange={(event) =>
                        setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, start_date: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End date</label>
                    <Input
                      type="date"
                      value={draft?.end_date ?? ''}
                      onChange={(event) =>
                        setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, end_date: event.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={draft?.completion_status ?? 'in_progress'}
                      onChange={(event) =>
                        setEducationDrafts({
                          ...educationDrafts,
                          [record.id]: { ...draft, completion_status: event.target.value },
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border pt-4">
                  <Button type="submit" disabled={busyKey === `education-${record.id}`}>
                    {busyKey === `education-${record.id}` ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={busyKey === `delete-education-${record.id}`}
                    onClick={() => void deleteEducation(record.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </form>
            )
          })}

          {/* Add New Education */}
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-4">
            <form className="space-y-4" onSubmit={createEducation}>
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add education
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Institution</label>
                  <Input
                    value={newEducation.institution}
                    onChange={(event) => setNewEducation({ ...newEducation, institution: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field of study</label>
                  <Input
                    value={newEducation.field_of_study}
                    onChange={(event) => setNewEducation({ ...newEducation, field_of_study: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start date</label>
                  <Input
                    type="date"
                    value={newEducation.start_date}
                    onChange={(event) => setNewEducation({ ...newEducation, start_date: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End date</label>
                  <Input
                    type="date"
                    value={newEducation.end_date}
                    onChange={(event) => setNewEducation({ ...newEducation, end_date: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newEducation.completion_status}
                    onChange={(event) => setNewEducation({ ...newEducation, completion_status: event.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={busyKey === 'create-education'}>
                {busyKey === 'create-education' ? 'Adding…' : 'Add education'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Experience
          </CardTitle>
          <Badge variant="secondary">{profile.experience_records.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Experience Records */}
          {profile.experience_records.map((record) => {
            const draft = experienceDrafts[record.id]
            return (
              <form
                key={record.id}
                className="space-y-4 rounded-lg border border-border p-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void saveExperience(record.id)
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization</label>
                    <Input
                      value={draft?.organization ?? ''}
                      onChange={(event) =>
                        setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, organization: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role title</label>
                    <Input
                      value={draft?.role_title ?? ''}
                      onChange={(event) =>
                        setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, role_title: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience type</label>
                    <select
                      value={draft?.experience_type ?? 'work'}
                      onChange={(event) =>
                        setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, experience_type: event.target.value } })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="work">Work</option>
                      <option value="internship">Internship</option>
                      <option value="project">Project</option>
                      <option value="freelance">Freelance</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start date</label>
                    <Input
                      type="date"
                      value={draft?.start_date ?? ''}
                      onChange={(event) =>
                        setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, start_date: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End date</label>
                    <Input
                      type="date"
                      value={draft?.end_date ?? ''}
                      onChange={(event) =>
                        setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, end_date: event.target.value } })
                      }
                      disabled={draft?.is_current}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft?.is_current ?? false}
                    onChange={(event) =>
                      setExperienceDrafts({
                        ...experienceDrafts,
                        [record.id]: {
                          ...draft,
                          is_current: event.target.checked,
                          end_date: event.target.checked ? '' : draft?.end_date ?? '',
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-medium">Currently employed here</span>
                </label>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Summary</label>
                  <textarea
                    rows={3}
                    value={draft?.summary ?? ''}
                    onChange={(event) =>
                      setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, summary: event.target.value } })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="flex gap-2 border-t border-border pt-4">
                  <Button type="submit" disabled={busyKey === `experience-${record.id}`}>
                    {busyKey === `experience-${record.id}` ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={busyKey === `delete-experience-${record.id}`}
                    onClick={() => void deleteExperience(record.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </form>
            )
          })}

          {/* Add New Experience */}
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-4">
            <form className="space-y-4" onSubmit={createExperience}>
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add experience
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization</label>
                  <Input
                    value={newExperience.organization}
                    onChange={(event) => setNewExperience({ ...newExperience, organization: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role title</label>
                  <Input
                    value={newExperience.role_title}
                    onChange={(event) => setNewExperience({ ...newExperience, role_title: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience type</label>
                  <select
                    value={newExperience.experience_type}
                    onChange={(event) => setNewExperience({ ...newExperience, experience_type: event.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="work">Work</option>
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                    <option value="freelance">Freelance</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start date</label>
                  <Input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(event) => setNewExperience({ ...newExperience, start_date: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End date</label>
                  <Input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(event) => setNewExperience({ ...newExperience, end_date: event.target.value })}
                    disabled={newExperience.is_current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
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
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm font-medium">Currently employed here</span>
              </label>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <textarea
                  rows={3}
                  value={newExperience.summary}
                  onChange={(event) => setNewExperience({ ...newExperience, summary: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <Button type="submit" disabled={busyKey === 'create-experience'}>
                {busyKey === 'create-experience' ? 'Adding…' : 'Add experience'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Resume Metadata */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume metadata
          </CardTitle>
          <Badge variant="secondary">{profile.resumes.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Resumes */}
          {profile.resumes.map((record) => {
            const draft = resumeDrafts[record.id]
            return (
              <form
                key={record.id}
                className="space-y-4 rounded-lg border border-border p-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void saveResume(record.id)
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display name</label>
                    <Input
                      value={draft?.display_name ?? ''}
                      onChange={(event) =>
                        setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, display_name: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">File name</label>
                    <Input
                      value={draft?.file_name ?? ''}
                      onChange={(event) =>
                        setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, file_name: event.target.value } })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source</label>
                    <select
                      value={draft?.source_type ?? 'manual'}
                      onChange={(event) =>
                        setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, source_type: event.target.value } })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="manual">Manual</option>
                      <option value="uploaded">Uploaded</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft?.is_active ?? false}
                    onChange={(event) =>
                      setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, is_active: event.target.checked } })
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-medium">Active resume</span>
                </label>
                <div className="flex gap-2 border-t border-border pt-4">
                  <Button type="submit" disabled={busyKey === `resume-${record.id}`}>
                    {busyKey === `resume-${record.id}` ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={busyKey === `delete-resume-${record.id}`}
                    onClick={() => void deleteResume(record.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </form>
            )
          })}

          {/* Add New Resume */}
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-4">
            <form className="space-y-4" onSubmit={createResume}>
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add resume metadata
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display name</label>
                  <Input
                    value={newResume.display_name}
                    onChange={(event) => setNewResume({ ...newResume, display_name: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">File name</label>
                  <Input
                    value={newResume.file_name}
                    onChange={(event) => setNewResume({ ...newResume, file_name: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source</label>
                  <select
                    value={newResume.source_type}
                    onChange={(event) => setNewResume({ ...newResume, source_type: event.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="manual">Manual</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="external">External</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newResume.is_active}
                  onChange={(event) => setNewResume({ ...newResume, is_active: event.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm font-medium">Active resume</span>
              </label>
              <Button type="submit" disabled={busyKey === 'create-resume'}>
                {busyKey === 'create-resume' ? 'Adding…' : 'Add resume metadata'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={saveAvailability}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job search status</label>
                <select
                  value={availabilityDraft.job_search_status}
                  onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, job_search_status: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select status</option>
                  <option value="actively_looking">Actively looking</option>
                  <option value="open_to_offers">Open to offers</option>
                  <option value="not_searching">Not searching</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Earliest start date</label>
                <Input
                  type="date"
                  value={availabilityDraft.earliest_start_date}
                  onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, earliest_start_date: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview availability</label>
                <Input
                  value={availabilityDraft.interview_availability}
                  onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, interview_availability: event.target.value })}
                  placeholder="Weekdays after 6 PM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduling notes</label>
              <textarea
                rows={3}
                value={availabilityDraft.scheduling_notes}
                onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, scheduling_notes: event.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="border-t border-border pt-4">
              <Button type="submit" disabled={busyKey === 'availability'}>
                {busyKey === 'availability' ? 'Saving…' : 'Save availability'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function educationFreeCurrentEndDate(draft: ExperienceDraft): ExperienceDraft {
  if (draft.is_current) {
    return { ...draft, end_date: '' }
  }
  return draft
}
