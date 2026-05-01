import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type {
  StudentAvailabilityProfile,
  StudentEducationRecord,
  StudentExperienceRecord,
  StudentProfile,
  StudentResumeRecord,
} from './types'

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

  async function loadProfile() {
    const data = await apiRequest<StudentProfile>('/student/profile')
    setProfile(data)
    setEducationDrafts(Object.fromEntries(data.education_records.map((record) => [record.id, toEducationDraft(record)])))
    setExperienceDrafts(Object.fromEntries(data.experience_records.map((record) => [record.id, toExperienceDraft(record)])))
    setResumeDrafts(Object.fromEntries(data.resumes.map((record) => [record.id, toResumeDraft(record)])))
    setAvailabilityDraft(toAvailabilityDraft(data.availability))
  }

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
      <section className="page">
        <div className="card">Loading student profile…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student profile</p>
          <h1>Profile and readiness</h1>
          <p className="lead">
            Keep your hiring profile current with structured education, experience, resume metadata, and interview
            availability.
          </p>
        </div>
        <div className="card compact-card">
          <strong>Profile completeness</strong>
          <p className="muted">{profile.profile_complete ? 'Complete' : 'Incomplete'}</p>
          <p className="muted">
            {profile.profile_extension_summary.education_count} education, {profile.profile_extension_summary.experience_count}{' '}
            experience, {profile.profile_extension_summary.resume_count} resumes
          </p>
        </div>
      </div>

      {error ? <div className="card"><p className="form-error">{error}</p></div> : null}
      {success ? <div className="card"><p className="form-success">{success}</p></div> : null}

      <div className="card form-card">
        <h2>Basic profile</h2>
        <form className="form" onSubmit={handleProfileSubmit}>
          <label>
            <span>Name</span>
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
          </label>
          <label>
            <span>Desired job type</span>
            <input
              value={profile.desired_job_type}
              onChange={(event) => setProfile({ ...profile, desired_job_type: event.target.value })}
              placeholder="Backend, frontend, QA, ..."
            />
          </label>
          <label>
            <span>Desired work location</span>
            <input
              value={profile.desired_work_location}
              onChange={(event) => setProfile({ ...profile, desired_work_location: event.target.value })}
              placeholder="Tokyo, remote, hybrid, ..."
            />
          </label>
          <label>
            <span>Japanese level</span>
            <input
              value={profile.japanese_level}
              onChange={(event) => setProfile({ ...profile, japanese_level: event.target.value })}
              placeholder="N3"
            />
          </label>
          <label>
            <span>English level</span>
            <input
              value={profile.english_level}
              onChange={(event) => setProfile({ ...profile, english_level: event.target.value })}
              placeholder="B2"
            />
          </label>
          <button className="primary-button" type="submit" disabled={busyKey === 'profile'}>
            {busyKey === 'profile' ? 'Saving…' : 'Save basic profile'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h2>Education</h2>
        {profile.education_records.map((record) => {
          const draft = educationDrafts[record.id]
          return (
            <form key={record.id} className="form" onSubmit={(event) => {
              event.preventDefault()
              void saveEducation(record.id)
            }}>
              <label>
                <span>Institution</span>
                <input
                  value={draft?.institution ?? ''}
                  onChange={(event) =>
                    setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, institution: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>Field of study</span>
                <input
                  value={draft?.field_of_study ?? ''}
                  onChange={(event) =>
                    setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, field_of_study: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>Start date</span>
                <input
                  type="date"
                  value={draft?.start_date ?? ''}
                  onChange={(event) =>
                    setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, start_date: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>End date</span>
                <input
                  type="date"
                  value={draft?.end_date ?? ''}
                  onChange={(event) =>
                    setEducationDrafts({ ...educationDrafts, [record.id]: { ...draft, end_date: event.target.value } })
                  }
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={draft?.completion_status ?? 'in_progress'}
                  onChange={(event) =>
                    setEducationDrafts({
                      ...educationDrafts,
                      [record.id]: { ...draft, completion_status: event.target.value },
                    })
                  }
                >
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </label>
              <div className="actions-row">
                <button className="primary-button" type="submit" disabled={busyKey === `education-${record.id}`}>
                  {busyKey === `education-${record.id}` ? 'Saving…' : 'Save education'}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busyKey === `delete-education-${record.id}`}
                  onClick={() => void deleteEducation(record.id)}
                >
                  Remove
                </button>
              </div>
            </form>
          )
        })}
        <form className="form" onSubmit={createEducation}>
          <h3>Add education</h3>
          <label>
            <span>Institution</span>
            <input value={newEducation.institution} onChange={(event) => setNewEducation({ ...newEducation, institution: event.target.value })} required />
          </label>
          <label>
            <span>Field of study</span>
            <input value={newEducation.field_of_study} onChange={(event) => setNewEducation({ ...newEducation, field_of_study: event.target.value })} required />
          </label>
          <label>
            <span>Start date</span>
            <input type="date" value={newEducation.start_date} onChange={(event) => setNewEducation({ ...newEducation, start_date: event.target.value })} required />
          </label>
          <label>
            <span>End date</span>
            <input type="date" value={newEducation.end_date} onChange={(event) => setNewEducation({ ...newEducation, end_date: event.target.value })} />
          </label>
          <label>
            <span>Status</span>
            <select value={newEducation.completion_status} onChange={(event) => setNewEducation({ ...newEducation, completion_status: event.target.value })}>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={busyKey === 'create-education'}>
            {busyKey === 'create-education' ? 'Adding…' : 'Add education'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h2>Experience</h2>
        {profile.experience_records.map((record) => {
          const draft = experienceDrafts[record.id]
          return (
            <form key={record.id} className="form" onSubmit={(event) => {
              event.preventDefault()
              void saveExperience(record.id)
            }}>
              <label>
                <span>Organization</span>
                <input
                  value={draft?.organization ?? ''}
                  onChange={(event) =>
                    setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, organization: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>Role title</span>
                <input
                  value={draft?.role_title ?? ''}
                  onChange={(event) =>
                    setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, role_title: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>Experience type</span>
                <select
                  value={draft?.experience_type ?? 'work'}
                  onChange={(event) =>
                    setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, experience_type: event.target.value } })
                  }
                >
                  <option value="work">Work</option>
                  <option value="internship">Internship</option>
                  <option value="project">Project</option>
                  <option value="freelance">Freelance</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </label>
              <label>
                <span>Start date</span>
                <input
                  type="date"
                  value={draft?.start_date ?? ''}
                  onChange={(event) =>
                    setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, start_date: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>End date</span>
                <input
                  type="date"
                  value={draft?.end_date ?? ''}
                  onChange={(event) =>
                    setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, end_date: event.target.value } })
                  }
                  disabled={draft?.is_current}
                />
              </label>
              <label className="checkbox-field">
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
                />
                <span>Current role</span>
              </label>
              <label>
                <span>Summary</span>
                <textarea
                  rows={3}
                  value={draft?.summary ?? ''}
                  onChange={(event) =>
                    setExperienceDrafts({ ...experienceDrafts, [record.id]: { ...draft, summary: event.target.value } })
                  }
                />
              </label>
              <div className="actions-row">
                <button className="primary-button" type="submit" disabled={busyKey === `experience-${record.id}`}>
                  {busyKey === `experience-${record.id}` ? 'Saving…' : 'Save experience'}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busyKey === `delete-experience-${record.id}`}
                  onClick={() => void deleteExperience(record.id)}
                >
                  Remove
                </button>
              </div>
            </form>
          )
        })}
        <form className="form" onSubmit={createExperience}>
          <h3>Add experience</h3>
          <label>
            <span>Organization</span>
            <input value={newExperience.organization} onChange={(event) => setNewExperience({ ...newExperience, organization: event.target.value })} required />
          </label>
          <label>
            <span>Role title</span>
            <input value={newExperience.role_title} onChange={(event) => setNewExperience({ ...newExperience, role_title: event.target.value })} required />
          </label>
          <label>
            <span>Experience type</span>
            <select value={newExperience.experience_type} onChange={(event) => setNewExperience({ ...newExperience, experience_type: event.target.value })}>
              <option value="work">Work</option>
              <option value="internship">Internship</option>
              <option value="project">Project</option>
              <option value="freelance">Freelance</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </label>
          <label>
            <span>Start date</span>
            <input type="date" value={newExperience.start_date} onChange={(event) => setNewExperience({ ...newExperience, start_date: event.target.value })} required />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={newExperience.end_date}
              onChange={(event) => setNewExperience({ ...newExperience, end_date: event.target.value })}
              disabled={newExperience.is_current}
            />
          </label>
          <label className="checkbox-field">
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
            <span>Current role</span>
          </label>
          <label>
            <span>Summary</span>
            <textarea rows={3} value={newExperience.summary} onChange={(event) => setNewExperience({ ...newExperience, summary: event.target.value })} />
          </label>
          <button className="primary-button" type="submit" disabled={busyKey === 'create-experience'}>
            {busyKey === 'create-experience' ? 'Adding…' : 'Add experience'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h2>Resume metadata</h2>
        {profile.resumes.map((record) => {
          const draft = resumeDrafts[record.id]
          return (
            <form key={record.id} className="form" onSubmit={(event) => {
              event.preventDefault()
              void saveResume(record.id)
            }}>
              <label>
                <span>Display name</span>
                <input
                  value={draft?.display_name ?? ''}
                  onChange={(event) =>
                    setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, display_name: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>File name</span>
                <input
                  value={draft?.file_name ?? ''}
                  onChange={(event) =>
                    setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, file_name: event.target.value } })
                  }
                  required
                />
              </label>
              <label>
                <span>Source</span>
                <select
                  value={draft?.source_type ?? 'manual'}
                  onChange={(event) =>
                    setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, source_type: event.target.value } })
                  }
                >
                  <option value="manual">Manual</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="external">External</option>
                </select>
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={draft?.is_active ?? false}
                  onChange={(event) =>
                    setResumeDrafts({ ...resumeDrafts, [record.id]: { ...draft, is_active: event.target.checked } })
                  }
                />
                <span>Active resume</span>
              </label>
              <div className="actions-row">
                <button className="primary-button" type="submit" disabled={busyKey === `resume-${record.id}`}>
                  {busyKey === `resume-${record.id}` ? 'Saving…' : 'Save resume'}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busyKey === `delete-resume-${record.id}`}
                  onClick={() => void deleteResume(record.id)}
                >
                  Remove
                </button>
              </div>
            </form>
          )
        })}
        <form className="form" onSubmit={createResume}>
          <h3>Add resume metadata</h3>
          <label>
            <span>Display name</span>
            <input value={newResume.display_name} onChange={(event) => setNewResume({ ...newResume, display_name: event.target.value })} required />
          </label>
          <label>
            <span>File name</span>
            <input value={newResume.file_name} onChange={(event) => setNewResume({ ...newResume, file_name: event.target.value })} required />
          </label>
          <label>
            <span>Source</span>
            <select value={newResume.source_type} onChange={(event) => setNewResume({ ...newResume, source_type: event.target.value })}>
              <option value="manual">Manual</option>
              <option value="uploaded">Uploaded</option>
              <option value="external">External</option>
            </select>
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={newResume.is_active} onChange={(event) => setNewResume({ ...newResume, is_active: event.target.checked })} />
            <span>Active resume</span>
          </label>
          <button className="primary-button" type="submit" disabled={busyKey === 'create-resume'}>
            {busyKey === 'create-resume' ? 'Adding…' : 'Add resume metadata'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h2>Availability</h2>
        <form className="form" onSubmit={saveAvailability}>
          <label>
            <span>Job search status</span>
            <select
              value={availabilityDraft.job_search_status}
              onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, job_search_status: event.target.value })}
            >
              <option value="">Select status</option>
              <option value="actively_looking">Actively looking</option>
              <option value="open_to_offers">Open to offers</option>
              <option value="not_searching">Not searching</option>
            </select>
          </label>
          <label>
            <span>Earliest start date</span>
            <input
              type="date"
              value={availabilityDraft.earliest_start_date}
              onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, earliest_start_date: event.target.value })}
            />
          </label>
          <label>
            <span>Interview availability</span>
            <input
              value={availabilityDraft.interview_availability}
              onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, interview_availability: event.target.value })}
              placeholder="Weekdays after 6 PM"
            />
          </label>
          <label>
            <span>Scheduling notes</span>
            <textarea
              rows={3}
              value={availabilityDraft.scheduling_notes}
              onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, scheduling_notes: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={busyKey === 'availability'}>
            {busyKey === 'availability' ? 'Saving…' : 'Save availability'}
          </button>
        </form>
      </div>
    </section>
  )
}

function educationFreeCurrentEndDate(draft: ExperienceDraft): ExperienceDraft {
  if (draft.is_current) {
    return { ...draft, end_date: '' }
  }
  return draft
}
