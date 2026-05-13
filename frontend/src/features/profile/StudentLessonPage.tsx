import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PlayCircle,
  Sparkles,
  TextQuote,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { LessonDetailResponse, LessonProgressUpdateResponse } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const progressPercent = useMemo(() => {
    if (data.total_lessons <= 0) {
      return data.progress.status === 'completed' ? 100 : data.progress.status === 'in_progress' ? 50 : 0
    }

    const completedBeforeCurrent = data.progress.status === 'completed' ? data.sequence_number : Math.max(data.sequence_number - 1, 0)
    return Math.min(100, Math.round((completedBeforeCurrent / data.total_lessons) * 100))
  }, [data.progress.status, data.sequence_number, data.total_lessons])

  const lessonSections = useMemo(() => {
    const blocks = data.content
      .split(/\n{2,}/)
      .map((section) => section.trim())
      .filter(Boolean)

    if (blocks.length === 0) {
      return ['No lesson content yet.']
    }

    return blocks
  }, [data.content])

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
      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#f5f3ff_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
              <Sparkles className="h-4 w-4" />
              Lesson workspace
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Lesson {data.sequence_number} of {data.total_lessons}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{data.title || 'Lesson'}</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                {data.summary || 'Continue the structured course path and keep your progress up to date.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800" asChild>
                <Link to={data.next_lesson_href || data.course_href || `/student/courses/${data.course_id}`}>
                  {data.next_lesson_href ? 'Continue to next lesson' : 'Back to course'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 bg-white px-5"
                onClick={() => void updateProgress(data.progress.status === 'not_started' ? 'in_progress' : 'completed')}
                disabled={saving || data.progress.status === 'completed'}
              >
                {saving ? 'Saving…' : data.progress.status === 'not_started' ? 'Mark in progress' : 'Mark completed'}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{data.course_title || 'Current course'}</p>
              <p className="mt-1 text-sm text-slate-500">Protected lesson workspace</p>
            </div>
            <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-3 text-lg font-semibold capitalize text-slate-950">
                {data.progress.status.replace('_', ' ')}
              </p>
              <p className="mt-1 text-sm text-slate-500">{progressPercent}% through course sequence</p>
            </div>
            <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next action</p>
              <p className="mt-3 text-sm font-semibold text-slate-950">
                {data.next_lesson_href ? 'Review this lesson and continue forward.' : 'Complete this lesson to finish the sequence.'}
              </p>
            </div>
          </div>
        </div>
      </section>

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

      <motion.div
        className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <CardContent className="space-y-0 p-0">
                <div className="relative border-b border-slate-100 bg-slate-950 px-6 py-6 text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.28),transparent_35%)]" />
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                        Learning view
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300">{data.course_title}</p>
                      <h2 className="mt-2 text-2xl font-semibold">{data.title || 'Lesson content'}</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Position</p>
                        <p className="mt-2 text-sm font-semibold">Step {data.sequence_number}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Progress</p>
                        <p className="mt-2 text-sm font-semibold">{progressPercent}% complete</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                        <p className="mt-2 text-sm font-semibold capitalize">{data.progress.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-2 text-blue-600 shadow-sm">
                          <TextQuote className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lesson summary</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {data.summary || 'A concise summary will appear here once the lesson is populated.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course progress</p>
                      <p className="mt-3 text-3xl font-bold text-slate-950">{progressPercent}%</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {lessonSections.map((section, index) => (
                      <div key={`${index}-${section.slice(0, 24)}`} className="rounded-[28px] border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Section {index + 1}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{section}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <CardHeader>
                <CardTitle>Lesson actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200 bg-white"
                  onClick={() => void updateProgress('in_progress')}
                  disabled={saving || data.progress.status === 'in_progress' || data.progress.status === 'completed'}
                >
                  Start lesson
                </Button>
                <Button
                  className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => void updateProgress('completed')}
                  disabled={saving || data.progress.status === 'completed'}
                >
                  Mark completed
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="space-y-6 xl:sticky xl:top-24">
            <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <CardHeader>
                <CardTitle>Curriculum navigator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current item</p>
                  <p className="mt-2 font-semibold text-slate-950">{data.title || 'Lesson'}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <span>
                      Lesson {data.sequence_number} of {data.total_lessons}
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="h-11 w-full justify-between rounded-2xl border-slate-200 bg-white" asChild>
                  <Link to={data.course_href || `/student/courses/${data.course_id}`}>
                    <span className="inline-flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Back to course
                    </span>
                  </Link>
                </Button>
                {data.previous_lesson_href ? (
                  <Button variant="outline" className="h-11 w-full justify-between rounded-2xl border-slate-200 bg-white" asChild>
                    <Link to={data.previous_lesson_href}>
                      <span className="inline-flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Previous lesson
                      </span>
                    </Link>
                  </Button>
                ) : null}
                {data.next_lesson_href ? (
                  <Button className="h-11 w-full justify-between rounded-2xl bg-blue-600 text-white hover:bg-blue-700" asChild>
                    <Link to={data.next_lesson_href}>
                      <span>Next lesson</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <CardHeader>
                <CardTitle>Study prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  `Summarize ${data.title || 'this lesson'} in simple terms.`,
                  `Give me one practice task based on ${data.title || 'this topic'}.`,
                  'List the key concepts I should remember before moving forward.',
                ].map((prompt) => (
                  <div key={prompt} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {prompt}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
