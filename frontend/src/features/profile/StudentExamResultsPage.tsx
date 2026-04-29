import { useEffect, useState } from 'react'

import { ApiError, apiRequest } from '../../lib/api'
import type { ExamResultsSummary } from './types'

const emptySummary: ExamResultsSummary = {
  student_id: 0,
  total_results: 0,
  passed_results: 0,
  average_score: null,
  results: [],
}

export function StudentExamResultsPage() {
  const [summary, setSummary] = useState<ExamResultsSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const response = await apiRequest<ExamResultsSummary>('/student/exam-results')
        if (active) {
          setSummary(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load exam results.')
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
        <div className="card">Loading exam results…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student exams</p>
          <h1>Exam results summary</h1>
          <p className="lead">Review your assessment outcomes without exposing any company-facing sharing decisions.</p>
        </div>
        <div className="card compact-card">
          <strong>Average score</strong>
          <p className="muted">{summary.average_score === null ? 'No exams yet' : `${summary.average_score}%`}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card-grid">
        <article className="card info-card">
          <h2>Total results</h2>
          <p className="metric">{summary.total_results}</p>
        </article>
        <article className="card info-card">
          <h2>Passed</h2>
          <p className="metric">{summary.passed_results}</p>
        </article>
      </div>

      <div className="card stack-card">
        <h2>Exam records</h2>
        {summary.results.length === 0 ? <p className="muted">No exam results yet.</p> : null}
        <div className="stack-list">
          {summary.results.map((result) => (
            <article key={result.id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{result.exam_title}</h3>
                  <p className="muted">
                    {result.category} · Attempt {result.attempt_number}
                  </p>
                </div>
                <strong>{result.score_percent}%</strong>
              </div>
              <p className={`status-pill ${result.passed ? 'status-success' : 'status-muted'}`}>
                {result.passed ? 'Passed' : 'Not passed'}
              </p>
              <p className="muted">Taken: {new Date(result.taken_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
