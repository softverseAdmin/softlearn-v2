import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { LearningSummary } from './types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const emptySummary: LearningSummary = {
  student_id: 0,
  total_courses: 0,
  completed_courses: 0,
  in_progress_courses: 0,
  records: [],
}

export function StudentLearningPage() {
  const [summary, setSummary] = useState<LearningSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const response = await apiRequest<LearningSummary>('/student/learning-summary')
        if (active) {
          setSummary(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load learning summary.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSummary()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="py-12">
        <LoadingState title="Loading your learning summary" className="min-h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student learning</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Learning summary</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Review your current course progress and completion evidence in one protected summary.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Progress snapshot</p>
            <p className="text-sm text-muted-foreground">{summary.completed_courses} completed</p>
            <p className="text-sm text-muted-foreground">{summary.in_progress_courses} in progress</p>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link to="/student/courses">Browse courses</Link>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load learning summary</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Total courses</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total_courses}</div>
              <p className="mt-1 text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.completed_courses}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.total_courses > 0
                  ? `${Math.round((summary.completed_courses / summary.total_courses) * 100)}% completion`
                  : 'No courses yet'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">In progress</CardTitle>
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.in_progress_courses}</div>
              <p className="mt-1 text-xs text-muted-foreground">Currently learning</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Course Records */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Course records</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your learning journey and progress</p>
        </div>

        {summary.records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">No learning records yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Start your learning journey by enrolling in a course.
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {summary.records.map((record) => (
              <motion.div key={record.id} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-lg bg-primary/10 p-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{record.course_title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {record.category} · <Badge variant="outline" className="ml-1">{record.status.replace('_', ' ')}</Badge>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 md:items-end">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{record.progress_percent}%</p>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                        {record.completed_at ? (
                          <p className="text-xs text-muted-foreground">
                            Completed: {new Date(record.completed_at).toLocaleDateString()}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${record.progress_percent}%` }}
                      />
                    </div>

                    {/* Action */}
                    {record.course_id ? (
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/student/courses/${record.course_id}`}>View course</Link>
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
