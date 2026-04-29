import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyProfile } from './types'

const emptyProfile: CompanyProfile = {
  company_id: 0,
  name: '',
  description: '',
  profile_complete: false,
}

export function CompanyProfilePage() {
  const { csrfToken, refreshSession } = useAuth()
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const data = await apiRequest<CompanyProfile>('/company/profile')
        if (active) {
          setProfile(data)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load company profile.')
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
      const updated = await apiRequest<CompanyProfile>('/company/profile', {
        method: 'PUT',
        body: {
          name: profile.name,
          description: profile.description,
        },
        csrfToken,
      })
      setProfile(updated)
      await refreshSession()
      setSuccess('Company profile updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save company profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading company profile…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company profile</p>
          <h1>Company overview</h1>
          <p className="lead">Maintain the organization identity and summary that later candidate review and vacancy flows will rely on.</p>
        </div>
        <div className="card compact-card">
          <strong>Profile completeness</strong>
          <p className="muted">{profile.profile_complete ? 'Complete' : 'Incomplete'}</p>
        </div>
      </div>
      <div className="card form-card">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Company name</span>
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
          </label>
          <label>
            <span>Company description</span>
            <textarea
              value={profile.description}
              onChange={(event) => setProfile({ ...profile, description: event.target.value })}
              rows={6}
              placeholder="Describe the company, hiring focus, and student opportunities."
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save company profile'}
          </button>
        </form>
      </div>
    </section>
  )
}
