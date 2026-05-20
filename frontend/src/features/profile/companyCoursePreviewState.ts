import type {
  CourseAssessmentSummary,
  CourseDetailResponse,
  CourseLessonSummary,
  LessonDetailResponse,
  LessonProgressState,
} from './types'

export interface CompanyCoursePreviewState {
  started: boolean
  lessonStatuses: Record<number, 'not_started' | 'in_progress' | 'completed'>
  lessonExamResults: Record<number, { score_percent: number; passed: boolean }>
  finalExamResult: { score_percent: number; passed: boolean } | null
}

export const companyCoursePreviewFavoritesStorageKey = 'company-course-preview-favorites'

const emptyPreviewState: CompanyCoursePreviewState = {
  started: false,
  lessonStatuses: {},
  lessonExamResults: {},
  finalExamResult: null,
}

function previewStorageKey(courseId: number) {
  return `company-course-preview:${courseId}`
}

export function readCompanyCoursePreviewState(courseId: number) {
  if (!courseId || typeof window === 'undefined') {
    return emptyPreviewState
  }

  const stored = window.localStorage.getItem(previewStorageKey(courseId))
  if (!stored) {
    return emptyPreviewState
  }

  try {
    const parsed = JSON.parse(stored) as Partial<CompanyCoursePreviewState>
    return {
      started: Boolean(parsed.started),
      lessonStatuses: parsed.lessonStatuses ?? {},
      lessonExamResults: parsed.lessonExamResults ?? {},
      finalExamResult: parsed.finalExamResult ?? null,
    }
  } catch {
    return emptyPreviewState
  }
}

