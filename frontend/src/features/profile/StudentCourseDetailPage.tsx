import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, BookOpen, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CourseDetailResponse, StudentCourseEnrollmentResponse } from './types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { containerVariants, itemVariants } from '../../lib/animations'

const emptyDetail: CourseDetailResponse = {
  course_id: 0,
  title: '',
  description: '',
  category: '',
  difficulty_level: '',
  estimated_hours: 0,
  status: 'active',
  lesson_count: 0,
  is_enrolled: false,
  enrollment_status: null,
  progress_percent: null,
  readiness_cues: [],
  detail_href: '',
  next_step_label: '',
  next_step_href: '',
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
  learning_outcomes: [],
}

export function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<CourseDetailResponse>(emptyDetail)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadCourse(active = true) {
    if (!courseId) {
      setError('Course id is required.')
      setLoading(false)
      return
    }

    try {
      const response = await apiRequest<CourseDetailResponse>(`/student/courses/${courseId}`)
      if (active) {
        setData(response)
      }
    } catch (loadError) {
      if (active) {
        setError(loadError instanceof ApiError ? loadError.message : 'Unable to load course detail.')
      }
    } finally {
      if (active) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    let active = true
    void loadCourse(active)
    return () => {
      active = false
    }
  }, [courseId])

  async function handleEnroll() {
    if (!courseId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<StudentCourseEnrollmentResponse>(`/student/courses/${courseId}/enrollment`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await loadCourse(true)
      setSuccess(response.created ? 'Course enrollment started.' : 'You are already enrolled in this course.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to enroll in this course.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading course details…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Course detail</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{data.title || 'Course detail'}</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Review the full course context, enroll, and continue through the lesson path from one place.
          </p>
        </div>
        <Card className="w-full md:w-auto md:flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Course summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.category}
              {data.difficulty_level ? ` · ${data.difficulty_level}` : ''}
              {data.estimated_hours > 0 ? ` · ${data.estimated_hours}h` : ''}
              {data.lesson_count > 0 ? ` · ${data.lesson_count} lessons` : ''}
            </p>
            {data.enrollment.progress_percent !== null ? (
              <p className="text-sm text-muted-foreground">Progress: {data.enrollment.progress_percent}%</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load course</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Success State */}
      {success ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Success</h3>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!error ? (
        <>
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground">{data.description || 'No course description yet.'}</p>
              {data.readiness_cues.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">What you'll be ready for:</p>
                  <div className="space-y-2">
                    {data.readiness_cues.map((cue) => (
                      <div key={cue} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-muted-foreground">{cue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Enrollment & Learning Outcomes */}
          <motion.div
            className="grid gap-6 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.enrollment.is_enrolled ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {data.enrollment.completed_lesson_count} of {data.enrollment.lesson_count} lessons completed
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="font-medium capitalize">{data.enrollment.status?.replace('_', ' ')}</span>
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Button className="w-full" asChild>
                          <Link to={data.next_step_href}>{data.next_step_label}</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/student/learning">View learning summary</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Enrollment unlocks lesson access and creates the progress record used in your learning summary.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => void handleEnroll()}
                        disabled={saving}
                      >
                        {saving ? 'Enrolling…' : 'Enroll in course'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>What to expect</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.learning_outcomes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No additional course outcomes yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.learning_outcomes.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 rounded-lg border border-border p-3 dark:border-border"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                          <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active lessons are available yet.</p>
              ) : (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {data.lessons.map((lesson) => (
                    <motion.div key={lesson.lesson_id} variants={itemVariants}>
                      <div className="space-y-3 rounded-lg border border-border p-4 dark:border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {lesson.sequence_number}. {lesson.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {lesson.status ? lesson.status.replace('_', ' ') : 'Locked until enrolled'}
                            </p>
                          </div>
                          {lesson.is_accessible ? (
                            <Badge variant="default">Open</Badge>
                          ) : (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {lesson.summary || 'No lesson summary yet.'}
                        </p>
                        {lesson.detail_href ? (
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link to={lesson.detail_href}>Open lesson</Link>
                          </Button>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/student/courses">Back to catalog</Link>
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
