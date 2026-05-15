import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ChevronRight, ClipboardList, FileCheck2, Trophy } from 'lucide-react'

import { ApiError, apiRequest } from '../../lib/api'
import type { ExamResultsSummary } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const emptySummary: ExamResultsSummary = {
  student_id: 0,
  total_results: 0,
  passed_results: 0,
  average_score: null,
  results: [],
  available_exams: [],
}

const cardClassName = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'

function formatCategoryLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatTakenAt(value: string) {
  return new Date(value).toLocaleString()
}

export default function StudentExamResultsPage() {
  const navigate = useNavigate()
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
          setError(null)
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
      <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 xl:px-8">
        <div className={cardClassName}>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading exam results…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 xl:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Exams</span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Unable to load exam results</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className={cardClassName}>
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Available exams</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start a new exam attempt or review what is currently unlocked for you.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {summary.available_exams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="font-medium text-slate-900 dark:text-slate-100">No active exams are available yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    New official exams will appear here once they are published and available to you.
                  </p>
                </div>
              ) : (
                summary.available_exams.map((exam) => (
                  <article
                    key={exam.exam_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {formatCategoryLabel(exam.category)}
                          </Badge>
                          <Badge
                            className={
                              exam.attempt_count === 0
                                ? 'rounded-full border-transparent bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'
                                : 'rounded-full border-transparent bg-blue-600 text-white hover:bg-blue-600'
                            }
                          >
                            {exam.attempt_count === 1 ? '1 attempt' : `${exam.attempt_count} attempts`}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{exam.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {exam.duration_minutes} min · pass {exam.passing_score_percent}% · {exam.question_count}{' '}
                            questions · max {exam.max_attempts} attempts
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Attempts used: {exam.attempt_count} of {exam.max_attempts}
                          </p>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {exam.description || 'No exam description yet.'}
                        </p>
                        <p className="text-xs text-muted-foreground">{exam.retake_message}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => navigate(exam.detail_href)}
                        >
                          View exam
                        </Button>
                        {exam.can_take ? (
                          <Button
                            type="button"
                            className="rounded-xl"
                            onClick={() => navigate(exam.detail_href)}
                          >
                            Start exam
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className={cardClassName}>
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Exam records</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track your past attempts, passing status, and official scores.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                  <ClipboardList className="h-4 w-4" />
                  {summary.total_results} total results
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                  <Trophy className="h-4 w-4" />
                  {summary.passed_results} passed
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {summary.results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="font-medium text-slate-900 dark:text-slate-100">No exam results yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Once you complete an exam, your official result history will appear here.
                  </p>
                </div>
              ) : (
                summary.results.map((result) => (
                  <article
                    key={result.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {formatCategoryLabel(result.category)}
                          </Badge>
                          <Badge variant={result.passed ? 'default' : 'secondary'} className="rounded-full">
                            Attempt {result.attempt_number}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{result.exam_title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Taken: {formatTakenAt(result.taken_at)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {result.passed ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="font-medium text-green-700 dark:text-green-300">Passed</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              <span className="font-medium text-amber-700 dark:text-amber-300">Not passed</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-[120px] flex-col items-start rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Score</span>
                        <span className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">
                          {result.score_percent}%
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <FileCheck2 className="h-4 w-4" />
                          Official result
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
