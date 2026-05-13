import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileSpreadsheet,
  Sparkles,
  Target,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { apiRequest } from '../../lib/api'
import type { StudentDashboardResponse } from './types'
import type {
  CourseCatalogResponse,
  ExamResultsSummary,
  InterviewListResponse,
} from '../profile/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { containerVariants, itemVariants } from '@/lib/animations'

type StudentDashboardRedesignProps = {
  userName: string
  loading: boolean
  error: string | null
  data: StudentDashboardResponse | null
}

type DashboardSupplementalState = {
  courseCatalog: CourseCatalogResponse
  exams: ExamResultsSummary
  interviews: InterviewListResponse
}

type LearningCard = {
  id: string
  title: string
  subtitle: string
  progress: number
  href: string
  ctaLabel: string
  toneLabel: string
}

const emptySupplementalState: DashboardSupplementalState = {
  courseCatalog: {
    result_count: 0,
    courses: [],
  },
  exams: {
    student_id: 0,
    total_results: 0,
    passed_results: 0,
    average_score: null,
    results: [],
    available_exams: [],
  },
  interviews: {
    interviews: [],
  },
}

const courseGradients = [
  'from-indigo-500 via-violet-500 to-blue-500',
  'from-emerald-500 via-green-500 to-lime-500',
  'from-orange-500 via-amber-500 to-yellow-400',
  'from-sky-500 via-cyan-500 to-blue-500',
] as const

function formatAverage(value: number | null) {
  return value === null ? 'No exams yet' : `${value.toFixed(1)}%`
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Ready when you are'
  }

  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function courseIcon(title: string, category: string) {
  const keyword = `${title} ${category}`.toLowerCase()

  if (keyword.includes('python') || keyword.includes('data')) {
    return <FileSpreadsheet className="h-10 w-10 text-white" />
  }

  if (keyword.includes('job') || keyword.includes('career') || keyword.includes('interview')) {
    return <BriefcaseBusiness className="h-10 w-10 text-white" />
  }

  return <BookOpen className="h-10 w-10 text-white" />
}

