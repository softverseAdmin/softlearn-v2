import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { LoadingState } from '@/components/LoadingIndicator'
import { ApiError, apiRequest } from '../../lib/api'
import type { PracticeQuestion } from './types'

interface PracticeAnswerResponse {
  is_correct: boolean
  explanation: string
  correct_option_id: number
}

export function PracticeQuestionPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [answerResponse, setAnswerResponse] = useState<PracticeAnswerResponse | null>(null)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  useEffect(() => {
    let active = true

    async function loadQuestions() {
      if (!examId) {
        setError('Exam ID is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<{ questions: PracticeQuestion[] }>(
          `/exams/${examId}/practice-questions/`
        )
        if (active) {
          setQuestions(response.questions)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load practice questions.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadQuestions()
    return () => {
      active = false
    }
  }, [examId])

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading practice questions" className="min-h-40" />
        </div>
      </section>
    )
  }

  if (questions.length === 0) {
    return (
      <section className="page">
        <div className="card">
          <p className="muted">No practice questions available for this exam.</p>
        </div>
      </section>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progressPercent = ((currentIndex + 1) / questions.length) * 100

  async function handleSubmitAnswer() {
    if (!selectedOptionId) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await apiRequest<PracticeAnswerResponse>(
        `/practice-questions/${currentQuestion.id}/answer/`,
        {
          method: 'POST',
          body: { selected_option_id: selectedOptionId },
          csrfToken,
        }
      )
      setAnswerResponse(response)
      setAnswered(true)
      setAnsweredCount(answeredCount + 1)
      if (response.is_correct) {
        setScore(score + 1)
      }
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to submit answer.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswered(false)
      setSelectedOptionId(null)
      setAnswerResponse(null)
    } else {
      navigate('/learning/performance')
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Practice questions</p>
          <h1>Question {currentIndex + 1} of {questions.length}</h1>
          <p className="lead">Answer this practice question. You'll get instant feedback after submitting.</p>
        </div>
        <div className="card compact-card">
          <strong>Score</strong>
          <p className="muted">{score}/{answeredCount} correct</p>
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
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card">
        <h2>{currentQuestion.question_text}</h2>
        {currentQuestion.topic ? (
          <p className="muted">Topic: {currentQuestion.topic}</p>
        ) : null}
        {currentQuestion.difficulty ? (
          <p className="muted">Difficulty: {currentQuestion.difficulty}</p>
        ) : null}

        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          {currentQuestion.options.map((option) => (
            <div key={option.id} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="option"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  disabled={answered}
                  style={{ marginRight: '0.75rem' }}
                />
                <span>{option.option_text}</span>
                {answered && option.id === answerResponse?.correct_option_id && (
                  <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 'bold' }}>✓ Correct</span>
                )}
                {answered && selectedOptionId === option.id && !option.is_correct && (
                  <span style={{ marginLeft: 'auto', color: '#dc2626', fontWeight: 'bold' }}>✗ Incorrect</span>
                )}
              </label>
            </div>
          ))}
        </div>

        {answered && answerResponse ? (
          <div style={{
            padding: '1rem',
            backgroundColor: answerResponse.is_correct ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${answerResponse.is_correct ? '#86efac' : '#fecaca'}`,
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: answerResponse.is_correct ? '#16a34a' : '#dc2626' }}>
              {answerResponse.is_correct ? 'Correct!' : 'Incorrect'}
            </p>
            {answerResponse.explanation ? (
              <p style={{ margin: 0 }}>{answerResponse.explanation}</p>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {!answered ? (
            <button
              className="primary-button"
              onClick={handleSubmitAnswer}
              disabled={selectedOptionId === null || submitting}
            >
              {submitting ? 'Submitting…' : 'Submit answer'}
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Next question' : 'View results'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
