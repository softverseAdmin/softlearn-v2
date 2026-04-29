import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentPrivacySettings } from './types'

const emptySettings: StudentPrivacySettings = {
  student_id: 0,
  share_profile_preview: true,
  share_learning_record: true,
  share_exam_results: false,
  history: [],
}

export function StudentPrivacySettingsPage() {
  const { csrfToken } = useAuth()
  const [settings, setSettings] = useState<StudentPrivacySettings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      try {
        const response = await apiRequest<StudentPrivacySettings>('/student/privacy-settings')
        if (active) {
          setSettings(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load privacy settings.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSettings()
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
      const response = await apiRequest<StudentPrivacySettings>('/student/privacy-settings', {
        method: 'PUT',
        body: {
          share_profile_preview: settings.share_profile_preview,
          share_learning_record: settings.share_learning_record,
          share_exam_results: settings.share_exam_results,
        },
        csrfToken,
      })
      setSettings(response)
      setSuccess('Privacy settings updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update privacy settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading privacy settings…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student privacy</p>
          <h1>Privacy settings</h1>
          <p className="lead">Choose what companies may see during approved candidate review. Exam results remain off until you explicitly enable them.</p>
        </div>
      </div>

      <div className="page-split">
        <div className="card form-card">
          <form className="form" onSubmit={handleSubmit}>
            <label className="toggle-field">
              <span>
                <strong>Share profile preview</strong>
                <span className="muted">Allows companies to see your core profile and skills in approved review contexts.</span>
              </span>
              <input
                type="checkbox"
                checked={settings.share_profile_preview}
                onChange={(event) => setSettings({ ...settings, share_profile_preview: event.target.checked })}
              />
            </label>
            <label className="toggle-field">
              <span>
                <strong>Share learning record</strong>
                <span className="muted">Allows companies to review course progress and completion summaries.</span>
              </span>
              <input
                type="checkbox"
                checked={settings.share_learning_record}
                onChange={(event) => setSettings({ ...settings, share_learning_record: event.target.checked })}
              />
            </label>
            <label className="toggle-field">
              <span>
                <strong>Share exam results</strong>
                <span className="muted">Allows companies to review your exam result summaries only when you explicitly opt in.</span>
              </span>
              <input
                type="checkbox"
                checked={settings.share_exam_results}
                onChange={(event) => setSettings({ ...settings, share_exam_results: event.target.checked })}
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className="form-success">{success}</p> : null}
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save privacy settings'}
            </button>
          </form>
        </div>

        <aside className="card stack-card">
          <h2>Recent consent history</h2>
          <div className="stack-list">
            {settings.history.map((event) => (
              <article key={event.id} className="skill-card">
                <p className="muted">{new Date(event.created_at).toLocaleString()}</p>
                <div className="visibility-row">
                  <span className={`status-pill ${event.share_profile_preview ? 'status-success' : 'status-muted'}`}>
                    Profile {event.share_profile_preview ? 'shared' : 'hidden'}
                  </span>
                  <span className={`status-pill ${event.share_learning_record ? 'status-success' : 'status-muted'}`}>
                    Learning {event.share_learning_record ? 'shared' : 'hidden'}
                  </span>
                  <span className={`status-pill ${event.share_exam_results ? 'status-success' : 'status-muted'}`}>
                    Exams {event.share_exam_results ? 'shared' : 'hidden'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
