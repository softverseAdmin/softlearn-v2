import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { InterviewDetail } from './types'

const emptyInterview: InterviewDetail = {
  id: 0,
  candidate_access_id: 0,
  student_id: 0,
  student_name: '',
  company_id: 0,
  purpose: '',
  role_context: '',
  status: 'requested',
  scheduled_start: null,
  scheduled_end: null,
  confirmed_at: null,
  created_at: '',
  updated_at: '',
  availabilities: [],
  history: [],
}

function toInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function StudentInterviewDetailPage() {
  const { csrfToken } = useAuth()
  const params = useParams<{ interviewId: string }>()
  const [interview, setInterview] = useState<InterviewDetail>(emptyInterview)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [startAt, setStartAt] = useState(toInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
  const [endAt, setEndAt] = useState(toInputValue(new Date(Date.now() + 25 * 60 * 60 * 1000)))
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadInterview() {
      if (!params.interviewId) {
        setError('Interview context is missing.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}`)
        if (active) {
          setInterview(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load interview.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInterview()
    return () => {
      active = false
    }
  }, [params.interviewId])

  async function handleSubmitAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/availability`, {
        method: 'POST',
        body: {
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          note,
        },
        csrfToken,
      })
      setInterview(response)
      setNote('')
      setSuccess('Availability submitted successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit availability.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading interview…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student interviews</p>
          <h1>{interview.purpose || 'Interview detail'}</h1>
          <p className="lead">{interview.role_context || 'Review the request, share availability, and monitor the confirmed schedule.'}</p>
        </div>
        <div className="actions">
          <Link className="secondary-button" to="/student/interviews">
            Back to interviews
          </Link>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>Interview status</h2>
          <div className="visibility-row">
            <span className={`status-pill ${interview.status === 'confirmed' ? 'status-success' : 'status-muted'}`}>{interview.status}</span>
          </div>
          <p className="muted">
            {interview.scheduled_start && interview.scheduled_end
              ? `${new Date(interview.scheduled_start).toLocaleString()} - ${new Date(interview.scheduled_end).toLocaleString()}`
              : 'No confirmed schedule yet.'}
          </p>
          <form className="form" onSubmit={handleSubmitAvailability}>
            <label>
              <span>Availability start</span>
              <input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} required />
            </label>
            <label>
              <span>Availability end</span>
              <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} required />
            </label>
            <label>
              <span>Note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Optional scheduling context." />
            </label>
            <button className="primary-button inline-button" type="submit" disabled={saving || interview.status === 'confirmed'}>
              {saving ? 'Saving…' : 'Submit availability'}
            </button>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Availability timeline</h2>
          <div className="stack-list">
            {interview.availabilities.map((availability) => (
              <article key={availability.id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{availability.submitted_by_name}</h3>
                    <p className="muted">{availability.submitted_by_role}</p>
                  </div>
                  <p className="muted">{new Date(availability.created_at).toLocaleString()}</p>
                </div>
                <p className="muted">
                  {new Date(availability.start_at).toLocaleString()} - {new Date(availability.end_at).toLocaleString()}
                </p>
                {availability.note ? <p>{availability.note}</p> : null}
              </article>
            ))}
            {interview.availabilities.length === 0 ? <p className="muted">No availability entries yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="card stack-card">
        <h2>History</h2>
        <div className="stack-list">
          {interview.history.map((event) => (
            <article key={event.id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{event.event_type}</h3>
                  <p className="muted">{event.actor_name ? `${event.actor_name} · ${event.actor_role}` : 'System'}</p>
                </div>
                <p className="muted">{new Date(event.created_at).toLocaleString()}</p>
              </div>
              <p>{event.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
