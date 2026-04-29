import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, apiRequest } from '../../lib/api'
import type { InterviewListResponse } from './types'

const emptyResponse: InterviewListResponse = {
  interviews: [],
}

export function StudentInterviewsPage() {
  const [data, setData] = useState<InterviewListResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadInterviews() {
      try {
        const response = await apiRequest<InterviewListResponse>('/student/interviews')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load interviews.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInterviews()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <section className="page"><div className="card">Loading interviews…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student interviews</p>
          <h1>Interview schedule</h1>
          <p className="lead">Review interview requests, share availability, and track confirmed schedules.</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {data.interviews.length === 0 ? (
        <div className="card info-card">
          <h2>No interviews yet</h2>
          <p className="muted">Interview requests will appear here after a company starts a hiring conversation.</p>
        </div>
      ) : null}
      <div className="card-grid">
        {data.interviews.map((interview) => (
          <article key={interview.id} className="card info-card">
            <p className="eyebrow">{interview.status}</p>
            <h2>{interview.purpose}</h2>
            <p className="muted">{interview.role_context || 'General interview context'}</p>
            <p className="muted">
              {interview.scheduled_start && interview.scheduled_end
                ? `${new Date(interview.scheduled_start).toLocaleString()} - ${new Date(interview.scheduled_end).toLocaleString()}`
                : 'Awaiting schedule confirmation'}
            </p>
            {interview.completed_at ? <p className="muted">Completed at {new Date(interview.completed_at).toLocaleString()}</p> : null}
            {interview.cancelled_at ? <p className="muted">Cancelled at {new Date(interview.cancelled_at).toLocaleString()}</p> : null}
            <Link className="secondary-button inline-button" to={`/student/interviews/${interview.id}`}>
              Open interview
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
