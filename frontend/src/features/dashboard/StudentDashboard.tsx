import { useEffect, useMemo, useState } from 'react'
import { BarChart3, BookOpen, CheckCircle2, Clock3, Send } from 'lucide-react'

import { ApiError, apiRequest } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'

import type { CourseCatalogRecord, CourseCatalogResponse } from '../profile/types'
import type { StudentAnalyticsDashboardData, StudentDashboardResponse } from './types'
import { StudentDashboardOverview } from './student-dashboard/StudentDashboardOverview'
import { StudentDashboardSidebar } from './student-dashboard/StudentDashboardSidebar'
import { getRecommendationScore, type StudentDashboardStatCard } from './student-dashboard/shared'

type StudentDashboardProps = {
  userName: string
}

export function StudentDashboard({ userName }: StudentDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<StudentAnalyticsDashboardData | null>(null)
  const [learningData, setLearningData] = useState<StudentDashboardResponse | null>(null)
  const [courseCatalog, setCourseCatalog] = useState<CourseCatalogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [learningError, setLearningError] = useState<string | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)

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

  const statCards = useMemo<StudentDashboardStatCard[]>(() => {
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-start">
          <StudentDashboardOverview
            statCards={statCards}
            learningData={learningData}
            learningError={learningError}
            coursesError={coursesError}
            recommendedCourses={recommendedCourses}
          />
          <StudentDashboardSidebar analyticsData={analyticsData} learningData={learningData} />
        </div>
      ) : null}
    </section>
  )
}
