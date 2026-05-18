import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ChevronLeft, ChevronRight, Lock, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type {
  CourseAssessmentDetailResponse,
  CourseAssessmentSubmitResponse,
  CourseDetailResponse,
  CourseLessonSummary,
  LessonDetailResponse,
  LessonProgressUpdateResponse,
} from './types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MarkdownContent } from '@/components/markdown/MarkdownContent'
import { containerVariants, itemVariants } from '../../lib/animations'
import { truncateText } from '@/lib/utils'
import { CourseReviewSection } from './CourseReviewSection'

const emptyLesson: LessonDetailResponse = {
  lesson_id: 0,
  course_id: 0,
  course_title: '',
  course_href: '',
  title: '',
  summary: '',
  content: '',
  video_url: '',
  sequence_number: 0,
  total_lessons: 0,
  progress: {
    status: 'not_started',
    started_at: null,
    completed_at: null,
  },
  previous_lesson_href: null,
  next_lesson_href: null,
  lesson_exam: null,
  final_exam: null,
}

const emptyCourseDetail: CourseDetailResponse = {
  course_id: 0,
  title: '',
  description: '',
  category: '',
  difficulty_level: '',
  estimated_hours: 0,
  status: 'active',
  lesson_count: 0,
  learning_record_count: 0,
  average_rating: null,
  rating_count: 0,
  is_enrolled: false,
  enrollment_status: null,
  progress_percent: null,
  readiness_cues: [],
  detail_href: '',
  next_step_label: '',
  next_step_href: '',
  company_name: null,
  created_by_name: null,
  enrollment: {
    is_enrolled: false,
    learning_record_id: null,
    status: null,
    progress_percent: null,
    completed_at: null,
    lesson_count: 0,
    completed_lesson_count: 0,
  },
  lessons: [],
  final_exam: null,
  learning_outcomes: [],
  reviews: [],
  current_user_review: null,
}

const emptyAssessment: CourseAssessmentDetailResponse = {
  assessment_id: 0,
  title: '',
  description: '',
  kind: 'lesson',
  passing_score_percent: 90,
  attempt_count: 0,
  next_attempt_number: 1,
  latest_score: null,
  passed: false,
  questions: [],
}

type AssessmentType = 'lesson' | 'final'

