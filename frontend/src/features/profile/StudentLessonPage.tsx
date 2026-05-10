import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { LessonDetailResponse, LessonProgressUpdateResponse } from './types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { containerVariants, itemVariants } from '../../lib/animations'

const emptyLesson: LessonDetailResponse = {
  lesson_id: 0,
  course_id: 0,
  course_title: '',
  course_href: '',
  title: '',
  summary: '',
  content: '',
  sequence_number: 0,
  total_lessons: 0,
  progress: {
    status: 'not_started',
    started_at: null,
    completed_at: null,
  },
  previous_lesson_href: null,
  next_lesson_href: null,
}

export function StudentLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { csrfToken } = useAuth()
  const [data, setData] = useState<LessonDetailResponse>(emptyLesson)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadLesson() {
      if (!courseId || !lessonId) {
        setError('Course id and lesson id are required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<LessonDetailResponse>(`/student/courses/${courseId}/lessons/${lessonId}`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load lesson.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLesson()
    return () => {
      active = false
    }
  }, [courseId, lessonId])

  async function updateProgress(status: 'in_progress' | 'completed') {
    if (!courseId || !lessonId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<LessonProgressUpdateResponse>(`/student/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'PUT',
        body: { status },
        csrfToken,
      })
      setData(response.lesson)
      setSuccess(status === 'completed' ? 'Lesson marked complete.' : 'Lesson started.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update lesson progress.')
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
              <p className="mt-4 text-sm text-muted-foreground">Loading lesson…</p>
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
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Lesson {data.sequence_number} of {data.total_lessons}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{data.title || 'Lesson'}</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {data.summary || 'Continue the structured course path and keep your progress up to date.'}
          </p>
        </div>
        <Card className="w-full md:w-auto md:flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{data.course_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium capitalize">{data.progress.status.replace('_', ' ')}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to update progress</h3>
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

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">{data.content || 'No lesson content yet.'}</p>
        </CardContent>
      </Card>

      {/* Progress Actions & Navigation */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Progress actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => void updateProgress('in_progress')}
                disabled={saving || data.progress.status === 'in_progress' || data.progress.status === 'completed'}
              >
                {saving ? 'Saving…' : 'Mark in progress'}
              </Button>
              <Button
                className="w-full"
                onClick={() => void updateProgress('completed')}
                disabled={saving || data.progress.status === 'completed'}
              >
                {saving ? 'Saving…' : 'Mark completed'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to={data.course_href || `/student/courses/${data.course_id}`}>
                  <ChevronLeft className="h-4 w-4" />
                  Back to course
                </Link>
              </Button>
              {data.previous_lesson_href ? (
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link to={data.previous_lesson_href}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous lesson
                  </Link>
                </Button>
              ) : null}
              {data.next_lesson_href ? (
                <Button className="w-full justify-between" asChild>
                  <Link to={data.next_lesson_href}>
                    Next lesson
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
