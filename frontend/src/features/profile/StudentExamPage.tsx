import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentExamDetailResponse, StudentExamSubmitResponse } from './types'

const emptyExam: StudentExamDetailResponse = {
  exam_id: 0,
  title: '',
  description: '',
  category: '',
  duration_minutes: 0,
  passing_score_percent: 70,
  question_count: 0,
  max_attempts: 3,
  attempt_count: 0,
  can_take: false,
  retake_message: '',
  next_attempt_number: null,
  questions: [],
}

export function StudentExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentExamDetailResponse>(emptyExam)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers],
  )

  useEffect(() => {
    let active = true

    async function loadExam() {
      if (!examId) {
        setError('Exam id is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<StudentExamDetailResponse>(`/student/exams/${examId}`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load exam.')
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
      const response = await apiRequest<StudentExamSubmitResponse>(`/student/exams/${examId}/submit`, {
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
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit exam.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading exam…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student assessment</p>
          <h1>{data.title || 'Exam'}</h1>
          <p className="lead">{data.description || 'Answer each question once, then submit the full exam for scoring.'}</p>
        </div>
        <div className="card compact-card">
          <strong>Attempt summary</strong>
          <p className="muted">
            Attempt {data.next_attempt_number ?? data.attempt_count} of {data.max_attempts}
          </p>
          <p className="muted">{answeredCount} / {data.question_count} answered</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <h2>Exam details</h2>
        <p className="muted">
          {data.category} · {data.duration_minutes} minutes · pass mark {data.passing_score_percent}%
        </p>
        <p className="muted">{data.retake_message}</p>
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
                    name={`question-${question.question_id}`}
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
        <Link className="secondary-button inline-button" to="/student/exams">
          Back to exam history
        </Link>
        <button
          className="primary-button inline-button"
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving || answeredCount !== data.question_count}
        >
          {saving ? 'Submitting…' : 'Submit exam'}
        </button>
      </div>
    </section>
  )
}
