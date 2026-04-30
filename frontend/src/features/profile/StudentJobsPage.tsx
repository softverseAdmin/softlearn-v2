import { useEffect, useState } from 'react'

import { ApiError, apiRequest } from '../../lib/api'
import type { StudentJobsResponse } from './types'

const emptyJobsResponse: StudentJobsResponse = {
  vacancies: [],
}

export function StudentJobsPage() {
  const [data, setData] = useState<StudentJobsResponse>(emptyJobsResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadJobs() {
      try {
        const response = await apiRequest<StudentJobsResponse>('/student/jobs')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load jobs.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadJobs()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading jobs…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student jobs</p>
          <h1>Job list</h1>
          <p className="lead">Browse the active vacancies currently visible for student discovery.</p>
        </div>
        <div className="card compact-card">
          <strong>Visible jobs</strong>
          <p className="muted">{data.vacancies.length} active opportunities</p>
          <p className="muted">Search, filters, and apply flows land in later units.</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <h2>Available opportunities</h2>
        {data.vacancies.length === 0 ? (
          <p className="muted">No active student-visible vacancies are available right now.</p>
        ) : null}
        <div className="stack-list">
          {data.vacancies.map((vacancy) => (
            <article key={vacancy.vacancy_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{vacancy.title}</h3>
                  <p className="muted">{vacancy.company_name}</p>
                </div>
                <span className="status-pill status-success">active</span>
              </div>
              <p>{vacancy.description}</p>
              <p className="muted">
                {vacancy.employment_type} · {vacancy.experience_level} · {vacancy.location}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