export function writeCompanyCoursePreviewState(courseId: number, state: CompanyCoursePreviewState) {
  if (!courseId || typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(previewStorageKey(courseId), JSON.stringify(state))
}

function getLessonStatus(state: CompanyCoursePreviewState, lessonId: number): LessonProgressState['status'] {
  return state.lessonStatuses[lessonId] ?? 'not_started'
}

function normalizeWorkspaceHref(href: string | null | undefined, workspacePrefix: string) {
  if (!href) {
    return null
  }

  return href.replace(/^\/company(?=\/|$)/, workspacePrefix)
}

function isLessonAccessible(state: CompanyCoursePreviewState, lessons: CourseLessonSummary[], lessonId: number) {
  if (!state.started) {
    return false
  }

  const lessonIndex = lessons.findIndex((lesson) => lesson.lesson_id === lessonId)
  if (lessonIndex <= 0) {
    return true
  }

  const previousLesson = lessons[lessonIndex - 1]
  return (
    getLessonStatus(state, previousLesson.lesson_id) === 'completed' &&
    Boolean(state.lessonExamResults[previousLesson.lesson_id]?.passed)
  )
}

function withAssessmentState(
  assessment: CourseAssessmentSummary | null,
  result: { score_percent: number; passed: boolean } | null,
  unlocked: boolean,
) {
  if (!assessment) {
    return null
  }

  return {
    ...assessment,
    is_unlocked: unlocked,
    attempt_count: result ? 1 : 0,
    best_score: result?.score_percent ?? null,
    latest_score: result?.score_percent ?? null,
    passed: result?.passed ?? false,
  }
}

export function applyCompanyPreviewStateToCourseDetail(
  detail: CourseDetailResponse,
  state: CompanyCoursePreviewState,
  workspacePrefix = '/company',
): CourseDetailResponse {
  const lessonCount = detail.lessons.length
  const completedLessonCount = detail.lessons.filter(
    (lesson) => getLessonStatus(state, lesson.lesson_id) === 'completed',
  ).length
  const allLessonsComplete =
    lessonCount > 0 && completedLessonCount === lessonCount && detail.lessons.every((lesson) => state.lessonExamResults[lesson.lesson_id]?.passed)
  const progressPercent = lessonCount > 0 ? Math.round((completedLessonCount / lessonCount) * 100) : 0

  const lessons = detail.lessons.map((lesson) => {
    const accessible = isLessonAccessible(state, detail.lessons, lesson.lesson_id)
      return {
        ...lesson,
        status: state.started ? getLessonStatus(state, lesson.lesson_id) : null,
        is_accessible: accessible,
        detail_href: accessible ? `${workspacePrefix}/courses/${detail.course_id}/preview/lessons/${lesson.lesson_id}` : null,
        assessment: withAssessmentState(
        lesson.assessment,
        state.lessonExamResults[lesson.lesson_id] ?? null,
        getLessonStatus(state, lesson.lesson_id) === 'completed',
      ),
    }
  })

  const continueLesson =
    lessons.find((lesson) => lesson.status === 'in_progress' && lesson.detail_href) ??
    lessons.find((lesson) => lesson.is_accessible && lesson.status !== 'completed' && lesson.detail_href) ??
    lessons.find((lesson) => lesson.detail_href) ??
    null

  return {
    ...detail,
    detail_href: `${workspacePrefix}/courses/${detail.course_id}/preview`,
    is_enrolled: state.started,
    enrollment_status: state.started ? (allLessonsComplete && state.finalExamResult?.passed ? 'completed' : 'in_progress') : null,
    progress_percent: progressPercent,
    next_step_label: state.started ? (allLessonsComplete && state.finalExamResult?.passed ? 'Review course' : 'Continue learning') : 'Start preview',
    next_step_href:
      continueLesson?.detail_href ??
      (state.started ? normalizeWorkspaceHref(detail.next_step_href, workspacePrefix) : null),
    enrollment: {
      ...detail.enrollment,
      is_enrolled: state.started,
      status: state.started ? (allLessonsComplete && state.finalExamResult?.passed ? 'completed' : 'in_progress') : null,
      progress_percent: progressPercent,
      completed_at: state.finalExamResult?.passed ? new Date().toISOString() : null,
      lesson_count: lessonCount,
      completed_lesson_count: completedLessonCount,
    },
    lessons,
    final_exam: withAssessmentState(
      detail.final_exam,
      state.finalExamResult,
      lessonCount > 0 &&
        getLessonStatus(state, lessons[lessonCount - 1]?.lesson_id ?? 0) === 'completed' &&
        Boolean(state.lessonExamResults[lessons[lessonCount - 1]?.lesson_id ?? 0]?.passed),
    ),
  }
}

export function applyCompanyPreviewStateToLessonDetail(
  detail: LessonDetailResponse,
  courseDetail: CourseDetailResponse,
  state: CompanyCoursePreviewState,
  workspacePrefix = '/company',
): LessonDetailResponse {
  const currentLesson = courseDetail.lessons.find((lesson) => lesson.lesson_id === detail.lesson_id)
  const currentIndex = courseDetail.lessons.findIndex((lesson) => lesson.lesson_id === detail.lesson_id)
  const previousLesson = currentIndex > 0 ? courseDetail.lessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 ? courseDetail.lessons[currentIndex + 1] : null

  return {
    ...detail,
    course_href: `${workspacePrefix}/courses/${detail.course_id}/preview`,
    progress: {
      status: state.started ? getLessonStatus(state, detail.lesson_id) : 'not_started',
      started_at: null,
      completed_at: null,
    },
    previous_lesson_href:
      previousLesson?.detail_href ?? normalizeWorkspaceHref(detail.previous_lesson_href, workspacePrefix),
    next_lesson_href: nextLesson?.detail_href ?? normalizeWorkspaceHref(detail.next_lesson_href, workspacePrefix),
    lesson_exam: withAssessmentState(
      detail.lesson_exam,
      state.lessonExamResults[detail.lesson_id] ?? null,
      Boolean(currentLesson && currentLesson.status === 'completed'),
    ),
    final_exam: withAssessmentState(
      detail.final_exam,
      state.finalExamResult,
      currentIndex === courseDetail.lessons.length - 1 &&
        Boolean(state.lessonExamResults[detail.lesson_id]?.passed) &&
        getLessonStatus(state, detail.lesson_id) === 'completed',
    ),
  }
}
