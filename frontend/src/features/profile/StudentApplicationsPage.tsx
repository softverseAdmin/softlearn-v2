import { useEffect, useState } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentApplicationRecord, StudentApplicationsResponse } from './types'

const emptyApplicationsResponse: StudentApplicationsResponse = {
  student_id: 0,
  application_count: 0,
  applications: [],
}

export function StudentApplicationsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentApplicationsResponse>(emptyApplicationsResponse)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadApplications() {
      try {
        const response = await apiRequest<StudentApplicationsResponse>('/student/applications')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load applications.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadApplications()
    return () => {
      active = false
    }
  }, [])

  async function refreshApplications() {
    const response = await apiRequest<StudentApplicationsResponse>('/student/applications')
    setData(response)
  }

  async function handleWithdraw(application: StudentApplicationRecord) {
    setSavingId(application.application_id)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<StudentApplicationRecord>(`/student/applications/${application.application_id}/withdraw`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await refreshApplications()
      setSuccess('Application withdrawn successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to withdraw application.')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading applications…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student applications</p>
          <h1>Application status</h1>
          <p className="lead">Track your submitted jobs, current status, and application history in one protected place.</p>
        </div>
        <div className="card compact-card">
          <strong>Total applications</strong>
          <p className="muted">{data.application_count}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="card stack-card">
        <h2>Your applications</h2>
        {data.applications.length === 0 ? <p className="muted">You have not applied to any jobs yet.</p> : null}
        <div className="stack-list">
          {data.applications.map((application) => (
            <article key={application.application_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{application.vacancy_title}</h3>
                  <p className="muted">{application.company_name}</p>
                </div>
                <span className={`status-pill ${application.status === 'shortlisted' ? 'status-success' : 'status-muted'}`}>
                  {application.status}
                </span>
              </div>
              <p className="muted">
                Submitted {new Date(application.submitted_at).toLocaleString()} · Updated {new Date(application.updated_at).toLocaleString()}
              </p>
              <div className="stack-list">
                {application.history.map((entry) => (
                  <p key={entry.id} className="muted">
                    {new Date(entry.created_at).toLocaleString()} · {entry.to_status}
                    {entry.actor_name ? ` · ${entry.actor_name}` : ''}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                ))}
              </div>
              {application.can_withdraw ? (
                <button
                  className="danger-button inline-button"
                  type="button"
                  onClick={() => void handleWithdraw(application)}
                  disabled={savingId === application.application_id}
                >
                  {savingId === application.application_id ? 'Withdrawing…' : 'Withdraw'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
