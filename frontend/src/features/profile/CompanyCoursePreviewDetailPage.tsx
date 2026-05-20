import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Check, ChevronDown, ChevronRight, Clock3, Heart, Lock, PlayCircle, Star, Users } from 'lucide-react'

import { ApiError, apiRequest } from '../../lib/api'
import type { CourseDetailResponse, CourseLessonSummary } from './types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Button } from '@/components/ui/button'
import { cn, truncateText } from '@/lib/utils'
import { getCourseMediaOverrideForCourse } from './courseMediaStorage'
import {
  applyCompanyPreviewStateToCourseDetail,
  companyCoursePreviewFavoritesStorageKey,
  readCompanyCoursePreviewState,
  writeCompanyCoursePreviewState,
} from './companyCoursePreviewState'

const instructorNames = ['Ava Patel', 'Daniel Kim', 'Mina Sato', 'Noah Chen', 'Sophia Sharma', 'Leo Tan']
const instructorRoles = [
  'Senior Frontend Developer',
  'React Engineer',
  'Lead Web Instructor',
  'Frontend Architect',
  'Senior JavaScript Developer',
  'UI Engineering Mentor',
]
const instructorBios = [
  'Builds practical frontend learning paths focused on React fundamentals, reusable UI patterns, and project-based practice.',
  'Helps learners turn JavaScript concepts into production-ready React interfaces with clean component design.',
  'Focuses on beginner-friendly explanations, structured milestones, and real-world exercises that mirror team workflows.',
  'Specializes in modern web apps, scalable component systems, and hands-on guidance for shipping polished features.',
  'Teaches React, routing, state management, and frontend problem-solving with practical examples and career-oriented outcomes.',
  'Supports students with clear walkthroughs, skill progression, and focused practice to build confidence in web development.',
]

const emptyDetail: CourseDetailResponse = {
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

const cardClassName = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatDifficultyLabel(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('beginner')) return 'Beginner'
  if (normalized.includes('intermediate')) return 'Intermediate'
  if (normalized.includes('advanced')) return 'Advanced'
  return value ? formatLabel(value) : 'General'
}

