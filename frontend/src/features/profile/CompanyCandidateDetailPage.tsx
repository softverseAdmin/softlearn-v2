import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ApiError, apiRequest } from '../../lib/api'
import type {
  CompanyCandidatePreviewResponse,
  CompanyCandidateRecordResponse,
  ExamResultsSummary,
  LearningSummary,
} from './types'

const emptyPreview: CompanyCandidatePreviewResponse = {
  candidate_access_id: 0,
  source: '',
  visibility: 'hidden',
  student: null,
  restrictions: [],
}

const emptyLearning: CompanyCandidateRecordResponse<LearningSummary> = {
  candidate_access_id: 0,
  visibility: 'hidden',
  summary: {
    student_id: 0,
    total_courses: 0,
    completed_courses: 0,
    in_progress_courses: 0,
    records: [],
  },
  restrictions: [],
}

const emptyExams: CompanyCandidateRecordResponse<ExamResultsSummary> = {
  candidate_access_id: 0,
  visibility: 'hidden',
  summary: {
    student_id: 0,
    total_results: 0,
    passed_results: 0,
    average_score: null,
    results: [],
  },
  restrictions: [],
}

export function CompanyCandidateDetailPage() {
  const params = useParams<{ candidateAccessId: string }>()
  const [preview, setPreview] = useState<CompanyCandidatePreviewResponse>(emptyPreview)
  const [learning, setLearning] = useState<CompanyCandidateRecordResponse<LearningSummary>>(emptyLearning)
  const [exams, setExams] = useState<CompanyCandidateRecordResponse<ExamResultsSummary>>(emptyExams)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCandidate() {
      if (!params.candidateAccessId) {
        setError('Candidate context is missing.')
        setLoading(false)
        return
      }

      try {
        const [previewResponse, learningResponse, examResponse] = await Promise.all([
          apiRequest<CompanyCandidatePreviewResponse>(`/company/candidates/${params.candidateAccessId}/preview`),
          apiRequest<CompanyCandidateRecordResponse<LearningSummary>>(
            `/company/candidates/${params.candidateAccessId}/learning-record`,
          ),
          apiRequest<CompanyCandidateRecordResponse<ExamResultsSummary>>(
            `/company/candidates/${params.candidateAccessId}/exam-results`,
          ),
        ])

        if (active) {
          setPreview(previewResponse)
          setLearning(learningResponse)
          setExams(examResponse)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load candidate review details.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCandidate()
    return () => {
      active = false
    }
  }, [params.candidateAccessId])

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading candidate review details…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company candidates</p>
          <h1>{preview.student?.name ?? 'Candidate review detail'}</h1>
          <p className="lead">This page preserves the privacy-safe split between profile preview, learning evidence, and exam evidence.</p>
        </div>
        <div className="actions">
          <Link className="secondary-button" to="/company/candidates">
            Back to candidates
          </Link>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <h2>Profile preview</h2>
        {preview.visibility === 'hidden' ? (
          <p className="muted">{preview.restrictions[0] ?? 'Profile preview is not available.'}</p>
        ) : (
          <>
            <div className="card-grid">
              <article className="card info-card">
                <h3>Desired job type</h3>
                <p className="muted">{preview.student?.desired_job_type || 'Not shared'}</p>
              </article>
              <article className="card info-card">
                <h3>Preferred location</h3>
                <p className="muted">{preview.student?.desired_work_location || 'Not shared'}</p>
              </article>
              <article className="card info-card">
                <h3>Languages</h3>
                <p className="muted">
                  JP: {preview.student?.japanese_level || 'Not shared'} · EN: {preview.student?.english_level || 'Not shared'}
                </p>
              </article>
            </div>
            <div className="visibility-row">
              {preview.student?.skills.length ? (
                preview.student.skills.map((skill) => (
                  <span key={skill.id} className="status-pill status-success">
                    {skill.skill_name} · {skill.proficiency_level}
                  </span>
                ))
              ) : (
                <p className="muted">No skills shared in the preview.</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Learning record</h2>
          {learning.visibility === 'hidden' ? (
            <p className="muted">{learning.restrictions[0] ?? 'Learning record is not visible.'}</p>
          ) : (
            <>
              <p className="muted">
                {learning.summary.completed_courses} completed · {learning.summary.in_progress_courses} in progress
              </p>
              <div className="stack-list">
                {learning.summary.records.map((record) => (
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
                  </article>
                ))}
                {learning.summary.records.length === 0 ? <p className="muted">No learning records available.</p> : null}
              </div>
            </>
          )}
        </div>

        <div className="card stack-card">
          <h2>Exam results</h2>
          {exams.visibility === 'hidden' ? (
            <p className="muted">{exams.restrictions[0] ?? 'Exam results are not visible.'}</p>
          ) : (
            <>
              <p className="muted">
                {exams.summary.passed_results} passed · Average score {exams.summary.average_score ?? 'N/A'}%
              </p>
              <div className="stack-list">
                {exams.summary.results.map((result) => (
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
                  </article>
                ))}
                {exams.summary.results.length === 0 ? <p className="muted">No exam results available.</p> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
