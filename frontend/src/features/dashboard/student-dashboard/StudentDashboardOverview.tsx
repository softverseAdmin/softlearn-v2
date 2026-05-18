import { useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { containerVariants, itemVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

import { getCourseMediaOverrideForCourse } from '../../profile/courseMediaStorage'
import type { CourseCatalogRecord } from '../../profile/types'
import type { StudentDashboardResponse } from '../types'
import {
  dashboardThumbnailBackgrounds,
  formatCourseCategory,
  formatCourseDifficulty,
  formatLearningStatus,
  formatLessonStatus,
  type StudentDashboardStatCard,
} from './shared'

type StudentDashboardOverviewProps = {
  statCards: StudentDashboardStatCard[]
  learningData: StudentDashboardResponse | null
  learningError: string | null
  coursesError: string | null
  recommendedCourses: CourseCatalogRecord[]
}

function RecommendedCourseCard({ course }: { course: CourseCatalogRecord }) {
  const mediaOverride = getCourseMediaOverrideForCourse(course.course_id, course.title)
  const courseThumbnail = course.thumbnail_image || mediaOverride?.thumbnailImage || mediaOverride?.previewImage || ''
  const background = dashboardThumbnailBackgrounds[course.course_id % dashboardThumbnailBackgrounds.length]

  return (
    <article className="flex min-h-[320px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-muted/20">
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
            <p className="text-sm text-muted-foreground">A good next step when you are ready for a new track.</p>
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
}

export function StudentDashboardOverview({
  statCards,
  learningData,
  learningError,
  coursesError,
  recommendedCourses,
}: StudentDashboardOverviewProps) {
  const recommendationCarouselRef = useRef<HTMLDivElement | null>(null)

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

  return (
    <div className="space-y-4">
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
                <Link to={learningData.continue_learning.cta_href}>{learningData.continue_learning.cta_label}</Link>
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

              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold">Next action</p>
                <p className="mt-1 text-sm text-muted-foreground">{learningData.next_action.description}</p>
                {learningData.next_action.requirement ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    {learningData.next_action.requirement}
                  </div>
                ) : null}
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to="/student/exams">Take next exam</Link>
                </Button>
              </div>
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
                  <CardDescription>Suggested from your current learning focus and course readiness signals.</CardDescription>
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
                    <RecommendedCourseCard key={course.course_id} course={course} />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
