import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, apiRequest } from '../../lib/api'
import type { ExamResultsSummary } from './types'

const emptySummary: ExamResultsSummary = {
  student_id: 0,
  total_results: 0,
  passed_results: 0,
  average_score: null,
  results: [],
  available_exams: [],
}

export default function StudentExamResultsPage() {
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
          <Link className="secondary-button inline-button" to="/student/preparation">
            Preparation workspace
          </Link>
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
        <article className="card info-card">
          <h2>Available exams</h2>
          <p className="metric">{summary.available_exams.length}</p>
        </article>
      </div>

      <div className="card stack-card">
        <h2>Available exams</h2>
        {summary.available_exams.length === 0 ? <p className="muted">No active exams are available yet.</p> : null}
        <div className="stack-list">
          {summary.available_exams.map((exam) => (
            <article key={exam.exam_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{exam.title}</h3>
                  <p className="muted">
                    {exam.category} · {exam.duration_minutes} min · pass {exam.passing_score_percent}% · {exam.question_count} questions
                  </p>
                </div>
                <span className={`status-pill ${exam.can_take ? 'status-success' : 'status-muted'}`}>
                  {exam.can_take ? `Attempt ${exam.next_attempt_number}` : 'Locked'}
                </span>
              </div>
              <p>{exam.description || 'No exam description yet.'}</p>
              <p className="muted">{exam.retake_message}</p>
              <div className="actions">
                <Link className="secondary-button inline-button" to={exam.detail_href}>
                  View exam
                </Link>
                {exam.can_take ? (
                  <Link className="primary-button inline-button" to={exam.detail_href}>
                    Start exam
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
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
