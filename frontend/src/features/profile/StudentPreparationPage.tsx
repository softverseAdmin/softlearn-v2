import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CircleAlert,
  CircleCheckBig,
  ClipboardList,
  GraduationCap,
  Target,
} from 'lucide-react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type {
  PracticeQuestionAttemptResponse,
  PracticeQuestionsResponse,
  PreparationSummaryResponse,
} from './types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

type FocusSection = 'overview' | 'practice' | 'study-plan' | 'performance'

function focusSectionFromPath(pathname: string): FocusSection {
  if (pathname.includes('/learning/practice')) return 'practice'
  if (pathname.includes('/learning/study-plan')) return 'study-plan'
  if (pathname.includes('/learning/performance')) return 'performance'
  return 'overview'
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'ready':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'in_progress':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'focus':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function StudentPreparationPage() {
  const { examId: routeExamId } = useParams<{ examId?: string }>()
  const location = useLocation()
  const { csrfToken } = useAuth()
  const [summary, setSummary] = useState<PreparationSummaryResponse>(emptySummary)
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestionsResponse>(emptyPracticeQuestions)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedExamId, setSelectedExamId] = useState(routeExamId ?? '')
  const [loading, setLoading] = useState(true)
  const [practiceLoading, setPracticeLoading] = useState(true)
  const [submittingQuestionId, setSubmittingQuestionId] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<number, PracticeQuestionAttemptResponse>>({})
  const [error, setError] = useState<string | null>(null)
  const practiceSectionRef = useRef<HTMLElement | null>(null)
  const studyPlanSectionRef = useRef<HTMLElement | null>(null)
  const performanceSectionRef = useRef<HTMLElement | null>(null)

  const focusSection = useMemo(() => focusSectionFromPath(location.pathname), [location.pathname])

  const loadSummary = useCallback(async (active = true) => {
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
  }, [])

  const loadPractice = useCallback(async (active = true, category = selectedCategory, examId = selectedExamId) => {
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
  }, [selectedCategory, selectedExamId])

  useEffect(() => {
    let active = true

    async function loadPage() {
      setLoading(true)
      await loadSummary(active)
      if (active) {
        setLoading(false)
      }
    }

    void loadPage()
    return () => {
      active = false
    }
  }, [loadSummary])

  useEffect(() => {
    let active = true
    void loadPractice(active)
    return () => {
      active = false
    }
  }, [loadPractice])

  useEffect(() => {
    setSelectedExamId(routeExamId ?? '')
  }, [routeExamId])

  useEffect(() => {
    if (loading) {
      return
    }

    const sectionRef =
      focusSection === 'practice'
        ? practiceSectionRef
        : focusSection === 'study-plan'
          ? studyPlanSectionRef
          : focusSection === 'performance'
            ? performanceSectionRef
            : null

    sectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusSection, loading])

  const filteredExams = useMemo(
    () => (selectedCategory ? practiceQuestions.exams.filter((exam) => exam.category === selectedCategory) : practiceQuestions.exams),
    [practiceQuestions.exams, selectedCategory],
  )

  const completionRate = summary.categories.length
    ? Math.round((summary.categories.filter((category) => category.completed_courses > 0).length / summary.categories.length) * 100)
    : 0

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
    return (
      <div className="py-12">
        <LoadingState title="Loading your preparation workspace" className="min-h-40" />
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Preparation workspace</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              Practice by category, build mock-exam confidence, and follow a deterministic study plan from one
              production-ready workspace.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild className="rounded-2xl">
            <Link to="/student/exams">
              Official exams
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/student/courses">Browse courses</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 pt-6 text-red-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Preparation data could not be loaded completely.</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Practice accuracy</CardDescription>
            <CardTitle className="text-3xl">
              {summary.performance.practice_accuracy === null ? '—' : `${summary.performance.practice_accuracy}%`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-600">
            {summary.performance.practice_attempt_count} checked attempt
            {summary.performance.practice_attempt_count === 1 ? '' : 's'}
          </CardContent>
        </Card>
        <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Best mock score</CardDescription>
            <CardTitle className="text-3xl">
              {summary.performance.best_mock_score === null ? '—' : `${summary.performance.best_mock_score}%`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-600">
            {summary.performance.mock_attempt_count} mock attempt
            {summary.performance.mock_attempt_count === 1 ? '' : 's'}
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Covered categories</CardDescription>
            <CardTitle className="text-3xl">{summary.categories.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-600">
            {completionRate}% of categories already have finished coursework
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/80">
          <CardHeader className="pb-3">
            <CardDescription>Recent mock score</CardDescription>
            <CardTitle className="text-3xl">
              {summary.performance.recent_mock_score === null ? '—' : `${summary.performance.recent_mock_score}%`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-600">
            Latest snapshot across your protected preparation history
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={focusSection === 'overview' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Overview
        </Button>
        <Button
          type="button"
          variant={focusSection === 'practice' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => practiceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          Practice bank
        </Button>
        <Button
          type="button"
          variant={focusSection === 'study-plan' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => studyPlanSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          Study plan
        </Button>
        <Button
          type="button"
          variant={focusSection === 'performance' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => performanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          Performance
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Exam categories
              </CardTitle>
              <CardDescription>Choose the category where you want to improve next.</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-full">
              {summary.categories.length} tracked
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {summary.categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No preparation categories are available yet.
              </div>
            ) : (
              summary.categories.map((category) => (
                <article key={category.category} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{category.label}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {category.available_exam_count} exams · {category.practice_question_count} practice questions
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {category.latest_mock_score === null ? 'No mock yet' : `${category.latest_mock_score}% latest`}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Courses</dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {category.completed_courses}/{category.course_count} completed
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Practice</dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {category.practice_attempt_count} attempts
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Accuracy</dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {category.practice_accuracy === null ? '—' : `${category.practice_accuracy}%`}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Mocks</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{category.mock_attempt_count}</dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-violet-600" />
              Preparation snapshot
            </CardTitle>
            <CardDescription>The same workspace now powers the legacy learning URLs as well.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Practice attempts</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.performance.practice_attempt_count}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Mock attempts</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.performance.mock_attempt_count}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Recent activity</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {summary.recent_activity.practice_attempts.length + summary.recent_activity.mock_attempts.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section ref={studyPlanSectionRef} className="scroll-mt-24">
        <Card className={`border-slate-200/80 shadow-sm ${focusSection === 'study-plan' ? 'ring-2 ring-primary/15' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Study plan
            </CardTitle>
            <CardDescription>Work through the next recommended steps by category.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {summary.study_plan.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Your study plan will appear once preparation categories are available.
              </div>
            ) : (
              summary.study_plan.items.map((item) => (
                <article key={item.category} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.label}</h2>
                      <p className="mt-1 text-sm text-slate-500">{item.next_step}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                      style={{
                        width: `${Math.min(100, Math.round((item.practice_completed / Math.max(item.practice_target, 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                    <span>
                      Practice target {item.practice_completed}/{item.practice_target}
                    </span>
                    <span>{item.latest_mock_score === null ? 'No mock score yet' : `Latest mock ${item.latest_mock_score}%`}</span>
                  </div>
                  <Button asChild variant="outline" className="mt-4 rounded-2xl">
                    <Link to={item.cta_href}>Open next step</Link>
                  </Button>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section ref={performanceSectionRef} className="scroll-mt-24">
        <Card className={`border-slate-200/80 shadow-sm ${focusSection === 'performance' ? 'ring-2 ring-primary/15' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Performance by category
            </CardTitle>
            <CardDescription>Track where practice accuracy and mock confidence are improving.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {summary.performance.category_breakdown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No preparation evidence yet.
              </div>
            ) : (
              summary.performance.category_breakdown.map((item) => (
                <article key={item.category} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.label}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Practice {item.practice_attempt_count}
                        {item.practice_accuracy !== null ? ` · ${item.practice_accuracy}% accuracy` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {item.best_mock_score === null ? '—' : `${item.best_mock_score}% best`}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Mock attempts</p>
                      <p className="mt-1 font-semibold text-slate-900">{item.mock_attempt_count}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Latest mock</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {item.latest_mock_score === null ? '—' : `${item.latest_mock_score}%`}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Mock exams
          </CardTitle>
          <CardDescription>Mock attempts stay separate from official exam history while using the same protected content.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {summary.mock_exams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No mock exams are ready yet.
            </div>
          ) : (
            summary.mock_exams.map((exam) => (
              <article key={exam.exam_id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{exam.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {exam.category} · {exam.duration_minutes} min · {exam.question_count} questions
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {exam.last_score === null ? 'No score yet' : `${exam.last_score}% last`}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{exam.description || 'No mock exam description yet.'}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>Attempts: {exam.attempt_count}</span>
                  <span>{exam.best_score === null ? 'Best score pending' : `Best ${exam.best_score}%`}</span>
                </div>
                <Button asChild className="mt-4 rounded-2xl">
                  <Link to={exam.detail_href}>Start mock exam</Link>
                </Button>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <section ref={practiceSectionRef} className="scroll-mt-24">
        <Card className={`border-slate-200/80 shadow-sm ${focusSection === 'practice' ? 'ring-2 ring-primary/15' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Practice question bank
            </CardTitle>
            <CardDescription>Filter the protected question pool by category or exam and get immediate feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Category</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value)
                    setSelectedExamId('')
                  }}
                  className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">All categories</option>
                  {practiceQuestions.categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Exam</span>
                <select
                  value={selectedExamId}
                  onChange={(event) => setSelectedExamId(event.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">All exams</option>
                  {filteredExams.map((exam) => (
                    <option key={exam.exam_id} value={exam.exam_id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <div className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {practiceQuestions.question_count} question{practiceQuestions.question_count === 1 ? '' : 's'} available
                </div>
              </div>
            </div>

            {practiceLoading ? <LoadingState title="Loading practice questions" className="min-h-24" /> : null}

            {!practiceLoading && practiceQuestions.questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No practice questions match the selected filters.
              </div>
            ) : null}

            <div className="space-y-4">
              {practiceQuestions.questions.map((question) => {
                const feedback = feedbackByQuestionId[question.question_id]
                return (
                  <article key={question.question_id} className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {question.exam_title} · Question {question.sequence_number}
                          </h2>
                          {question.last_outcome === null ? null : question.last_outcome ? (
                            <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              Last answer correct
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                              Review again
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {question.category} · {question.points} point{question.points === 1 ? '' : 's'} · Attempts {question.attempt_count}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-base leading-7 text-slate-800">{question.prompt}</p>
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
                              name={`practice-question-${question.question_id}`}
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

                    {feedback ? (
                      <div
                        className={`mt-5 rounded-2xl border px-4 py-4 text-sm ${
                          feedback.is_correct
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {feedback.is_correct ? <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
                          <div>
                            <p className="font-semibold">{feedback.is_correct ? 'Correct answer' : 'Needs review'}</p>
                            <p className="mt-1 leading-6">{feedback.feedback}</p>
                            <p className="mt-2 text-xs">Correct option: {feedback.correct_option_text}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-slate-500">
                        {selectedAnswers[question.question_id] ? 'Answer selected and ready to check.' : 'Choose one option to check your answer.'}
                      </div>
                      <Button
                        type="button"
                        className="rounded-2xl"
                        onClick={() => void handlePracticeSubmit(question.question_id)}
                        disabled={submittingQuestionId === question.question_id || !selectedAnswers[question.question_id]}
                      >
                        {submittingQuestionId === question.question_id ? 'Checking…' : 'Check answer'}
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>Recent practice</CardTitle>
            <CardDescription>The latest answer attempts recorded in your preparation history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recent_activity.practice_attempts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No practice attempts yet.
              </div>
            ) : (
              summary.recent_activity.practice_attempts.map((attempt) => (
                <article key={attempt.attempt_id} className="rounded-2xl border border-slate-200/80 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{attempt.exam_title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{attempt.question_prompt}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        attempt.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {attempt.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>Recent mock attempts</CardTitle>
            <CardDescription>Keep an eye on score movement before taking official exams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recent_activity.mock_attempts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No mock attempts yet.
              </div>
            ) : (
              summary.recent_activity.mock_attempts.map((attempt) => (
                <article key={attempt.attempt_id} className="rounded-2xl border border-slate-200/80 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{attempt.exam_title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Attempt {attempt.attempt_number} · {attempt.correct_answer_count}/{attempt.total_questions} correct
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {attempt.score_percent}%
                    </span>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Launch-safe learning flow</p>
            <h2 className="text-2xl font-semibold">Legacy learning routes now land on the real preparation workspace.</h2>
            <p className="max-w-3xl text-sm leading-6 text-white/70">
              Users now get the same authenticated experience for category browsing, study planning, and performance review
              without bouncing into unfinished legacy pages.
            </p>
          </div>
          <Button asChild variant="secondary" className="rounded-2xl">
            <Link to="/student/exams">
              Review official exams
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