export function StudentDashboardRedesign({ userName, loading, error, data }: StudentDashboardRedesignProps) {
  const [supplemental, setSupplemental] = useState<DashboardSupplementalState>(emptySupplementalState)
  const [supplementalError, setSupplementalError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSupplementalData() {
      const results = await Promise.allSettled([
        apiRequest<CourseCatalogResponse>('/student/courses'),
        apiRequest<ExamResultsSummary>('/student/exam-results'),
        apiRequest<InterviewListResponse>('/student/interviews'),
      ])

      if (!active) {
        return
      }

      const nextState: DashboardSupplementalState = {
        courseCatalog:
          results[0].status === 'fulfilled' ? results[0].value : emptySupplementalState.courseCatalog,
        exams: results[1].status === 'fulfilled' ? results[1].value : emptySupplementalState.exams,
        interviews: results[2].status === 'fulfilled' ? results[2].value : emptySupplementalState.interviews,
      }

      const failedSources = [
        results[0].status === 'rejected' ? 'courses' : null,
        results[1].status === 'rejected' ? 'exams' : null,
        results[2].status === 'rejected' ? 'interviews' : null,
      ].filter((value): value is string => value !== null)

      setSupplemental(nextState)
      setSupplementalError(
        failedSources.length > 0 ? `Some dashboard panels could not be loaded: ${failedSources.join(', ')}.` : null,
      )
    }

    void loadSupplementalData()

    return () => {
      active = false
    }
  }, [])

  const enrolledCourses = useMemo(
    () => supplemental.courseCatalog.courses.filter((course) => course.is_enrolled),
    [supplemental.courseCatalog.courses],
  )

  const activeCourses = useMemo(
    () =>
      enrolledCourses
        .filter((course) => (course.progress_percent ?? 0) < 100)
        .sort((left, right) => (right.progress_percent ?? 0) - (left.progress_percent ?? 0)),
    [enrolledCourses],
  )

  const learningCards = useMemo<LearningCard[]>(() => {
    if (!data) {
      return []
    }

    const cards: LearningCard[] = [
      {
        id: 'current-focus',
        title: data.continue_learning.topic_title,
        subtitle: data.continue_learning.roadmap_title,
        progress: data.continue_learning.progress_percent,
        href: data.continue_learning.cta_href,
        ctaLabel: data.continue_learning.cta_label,
        toneLabel: data.next_action.action_type === 'take_exam' ? 'Exam gate' : 'Current focus',
      },
    ]

    activeCourses.slice(0, 2).forEach((course) => {
      cards.push({
        id: `course-${course.course_id}`,
        title: course.title,
        subtitle: course.category,
        progress: course.progress_percent ?? 0,
        href: course.next_step_href,
        ctaLabel: course.next_step_label,
        toneLabel: course.is_enrolled ? 'In progress' : 'Recommended',
      })
    })

    return cards
  }, [activeCourses, data])

  const upcomingItems = useMemo(() => {
    if (!data) {
      return []
    }

    const scheduledInterviews = supplemental.interviews.interviews
      .filter((interview) => interview.scheduled_start)
      .sort((left, right) => {
        const leftTime = left.scheduled_start ? new Date(left.scheduled_start).getTime() : Number.MAX_SAFE_INTEGER
        const rightTime = right.scheduled_start ? new Date(right.scheduled_start).getTime() : Number.MAX_SAFE_INTEGER

        return leftTime - rightTime
      })
      .map((interview) => ({
        id: `interview-${interview.id}`,
        title: interview.purpose,
        detail: formatDateTime(interview.scheduled_start),
        href: `/student/interviews/${interview.id}`,
        icon: CalendarDays,
        iconTone: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
      }))

    const availableExams = supplemental.exams.available_exams
      .filter((exam) => exam.can_take)
      .map((exam) => ({
        id: `exam-${exam.exam_id}`,
        title: exam.title,
        detail: 'Available now',
        href: exam.detail_href,
        icon: FileSpreadsheet,
        iconTone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
      }))

    const actions = [
      {
        id: 'next-action',
        title: data.next_action.title,
        detail: data.next_action.requirement ?? data.next_action.description,
        href: data.next_action.cta_href,
        icon: Target,
        iconTone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
      },
    ]

    return [...scheduledInterviews, ...availableExams, ...actions].slice(0, 3)
  }, [data, supplemental.exams.available_exams, supplemental.interviews.interviews])

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading your learning dashboard…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const completedRoadmapSteps = data.roadmap_preview.nodes.filter((node) => node.state === 'completed').length
  const roadmapLabel = `${completedRoadmapSteps}/${Math.max(data.roadmap_preview.nodes.length, 1)} steps`

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load dashboard</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {supplementalError ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Dashboard panels partially loaded</h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{supplementalError}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <motion.section
            variants={itemVariants}
            className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_52%,#f5f3ff_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="p-6 lg:p-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  Student dashboard
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                    Welcome back, {userName}.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">{data.header_message}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="rounded-full border-transparent bg-violet-100 px-3 py-1 text-violet-700 hover:bg-violet-100">
                    {data.progress_overview.current_level}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-700">
                    {roadmapLabel} completed
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current roadmap</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{data.continue_learning.roadmap_title}</p>
                    <p className="mt-1 text-sm text-slate-500">{data.continue_learning.progress_percent}% complete</p>
                  </div>
                  <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next action</p>
                    <p className="mt-3 text-sm font-semibold text-slate-950">{data.next_action.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{data.next_action.action_type.replace('_', ' ')}</p>
                  </div>
                  <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Exam average</p>
                    <p className="mt-3 text-3xl font-bold text-slate-950">{formatAverage(data.progress_overview.exam_average)}</p>
                    <p className="mt-1 text-sm text-slate-500">Validated learning signal</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm" className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800">
                    <Link to={data.continue_learning.cta_href}>{data.continue_learning.cta_label}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-11 rounded-2xl border-slate-200 bg-white px-5">
                    <Link to={data.next_action.cta_href}>{data.next_action.cta_label}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Courses enrolled"
              value={enrolledCourses.length}
              detail={`${activeCourses.length} active now`}
              tone="blue"
            />
            <DashboardStatCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Topics completed"
              value={data.progress_overview.completed_topics}
              detail={roadmapLabel}
              tone="green"
            />
            <DashboardStatCard
              icon={<FileSpreadsheet className="h-5 w-5" />}
              label="Exams taken"
              value={supplemental.exams.total_results}
              detail={formatAverage(data.progress_overview.exam_average)}
              tone="violet"
            />
          </motion.div>

          <motion.section variants={itemVariants} className="rounded-[28px] border border-border bg-card shadow-sm">
            <SectionHeader
              title="Continue Learning"
              description="Pick up where you left off across your roadmap and enrolled courses."
              actionHref="/student/learning"
            />
            <div className="grid gap-4 p-6 pt-0 md:grid-cols-2 xl:grid-cols-3">
              {learningCards.length > 0 ? (
                learningCards.map((card, index) => (
                  <LearningCourseCard key={card.id} card={card} index={index} />
                ))
              ) : (
                <EmptyPanel
                  title="No active learning yet"
                  description="Start a course to populate your continue learning workspace."
                  href="/student/courses"
                  ctaLabel="Browse courses"
                />
              )}
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.section variants={itemVariants} className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xl font-semibold text-foreground">Upcoming Events</p>
                <p className="mt-1 text-sm text-muted-foreground">Keep track of your immediate learner tasks.</p>
              </div>
              <Link className="text-sm font-semibold text-primary" to="/student/interviews">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingItems.length > 0 ? (
                upcomingItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className="flex items-start gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/30 hover:bg-muted/40"
                    >
                      <div className={`rounded-2xl p-3 ${item.iconTone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming learning events are scheduled yet.</p>
              )}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  actionHref,
}: {
  title: string
  description: string
  actionHref: string
}) {
  return (
    <div className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Link className="text-sm font-semibold text-primary" to={actionHref}>
        View all
      </Link>
    </div>
  )
}

function DashboardStatCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  detail: string
  tone: 'blue' | 'green' | 'violet' | 'amber'
}) {
  const toneClasses: Record<typeof tone, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  }

  return (
    <Card className="rounded-[24px] border border-border shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LearningCourseCard({ card, index }: { card: LearningCard; index: number }) {
  const gradient = courseGradients[index % courseGradients.length]

  return (
    <article className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`bg-gradient-to-r ${gradient} p-6`}>{courseIcon(card.title, card.subtitle)}</div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {card.toneLabel}
          </Badge>
          <span className="text-sm font-semibold text-muted-foreground">{card.progress}%</span>
        </div>
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{card.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{card.subtitle}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{card.progress}% complete</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-[width]"
              style={{ width: `${card.progress}%` }}
            />
          </div>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" to={card.href}>
          {card.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

function EmptyPanel({
  title,
  description,
  href,
  ctaLabel,
}: {
  title: string
  description: string
  href: string
  ctaLabel: string
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-muted/30 p-6 md:col-span-full">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" to={href}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

