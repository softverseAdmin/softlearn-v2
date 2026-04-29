import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyCandidatesResponse } from './types'

const emptyResponse: CompanyCandidatesResponse = {
  company_id: 0,
  candidate_count: 0,
  candidates: [],
}

export function CompanyCandidatesPage() {
  const [data, setData] = useState<CompanyCandidatesResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCandidates() {
      try {
        const response = await apiRequest<CompanyCandidatesResponse>('/company/candidates')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load candidate review queue.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCandidates()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading candidate review queue…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company candidates</p>
          <h1>Candidate review</h1>
          <p className="lead">Review only the candidate contexts already approved for your company, with privacy-aware visibility for profile, learning, and exam evidence.</p>
        </div>
        <div className="card compact-card">
          <strong>Approved candidates</strong>
          <p className="muted">{data.candidate_count}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      {data.candidates.length === 0 ? (
        <div className="card info-card">
          <h2>No candidate contexts yet</h2>
          <p className="muted">This list will populate when approved application, shortlist, or match contexts are created for your company.</p>
        </div>
      ) : null}

      <div className="card-grid">
        {data.candidates.map((candidate) => (
          <article key={candidate.candidate_access_id} className="card info-card">
            <p className="eyebrow">{candidate.source}</p>
            <h2>{candidate.display_name}</h2>
            <p className="muted">
              {candidate.desired_job_type || 'Job type hidden'} · {candidate.desired_work_location || 'Location hidden'}
            </p>
            {candidate.top_skills.length > 0 ? <p className="muted">Skills: {candidate.top_skills.join(', ')}</p> : null}
            {candidate.strengths.length > 0 ? (
              <ul className="feature-list">
                {candidate.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <div className="visibility-row">
              <span className={`status-pill ${candidate.visibility.profile_preview === 'visible' ? 'status-success' : 'status-muted'}`}>Profile {candidate.visibility.profile_preview}</span>
              <span className={`status-pill ${candidate.visibility.learning_record === 'visible' ? 'status-success' : 'status-muted'}`}>Learning {candidate.visibility.learning_record}</span>
              <span className={`status-pill ${candidate.visibility.exam_results === 'visible' ? 'status-success' : 'status-muted'}`}>Exams {candidate.visibility.exam_results}</span>
              <span className={`status-pill ${candidate.is_shortlisted ? 'status-success' : 'status-muted'}`}>
                {candidate.is_shortlisted ? 'Shortlisted' : 'Not shortlisted'}
              </span>
            </div>
            <p className="muted">Company notes: {candidate.notes_count}</p>
            <Link className="secondary-button inline-button" to={`/company/candidates/${candidate.candidate_access_id}`}>
              Review candidate
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
