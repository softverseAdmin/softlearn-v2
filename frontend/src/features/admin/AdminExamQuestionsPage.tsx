import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type {
  AdminExamAnswerOptionRecord,
  AdminExamQuestionRecord,
  AdminExamQuestionsResponse,
  AdminQuestionOptionsResponse,
} from './types'

const emptyExamQuestions: AdminExamQuestionsResponse = {
  exam: {
    exam_id: 0,
    title: '',
    description: '',
    category: '',
    duration_minutes: 0,
    passing_score_percent: 70,
    question_count: 0,
    max_attempts: 3,
    status: 'draft',
    result_count: 0,
    created_at: '',
    updated_at: '',
  },
  questions: [],
}

const emptyQuestionOptions: AdminQuestionOptionsResponse = {
  question: {
    question_id: 0,
    exam_id: 0,
    prompt: '',
    instructions: '',
    question_type: 'single_choice',
    sequence_number: 1,
    points: 1,
    status: 'draft',
    option_count: 0,
    created_at: '',
    updated_at: '',
  },
  options: [],
}

export function AdminExamQuestionsPage() {
  const { examId } = useParams<{ examId: string }>()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminExamQuestionsResponse>(emptyExamQuestions)
  const [optionsData, setOptionsData] = useState<AdminQuestionOptionsResponse>(emptyQuestionOptions)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [questionPrompt, setQuestionPrompt] = useState('')
  const [questionInstructions, setQuestionInstructions] = useState('')
  const [questionType, setQuestionType] = useState('single_choice')
  const [questionSequence, setQuestionSequence] = useState('1')
  const [questionPoints, setQuestionPoints] = useState('1')
  const [questionStatus, setQuestionStatus] = useState('draft')
  const [optionText, setOptionText] = useState('')
  const [optionSequence, setOptionSequence] = useState('1')
  const [optionIsCorrect, setOptionIsCorrect] = useState(false)
  const [optionStatus, setOptionStatus] = useState('active')
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedQuestion = useMemo(
    () => data.questions.find((question) => question.question_id === selectedQuestionId) ?? null,
    [data.questions, selectedQuestionId],
  )

  const selectedOption = useMemo(
    () => optionsData.options.find((option) => option.option_id === selectedOptionId) ?? null,
    [optionsData.options, selectedOptionId],
  )

  useEffect(() => {
    if (!selectedQuestion) {
      setQuestionPrompt('')
      setQuestionInstructions('')
      setQuestionType('single_choice')
      setQuestionSequence(String(data.questions.length + 1 || 1))
      setQuestionPoints('1')
      setQuestionStatus('draft')
      setOptionsData(emptyQuestionOptions)
      return
    }

    setQuestionPrompt(selectedQuestion.prompt)
    setQuestionInstructions(selectedQuestion.instructions)
    setQuestionType(selectedQuestion.question_type)
    setQuestionSequence(String(selectedQuestion.sequence_number))
    setQuestionPoints(String(selectedQuestion.points))
    setQuestionStatus(selectedQuestion.status)
  }, [data.questions.length, selectedQuestion])

  useEffect(() => {
    if (!selectedOption) {
      setOptionText('')
      setOptionSequence(String(optionsData.options.length + 1 || 1))
      setOptionIsCorrect(false)
      setOptionStatus('active')
      return
    }

    setOptionText(selectedOption.option_text)
    setOptionSequence(String(selectedOption.sequence_number))
    setOptionIsCorrect(selectedOption.is_correct)
    setOptionStatus(selectedOption.status)
  }, [optionsData.options.length, selectedOption])

  useEffect(() => {
    let active = true

    async function loadQuestions() {
      if (!examId) {
        setError('Exam id is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<AdminExamQuestionsResponse>(`/admin/exams/${examId}/questions`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load exam questions.')
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

  useEffect(() => {
    let active = true

    async function loadOptions() {
      if (!selectedQuestionId) {
        return
      }

      try {
        const response = await apiRequest<AdminQuestionOptionsResponse>(`/admin/questions/${selectedQuestionId}/options`)
        if (active) {
          setOptionsData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load answer options.')
        }
      }
    }

    void loadOptions()
    return () => {
      active = false
    }
  }, [selectedQuestionId])

  async function refreshQuestions() {
    if (!examId) {
      return
    }
    const response = await apiRequest<AdminExamQuestionsResponse>(`/admin/exams/${examId}/questions`)
    setData(response)
  }

  async function refreshOptions(questionId: number) {
    const response = await apiRequest<AdminQuestionOptionsResponse>(`/admin/questions/${questionId}/options`)
    setOptionsData(response)
  }

  async function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!examId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        prompt: questionPrompt,
        instructions: questionInstructions,
        question_type: questionType,
        sequence_number: Number(questionSequence),
        points: Number(questionPoints),
        status: questionStatus,
      }

      if (selectedQuestion) {
        await apiRequest<AdminExamQuestionRecord>(`/admin/questions/${selectedQuestion.question_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Question updated successfully.')
      } else {
        await apiRequest<AdminExamQuestionRecord>(`/admin/exams/${examId}/questions`, {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Question created successfully.')
      }

      await refreshQuestions()
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save question.')
    } finally {
      setSaving(false)
    }
  }

  async function handleQuestionRetire(questionId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<AdminExamQuestionRecord>(`/admin/questions/${questionId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshQuestions()
      if (selectedQuestionId === questionId) {
        setSelectedQuestionId(null)
      }
      setSuccess('Question retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire question.')
    } finally {
      setSaving(false)
    }
  }

  async function handleOptionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedQuestionId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        option_text: optionText,
        sequence_number: Number(optionSequence),
        is_correct: optionIsCorrect,
        status: optionStatus,
      }

      if (selectedOption) {
        await apiRequest<AdminExamAnswerOptionRecord>(`/admin/options/${selectedOption.option_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Answer option updated successfully.')
      } else {
        await apiRequest<AdminExamAnswerOptionRecord>(`/admin/questions/${selectedQuestionId}/options`, {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Answer option created successfully.')
      }

      await refreshOptions(selectedQuestionId)
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save answer option.')
    } finally {
      setSaving(false)
    }
  }

  async function handleOptionRetire(optionId: number) {
    if (!selectedQuestionId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<AdminExamAnswerOptionRecord>(`/admin/options/${optionId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshOptions(selectedQuestionId)
      if (selectedOptionId === optionId) {
        setSelectedOptionId(null)
      }
      setSuccess('Answer option retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire answer option.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading exam questions…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin assessment content</p>
          <h1>{data.exam.title || 'Exam questions'}</h1>
          <p className="lead">Author structured questions and protected answer options for a shared exam.</p>
        </div>
        <div className="actions">
          <Link className="secondary-button inline-button" to="/admin/exams">
            Back to exams
          </Link>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedQuestion ? 'Edit question' : 'Create question'}</h2>
          <form className="form" onSubmit={handleQuestionSubmit}>
            <label>
              <span>Prompt</span>
              <textarea value={questionPrompt} onChange={(event) => setQuestionPrompt(event.target.value)} rows={4} required />
            </label>
            <label>
              <span>Instructions</span>
              <textarea value={questionInstructions} onChange={(event) => setQuestionInstructions(event.target.value)} rows={3} />
            </label>
            <label>
              <span>Question type</span>
              <select value={questionType} onChange={(event) => setQuestionType(event.target.value)}>
                <option value="single_choice">Single choice</option>
              </select>
            </label>
            <label>
              <span>Sequence number</span>
              <input type="number" min={1} value={questionSequence} onChange={(event) => setQuestionSequence(event.target.value)} required />
            </label>
            <label>
              <span>Points</span>
              <input type="number" min={1} value={questionPoints} onChange={(event) => setQuestionPoints(event.target.value)} required />
            </label>
            <label>
              <span>Status</span>
              <select value={questionStatus} onChange={(event) => setQuestionStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedQuestion ? 'Update question' : 'Create question'}
              </button>
              {selectedQuestion ? (
                <button className="secondary-button inline-button" type="button" onClick={() => setSelectedQuestionId(null)} disabled={saving}>
                  New question
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Questions</h2>
          <div className="stack-list">
            {data.questions.map((question) => (
              <article key={question.question_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>Q{question.sequence_number}</h3>
                    <p className="muted">{question.points} point{question.points === 1 ? '' : 's'} · {question.option_count} options</p>
                  </div>
                  <span className={`status-pill ${question.status === 'active' ? 'status-success' : 'status-muted'}`}>{question.status}</span>
                </div>
                <p>{question.prompt}</p>
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedQuestionId(question.question_id)}>
                    Edit
                  </button>
                  <button className="secondary-button inline-button" type="button" onClick={() => { setSelectedQuestionId(question.question_id); setSelectedOptionId(null) }}>
                    Options
                  </button>
                  {question.status !== 'inactive' ? (
                    <button className="danger-button inline-button" type="button" onClick={() => void handleQuestionRetire(question.question_id)} disabled={saving}>
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.questions.length === 0 ? <p className="muted">No questions yet.</p> : null}
          </div>
        </div>
      </div>

      {selectedQuestion ? (
        <div className="page-split">
          <div className="card stack-card">
            <h2>{selectedOption ? 'Edit answer option' : 'Create answer option'}</h2>
            <form className="form" onSubmit={handleOptionSubmit}>
              <label>
                <span>Option text</span>
                <input value={optionText} onChange={(event) => setOptionText(event.target.value)} required />
              </label>
              <label>
                <span>Sequence number</span>
                <input type="number" min={1} value={optionSequence} onChange={(event) => setOptionSequence(event.target.value)} required />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={optionIsCorrect} onChange={(event) => setOptionIsCorrect(event.target.checked)} />
                <span>Correct option</span>
              </label>
              <label>
                <span>Status</span>
                <select value={optionStatus} onChange={(event) => setOptionStatus(event.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="actions">
                <button className="primary-button inline-button" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : selectedOption ? 'Update option' : 'Create option'}
                </button>
                {selectedOption ? (
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedOptionId(null)} disabled={saving}>
                    New option
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="card stack-card">
            <h2>Answer options</h2>
            <div className="stack-list">
              {optionsData.options.map((option) => (
                <article key={option.option_id} className="skill-card">
                  <div className="skill-card-header">
                    <div>
                      <h3>{option.sequence_number}. {option.option_text}</h3>
                      <p className="muted">{option.is_correct ? 'Correct' : 'Distractor'}</p>
                    </div>
                    <span className={`status-pill ${option.status === 'active' ? 'status-success' : 'status-muted'}`}>{option.status}</span>
                  </div>
                  <div className="actions">
                    <button className="secondary-button inline-button" type="button" onClick={() => setSelectedOptionId(option.option_id)}>
                      Edit
                    </button>
                    {option.status !== 'inactive' ? (
                      <button className="danger-button inline-button" type="button" onClick={() => void handleOptionRetire(option.option_id)} disabled={saving}>
                        Retire
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
              {optionsData.options.length === 0 ? <p className="muted">No answer options yet.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
