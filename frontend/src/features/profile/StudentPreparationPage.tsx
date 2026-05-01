import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type {
  PracticeQuestionAttemptResponse,
  PracticeQuestionsResponse,
  PreparationSummaryResponse,
} from './types'

const emptySummary: PreparationSummaryResponse = {
  student_id: 0,
  categories: [],
  study_plan: {
    items: [],
  },
  performance: {
    practice_attempt_count: 0,
    practice_accuracy: null,
    mock_attempt_count: 0,
    best_mock_score: null,
    recent_mock_score: null,
    category_breakdown: [],
  },
  mock_exams: [],
  recent_activity: {
    practice_attempts: [],
    mock_attempts: [],
  },
}

const emptyPracticeQuestions: PracticeQuestionsResponse = {
  selected_category: null,
  selected_exam_id: null,
  categories: [],
  exams: [],
  question_count: 0,
  questions: [],
}

export function StudentPreparationPage() {
  const { csrfToken } = useAuth()
  const [summary, setSummary] = useState<PreparationSummaryResponse>(emptySummary)
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestionsResponse>(emptyPracticeQuestions)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedExamId, setSelectedExamId] = useState('')
  const [loading, setLoading] = useState(true)
  const [practiceLoading, setPracticeLoading] = useState(true)
  const [submittingQuestionId, setSubmittingQuestionId] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<number, PracticeQuestionAttemptResponse>>({})
  const [error, setError] = useState<string | null>(null)

  async function loadSummary(active = true) {
    try {
      const response = await apiRequest<PreparationSummaryResponse>('/student/preparation-summary')
      if (active) {
        setSummary(response)
      }
    } catch (loadError) {
      if (active) {
        setError(loadError instanceof ApiError ? loadError.message : 'Unable to load your preparation workspace.')
      }
    }
  }

  async function loadPractice(active = true, category = selectedCategory, examId = selectedExamId) {
    if (active) {
      setPracticeLoading(true)
    }

    const params = new URLSearchParams()
    if (category) {
      params.set('category', category)
    }
    if (examId) {
      params.set('exam_id', examId)
    }

    try {
      const response = await apiRequest<PracticeQuestionsResponse>(
        `/student/practice-questions${params.toString() ? `?${params.toString()}` : ''}`,
      )
      if (active) {
        setPracticeQuestions(response)
      }
    } catch (loadError) {
      if (active) {
        setError(loadError instanceof ApiError ? loadError.message : 'Unable to load practice questions.')
      }
    } finally {
      if (active) {
        setPracticeLoading(false)
      }
    }
  }

  useEffect(() => {
    let active = true

    async function loadPage() {
      setLoading(true)
      await Promise.all([loadSummary(active), loadPractice(active, '', '')])
      if (active) {
        setLoading(false)
      }
    }

    void loadPage()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void loadPractice(active)
    return () => {
      active = false
    }
  }, [selectedCategory, selectedExamId])

  const filteredExams = useMemo(
    () => (selectedCategory ? practiceQuestions.exams.filter((exam) => exam.category === selectedCategory) : practiceQuestions.exams),
    [practiceQuestions.exams, selectedCategory],
  )

  async function handlePracticeSubmit(questionId: number) {
    const selectedOptionId = selectedAnswers[questionId]
    if (!selectedOptionId) {
      return
    }

    setSubmittingQuestionId(questionId)
    setError(null)

    try {
      const response = await apiRequest<PracticeQuestionAttemptResponse>(`/student/practice-questions/${questionId}/attempt`, {
        method: 'POST',
        body: { selected_option_id: selectedOptionId },
        csrfToken,
      })
      setFeedbackByQuestionId((current) => ({
        ...current,
        [questionId]: response,
      }))
      await loadSummary(true)
      await loadPractice(true)
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit practice answer.')
    } finally {
      setSubmittingQuestionId(null)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading preparation workspace…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student preparation</p>
          <h1>Preparation workspace</h1>
          <p className="lead">Practice by category, measure yourself with mock exams, and follow a deterministic study plan separate from official exam records.</p>
        </div>
        <div className="card compact-card">
          <strong>Preparation snapshot</strong>
          <p className="muted">Practice attempts: {summary.performance.practice_attempt_count}</p>
          <p className="muted">Mock attempts: {summary.performance.mock_attempt_count}</p>
          <Link className="secondary-button inline-button" to="/student/exams">
            Official exams
          </Link>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card-grid">
        <article className="card info-card">
          <h2>Practice accuracy</h2>
          <p className="metric">{summary.performance.practice_accuracy === null ? '—' : `${summary.performance.practice_accuracy}%`}</p>
        </article>
        <article className="card info-card">
          <h2>Best mock score</h2>
          <p className="metric">{summary.performance.best_mock_score === null ? '—' : `${summary.performance.best_mock_score}%`}</p>
        </article>
        <article className="card info-card">
          <h2>Preparation categories</h2>
          <p className="metric">{summary.categories.length}</p>
        </article>
      </div>

      <div className="card stack-card">
        <h2>Exam categories</h2>
        {summary.categories.length === 0 ? <p className="muted">No preparation categories are available yet.</p> : null}
        <div className="stack-list">
          {summary.categories.map((category) => (
            <article key={category.category} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{category.label}</h3>
                  <p className="muted">
                    {category.available_exam_count} exams · {category.practice_question_count} practice questions
                  </p>
                </div>
                <strong>{category.latest_mock_score === null ? 'No mock yet' : `${category.latest_mock_score}%`}</strong>
              </div>
              <p className="muted">
                Courses completed: {category.completed_courses} · Practice attempts: {category.practice_attempt_count} · Mock attempts: {category.mock_attempt_count}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Study plan</h2>
          {summary.study_plan.items.length === 0 ? <p className="muted">Your study plan will appear once preparation categories are available.</p> : null}
          <div className="stack-list">
            {summary.study_plan.items.map((item) => (
              <article key={item.category} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{item.label}</h3>
                    <p className="muted">{item.next_step}</p>
                  </div>
                  <span className="status-pill status-muted">{item.status.replace('_', ' ')}</span>
                </div>
                <p className="muted">
                  Practice target: {item.practice_completed}/{item.practice_target}
                  {item.latest_mock_score !== null ? ` · Latest mock ${item.latest_mock_score}%` : ''}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="card stack-card">
          <h2>Performance by category</h2>
          {summary.performance.category_breakdown.length === 0 ? <p className="muted">No preparation evidence yet.</p> : null}
          <div className="stack-list">
            {summary.performance.category_breakdown.map((item) => (
              <article key={item.category} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{item.label}</h3>
                    <p className="muted">
                      Practice {item.practice_attempt_count}
                      {item.practice_accuracy !== null ? ` · ${item.practice_accuracy}% accuracy` : ''}
                    </p>
                  </div>
                  <strong>{item.best_mock_score === null ? '—' : `${item.best_mock_score}%`}</strong>
                </div>
                <p className="muted">Mock attempts: {item.mock_attempt_count}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="card stack-card">
        <div className="skill-card-header">
          <div>
            <h2>Mock exams</h2>
            <p className="muted">Mock exams use the same protected question pool, but their history stays separate from official exam results.</p>
          </div>
        </div>
        {summary.mock_exams.length === 0 ? <p className="muted">No mock exams are ready yet.</p> : null}
        <div className="stack-list">
          {summary.mock_exams.map((exam) => (
            <article key={exam.exam_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{exam.title}</h3>
                  <p className="muted">
                    {exam.category} · {exam.duration_minutes} min · {exam.question_count} questions
                  </p>
                </div>
                <strong>{exam.last_score === null ? 'No mock yet' : `${exam.last_score}%`}</strong>
              </div>
              <p>{exam.description || 'No mock exam description yet.'}</p>
              <p className="muted">Attempts: {exam.attempt_count}{exam.best_score !== null ? ` · Best ${exam.best_score}%` : ''}</p>
              <Link className="primary-button inline-button" to={exam.detail_href}>
                Start mock exam
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="card stack-card">
        <h2>Practice question bank</h2>
        <div className="actions">
          <label className="skill-card">
            <span>Category</span>
            <select value={selectedCategory} onChange={(event) => {
              setSelectedCategory(event.target.value)
              setSelectedExamId('')
            }}>
              <option value="">All categories</option>
              {practiceQuestions.categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="skill-card">
            <span>Exam</span>
            <select value={selectedExamId} onChange={(event) => setSelectedExamId(event.target.value)}>
              <option value="">All exams</option>
              {filteredExams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {practiceLoading ? <p className="muted">Loading practice questions…</p> : null}
        {!practiceLoading && practiceQuestions.questions.length === 0 ? <p className="muted">No practice questions match the selected filters.</p> : null}
        <div className="stack-list">
          {practiceQuestions.questions.map((question) => (
            <article key={question.question_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{question.exam_title} · Question {question.sequence_number}</h3>
                  <p className="muted">
                    {question.category} · {question.points} point{question.points === 1 ? '' : 's'} · Attempts {question.attempt_count}
                  </p>
                </div>
                {question.last_outcome === null ? null : (
                  <span className={`status-pill ${question.last_outcome ? 'status-success' : 'status-muted'}`}>
                    {question.last_outcome ? 'Last answer correct' : 'Review again'}
                  </span>
                )}
              </div>
              <p>{question.prompt}</p>
              {question.instructions ? <p className="muted">{question.instructions}</p> : null}
              <div className="stack-list">
                {question.options.map((option) => (
                  <label key={option.option_id} className="skill-card">
                    <input
                      type="radio"
                      name={`practice-question-${question.question_id}`}
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
              {feedbackByQuestionId[question.question_id] ? (
                <div className={`card ${feedbackByQuestionId[question.question_id].is_correct ? 'form-success' : 'form-error'}`}>
                  <p>{feedbackByQuestionId[question.question_id].feedback}</p>
                  <p className="muted">Correct option: {feedbackByQuestionId[question.question_id].correct_option_text}</p>
                </div>
              ) : null}
              <button
                className="primary-button inline-button"
                type="button"
                onClick={() => void handlePracticeSubmit(question.question_id)}
                disabled={submittingQuestionId === question.question_id || !selectedAnswers[question.question_id]}
              >
                {submittingQuestionId === question.question_id ? 'Checking…' : 'Check answer'}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Recent practice</h2>
          {summary.recent_activity.practice_attempts.length === 0 ? <p className="muted">No practice attempts yet.</p> : null}
          <div className="stack-list">
            {summary.recent_activity.practice_attempts.map((attempt) => (
              <article key={attempt.attempt_id} className="skill-card">
                <h3>{attempt.exam_title}</h3>
                <p className="muted">{attempt.question_prompt}</p>
                <p className={`status-pill ${attempt.is_correct ? 'status-success' : 'status-muted'}`}>
                  {attempt.is_correct ? 'Correct' : 'Incorrect'}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="card stack-card">
          <h2>Recent mock attempts</h2>
          {summary.recent_activity.mock_attempts.length === 0 ? <p className="muted">No mock attempts yet.</p> : null}
          <div className="stack-list">
            {summary.recent_activity.mock_attempts.map((attempt) => (
              <article key={attempt.attempt_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{attempt.exam_title}</h3>
                    <p className="muted">
                      Attempt {attempt.attempt_number} · {attempt.correct_answer_count}/{attempt.total_questions} correct
                    </p>
                  </div>
                  <strong>{attempt.score_percent}%</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