function formatDuration(hours: number) {
  if (hours <= 0) return 'Self-paced'
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  if (wholeHours === 0) return `${minutes}m total`
  if (minutes === 0) return `${wholeHours}h total`
  return `${wholeHours}h ${minutes}m total`
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function dedupeText(items: Array<string | null | undefined>) {
  const seen = new Set<string>()
  return items.filter((item): item is string => {
    if (!item) return false
    const normalized = item.trim()
    if (!normalized) return false
    const key = normalized.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildCourseMeta(courseId: number) {
  const index = courseId % instructorNames.length
  return {
    rating: (4.6 + ((courseId + 1) % 4) * 0.1).toFixed(1),
    ratingCount: 1045 + ((courseId * 37) % 1200),
    studentCount: 8240 + ((courseId * 113) % 24000),
    instructorName: instructorNames[index],
    instructorRole: instructorRoles[index],
    instructorBio: instructorBios[index],
  }
}

function buildLearningHighlights(data: CourseDetailResponse) {
  const fallbackHighlights = [
    `Build practical skills in ${data.category ? formatLabel(data.category) : 'this course area'}.`,
    `Complete ${data.lesson_count || data.lessons.length || 0} guided lessons with structured milestones.`,
    `Experience the same exam-gated progression students follow in ${data.title || 'this course'}.`,
  ]

  return dedupeText([
    ...data.learning_outcomes,
    ...data.readiness_cues,
    ...data.lessons.slice(0, 3).map((lesson) => lesson.summary || `Apply ${lesson.title} in a focused exercise.`),
    ...fallbackHighlights,
  ]).slice(0, 6)
}

function buildTags(data: CourseDetailResponse) {
  return dedupeText([
    data.category ? formatLabel(data.category) : null,
    formatDifficultyLabel(data.difficulty_level),
    ...data.readiness_cues,
  ]).slice(0, 4)
}

function getContinueLesson(data: CourseDetailResponse) {
  return (
    data.lessons.find((lesson) => lesson.status === 'in_progress') ??
    data.lessons.find((lesson) => lesson.is_accessible) ??
    data.lessons[0] ??
    null
  )
}

function getLessonStatusMeta(lesson: CourseLessonSummary) {
  if (lesson.status === 'completed') {
    return {
      label: 'Completed',
      icon: Check,
      iconClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      textClassName: 'text-emerald-600 dark:text-emerald-300',
    }
  }

  if (lesson.status === 'in_progress') {
    return {
      label: 'In progress',
      icon: PlayCircle,
      iconClassName: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      textClassName: 'text-blue-600 dark:text-blue-300',
    }
  }

  if (!lesson.is_accessible) {
    return {
      label: 'Locked',
      icon: Lock,
      iconClassName: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300',
      textClassName: 'text-slate-500 dark:text-slate-400',
    }
  }

  return {
    label: 'Ready',
    icon: BookOpen,
    iconClassName: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    textClassName: 'text-violet-600 dark:text-violet-300',
  }
}

function getLessonAssessmentLabel(lesson: CourseLessonSummary) {
  if (!lesson.assessment) {
    return 'No assessment attached yet'
  }

  return `Lesson ${lesson.sequence_number}: Exam · ${lesson.assessment.question_count} questions`
}

export function CompanyCoursePreviewDetailPage({ workspaceRole = 'company' }: { workspaceRole?: 'company' | 'teacher' }) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const workspacePrefix = workspaceRole === 'teacher' ? '/teacher' : '/company'
  const [data, setData] = useState<CourseDetailResponse>(emptyDetail)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<number[]>([])
  const [openLessonIds, setOpenLessonIds] = useState<number[]>([])

  const loadCourse = useCallback(
    async (active = true, showLoading = false) => {
      if (!courseId) {
        setError('Course id is required.')
        setLoading(false)
        return
      }

      if (showLoading && active) {
        setLoading(true)
      }

      try {
        const response = await apiRequest<CourseDetailResponse>(`${workspacePrefix}/courses/${courseId}/preview`)
        const previewState = readCompanyCoursePreviewState(response.course_id)
        if (active) {
          setData(applyCompanyPreviewStateToCourseDetail(response, previewState, workspacePrefix))
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load course detail.')
        }
      } finally {
        if (active && showLoading) {
          setLoading(false)
        }
      }
    },
    [courseId, workspacePrefix],
  )

  useEffect(() => {
    const storedFavorites = localStorage.getItem(companyCoursePreviewFavoritesStorageKey)
    if (!storedFavorites) return
    try {
      const parsedFavorites = JSON.parse(storedFavorites) as number[]
      setFavoriteCourseIds(Array.isArray(parsedFavorites) ? parsedFavorites : [])
    } catch {
      setFavoriteCourseIds([])
    }
  }, [])

  useEffect(() => {
    let active = true
    void loadCourse(active, true)
    return () => {
      active = false
    }
  }, [loadCourse])

  const progressPercent = data.enrollment.progress_percent ?? data.progress_percent ?? 0
  const continueLesson = useMemo(() => getContinueLesson(data), [data])
  const courseMeta = useMemo(() => buildCourseMeta(data.course_id), [data.course_id])
  const learningHighlights = useMemo(() => buildLearningHighlights(data), [data])
  const courseTags = useMemo(() => buildTags(data), [data])
  const coursePreviewDescription = useMemo(
    () => truncateText(data.description, 160),
    [data.description],
  )
  const mediaOverride = useMemo(
    () => (data.course_id ? getCourseMediaOverrideForCourse(data.course_id, data.title) : null),
    [data.course_id, data.title],
  )
  const areAllLessonsOpen = data.lessons.length > 0 && openLessonIds.length === data.lessons.length
  const isWishlisted = favoriteCourseIds.includes(data.course_id)

  useEffect(() => {
    if (data.lessons.length === 0) {
      setOpenLessonIds([])
      return
    }

    setOpenLessonIds((currentLessonIds) => {
      const validLessonIds = currentLessonIds.filter((lessonId) => data.lessons.some((lesson) => lesson.lesson_id === lessonId))
      if (validLessonIds.length > 0) {
        return validLessonIds
      }
      return continueLesson ? [continueLesson.lesson_id] : [data.lessons[0].lesson_id]
    })
  }, [continueLesson, data.lessons])

  function toggleFavorite() {
    if (!data.course_id) return
    setFavoriteCourseIds((currentFavorites) => {
      const nextFavorites = currentFavorites.includes(data.course_id)
        ? currentFavorites.filter((course) => course !== data.course_id)
        : [...currentFavorites, data.course_id]
      localStorage.setItem(companyCoursePreviewFavoritesStorageKey, JSON.stringify(nextFavorites))
      return nextFavorites
    })
  }

  function toggleLesson(lessonId: number) {
    setOpenLessonIds((currentLessonIds) =>
      currentLessonIds.includes(lessonId)
        ? currentLessonIds.filter((currentLessonId) => currentLessonId !== lessonId)
        : [...currentLessonIds, lessonId],
    )
  }

  function toggleAllLessons() {
    setOpenLessonIds(areAllLessonsOpen ? [] : data.lessons.map((lesson) => lesson.lesson_id))
  }

  async function startPreview(targetHref?: string | null) {
    if (!data.course_id || data.lessons.length === 0) return
    setStarting(true)
    const previewState = readCompanyCoursePreviewState(data.course_id)
    writeCompanyCoursePreviewState(data.course_id, {
      ...previewState,
      started: true,
    })
    await loadCourse(true, false)
    navigate(targetHref || `${workspacePrefix}/courses/${data.course_id}/preview/lessons/${data.lessons[0].lesson_id}`)
    setStarting(false)
  }

  function goToHref(href: string) {
    navigate(href)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
        <div className={cardClassName}>
          <LoadingState title="Loading course details" className="min-h-72 py-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to={workspacePrefix} className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`${workspacePrefix}/courses`} className="transition-colors hover:text-foreground">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{data.title || 'Course detail'}</span>
        </div>

        <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="h-52 overflow-hidden rounded-xl bg-slate-950 shadow">
              {data.thumbnail_image || mediaOverride?.thumbnailImage || mediaOverride?.previewImage ? (
                <img
                  src={data.thumbnail_image || mediaOverride?.thumbnailImage || mediaOverride?.previewImage || ''}
                  alt={data.thumbnail_alt_text || mediaOverride?.thumbnailAltText || `${data.title} cover`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
                  <div className="text-center">
                    <div className="mb-3 text-6xl text-cyan-400">⚛</div>
                    <h2 className="text-3xl font-bold">
                      {data.title.split(' ').slice(0, 1).join(' ') || 'Course'}{' '}
                      <span className="rounded bg-blue-600 px-2">{data.title.split(' ').slice(1, 2).join(' ') || 'JS'}</span>
                    </h2>
                    <p className="mt-1 text-xl">{data.title.split(' ').slice(2).join(' ') || 'Complete Guide'}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl dark:text-slate-100">{data.title || 'Course detail'}</h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-500 dark:text-slate-400">
                {coursePreviewDescription || 'Learn step by step with practical lessons, guided progress, and project-focused outcomes.'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current text-amber-400" />
                  <b className="text-slate-900 dark:text-slate-100">{courseMeta.rating}</b> ({formatCompactNumber(courseMeta.ratingCount)} ratings)
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  {formatCompactNumber(courseMeta.studentCount)} students
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  {formatDuration(data.estimated_hours)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {courseTags.map((tag) => (
                  <span key={tag} className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <Button
                  type="button"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 hover:text-white"
                  onClick={() =>
                    data.enrollment.is_enrolled
                      ? goToHref(continueLesson?.detail_href || data.next_step_href || data.detail_href || `${workspacePrefix}/courses`)
                      : void startPreview(continueLesson?.detail_href)
                  }
                  disabled={starting}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {data.enrollment.is_enrolled ? 'Continue Preview' : starting ? 'Starting...' : 'Start Preview'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  onClick={toggleFavorite}
                >
                  <Heart className={cn('mr-2 h-4 w-4', isWishlisted && 'fill-current text-emerald-500')} />
                  {isWishlisted ? 'Saved Preview' : 'Save Preview'}
                </Button>
              </div>
            </div>
          </section>

          <section className={cn(cardClassName, 'mb-5')}>
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-100">Continue Learning</h2>
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-20 w-36 items-center justify-center rounded-lg bg-slate-950 text-4xl text-cyan-400">⚛</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{continueLesson?.title || 'Start your first lesson'}</h3>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  {continueLesson ? `Lesson ${continueLesson.sequence_number}` : 'Course overview'} ・{' '}
                  {data.enrollment.is_enrolled ? 'Ready to continue' : 'Start preview to unlock lessons'}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-1.5 max-w-sm flex-1 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{progressPercent}% completed</span>
                </div>
              </div>

              <Button
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 hover:text-white"
                onClick={() =>
                  data.enrollment.is_enrolled
                    ? goToHref(continueLesson?.detail_href || data.next_step_href || data.detail_href || `${workspacePrefix}/courses`)
                    : void startPreview(continueLesson?.detail_href)
                }
                disabled={starting}
              >
                {data.enrollment.is_enrolled ? 'Resume Lesson' : starting ? 'Starting...' : 'Start Preview'}
              </Button>
            </div>
          </section>

          <section className={cn(cardClassName, 'mb-5')}>
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-100">What you&apos;ll learn</h2>
            <div className="grid grid-cols-1 gap-5 text-slate-700 md:grid-cols-2 xl:grid-cols-3 dark:text-slate-300">
              {learningHighlights.map((item) => (
                <p key={item} className="flex gap-3 leading-7">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    ✓
                  </span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </section>

          <section className={cardClassName}>
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course Content</h2>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={toggleAllLessons}
              >
                {areAllLessonsOpen ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {data.lessons.map((lesson) => {
                const isOpen = openLessonIds.includes(lesson.lesson_id)
                const statusMeta = getLessonStatusMeta(lesson)
                const StatusIcon = statusMeta.icon

                return (
                  <div key={lesson.lesson_id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 py-4 text-left text-slate-700 dark:text-slate-200"
                      onClick={() => toggleLesson(lesson.lesson_id)}
                    >
                      <span className="flex min-w-0 items-center gap-3 font-medium">
                        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
                        <span className="truncate">
                          Lesson {lesson.sequence_number}: {lesson.title}
                        </span>
                      </span>
                      <span className={cn('flex items-center gap-2 text-sm', statusMeta.textClassName)}>
                        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', statusMeta.iconClassName)}>
                          <StatusIcon className="h-4 w-4" />
                        </span>
                        {statusMeta.label}
                      </span>
                    </button>

                    {isOpen ? (
                      <div className="pb-4 pl-7 pr-1">
                        <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
                          {lesson.summary || 'Continue through this lesson to build the next skill in the course.'}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {lesson.detail_href ? (
                            <Button
                              type="button"
                              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                              onClick={() => goToHref(lesson.detail_href)}
                            >
                              Open Lesson
                            </Button>
                          ) : lesson.sequence_number === 1 && !data.enrollment.is_enrolled ? (
                            <Button
                              type="button"
                              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                              onClick={() => void startPreview(`${workspacePrefix}/courses/${data.course_id}/preview/lessons/${lesson.lesson_id}`)}
                              disabled={starting}
                            >
                              Start Preview
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" className="rounded-xl" disabled>
                              Unlock by passing the previous exam
                            </Button>
                          )}

                          <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                            {getLessonAssessmentLabel(lesson)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
