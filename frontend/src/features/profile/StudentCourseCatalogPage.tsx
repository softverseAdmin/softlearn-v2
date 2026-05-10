import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { ApiError, apiRequest } from '../../lib/api'
import type { CourseCatalogResponse } from './types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const emptyCatalog: CourseCatalogResponse = {
  result_count: 0,
  courses: [],
}

export function StudentCourseCatalogPage() {
  const [data, setData] = useState<CourseCatalogResponse>(emptyCatalog)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all')

  useEffect(() => {
    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<CourseCatalogResponse>('/student/courses')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load course catalog.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCourses()
    return () => {
      active = false
    }
  }, [])

  const filteredCourses = data.courses.filter((course) => {
    if (filter === 'enrolled') return course.is_enrolled
    if (filter === 'available') return !course.is_enrolled
    return true
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Learning</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Course Catalog</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Explore our collection of professional courses and continue your learning journey.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{data.result_count} courses</Badge>
          <Badge variant="secondary">{data.courses.filter((c) => c.is_enrolled).length} enrolled</Badge>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load courses</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading your course catalog…</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      {!loading ? (
        <div className="flex gap-2">
          {(['all', 'enrolled', 'available'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-muted'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      ) : null}

      {/* Course Grid */}
      {!loading && !error ? (
        <>
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {filter === 'enrolled' ? 'You haven\'t enrolled in any courses yet.' : 'Check back later for new courses.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCourses.map((course) => (
                <motion.div key={course.course_id} variants={itemVariants}>
                  <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                    {/* Course Header */}
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <BookOpen className="h-8 w-8 flex-shrink-0 text-primary" />
                        <Badge variant={course.is_enrolled ? 'default' : 'secondary'}>
                          {course.is_enrolled ? 'Enrolled' : 'Available'}
                        </Badge>
                      </div>
                    </div>

                    {/* Course Content */}
                    <CardContent className="flex-1 space-y-4 pt-4">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{course.category}</p>
                      </div>

                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      )}

                      {/* Course Meta */}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {course.difficulty_level && <Badge variant="outline">{course.difficulty_level}</Badge>}
                        {course.estimated_hours > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.estimated_hours}h
                          </div>
                        )}
                        {course.lesson_count > 0 && <Badge variant="outline">{course.lesson_count} lessons</Badge>}
                      </div>

                      {/* Progress Bar */}
                      {course.progress_percent !== null && course.progress_percent > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">Progress</p>
                            <p className="text-xs text-muted-foreground">{course.progress_percent}%</p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                              style={{ width: `${course.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Readiness Cues */}
                      {course.readiness_cues.length > 0 ? (
                        <div className="space-y-1">
                          {course.readiness_cues.slice(0, 2).map((cue) => (
                            <div key={cue} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                              <p className="text-xs text-muted-foreground">{cue}</p>
                            </div>
                          ))}
                          {course.readiness_cues.length > 2 ? (
                            <p className="text-xs text-muted-foreground">+{course.readiness_cues.length - 2} more</p>
                          ) : null}
                        </div>
                      ) : null}
                    </CardContent>

                    {/* Actions */}
                    <div className="border-t border-border p-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/student/courses/${course.course_id}`}
                          className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
                        >
                          Details
                        </Link>
                        <Link
                          to={course.next_step_href}
                          className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {course.next_step_label}
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      ) : null}
    </div>
  )
}
