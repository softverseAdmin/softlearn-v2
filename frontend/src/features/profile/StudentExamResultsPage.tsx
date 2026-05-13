import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { ApiError, apiRequest } from '../../lib/api'
import type { ExamResultsSummary } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { containerVariants, itemVariants } from '../../lib/animations'

const emptySummary: ExamResultsSummary = {
  student_id: 0,
  total_results: 0,
  passed_results: 0,
  average_score: null,
  results: [],
  available_exams: [],
}

export default function StudentExamResultsPage() {
  const [summary, setSummary] = useState<ExamResultsSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const response = await apiRequest<ExamResultsSummary>('/student/exam-results')
        if (active) {
          setSummary(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load exam results.')
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
      <div className="space-y-6 md:space-y-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading exam results…</p>
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
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student exams</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Exam results summary</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Review your assessment outcomes without exposing any company-facing sharing decisions.
          </p>
        </div>
        <Card className="w-full md:w-auto md:flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Average score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-bold">{summary.average_score === null ? 'No exams yet' : `${summary.average_score}%`}</p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/student/preparation">Preparation workspace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load exam results</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats Cards */}
      {!error ? (
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.total_results}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Passed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.passed_results}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available exams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.available_exams.length}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}

      {/* Available Exams */}
      {!error ? (
        <Card>
          <CardHeader>
            <CardTitle>Available exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.available_exams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active exams are available yet.</p>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {summary.available_exams.map((exam) => (
                  <motion.div key={exam.exam_id} variants={itemVariants}>
                    <div className="space-y-3 rounded-lg border border-border p-4 dark:border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{exam.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {exam.category} · {exam.duration_minutes} min · pass {exam.passing_score_percent}% · {exam.question_count} questions
                          </p>
                        </div>
                        <Badge variant={exam.can_take ? 'default' : 'secondary'}>
                          {exam.can_take ? `Attempt ${exam.next_attempt_number}` : 'Locked'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exam.description || 'No exam description yet.'}</p>
                      <p className="text-xs text-muted-foreground">{exam.retake_message}</p>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={exam.detail_href}>View exam</Link>
                        </Button>
                        {exam.can_take ? (
                          <Button size="sm" asChild>
                            <Link to={exam.detail_href}>Start exam</Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Exam Records */}
      {!error ? (
        <Card>
          <CardHeader>
            <CardTitle>Exam records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exam results yet.</p>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {summary.results.map((result) => (
                  <motion.div key={result.id} variants={itemVariants}>
                    <div className="space-y-3 rounded-lg border border-border p-4 dark:border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{result.exam_title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {result.category} · Attempt {result.attempt_number}
                          </p>
                        </div>
                        <p className="text-2xl font-bold">{result.score_percent}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <Badge variant="default">Passed</Badge>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <Badge variant="secondary">Not passed</Badge>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Taken: {new Date(result.taken_at).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
