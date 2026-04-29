import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentProfile } from './types'

const emptyProfile: StudentProfile = {
  student_id: 0,
  name: '',
  desired_job_type: '',
  desired_work_location: '',
  japanese_level: '',
  english_level: '',
  profile_complete: false,
}

export function StudentProfilePage() {
  const { csrfToken, refreshSession } = useAuth()
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const data = await apiRequest<StudentProfile>('/student/profile')
        if (active) {
          setProfile(data)
        }
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

    void loadProfile()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await apiRequest<StudentProfile>('/student/profile', {
        method: 'PUT',
        body: {
          name: profile.name,
          desired_job_type: profile.desired_job_type,
          desired_work_location: profile.desired_work_location,
          japanese_level: profile.japanese_level,
          english_level: profile.english_level,
        },
        csrfToken,
      })
      setProfile(updated)
      await refreshSession()
      setSuccess('Student profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading student profile…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student profile</p>
          <h1>Basic profile</h1>
          <p className="lead">Maintain your core identity and preference fields used by later learning and job workflows.</p>
        </div>
        <div className="card compact-card">
          <strong>Profile completeness</strong>
          <p className="muted">{profile.profile_complete ? 'Complete' : 'Incomplete'}</p>
        </div>
      </div>
      <div className="card form-card">
        <form className="form" onSubmit={handleSubmit}>
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
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </section>
  )
}