function formatStatusLabel(value: string | null | undefined) {
  if (!value) {
    return 'Not started'
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getYouTubeEmbedUrl(videoUrl: string) {
  if (!videoUrl.trim()) {
    return null
  }

  try {
    const parsed = new URL(videoUrl)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
      const videoId = parsed.pathname.replace('/', '').trim()
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        const videoId = parsed.pathname.split('/')[2]
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }

      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
  } catch {
    return null
  }

  return null
}

function getLessonState(summary: CourseLessonSummary, currentLessonId: number) {
  if (summary.lesson_id === currentLessonId) {
    return 'current'
  }

  if (summary.status === 'completed') {
    return 'completed'
  }

  if (!summary.is_accessible || !summary.detail_href) {
    return 'locked'
  }

  if (summary.status === 'in_progress') {
    return 'in_progress'
  }

  return 'ready'
}

function getLessonExamLabel(sequenceNumber: number) {
  return `Lesson ${sequenceNumber}: Exam`
}

function getAssessmentStatusLabel(
  assessment: CourseLessonSummary['assessment'],
) {
  if (!assessment) return 'No exam'
  if (assessment.passed) {
    return typeof assessment.latest_score === 'number' ? `Passed · ${assessment.latest_score}%` : 'Passed'
  }
  return assessment.is_unlocked ? 'Unlocked' : 'Locked'
}

function shouldShowLessonAssessment(lesson: CourseLessonSummary) {
  return Boolean(lesson.assessment && (lesson.assessment.passed || lesson.assessment.is_unlocked || lesson.status === 'completed'))
}

function getAssessmentRowClassName(assessment: CourseLessonSummary['assessment'] | CourseDetailResponse['final_exam']) {
  if (assessment?.passed) {
    return 'flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700'
  }
  if (assessment?.is_unlocked) {
    return 'flex items-center justify-between rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-50'
  }
  return 'flex items-center justify-between rounded-xl px-4 py-3 text-slate-400'
}

export function StudentLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<LessonDetailResponse>(emptyLesson)
  const [courseDetail, setCourseDetail] = useState<CourseDetailResponse>(emptyCourseDetail)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('lesson')
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [assessmentSaving, setAssessmentSaving] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<CourseAssessmentDetailResponse>(emptyAssessment)
  const [assessmentSelections, setAssessmentSelections] = useState<Record<number, number[]>>({})
  const [assessmentResult, setAssessmentResult] = useState<CourseAssessmentSubmitResponse | null>(null)
  const [showAllLessons, setShowAllLessons] = useState(false)
  const [isPageScrollable, setIsPageScrollable] = useState(false)
  const [isPageScrolled, setIsPageScrolled] = useState(false)
  const pageContainerRef = useRef<HTMLDivElement | null>(null)

  const loadPageData = useCallback(async () => {
    if (!courseId || !lessonId) {
      setLoadError('Course id and lesson id are required.')
      setLoading(false)
      return
    }

    try {
      const [lessonResponse, courseResponse] = await Promise.all([
        apiRequest<LessonDetailResponse>(`/student/courses/${courseId}/lessons/${lessonId}`),
        apiRequest<CourseDetailResponse>(`/student/courses/${courseId}`),
      ])

      setData(lessonResponse)
      setCourseDetail(courseResponse)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Unable to load lesson.')
    } finally {
      setLoading(false)
    }
  }, [courseId, lessonId])

  useEffect(() => {
    void loadPageData()
  }, [loadPageData])

  useEffect(() => {
    setShowAllLessons(false)
  }, [lessonId])

  useEffect(() => {
    const scrollContainer = pageContainerRef.current?.closest('main')
    const scrollElement =
      scrollContainer instanceof HTMLElement ? scrollContainer : document.documentElement

    const updatePageScrollable = () => {
      const viewportHeight =
        scrollElement instanceof HTMLElement ? scrollElement.clientHeight : window.innerHeight
      const scrollTop =
        scrollElement instanceof HTMLElement ? scrollElement.scrollTop : window.scrollY

      setIsPageScrollable(scrollElement.scrollHeight > viewportHeight + 1)
      setIsPageScrolled(scrollTop > 16)
    }

    updatePageScrollable()
    window.addEventListener('resize', updatePageScrollable)

    if (scrollElement instanceof HTMLElement) {
      scrollElement.addEventListener('scroll', updatePageScrollable, { passive: true })
    } else {
      window.addEventListener('scroll', updatePageScrollable, { passive: true })
    }

    return () => {
      window.removeEventListener('resize', updatePageScrollable)

      if (scrollElement instanceof HTMLElement) {
        scrollElement.removeEventListener('scroll', updatePageScrollable)
      } else {
        window.removeEventListener('scroll', updatePageScrollable)
      }
    }
  }, [courseDetail.lessons.length, courseDetail.final_exam, data.final_exam, data.summary, data.content, showAllLessons])

  async function updateProgress(status: 'in_progress' | 'completed') {
    if (!courseId || !lessonId) {
      return
    }

    setSaving(true)

    try {
      const [progressResponse, courseResponse] = await Promise.all([
        apiRequest<LessonProgressUpdateResponse>(`/student/courses/${courseId}/lessons/${lessonId}/progress`, {
          method: 'PUT',
          body: { status },
          csrfToken,
        }),
        apiRequest<CourseDetailResponse>(`/student/courses/${courseId}`),
      ])

      setData(progressResponse.lesson)
      setCourseDetail(courseResponse)
    } finally {
      setSaving(false)
    }
  }

  async function openAssessment(type: AssessmentType) {
    if (!courseId || !lessonId) {
      return
    }

    setAssessmentType(type)
    setAssessmentOpen(true)
    setAssessmentLoading(true)
    setAssessmentSaving(false)
    setAssessmentError(null)
    setAssessmentResult(null)
    setAssessmentSelections({})

    const endpoint =
      type === 'lesson'
        ? `/student/courses/${courseId}/lessons/${lessonId}/exam`
        : `/student/courses/${courseId}/final-exam`

    try {
      const response = await apiRequest<CourseAssessmentDetailResponse>(endpoint)
      setAssessmentData(response)
    } catch (error) {
      setAssessmentError(error instanceof ApiError ? error.message : 'Unable to load exam.')
    } finally {
      setAssessmentLoading(false)
    }
  }

  function updateAssessmentSelection(questionId: number, optionId: number, questionType: string, checked: boolean) {
    setAssessmentSelections((current) => {
      if (questionType === 'multiple_choice') {
        const existing = current[questionId] ?? []
        const next = checked ? Array.from(new Set([...existing, optionId])) : existing.filter((id) => id !== optionId)
        return { ...current, [questionId]: next }
      }

      return { ...current, [questionId]: checked ? [optionId] : [] }
    })
  }

  async function submitAssessment() {
    if (!courseId || !lessonId) {
      return
    }

    setAssessmentSaving(true)
    setAssessmentError(null)

    const endpoint =
      assessmentType === 'lesson'
        ? `/student/courses/${courseId}/lessons/${lessonId}/exam/submit`
        : `/student/courses/${courseId}/final-exam/submit`

    try {
      const response = await apiRequest<CourseAssessmentSubmitResponse>(endpoint, {
        method: 'POST',
        body: {
          answers: assessmentData.questions.map((question) => ({
            question_id: question.question_id,
            selected_option_ids: assessmentSelections[question.question_id] ?? [],
          })),
        },
        csrfToken,
      })
      setAssessmentResult(response)
      setAssessmentOpen(false)
      await loadPageData()
    } catch (error) {
      setAssessmentError(error instanceof ApiError ? error.message : 'Unable to submit exam.')
    } finally {
      setAssessmentSaving(false)
    }
  }

  const progressPercent = useMemo(() => {
    if (typeof courseDetail.enrollment.progress_percent === 'number') {
      return courseDetail.enrollment.progress_percent
    }

    if (data.total_lessons <= 0) {
      return data.progress.status === 'completed' ? 100 : data.progress.status === 'in_progress' ? 50 : 0
    }

    const completedBeforeCurrent =
      data.progress.status === 'completed' ? data.sequence_number : Math.max(data.sequence_number - 1, 0)
    return Math.min(100, Math.round((completedBeforeCurrent / data.total_lessons) * 100))
  }, [courseDetail.enrollment.progress_percent, data.progress.status, data.sequence_number, data.total_lessons])

  const completedLessons = courseDetail.enrollment.completed_lesson_count
  const allLessonsCompleted =
    courseDetail.lessons.length > 0 &&
    courseDetail.lessons.every((lesson) => lesson.status === 'completed')
  const currentLessonIndex = useMemo(
    () => courseDetail.lessons.findIndex((lesson) => lesson.lesson_id === data.lesson_id),
    [courseDetail.lessons, data.lesson_id],
  )
  const hiddenPreviousLessonCount = currentLessonIndex > 0 ? currentLessonIndex : 0
  const shouldCollapseLessons = courseDetail.lessons.length > 6 && hiddenPreviousLessonCount > 0
  const visibleLessons = useMemo(() => {
    if (!shouldCollapseLessons || showAllLessons || currentLessonIndex < 0) {
      return courseDetail.lessons
    }
    return courseDetail.lessons.slice(currentLessonIndex)
  }, [courseDetail.lessons, currentLessonIndex, shouldCollapseLessons, showAllLessons])
  const sidebarFinalExam = courseDetail.final_exam ?? data.final_exam
  const showSidebarNavButtons = isPageScrollable && isPageScrolled
  const shouldScrollLessonItems = visibleLessons.length >= 5 || Boolean(sidebarFinalExam)
  const lessonItemsClass = shouldScrollLessonItems
    ? showSidebarNavButtons
      ? 'max-h-[24rem] space-y-2 overflow-y-auto pr-2 xl:max-h-[16rem]'
      : 'max-h-[24rem] space-y-2 overflow-y-auto pr-2 xl:max-h-[28rem]'
    : 'space-y-2'
  const videoEmbedUrl = useMemo(() => getYouTubeEmbedUrl(data.video_url), [data.video_url])
  const courseDescriptionPreview = useMemo(() => truncateText(courseDetail.description, 160), [courseDetail.description])
  const answeredAssessmentQuestions = useMemo(
    () => Object.values(assessmentSelections).filter((value) => value.length > 0).length,
    [assessmentSelections],
  )
  const allAssessmentQuestionsAnswered =
    assessmentData.questions.length > 0 &&
    assessmentData.questions.every((question) => (assessmentSelections[question.question_id] ?? []).length > 0)

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading lesson…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={pageContainerRef} className="space-y-6 bg-slate-50 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/student/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={data.course_href || `/student/courses/${data.course_id}`} className="transition-colors hover:text-foreground">
          {data.course_title || 'Course'}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{data.title || 'Lesson'}</span>
      </div>

      {loadError ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load lesson</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{loadError}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <motion.div
        className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.main variants={itemVariants}>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-8 p-6">
              <div className="mb-6">
                <p className="mb-3 font-medium text-blue-600">{data.course_title || 'Course lesson'}</p>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{data.title || 'Lesson'}</h1>
                    <p className="mt-3 max-w-3xl text-slate-500">
                      {data.summary || courseDescriptionPreview || 'Continue through the lesson and track your course progress.'}
                    </p>
                  </div>

                  <div className={`flex gap-3 ${showSidebarNavButtons ? 'xl:hidden' : ''}`}>
                    <Button
                      variant="outline"
                      className="rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => navigate(data.previous_lesson_href || data.course_href || `/student/courses/${data.course_id}`)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {data.previous_lesson_href ? 'Previous' : 'Course'}
                    </Button>
                    <Button
                      className="rounded-xl px-6 !text-white hover:!text-white"
                      onClick={() => navigate(data.next_lesson_href || data.course_href || `/student/courses/${data.course_id}`)}
                    >
                        <span className="text-white">{data.next_lesson_href ? 'Next' : 'Back to course'}</span>
                        <ChevronRight className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950 shadow-lg">
                {videoEmbedUrl ? (
                  <iframe
                    className="h-full w-full"
                    src={videoEmbedUrl}
                    title={data.title || 'Lesson video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 rounded-full bg-white/10 p-5 text-cyan-300 backdrop-blur-sm">
                      <PlayCircle className="h-10 w-10" />
                    </div>
                    <h2 className="text-4xl font-semibold text-white">{data.title || 'Lesson video'}</h2>
                    <p className="mt-4 max-w-2xl text-slate-300">
                      Add a YouTube link in the lesson editor to display the video player here.
                    </p>
                  </div>
                )}
              </div>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">About this lesson</h2>

                {data.summary ? <p className="max-w-3xl leading-8 text-slate-700">{data.summary}</p> : null}

                <MarkdownContent content={data.content} className="max-w-3xl" emptyMessage="No lesson content yet." />
              </section>

            </CardContent>
          </Card>
        </motion.main>

        <motion.aside variants={itemVariants}>
          <div className="space-y-4 xl:sticky xl:top-12 xl:flex xl:max-h-[calc(100vh-3rem)] xl:flex-col xl:space-y-2 xl:overflow-hidden">
            {showSidebarNavButtons ? (
              <div className="hidden gap-3 xl:shrink-0 xl:grid xl:grid-cols-2">
                <Button
                  variant="outline"
                  className="rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => navigate(data.previous_lesson_href || data.course_href || `/student/courses/${data.course_id}`)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {data.previous_lesson_href ? 'Previous' : 'Course'}
                </Button>
                <Button
                  className="rounded-xl px-6 !text-white hover:!text-white"
                  onClick={() => navigate(data.next_lesson_href || data.course_href || `/student/courses/${data.course_id}`)}
                >
                  <span className="text-white">{data.next_lesson_href ? 'Next' : 'Back to course'}</span>
                  <ChevronRight className="h-4 w-4 text-white" />
                </Button>
              </div>
            ) : null}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:flex xl:min-h-0 xl:flex-1 xl:overflow-hidden">
              <CardContent className="p-6 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-hidden xl:p-5 xl:pr-3">
                <div className="mb-8 flex items-center justify-between xl:mb-5">
                  <h2 className="text-2xl font-bold text-slate-900">Lessons</h2>
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-blue-600">
                      {completedLessons} of {courseDetail.lessons.length || data.total_lessons || 1}
                    </span>{' '}
                    completed
                  </p>
                </div>

                <div className="space-y-7 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:space-y-4 xl:overflow-y-auto xl:pr-2">
                  <div className="xl:min-h-0">
                    <div className="mb-4 flex items-start justify-between gap-3 font-semibold text-slate-900">
                      <h3 className="min-w-0 flex-1 break-words">{data.course_title || 'Course lessons'}</h3>
                      <span className="shrink-0 text-slate-500">
                        {data.sequence_number} / {courseDetail.lessons.length || data.total_lessons || 1}
                      </span>
                    </div>

                    {shouldCollapseLessons ? (
                      <button
                        type="button"
                        className="mb-4 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                        onClick={() => setShowAllLessons((current) => !current)}
                      >
                        {showAllLessons ? 'Hide previous lessons' : `Show previous lessons (${hiddenPreviousLessonCount})`}
                      </button>
                    ) : null}

                    <div className={lessonItemsClass}>
                      {visibleLessons.length > 0 ? (
                        visibleLessons.map((lesson) => {
                          const state = getLessonState(lesson, data.lesson_id)
                          const examLabel = getLessonExamLabel(lesson.sequence_number)
                          const examStatusLabel = getAssessmentStatusLabel(lesson.assessment)
                          const examRowClassName = getAssessmentRowClassName(lesson.assessment)

                          return (
                            <div key={lesson.lesson_id} className="space-y-1">
                              {state === 'current' ? (
                                <div
                                  className="flex items-start justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700"
                                >
                                  <span className="flex min-w-0 flex-1 items-start gap-2">
                                    <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span className="min-w-0 break-words">
                                      {lesson.sequence_number}. {lesson.title}
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-right">{formatStatusLabel(lesson.status)}</span>
                                </div>
                              ) : state === 'locked' ? (
                                <div className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-slate-400">
                                  <span className="flex min-w-0 flex-1 items-start gap-2">
                                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span className="min-w-0 break-words">
                                      {lesson.sequence_number}. {lesson.title}
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-right">Locked</span>
                                </div>
                              ) : (
                                <Link
                                  to={lesson.detail_href || data.course_href || `/student/courses/${data.course_id}`}
                                  className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                                >
                                  <span className="min-w-0 flex-1 break-words">
                                    {lesson.sequence_number}. {lesson.title}
                                  </span>
                                  <span className="shrink-0 text-right text-sm text-slate-500">{formatStatusLabel(lesson.status)}</span>
                                </Link>
                              )}

                              {shouldShowLessonAssessment(lesson) ? (
                                lesson.lesson_id === data.lesson_id && lesson.assessment.is_unlocked ? (
                                  <button
                                    type="button"
                                    className={`${examRowClassName} w-full text-left`}
                                    onClick={() => void openAssessment('lesson')}
                                  >
                                    <span>{examLabel}</span>
                                    <span className={lesson.assessment.passed ? '' : 'text-sm text-slate-500'}>{examStatusLabel}</span>
                                  </button>
                                ) : lesson.detail_href && lesson.assessment.is_unlocked ? (
                                  <Link
                                    to={lesson.detail_href}
                                    className={examRowClassName}
                                  >
                                    <span>{examLabel}</span>
                                    <span className={lesson.assessment.passed ? '' : 'text-sm text-slate-500'}>{examStatusLabel}</span>
                                  </Link>
                                ) : (
                                  <div className={examRowClassName}>
                                    <span>{examLabel}</span>
                                    <span>{examStatusLabel}</span>
                                  </div>
                                )
                              ) : null}
                            </div>
                          )
                        })
                      ) : (
                        <div className="rounded-xl px-4 py-3 text-slate-500">No lesson list available yet.</div>
                      )}
                      {sidebarFinalExam && (allLessonsCompleted || sidebarFinalExam.passed) ? (
                        sidebarFinalExam.is_unlocked ? (
                          <button
                            type="button"
                            className={`${getAssessmentRowClassName(sidebarFinalExam)} w-full text-left`}
                            onClick={() => void openAssessment('final')}
                          >
                            <span>Final Exam</span>
                            <span className={sidebarFinalExam.passed ? '' : 'text-sm text-slate-500'}>
                              {getAssessmentStatusLabel(sidebarFinalExam)}
                            </span>
                          </button>
                        ) : (
                          <div className={getAssessmentRowClassName(sidebarFinalExam)}>
                            <span>Final Exam</span>
                            <span>{getAssessmentStatusLabel(sidebarFinalExam)}</span>
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>Course progress</span>
                      <span className="text-slate-500">{progressPercent}%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>Status</span>
                      <span className="text-slate-500">{formatStatusLabel(data.progress.status)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {courseDescriptionPreview || 'Complete each lesson and pass the required exams to finish the course.'}
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 px-1 sm:grid-cols-2 xl:shrink-0 xl:gap-2 xl:px-0">
              <Button
                variant="outline"
                className="h-11 rounded-xl text-slate-950 hover:text-slate-950"
                onClick={() => void updateProgress('in_progress')}
                disabled={saving || data.progress.status === 'in_progress' || data.progress.status === 'completed'}
              >
                Start lesson
              </Button>
              <Button
                className="h-11 rounded-xl !text-white hover:!text-white"
                onClick={() => void updateProgress('completed')}
                disabled={saving || data.progress.status === 'completed'}
              >
                Mark completed
              </Button>
            </div>
          </div>
        </motion.aside>
      </motion.div>

      <CourseReviewSection
        course={courseDetail}
        csrfToken={csrfToken}
        onReviewSaved={loadPageData}
      />

      <Dialog open={assessmentOpen} onOpenChange={setAssessmentOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[min(42rem,calc(100vw-2rem))] sm:max-w-[min(42rem,calc(100vw-2rem))] lg:w-[min(64rem,calc(100vw-3rem))] lg:max-w-[min(64rem,calc(100vw-3rem))]">
          <DialogHeader className="border-b px-4 pt-6 pb-4 sm:px-6">
            <DialogTitle>{assessmentData.title || (assessmentType === 'lesson' ? 'Lesson exam' : 'Final exam')}</DialogTitle>
            <DialogDescription>
              {assessmentData.description || 'Answer every question and submit the exam in this modal.'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
            {assessmentLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading exam…</div>
            ) : assessmentError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{assessmentError}</div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Pass mark: {assessmentData.passing_score_percent}%
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Attempt {assessmentData.next_attempt_number}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {answeredAssessmentQuestions} / {assessmentData.questions.length} answered
                  </span>
                </div>

                {assessmentResult ? (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      assessmentResult.passed
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    <p className="font-semibold">
                      Score: {assessmentResult.score_percent}% (pass mark {assessmentResult.passing_score_percent}%)
                    </p>
                    <p className="mt-1">
                      {assessmentResult.passed
                        ? assessmentType === 'final'
                          ? 'You passed the final exam and completed the course.'
                          : 'You passed the lesson exam and unlocked the next lesson.'
                        : 'You can retake this exam any time until you reach the required score.'}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-4">
                  {assessmentData.questions.map((question) => (
                    <Card key={question.question_id} className="rounded-xl border border-slate-200 shadow-none">
                      <CardContent className="space-y-4 p-5">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Question {question.sequence_number}
                          </p>
                          <p className="mt-2 text-sm text-slate-700">{question.prompt}</p>
                          {question.instructions ? (
                            <p className="mt-2 text-xs text-slate-500">{question.instructions}</p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          {question.options.map((option) => {
                            const checked = (assessmentSelections[question.question_id] ?? []).includes(option.option_id)
                            const inputType = question.question_type === 'multiple_choice' ? 'checkbox' : 'radio'

                            return (
                              <label
                                key={option.option_id}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
                              >
                                <input
                                  type={inputType}
                                  name={`assessment-question-${question.question_id}`}
                                  checked={checked}
                                  onChange={(event) =>
                                    updateAssessmentSelection(
                                      question.question_id,
                                      option.option_id,
                                      question.question_type,
                                      event.target.checked,
                                    )
                                  }
                                  className="mt-1"
                                />
                                <span className="text-sm text-slate-700">{option.option_text}</span>
                              </label>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 gap-3 border-t px-4 py-4 sm:px-6 sm:flex-row">
            <Button variant="outline" onClick={() => setAssessmentOpen(false)}>
              Close
            </Button>
            <Button
              className="!text-white hover:!text-white"
              onClick={() => void submitAssessment()}
              disabled={assessmentLoading || assessmentSaving || !allAssessmentQuestionsAnswered}
            >
              {assessmentSaving ? 'Submitting…' : 'Submit exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
