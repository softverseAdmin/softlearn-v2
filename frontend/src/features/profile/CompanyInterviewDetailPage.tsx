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
  cancelled_at: null,
  completed_at: null,
  meeting_provider: null,
  meeting_url: null,
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

export function CompanyInterviewDetailPage() {
  const { csrfToken } = useAuth()
  const params = useParams<{ interviewId: string }>()
  const [interview, setInterview] = useState<InterviewDetail>(emptyInterview)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState('')
  const [startAt, setStartAt] = useState(toInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
  const [endAt, setEndAt] = useState(toInputValue(new Date(Date.now() + 25 * 60 * 60 * 1000)))
  const [note, setNote] = useState('')
  const [meetingProvider, setMeetingProvider] = useState('custom')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [completionSummary, setCompletionSummary] = useState('')
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
          setMeetingProvider(response.meeting_provider ?? 'custom')
          setMeetingUrl(response.meeting_url ?? '')
          if (response.availabilities.length > 0) {
            setSelectedAvailabilityId(String(response.availabilities[0].id))
          }
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
      setSelectedAvailabilityId(response.availabilities.length > 0 ? String(response.availabilities[0].id) : '')
      setSuccess('Availability submitted successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit availability.')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/company/interviews/${params.interviewId}/confirm`, {
        method: 'POST',
        body: {
          availability_id: Number(selectedAvailabilityId),
        },
        csrfToken,
      })
      setInterview(response)
      setSuccess('Interview confirmed successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to confirm interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/reschedule`, {
        method: 'POST',
        body: { reason: rescheduleReason },
        csrfToken,
      })
      setInterview(response)
      setRescheduleReason('')
      setSuccess('Interview moved to rescheduled state.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to reschedule interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/cancel`, {
        method: 'POST',
        body: { reason: cancelReason },
        csrfToken,
      })
      setInterview(response)
      setCancelReason('')
      setSuccess('Interview cancelled successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to cancel interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleMeetingLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/meeting-link`, {
        method: 'PUT',
        body: {
          meeting_provider: meetingProvider,
          meeting_url: meetingUrl,
        },
        csrfToken,
      })
      setInterview(response)
      setSuccess('Meeting link updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update meeting link.')
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/complete`, {
        method: 'POST',
        body: { summary: completionSummary },
        csrfToken,
      })
      setInterview(response)
      setCompletionSummary('')
      setSuccess('Interview marked as completed.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to complete interview.')
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
          <p className="eyebrow">Company interviews</p>
          <h1>{interview.student_name || 'Interview detail'}</h1>
          <p className="lead">{interview.purpose || 'Review availability and confirm one final slot.'}</p>
        </div>
        <div className="actions">
          <Link className="secondary-button" to="/company/interviews">
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
          {interview.completed_at ? <p className="muted">Completed at: {new Date(interview.completed_at).toLocaleString()}</p> : null}
          {interview.cancelled_at ? <p className="muted">Cancelled at: {new Date(interview.cancelled_at).toLocaleString()}</p> : null}
          {interview.meeting_url ? (
            <p className="muted">
              Meeting link: <a href={interview.meeting_url} target="_blank" rel="noreferrer">{interview.meeting_provider}</a>
            </p>
          ) : null}
          <form className="form" onSubmit={handleConfirm}>
            <label>
              <span>Select availability to confirm</span>
              <select value={selectedAvailabilityId} onChange={(event) => setSelectedAvailabilityId(event.target.value)} required>
                <option value="">Select a slot</option>
                {interview.availabilities.map((availability) => (
                  <option key={availability.id} value={availability.id}>
                    {availability.submitted_by_name}: {new Date(availability.start_at).toLocaleString()} - {new Date(availability.end_at).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="primary-button inline-button"
              type="submit"
              disabled={saving || interview.availabilities.length === 0 || !['requested', 'rescheduled'].includes(interview.status)}
            >
              {saving ? 'Saving…' : 'Confirm schedule'}
            </button>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Interview actions</h2>
          <form className="form" onSubmit={handleMeetingLink}>
            <label>
              <span>Meeting provider</span>
              <select value={meetingProvider} onChange={(event) => setMeetingProvider(event.target.value)}>
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="teams">Microsoft Teams</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label>
              <span>Meeting URL</span>
              <input value={meetingUrl} onChange={(event) => setMeetingUrl(event.target.value)} placeholder="https://..." />
            </label>
            <button
              className="secondary-button inline-button"
              type="submit"
              disabled={saving || !['confirmed', 'rescheduled'].includes(interview.status)}
            >
              {saving ? 'Saving…' : 'Save meeting link'}
            </button>
          </form>
          <form className="form" onSubmit={handleReschedule}>
            <label>
              <span>Reschedule reason</span>
              <textarea value={rescheduleReason} onChange={(event) => setRescheduleReason(event.target.value)} rows={3} required />
            </label>
            <button
              className="secondary-button inline-button"
              type="submit"
              disabled={saving || ['cancelled', 'completed'].includes(interview.status)}
            >
              {saving ? 'Saving…' : 'Request reschedule'}
            </button>
          </form>
          <form className="form" onSubmit={handleCancel}>
            <label>
              <span>Cancellation reason</span>
              <textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} rows={3} required />
            </label>
            <button
              className="danger-button inline-button"
              type="submit"
              disabled={saving || ['cancelled', 'completed'].includes(interview.status)}
            >
              {saving ? 'Saving…' : 'Cancel interview'}
            </button>
          </form>
          <form className="form" onSubmit={handleComplete}>
            <label>
              <span>Completion summary</span>
              <textarea value={completionSummary} onChange={(event) => setCompletionSummary(event.target.value)} rows={3} required />
            </label>
            <button className="primary-button inline-button" type="submit" disabled={saving || interview.status !== 'confirmed'}>
              {saving ? 'Saving…' : 'Mark interview complete'}
            </button>
          </form>
        </div>
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Add company availability</h2>
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
            <button
              className="secondary-button inline-button"
              type="submit"
              disabled={saving || !['requested', 'rescheduled'].includes(interview.status)}
            >
              {saving ? 'Saving…' : 'Submit company availability'}
            </button>
          </form>
        </div>
      </div>

      <div className="page-split">
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
      </div>
    </section>
  )
}
