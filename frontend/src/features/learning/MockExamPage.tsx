import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { ExamQuestion } from './types'

interface MockExamDetail {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  question_count: number
  questions: ExamQuestion[]
}

interface AnswerSubmission {
  question_id: number
  selected_option_id: number
}

interface MockExamResult {
  attempt_id: number
  exam_id: number
  exam_title: string
  attempt_number: number
  score_percent: number
  correct_answer_count: number
  total_questions: number
  history_href: string
}

export function MockExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [exam, setExam] = useState<MockExamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [isPaused, setIsPaused] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAutoSubmittedRef = useRef(false)

  const handleSubmitExam = useCallback(async () => {
    if (!exam || examId === undefined || submitting) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const answers: AnswerSubmission[] = exam.questions
        .filter((q) => selectedAnswers[q.question_id] !== undefined)
        .map((q) => ({
          question_id: q.question_id,
          selected_option_id: selectedAnswers[q.question_id],
        }))

      const response = await apiRequest<MockExamResult>(
        `/student/mock-exams/${examId}/submit`,
        {
          method: 'POST',
          body: { answers },
          csrfToken,
        }
      )
      navigate(response.history_href, {
        state: {
          score: response.score_percent,
          correctCount: response.correct_answer_count,
          totalCount: response.total_questions,
        },
      })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to submit exam.')
    } finally {
      setSubmitting(false)
    }
  }, [csrfToken, exam, examId, navigate, selectedAnswers, submitting])

  useEffect(() => {
    let active = true

    async function loadExam() {
      if (!examId) {
        setError('Exam ID is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<MockExamDetail>(`/student/exams/${examId}/mock`)
        if (active) {
          hasAutoSubmittedRef.current = false
          setExam(response)
          setRemainingSeconds(response.duration_minutes * 60)
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

  useEffect(() => {
    if (isPaused || remainingSeconds === null || remainingSeconds <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPaused, remainingSeconds])

  useEffect(() => {
    if (remainingSeconds !== 0 || hasAutoSubmittedRef.current) {
      return
    }

    hasAutoSubmittedRef.current = true
    void handleSubmitExam()
  }, [handleSubmitExam, remainingSeconds])

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading mock exam…</div>
      </section>
    )
  }

  if (!exam) {
    return (
      <section className="page">
        <div className="card form-error">{error || 'Unable to load the mock exam.'}</div>
      </section>
    )
  }

  const currentQuestion = exam.questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / exam.questions.length) * 100
  const answeredCount = Object.keys(selectedAnswers).length
  const minutesRemaining = remainingSeconds ? Math.floor(remainingSeconds / 60) : 0
  const secondsRemaining = remainingSeconds ? remainingSeconds % 60 : 0

  function handleSelectOption(optionId: number) {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.question_id]: optionId,
    })
  }

  function handleFlagQuestion() {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestion.question_id)) {
      newFlagged.delete(currentQuestion.question_id)
    } else {
      newFlagged.add(currentQuestion.question_id)
    }
    setFlaggedQuestions(newFlagged)
  }

  function handleNextQuestion() {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  function handlePreviousQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Mock exam</p>
          <h1>{exam.title}</h1>
          <p className="lead">Complete this mock exam to assess your readiness. You have {exam.duration_minutes} minutes.</p>
        </div>
        <div className="card compact-card" style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '1.5rem', color: remainingSeconds && remainingSeconds < 600 ? '#dc2626' : '#6366f1' }}>
            {String(minutesRemaining).padStart(2, '0')}:{String(secondsRemaining).padStart(2, '0')}
          </strong>
          <p className="muted" style={{ marginTop: '0.5rem' }}>Time remaining</p>
          <button
            className="secondary-button inline-button"
            onClick={() => setIsPaused(!isPaused)}
            style={{ marginTop: '0.5rem' }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '1rem' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: '#6366f1',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          Question {currentIndex + 1} of {exam.questions.length} • {answeredCount} answered
        </p>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      {isPaused ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Exam paused</p>
          <p className="muted">Click "Resume" to continue your mock exam.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>{currentQuestion.prompt}</h2>
            {currentQuestion.instructions ? (
              <p className="muted" style={{ marginTop: '0.5rem' }}>{currentQuestion.instructions}</p>
            ) : null}

            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              {currentQuestion.options.map((option, idx) => (
                <div key={option.option_id} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="option"
                      value={option.option_id}
                      checked={selectedAnswers[currentQuestion.question_id] === option.option_id}
                      onChange={() => handleSelectOption(option.option_id)}
                      style={{ marginRight: '0.75rem' }}
                    />
                    <span>{String.fromCharCode(65 + idx)}) {option.option_text}</span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="secondary-button"
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                <button
                  className={`secondary-button ${flaggedQuestions.has(currentQuestion.question_id) ? 'active' : ''}`}
                  onClick={handleFlagQuestion}
                  style={{
                    backgroundColor: flaggedQuestions.has(currentQuestion.question_id) ? '#fbbf24' : undefined,
                  }}
                >
                  {flaggedQuestions.has(currentQuestion.question_id) ? '🚩 Flagged' : '🚩 Flag'}
                </button>
                <button
                  className="secondary-button"
                  onClick={handleNextQuestion}
                  disabled={currentIndex === exam.questions.length - 1}
                >
                  Next
                </button>
              </div>
              <button
                className="primary-button"
                onClick={handleSubmitExam}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit exam'}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
