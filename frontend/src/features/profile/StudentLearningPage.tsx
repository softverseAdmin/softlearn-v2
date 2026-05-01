import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, apiRequest } from '../../lib/api'
import type { LearningSummary } from './types'

const emptySummary: LearningSummary = {
  student_id: 0,
  total_courses: 0,
  completed_courses: 0,
  in_progress_courses: 0,
  records: [],
}

export function StudentLearningPage() {
  const [summary, setSummary] = useState<LearningSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const response = await apiRequest<LearningSummary>('/student/learning-summary')
        if (active) {
          setSummary(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load learning summary.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSummary()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading learning summary…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student learning</p>
          <h1>Learning summary</h1>
          <p className="lead">Review your current course progress and completion evidence in one protected summary.</p>
        </div>
        <div className="card compact-card">
          <strong>Progress snapshot</strong>
          <p className="muted">{summary.completed_courses} completed</p>
          <p className="muted">{summary.in_progress_courses} in progress</p>
          <Link className="secondary-button inline-button" to="/student/courses">
            Browse courses
          </Link>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card-grid">
        <article className="card info-card">
          <h2>Total courses</h2>
          <p className="metric">{summary.total_courses}</p>
        </article>
        <article className="card info-card">
          <h2>Completed</h2>
          <p className="metric">{summary.completed_courses}</p>
        </article>
        <article className="card info-card">
          <h2>In progress</h2>
          <p className="metric">{summary.in_progress_courses}</p>
        </article>
      </div>

      <div className="card stack-card">
        <h2>Course records</h2>
        {summary.records.length === 0 ? <p className="muted">No learning records yet.</p> : null}
        <div className="stack-list">
          {summary.records.map((record) => (
            <article key={record.id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{record.course_title}</h3>
                  <p className="muted">
                    {record.category} · {record.status.replace('_', ' ')}
                  </p>
                </div>
                <strong>{record.progress_percent}%</strong>
              </div>
              {record.completed_at ? <p className="muted">Completed: {new Date(record.completed_at).toLocaleString()}</p> : null}
              {record.course_id ? (
                <Link className="secondary-button inline-button" to={`/student/courses/${record.course_id}`}>
                  View course
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
