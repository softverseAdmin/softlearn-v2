import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentExamDetailResponse, StudentExamSubmitResponse } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { containerVariants, itemVariants } from '../../lib/animations'

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
    return (
      <div className="space-y-6 md:space-y-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading exam…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student assessment</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{data.title || 'Exam'}</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {data.description || 'Answer each question once, then submit the full exam for scoring.'}
          </p>
        </div>
        <Card className="min-w-fit dark:bg-card dark:border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Attempt summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm font-medium">
              Attempt {data.next_attempt_number ?? data.attempt_count} of {data.max_attempts}
            </p>
            <p className="text-sm text-muted-foreground">
              {answeredCount} / {data.question_count} answered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Exam Info Card */}
      <Card className="dark:bg-card dark:border-border">
        <CardHeader>
          <CardTitle className="text-base">Exam details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{data.category}</Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {data.duration_minutes} minutes
            </span>
            <span>Pass mark: {data.passing_score_percent}%</span>
          </div>
          {data.retake_message ? (
            <p className="text-sm text-muted-foreground">{data.retake_message}</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Questions ({answeredCount} / {data.question_count})</h2>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.questions.map((question) => (
            <motion.div key={question.question_id} variants={itemVariants}>
              <Card className="overflow-hidden transition-all hover:shadow-lg dark:bg-card dark:border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">
                        Question {question.sequence_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {question.points} point{question.points === 1 ? '' : 's'}
                      </p>
                    </div>
                    {selectedAnswers[question.question_id] !== undefined && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm">{question.prompt}</p>

                  {question.instructions ? (
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 dark:bg-muted/30 p-3">
                      <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground">{question.instructions}</p>
                    </div>
                  ) : null}

                  {/* Options */}
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.option_id}
                        className="flex items-start gap-3 cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 dark:hover:bg-muted/30"
                      >
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
                          className="mt-1 flex-shrink-0"
                        />
                        <span className="text-sm flex-1">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border border-border">
        <Link
          to="/student/exams"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to exam history
        </Link>
        <Button
          onClick={() => void handleSubmit()}
          disabled={saving || answeredCount !== data.question_count}
          className="flex-1"
        >
          {saving ? 'Submitting…' : 'Submit exam'}
        </Button>
      </div>
    </div>
  )
}
