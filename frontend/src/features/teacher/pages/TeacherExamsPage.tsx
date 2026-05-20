import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertCircle, ChevronRight, ClipboardList, FileCheck2, Search, Trophy } from 'lucide-react'

import type { TeacherExamsResponse } from '@/features/teacher/types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { apiRequest } from '@/lib/api'

const emptyResponse: TeacherExamsResponse = {
  exams: [],
  summary: {
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
  },
}

const cardClassName = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'

function formatCategoryLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatStatusLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function TeacherExamsPage() {
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()

  const examsQuery = useQuery({
    queryKey: ['teacher-exams'],
    queryFn: () => apiRequest<TeacherExamsResponse>('/teacher/exams'),
  })

  const data = examsQuery.data ?? emptyResponse
  const error =
    examsQuery.error instanceof Error ? examsQuery.error.message : examsQuery.isError ? 'Unable to load exams.' : null

  const filteredExams = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return data.exams.filter((exam) => {
      if (!normalizedQuery) {
        return true
      }

      return [exam.title, exam.description, exam.category, exam.status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [data.exams, searchQuery])

  if (examsQuery.isLoading) {
    return (
      <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 xl:px-8">
        <div className={cardClassName}>
          <LoadingState title="Loading related exams" className="min-h-48 py-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 xl:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teacher" className="transition-colors hover:text-foreground">
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
              <h3 className="font-semibold">Unable to load related exams</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className={cardClassName}>
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Related exams</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This view now matches the student exam workspace styling and only shows exam activity tied to your learners.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                  <ClipboardList className="h-4 w-4" />
                  {data.summary.total} related exams
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                  <Trophy className="h-4 w-4" />
                  {data.summary.active} active
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search related exams"
                  className="h-11 pl-10"
                />
              </div>

              {filteredExams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="font-medium text-slate-900 dark:text-slate-100">No related exams found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Exams will appear here once students linked to your courses start generating exam activity.
                  </p>
                </div>
              ) : (
                filteredExams.map((exam) => (
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
                          <Badge variant="secondary" className="rounded-full">
                            {formatStatusLabel(exam.status)}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{exam.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {exam.duration_minutes} min · pass {exam.passing_score_percent}% · {exam.question_count} questions
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Max {exam.max_attempts} attempts per learner</p>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{exam.description || 'No exam description yet.'}</p>
                      </div>

                      <div className="flex min-w-[160px] flex-col items-start rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Results</span>
                        <span className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">{exam.result_count}</span>
                        <span className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <FileCheck2 className="h-4 w-4" />
                          Linked learner results
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className={cardClassName}>
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Status overview</h2>
                <p className="mt-1 text-sm text-muted-foreground">A quick summary of the exam activity currently attached to your learners.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{data.summary.active}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Draft</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{data.summary.draft}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inactive</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{data.summary.inactive}</p>
              </div>
            </div>

            <div className="mt-6">
              <Button type="button" variant="outline" className="rounded-xl" disabled>
                Teacher exam details are read-only for now
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
