import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminExamRecord, AdminExamsResponse } from './types'

const emptyExamsResponse: AdminExamsResponse = {
  exams: [],
}

export function AdminExamsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminExamsResponse>(emptyExamsResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('0')
  const [passingScorePercent, setPassingScorePercent] = useState('70')
  const [questionCount, setQuestionCount] = useState('0')
  const [maxAttempts, setMaxAttempts] = useState('3')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedExam = useMemo(
    () => data.exams.find((exam) => exam.exam_id === selectedExamId) ?? null,
    [data.exams, selectedExamId],
  )

  useEffect(() => {
    let active = true

    async function loadExams() {
      try {
        const response = await apiRequest<AdminExamsResponse>('/admin/exams')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load exams.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadExams()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedExam) {
      setTitle('')
      setDescription('')
      setCategory('')
      setDurationMinutes('0')
      setPassingScorePercent('70')
      setQuestionCount('0')
      setMaxAttempts('3')
      setStatus('draft')
      return
    }

    setTitle(selectedExam.title)
    setDescription(selectedExam.description)
    setCategory(selectedExam.category)
    setDurationMinutes(String(selectedExam.duration_minutes))
    setPassingScorePercent(String(selectedExam.passing_score_percent))
    setQuestionCount(String(selectedExam.question_count))
    setMaxAttempts(String(selectedExam.max_attempts))
    setStatus(selectedExam.status)
  }, [selectedExam])

  async function refreshExams() {
    const response = await apiRequest<AdminExamsResponse>('/admin/exams')
    setData(response)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        title,
        description,
        category,
        duration_minutes: Number(durationMinutes),
        passing_score_percent: Number(passingScorePercent),
        question_count: Number(questionCount),
        max_attempts: Number(maxAttempts),
        status,
      }

      if (selectedExam) {
        await apiRequest<AdminExamRecord>(`/admin/exams/${selectedExam.exam_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Exam updated successfully.')
      } else {
        await apiRequest<AdminExamRecord>('/admin/exams', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Exam created successfully.')
      }

      await refreshExams()
      if (!selectedExam) {
        setSelectedExamId(null)
      }
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save exam.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(examId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<AdminExamRecord>(`/admin/exams/${examId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshExams()
      if (selectedExamId === examId) {
        setSelectedExamId(null)
      }
      setSuccess('Exam retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire exam.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading exams…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin exams</p>
          <h1>Exam management</h1>
          <p className="lead">Create, update, and deactivate shared exam records used across assessment flows.</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedExam ? 'Edit exam' : 'Create exam'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              <span>Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            </label>
            <label>
              <span>Category</span>
              <input value={category} onChange={(event) => setCategory(event.target.value)} required />
            </label>
            <label>
              <span>Duration minutes</span>
              <input type="number" min={0} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} required />
            </label>
            <label>
              <span>Passing score percent</span>
              <input type="number" min={0} max={100} value={passingScorePercent} onChange={(event) => setPassingScorePercent(event.target.value)} required />
            </label>
            <label>
              <span>Question count</span>
              <input type="number" min={0} value={questionCount} onChange={(event) => setQuestionCount(event.target.value)} required />
            </label>
            <label>
              <span>Max attempts</span>
              <input type="number" min={1} value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} required />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedExam ? 'Update exam' : 'Create exam'}
              </button>
              {selectedExam ? (
                <button className="secondary-button inline-button" type="button" onClick={() => setSelectedExamId(null)} disabled={saving}>
                  New exam
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Exams</h2>
          <div className="stack-list">
            {data.exams.map((exam) => (
              <article key={exam.exam_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{exam.title}</h3>
                    <p className="muted">
                      {exam.category} · {exam.duration_minutes} min · pass {exam.passing_score_percent}% · {exam.question_count} questions · {exam.max_attempts} attempts
                    </p>
                  </div>
                  <span className={`status-pill ${exam.status === 'active' ? 'status-success' : 'status-muted'}`}>
                    {exam.status}
                  </span>
                </div>
                <p className="muted">{exam.description || 'No description yet.'}</p>
                <p className="muted">{exam.result_count} linked exam results</p>
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedExamId(exam.exam_id)}>
                    Edit
                  </button>
                  <Link className="secondary-button inline-button" to={`/admin/exams/${exam.exam_id}/questions`}>
                    Questions
                  </Link>
                  {exam.status !== 'inactive' ? (
                    <button className="danger-button inline-button" type="button" onClick={() => void handleDeactivate(exam.exam_id)} disabled={saving}>
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.exams.length === 0 ? <p className="muted">No exams yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
