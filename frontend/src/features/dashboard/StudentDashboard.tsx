import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { DayPicker } from 'react-day-picker'

import { ApiError, apiRequest } from '@/lib/api'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  formatInterviewDate,
  formatInterviewStatus,
  formatInterviewTime,
  toCalendarDate,
  toDayKey,
  toInterviewDayKey,
} from './interviewCalendar'

import type { StudentAnalyticsDashboardData, StudentDashboardResponse } from './types'
import type { CourseCatalogRecord, CourseCatalogResponse } from '../profile/types'
import { getCourseMediaOverrideForCourse } from '../profile/courseMediaStorage'

type StudentDashboardProps = {
  userName: string
}

const dashboardThumbnailBackgrounds = [
  'from-violet-600 via-indigo-600 to-blue-500',
  'from-cyan-500 via-sky-600 to-indigo-700',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-orange-400 via-amber-500 to-yellow-400',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-slate-700 via-slate-800 to-slate-900',
]

function formatLearningStatus(status: StudentDashboardResponse['continue_learning']['status']) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatLessonStatus(status: NonNullable<StudentDashboardResponse['current_lesson']>['status']) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatCourseDifficulty(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('beginner')) return 'Beginner'
  if (normalized.includes('advanced')) return 'Advanced'
  if (normalized.includes('intermediate')) return 'Intermediate'

  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatCourseCategory(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getRecommendationScore(
  course: CourseCatalogRecord,
  learningData: StudentDashboardResponse | null
) {
  const learningContext = [
    learningData?.continue_learning.roadmap_title ?? '',
    learningData?.continue_learning.topic_title ?? '',
    learningData?.current_lesson?.course_title ?? '',
  ]
    .join(' ')
    .toLowerCase()

  const searchableCourseText = `${course.title} ${course.category} ${course.description}`.toLowerCase()
  const contextTokens = learningContext.split(/\W+/).filter((token) => token.length >= 4)
  const contextMatches = contextTokens.reduce((count, token) => {
    return searchableCourseText.includes(token) ? count + 1 : count
  }, 0)

  return course.readiness_cues.length * 12 + contextMatches * 8 + course.lesson_count - (course.estimated_hours || 0) / 4
}

export function StudentDashboard({ userName }: StudentDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<StudentAnalyticsDashboardData | null>(null)
  const [learningData, setLearningData] = useState<StudentDashboardResponse | null>(null)
  const [courseCatalog, setCourseCatalog] = useState<CourseCatalogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [learningError, setLearningError] = useState<string | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isInterviewPopoverOpen, setIsInterviewPopoverOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number
    left: number
    width: number
    arrowLeft: number
    placement: 'top' | 'bottom'
  } | null>(null)
  const calendarContainerRef = useRef<HTMLDivElement | null>(null)
  const recommendationCarouselRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true

    async function loadDashboardCards() {
      try {
        const [analyticsResult, learningResult, courseCatalogResult] = await Promise.allSettled([
          apiRequest<StudentAnalyticsDashboardData>('/student/dashboard-data'),
          apiRequest<StudentDashboardResponse>('/student/dashboard'),
          apiRequest<CourseCatalogResponse>('/student/courses'),
        ])

        if (active) {
          if (analyticsResult.status === 'fulfilled') {
            setAnalyticsData(analyticsResult.value)
            setError(null)
          } else {
            setError(
              analyticsResult.reason instanceof ApiError
                ? analyticsResult.reason.message
                : 'Unable to load dashboard cards.'
            )
          }

          if (learningResult.status === 'fulfilled') {
            setLearningData(learningResult.value)
            setLearningError(null)
          } else {
            setLearningError(
              learningResult.reason instanceof ApiError
                ? learningResult.reason.message
                : 'Unable to load continue learning cards.'
            )
          }

          if (courseCatalogResult.status === 'fulfilled') {
            setCourseCatalog(courseCatalogResult.value.courses)
            setCoursesError(null)
          } else {
            setCoursesError(
              courseCatalogResult.reason instanceof ApiError
                ? courseCatalogResult.reason.message
                : 'Unable to load recommended courses.'
            )
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load dashboard cards.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboardCards()

    return () => {
      active = false
    }
  }, [])

  const recommendedCourses = useMemo(() => {
    const currentCourseTitle = learningData?.current_lesson?.course_title?.toLowerCase() ?? ''

    const availableCourses = courseCatalog.filter((course) => {
      if (course.is_enrolled) {
        return false
      }

      return course.title.toLowerCase() !== currentCourseTitle
    })

    return availableCourses
      .sort((left, right) => getRecommendationScore(right, learningData) - getRecommendationScore(left, learningData))
      .slice(0, 6)
  }, [courseCatalog, learningData])

  const statCards = useMemo(() => {
    const enrolledCourses = analyticsData
      ? analyticsData.learning_status.not_started +
        analyticsData.learning_status.in_progress +
        analyticsData.learning_status.completed
      : 0

    return [
      {
        label: 'Enrolled courses',
        value: enrolledCourses.toString(),
        helper: 'From your learning dashboard analytics',
        icon: BookOpen,
        iconClassName: 'text-blue-600 dark:text-blue-400',
      },
      {
        label: 'Ongoing courses',
        value: (analyticsData?.metrics.courses_in_progress ?? 0).toString(),
        helper: 'Currently active in your roadmap',
        icon: Clock3,
        iconClassName: 'text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Completed courses',
        value: (analyticsData?.metrics.courses_completed ?? 0).toString(),
        helper:
          enrolledCourses > 0
            ? `${Math.round(((analyticsData?.metrics.courses_completed ?? 0) / enrolledCourses) * 100)}% completion rate`
            : 'No completions yet',
        icon: CheckCircle2,
        iconClassName: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Exam average',
        value: analyticsData ? `${Math.round(analyticsData.metrics.average_exam_score)}%` : 'N/A',
        helper:
          analyticsData && analyticsData.metrics.exams_attempted > 0
            ? 'Across your validation exams'
            : 'No exam results yet',
        icon: BarChart3,
        iconClassName: 'text-violet-600 dark:text-violet-400',
      },
      {
        label: 'Applications submitted',
        value: (analyticsData?.metrics.applications_submitted ?? 0).toString(),
        helper: `${analyticsData?.metrics.interviews_scheduled ?? 0} interviews scheduled`,
        icon: Send,
        iconClassName: 'text-primary',
      },
    ]
  }, [analyticsData])

  const interviewDates = useMemo(
    () =>
      analyticsData?.upcoming_interviews
        .filter((interview) => Boolean(interview.scheduled_start))
        .map((interview) => toCalendarDate(interview.scheduled_start as string))
        .filter((date): date is Date => Boolean(date)) ?? [],
    [analyticsData]
  )

  const selectedInterviews = useMemo(() => {
    if (!analyticsData || !selectedDate) {
      return []
    }

    const selectedKey = toDayKey(selectedDate)
    return analyticsData.upcoming_interviews.filter((interview) => {
      return toInterviewDayKey(interview.scheduled_start) === selectedKey
    })
  }, [analyticsData, selectedDate])

  const upcomingEvents = useMemo(() => {
    if (!analyticsData) {
      return []
    }

    return [...analyticsData.upcoming_interviews]
      .sort((left, right) => {
        if (!left.scheduled_start && !right.scheduled_start) {
          return 0
        }

        if (!left.scheduled_start) {
          return 1
        }

        if (!right.scheduled_start) {
          return -1
        }

        return new Date(left.scheduled_start).getTime() - new Date(right.scheduled_start).getTime()
      })
      .slice(0, 3)
  }, [analyticsData])

  const studyStreakLabel = useMemo(() => {
    const streak = analyticsData?.study_streak_days ?? 0
    if (streak <= 0) {
      return 'Start a lesson today to begin your streak.'
    }

    return streak === 1 ? '1 active study day in a row.' : `${streak} active study days in a row.`
  }, [analyticsData])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !analyticsData) {
      setSelectedDate(undefined)
      setIsInterviewPopoverOpen(false)
      setTooltipPosition(null)
      return
    }

    setSelectedDate(date)
    setIsInterviewPopoverOpen(true)
  }

  const scrollRecommendations = (direction: 'left' | 'right') => {
    const container = recommendationCarouselRef.current
    if (!container) {
      return
    }

    const scrollAmount = Math.max(container.clientWidth * 0.85, 280)
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const updateTooltipPosition = (triggerRect: DOMRect) => {
    const containerRect = calendarContainerRef.current?.getBoundingClientRect()
    if (!containerRect) {
      return
    }

    const tooltipWidth = containerRect.width
    const estimatedTooltipHeight = 320
    const left = containerRect.left
    const arrowLeft = Math.min(
      Math.max(triggerRect.left + triggerRect.width / 2 - left, 24),
      tooltipWidth - 24
    )

    let placement: 'top' | 'bottom' = 'bottom'
    let top = triggerRect.bottom + 12

    if (
      top + estimatedTooltipHeight > window.innerHeight - 8 &&
      triggerRect.top - estimatedTooltipHeight - 12 > 8
    ) {
      placement = 'top'
      top = triggerRect.top - estimatedTooltipHeight - 12
    }

    setTooltipPosition({
      top,
      left,
      width: tooltipWidth,
      arrowLeft,
      placement,
    })
  }

  return (
    <section className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="font-semibold text-red-900 dark:text-red-100">Unable to load dashboard</p>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Loading dashboard cards for {userName}…</CardContent>
        </Card>
      ) : null}

      {!loading && analyticsData ? (
        <>
          <motion.div
            className="grid grid-cols-2 gap-4 xl:grid-cols-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <motion.div key={card.label} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                      <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-start">
            <div className="space-y-4">
              {learningError ? (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                  <CardContent className="pt-6">
                    <div className="space-y-1">
                      <p className="font-semibold text-red-900 dark:text-red-100">Unable to load continue learning</p>
                      <p className="text-sm text-red-800 dark:text-red-200">{learningError}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {learningData ? (
                <>
                  <Card>
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle>Continue learning</CardTitle>
                          <CardDescription>{learningData.continue_learning.roadmap_title}</CardDescription>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {formatLearningStatus(learningData.continue_learning.status)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold tracking-tight">{learningData.continue_learning.topic_title}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{learningData.continue_learning.progress_percent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-[width]"
                              style={{ width: `${learningData.continue_learning.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Link to={learningData.continue_learning.cta_href}>
                          {learningData.continue_learning.cta_label}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="space-y-2">
                      <div className="space-y-1">
                        <span className="inline-flex w-fit rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Recommended exam
                        </span>
                        <CardTitle>Exam recommendation</CardTitle>
                        <CardDescription>
                          {learningData.current_lesson
                            ? `Based on your current lesson in ${learningData.current_lesson.course_title}, keep progressing through ${learningData.current_lesson.title} before taking the validation exam.`
                            : `Based on your current progress in ${learningData.continue_learning.roadmap_title}, focus on exam readiness for ${learningData.continue_learning.topic_title}.`}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current course</p>
                          <p className="mt-1 text-sm font-medium">
                            {learningData.current_lesson?.course_title ?? learningData.continue_learning.roadmap_title}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current lesson</p>
                          <p className="mt-1 text-sm font-medium">
                            {learningData.current_lesson
                              ? `Lesson ${learningData.current_lesson.sequence_number}: ${learningData.current_lesson.title}`
                              : learningData.continue_learning.topic_title}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lesson status</p>
                          <p className="mt-1 text-sm font-medium">
                            {learningData.current_lesson
                              ? formatLessonStatus(learningData.current_lesson.status)
                              : formatLearningStatus(learningData.continue_learning.status)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exam average</p>
                          <p className="mt-1 text-sm font-medium">
                            {learningData.progress_overview.exam_average !== null
                              ? `${Math.round(learningData.progress_overview.exam_average)}%`
                              : 'No exams yet'}
                          </p>
                        </div>
                      </div>

                      {learningData.next_action.requirement ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                          {learningData.next_action.requirement}
                        </div>
                      ) : null}
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/student/exams">Take next exam</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Recommended courses
                          </span>
                          <CardTitle>Pick your next course</CardTitle>
                          <CardDescription>
                            Suggested from your current learning focus and course readiness signals.
                          </CardDescription>
                        </div>

                        {recommendedCourses.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => scrollRecommendations('left')}
                              aria-label="Scroll recommended courses left"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => scrollRecommendations('right')}
                              aria-label="Scroll recommended courses right"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {coursesError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                          {coursesError}
                        </div>
                      ) : null}

                      {!coursesError && recommendedCourses.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                          <p className="font-medium">No fresh recommendations yet</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Finish your current path or browse the full catalog to explore more options.
                          </p>
                          <Button asChild variant="outline" className="mt-4">
                            <Link to="/student/courses">Browse all courses</Link>
                          </Button>
                        </div>
                      ) : null}

                      {recommendedCourses.length > 0 ? (
                        <div
                          ref={recommendationCarouselRef}
                          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                          {recommendedCourses.map((course) => (
                            (() => {
                              const mediaOverride = getCourseMediaOverrideForCourse(course.course_id, course.title)
                              const courseThumbnail = course.thumbnail_image || mediaOverride?.thumbnailImage || mediaOverride?.previewImage || ''
                              const background =
                                dashboardThumbnailBackgrounds[course.course_id % dashboardThumbnailBackgrounds.length]

                              return (
                                <article
                                  key={course.course_id}
                                  className="flex min-h-[320px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-muted/20"
                                >
                                  <div className={cn('relative h-36 bg-gradient-to-br p-4 text-white', background)}>
                                    {courseThumbnail ? (
                                      <>
                                        <img
                                          src={courseThumbnail}
                                          alt={course.thumbnail_alt_text || mediaOverride?.thumbnailAltText || `${course.title} thumbnail`}
                                          className="absolute inset-0 h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                                      </>
                                    ) : null}
                                    <div className="relative z-10 flex h-full flex-col justify-between">
                                      <div className="flex items-start justify-between gap-3">
                                        <Badge variant="secondary" className="w-fit rounded-full bg-white/15 text-white hover:bg-white/15">
                                          {formatCourseCategory(course.category)}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-white/30 bg-black/20 text-white">
                                          {formatCourseDifficulty(course.difficulty_level)}
                                        </Badge>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm text-white/80">{course.lesson_count} lessons</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-1 flex-col p-4">
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold">{course.title}</p>
                                      <p className="text-xs text-muted-foreground">{formatCourseCategory(course.category)}</p>
                                    </div>

                                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                                      {course.description || 'Build practical skills with guided lessons and structured progress.'}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <Badge variant="secondary" className="rounded-full">
                                        {course.lesson_count} lessons
                                      </Badge>
                                      <Badge variant="secondary" className="rounded-full">
                                        {course.estimated_hours || 0} hrs
                                      </Badge>
                                    </div>

                                    <div className="mt-4 min-h-14 space-y-2">
                                      {course.readiness_cues.slice(0, 2).map((cue) => (
                                        <Badge key={cue} variant="outline" className="mr-2 h-auto max-w-full rounded-full py-1">
                                          <span className="line-clamp-1">{cue}</span>
                                        </Badge>
                                      ))}
                                      {course.readiness_cues.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                          A good next step when you are ready for a new track.
                                        </p>
                                      ) : null}
                                    </div>

                                    <div className="mt-auto pt-4">
                                      <Button asChild className="w-full !text-white hover:!text-white [&_*]:!text-white">
                                        <Link to={course.next_step_href}>
                                          {course.next_step_label || 'View course'}
                                          <ArrowRight className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                </article>
                              )
                            })()
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            <div className="w-full max-w-full space-y-4 sm:max-w-[380px] xl:justify-self-end">
              <Card>
                <CardHeader className="mb-4 justify-center">
                  <CardTitle>Events calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={calendarContainerRef} className="relative flex w-full justify-center">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      onDayClick={(day, _modifiers, event) => {
                        handleDateSelect(day)
                        updateTooltipPosition(event.currentTarget.getBoundingClientRect())
                      }}
                      showOutsideDays
                      weekStartsOn={1}
                      modifiers={{ interview: interviewDates }}
                      modifiersStyles={{
                        interview: {
                          backgroundColor: 'color-mix(in oklab, var(--primary) 16%, white)',
                          color: 'var(--foreground)',
                          fontWeight: 700,
                        },
                      }}
                      navLayout="after"
                      className="w-full rounded-2xl"
                      classNames={{
                        root: 'w-full',
                        months: 'flex w-full flex-col',
                        month: 'relative',
                        month_caption: 'flex h-[30px] items-center justify-center',
                        caption_label: 'flex h-full items-center text-sm font-semibold leading-none',
                        nav: 'pointer-events-none absolute inset-x-0 top-0 flex h-[30px] items-center justify-between',
                        button_previous:
                          'pointer-events-auto inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md border border-border bg-background p-0 text-foreground hover:bg-muted',
                        button_next:
                          'pointer-events-auto inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md border border-border bg-background p-0 text-foreground hover:bg-muted',
                        chevron: 'h-3 w-3',
                        month_grid: 'mt-3 w-full border-collapse',
                        weekdays: 'grid grid-cols-7',
                        weekday: 'text-muted-foreground text-[11px] font-medium',
                        week: 'mt-2 grid grid-cols-7',
                        day: 'text-center text-sm',
                        day_button:
                          'mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm transition-colors hover:bg-muted [&[aria-selected=true]]:bg-transparent [&[aria-selected=true]]:text-primary [&[aria-selected=true]]:ring-1 [&[aria-selected=true]]:ring-primary/30 [&[aria-selected=true]:hover]:bg-transparent [&[aria-selected=true]:hover]:text-primary',
                        today: 'text-primary',
                        selected: 'bg-transparent text-primary',
                        outside: 'text-muted-foreground/40',
                        disabled: 'text-muted-foreground/30',
                        hidden: 'invisible',
                      }}
                    />

                    {isInterviewPopoverOpen && tooltipPosition ? (
                      <div
                        className="fixed z-30 min-h-[18rem] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10"
                        style={{
                          top: tooltipPosition.top,
                          left: tooltipPosition.left,
                          width: tooltipPosition.width,
                        }}
                      >
                        <div
                          className="absolute h-3 w-3 border-border bg-popover"
                          style={{
                            left: tooltipPosition.arrowLeft,
                            transform: 'translateX(0%) rotate(45deg)',
                            ...(tooltipPosition.placement === 'bottom'
                              ? {
                                  top: -6,
                                  borderLeftWidth: '1px',
                                  borderTopWidth: '1px',
                                }
                              : {
                                  bottom: -6,
                                  borderRightWidth: '1px',
                                  borderBottomWidth: '1px',
                                }),
                          }}
                        />
                        <div className="flex h-full flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {selectedDate ? selectedDate.toLocaleDateString() : 'Interview events'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedInterviews.length > 0
                                  ? 'Your scheduled interviews for the selected day.'
                                  : 'There is no event for the selected day.'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsInterviewPopoverOpen(false)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label="Close interview preview"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {selectedInterviews.length > 0 ? (
                            selectedInterviews.map((interview) => (
                              <article
                                key={interview.id}
                                className="rounded-2xl border border-border bg-muted/30 p-4"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-base font-semibold">{interview.company}</p>
                                      <p className="text-sm text-muted-foreground">{interview.purpose}</p>
                                    </div>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>{formatInterviewDate(interview.scheduled_start)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock3 className="h-4 w-4" />
                                        <span>{formatInterviewTime(interview.scheduled_start)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    {formatInterviewStatus(interview.status)}
                                  </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                  <Button asChild variant="outline" size="sm">
                                    <Link to={`/student/interviews/${interview.id}`}>View details</Link>
                                  </Button>
                                  {interview.meeting_url ? (
                                    <Button asChild size="sm">
                                      <a href={interview.meeting_url} target="_blank" rel="noreferrer">
                                        Join meeting
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  ) : null}
                                </div>
                              </article>
                            ))
                          ) : (
                            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                              There is no event for this date.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle>Upcoming events</CardTitle>
                  <CardDescription>Your next scheduled interviews and meeting links.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-2xl border border-border bg-muted/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold">{event.company}</p>
                            <p className="text-sm text-muted-foreground">{event.purpose}</p>
                          </div>
                          <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            {formatInterviewStatus(event.status)}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatInterviewDate(event.scheduled_start)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            <span>{formatInterviewTime(event.scheduled_start)}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/student/interviews/${event.id}`}>View details</Link>
                          </Button>
                          {event.meeting_url ? (
                            <Button asChild size="sm">
                              <a href={event.meeting_url} target="_blank" rel="noreferrer">
                                Join meeting
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                      No upcoming events yet. We will show scheduled interviews here.
                    </div>
                  )}

                  <Button asChild variant="outline" className="w-full">
                    <Link to="/student/interviews">View all events</Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="space-y-1 pb-3">
                    <CardDescription>Your progress</CardDescription>
                    <CardTitle className="text-2xl">
                      {learningData?.continue_learning.progress_percent ?? 0}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${learningData?.continue_learning.progress_percent ?? 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {learningData
                        ? `${learningData.progress_overview.completed_topics} topics completed in ${learningData.continue_learning.roadmap_title}.`
                        : 'Track your roadmap completion here.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1 pb-3">
                    <CardDescription>Study streak</CardDescription>
                    <CardTitle className="text-2xl">{analyticsData?.study_streak_days ?? 0} days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{studyStreakLabel}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
