import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CircleAlert, CircleCheckBig, Clock3, FileQuestion, Target, Trophy } from 'lucide-react'

import { LoadingState } from '@/components/LoadingIndicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const progressPercent = data.question_count > 0 ? Math.round((answeredCount / data.question_count) * 100) : 0
  const readyToSubmit = data.question_count > 0 && answeredCount === data.question_count

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
      <div className="py-12">
        <LoadingState title="Loading mock exam" className="min-h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]">
            Student preparation
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{data.title || 'Mock exam'}</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              {data.description || 'Use this mock exam to measure readiness without changing your official exam history.'}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-2xl">
          <Link to="/student/preparation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to preparation
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 pt-6 text-red-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Mock exam issue</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Questions</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <FileQuestion className="h-7 w-7 text-primary" />
              {data.question_count}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Duration</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Clock3 className="h-7 w-7 text-violet-600" />
              {data.duration_minutes}m
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Attempt number</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Target className="h-7 w-7 text-amber-600" />
              {data.next_attempt_number}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Best score</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Trophy className="h-7 w-7 text-emerald-600" />
              {data.best_score === null ? '—' : `${data.best_score}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Exam progress</CardTitle>
            <CardDescription>
              {data.category} · {answeredCount}/{data.question_count} answered
              {data.last_score !== null ? ` · last score ${data.last_score}%` : ''}
              {data.attempt_count > 0 ? ` · ${data.attempt_count} previous attempt${data.attempt_count === 1 ? '' : 's'}` : ''}
            </CardDescription>
          </div>
          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
            {progressPercent}% complete
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.questions.map((question, index) => {
              const answered = selectedAnswers[question.question_id] !== undefined
              return (
                <button
                  key={question.question_id}
                  type="button"
                  onClick={() => document.getElementById(`mock-question-${question.question_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                    answered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  aria-label={`Jump to question ${index + 1}`}
                >
                  {answered ? <CircleCheckBig className="h-4 w-4" /> : index + 1}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {data.questions.map((question) => (
          <Card key={question.question_id} id={`mock-question-${question.question_id}`} className="scroll-mt-24 border-slate-200/80 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="text-xl">Question {question.sequence_number}</CardTitle>
                  <CardDescription>
                    {question.points} point{question.points === 1 ? '' : 's'}
                  </CardDescription>
                </div>
                {selectedAnswers[question.question_id] !== undefined ? (
                  <Badge className="w-fit rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Answer selected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-fit rounded-full">
                    Waiting for answer
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-slate-800">{question.prompt}</p>
              {question.instructions ? (
                <p className="mt-2 text-sm leading-6 text-slate-500">{question.instructions}</p>
              ) : null}

              <div className="mt-5 grid gap-3">
                {question.options.map((option) => {
                  const selected = selectedAnswers[question.question_id] === option.option_id
                  return (
                    <label
                      key={option.option_id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mock-question-${question.question_id}`}
                        checked={selected}
                        onChange={() =>
                          setSelectedAnswers((current) => ({
                            ...current,
                            [question.question_id]: option.option_id,
                          }))
                        }
                        className="mt-1"
                      />
                      <span className="text-sm leading-6 text-slate-700">{option.option_text}</span>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 bg-slate-900 text-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Submission</p>
            <h2 className="text-2xl font-semibold">
              {readyToSubmit ? 'All questions answered. Ready to submit.' : 'Answer every question before submitting.'}
            </h2>
            <p className="text-sm leading-6 text-white/70">
              Your mock attempt stays separate from official exam history while still using the same protected question set.
            </p>
          </div>
          <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => void handleSubmit()} disabled={saving || !readyToSubmit}>
            {saving ? 'Submitting…' : 'Submit mock exam'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
