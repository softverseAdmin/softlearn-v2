import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyApplicationRecord, CompanyApplicationsResponse } from './types'

const emptyApplicationsResponse: CompanyApplicationsResponse = {
  company_id: 0,
  application_count: 0,
  applications: [],
}

export function CompanyApplicationsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<CompanyApplicationsResponse>(emptyApplicationsResponse)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadApplications() {
      try {
        const response = await apiRequest<CompanyApplicationsResponse>('/company/applications')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load company applications.')
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
    const response = await apiRequest<CompanyApplicationsResponse>('/company/applications')
    setData(response)
  }

  async function runAction(
    application: CompanyApplicationRecord,
    action: 'shortlist' | 'reject',
  ) {
    setSavingId(application.application_id)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<CompanyApplicationRecord>(`/company/applications/${application.application_id}/${action}`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await refreshApplications()
      setSuccess(action === 'shortlist' ? 'Application shortlisted successfully.' : 'Application rejected successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update application status.')
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
          <p className="eyebrow">Company applications</p>
          <h1>Application review</h1>
          <p className="lead">Review submitted applications, promote candidates to shortlist, or reject them with traceable status history.</p>
        </div>
        <div className="card compact-card">
          <strong>Total applications</strong>
          <p className="muted">{data.application_count}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="card stack-card">
        <h2>Applications</h2>
        {data.applications.length === 0 ? <p className="muted">No applications have been submitted to your company yet.</p> : null}
        <div className="stack-list">
          {data.applications.map((application) => (
            <article key={application.application_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{application.display_name}</h3>
                  <p className="muted">{application.vacancy_title}</p>
                </div>
                <span className={`status-pill ${application.status === 'shortlisted' ? 'status-success' : 'status-muted'}`}>
                  {application.status}
                </span>
              </div>
              <p className="muted">
                {application.desired_job_type || 'Job type hidden'} · {application.desired_work_location || 'Location hidden'}
              </p>
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
              <div className="actions">
                {application.candidate_access_id ? (
                  <Link className="secondary-button inline-button" to={`/company/candidates/${application.candidate_access_id}`}>
                    Review candidate
                  </Link>
                ) : null}
                {application.can_shortlist ? (
                  <button
                    className="primary-button inline-button"
                    type="button"
                    onClick={() => void runAction(application, 'shortlist')}
                    disabled={savingId === application.application_id}
                  >
                    {savingId === application.application_id ? 'Saving…' : 'Shortlist'}
                  </button>
                ) : null}
                {application.can_reject ? (
                  <button
                    className="danger-button inline-button"
                    type="button"
                    onClick={() => void runAction(application, 'reject')}
                    disabled={savingId === application.application_id}
                  >
                    {savingId === application.application_id ? 'Saving…' : 'Reject'}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
