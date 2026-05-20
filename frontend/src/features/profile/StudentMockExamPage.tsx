import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { LoadingState } from '@/components/LoadingIndicator'
import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentMockExamDetailResponse, StudentMockExamSubmitResponse } from './types'

const emptyExam: StudentMockExamDetailResponse = {
  exam_id: 0,
  title: '',
  description: '',
  category: '',
  duration_minutes: 0,
  question_count: 0,
  attempt_count: 0,
  next_attempt_number: 1,
  best_score: null,
  last_score: null,
  questions: [],
}

export function StudentMockExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentMockExamDetailResponse>(emptyExam)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers])

  useEffect(() => {
    let active = true

    async function loadExam() {
      if (!examId) {
        setError('Mock exam id is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<StudentMockExamDetailResponse>(`/student/mock-exams/${examId}`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load mock exam.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadExam()
    return () => {
      active = false
    }
  }, [examId])

  async function handleSubmit() {
    if (!examId) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await apiRequest<StudentMockExamSubmitResponse>(`/student/mock-exams/${examId}/submit`, {
        method: 'POST',
        body: {
          answers: Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
            question_id: Number(questionId),
            selected_option_id: selectedOptionId,
          })),
        },
        csrfToken,
      })
      navigate(response.history_href)
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit mock exam.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading mock exam" className="min-h-40" />
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student preparation</p>
          <h1>{data.title || 'Mock exam'}</h1>
          <p className="lead">{data.description || 'Use this mock exam to measure readiness without changing your official exam history.'}</p>
        </div>
        <div className="card compact-card">
          <strong>Mock summary</strong>
          <p className="muted">Attempt {data.next_attempt_number}</p>
          <p className="muted">{answeredCount} / {data.question_count} answered</p>
          {data.best_score !== null ? <p className="muted">Best score: {data.best_score}%</p> : null}
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <h2>Mock details</h2>
        <p className="muted">
          {data.category} · {data.duration_minutes} minutes · previous attempts {data.attempt_count}
          {data.last_score !== null ? ` · last score ${data.last_score}%` : ''}
        </p>
      </div>

      <div className="card stack-card">
        <h2>Questions</h2>
        {data.questions.map((question) => (
          <article key={question.question_id} className="skill-card">
            <div className="skill-card-header">
              <div>
                <h3>Question {question.sequence_number}</h3>
                <p className="muted">{question.points} point{question.points === 1 ? '' : 's'}</p>
              </div>
            </div>
            <p>{question.prompt}</p>
            {question.instructions ? <p className="muted">{question.instructions}</p> : null}
            <div className="stack-list">
              {question.options.map((option) => (
                <label key={option.option_id} className="skill-card">
                  <input
                    type="radio"
                    name={`mock-question-${question.question_id}`}
                    checked={selectedAnswers[question.question_id] === option.option_id}
                    onChange={() =>
                      setSelectedAnswers((current) => ({
                        ...current,
                        [question.question_id]: option.option_id,
                      }))
                    }
                  />
                  <span>{option.option_text}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="actions">
        <Link className="secondary-button inline-button" to="/student/preparation">
          Back to preparation
        </Link>
        <button
          className="primary-button inline-button"
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving || answeredCount !== data.question_count}
        >
          {saving ? 'Submitting…' : 'Submit mock exam'}
        </button>
      </div>
    </section>
  )
}
