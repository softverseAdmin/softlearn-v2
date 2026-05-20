import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, BookOpen, ChevronRight, FileBadge2, Search, SlidersHorizontal, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { TeacherProgressResponse } from '@/features/teacher/types'
import { formatDateLabel, formatLabel, getStatusBadgeClassName } from '@/features/teacher/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

const emptyResponse: TeacherProgressResponse = {
  records: [],
  summary: {
    students: 0,
    learning_records: 0,
    in_progress: 0,
    completed: 0,
    average_progress_percent: 0,
  },
}

function progressBarClassName(progressPercent: number) {
  if (progressPercent >= 80) return 'bg-emerald-500'
  if (progressPercent >= 50) return 'bg-blue-500'
  if (progressPercent >= 25) return 'bg-amber-500'
  return 'bg-slate-400'
}

function finalExamLabel(finalExam: TeacherProgressResponse['records'][number]['final_exam']) {
  if (!finalExam) {
    return 'No final exam'
  }
  if (finalExam.passed) {
    return typeof finalExam.latest_score === 'number' ? `Passed · ${finalExam.latest_score}%` : 'Passed'
  }
  if (typeof finalExam.latest_score === 'number') {
    return `${finalExam.latest_score}% latest`
  }
  return 'No attempt yet'
}

export function TeacherProgressPage() {
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [courseFilter, setCourseFilter] = useState('All Courses')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [sortBy, setSortBy] = useState('Recently Updated')

  const progressQuery = useQuery({
    queryKey: ['teacher-progress'],
    queryFn: () => apiRequest<TeacherProgressResponse>('/teacher/progress'),
  })

  const data = progressQuery.data ?? emptyResponse
  const error =
    progressQuery.error instanceof Error ? progressQuery.error.message : progressQuery.isError ? 'Unable to load progress overview.' : null

  const courseOptions = useMemo(() => {
    const courses = Array.from(new Set(data.records.map((record) => record.course_title))).sort((left, right) =>
      left.localeCompare(right),
    )
    return ['All Courses', ...courses]
  }, [data.records])

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = data.records.filter((record) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          record.student_name,
          record.student_email,
          record.course_title,
          record.course_category,
          record.current_lesson_title ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesCourse = courseFilter === 'All Courses' || record.course_title === courseFilter
      const matchesStatus = statusFilter === 'All Statuses' || formatLabel(record.learning_status) === statusFilter

      return matchesQuery && matchesCourse && matchesStatus
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'Highest Progress') {
        return right.progress_percent - left.progress_percent
      }
      if (sortBy === 'Student A-Z') {
        return left.student_name.localeCompare(right.student_name)
      }
      return new Date(right.last_activity_at).getTime() - new Date(left.last_activity_at).getTime()
    })
  }, [courseFilter, data.records, searchQuery, sortBy, statusFilter])

  if (progressQuery.isLoading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[26px] border border-border bg-muted/20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teacher" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Progress</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Student progress</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Review only the learning records linked to your own courses, including lesson completion and final exam readiness.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-4 text-sm text-red-800 dark:text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Students</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.students}</p>
          <p className="mt-1 text-sm text-muted-foreground">Learners linked to your courses</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Learning records</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.learning_records}</p>
          <p className="mt-1 text-sm text-muted-foreground">Teacher-visible course progress rows</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">In progress</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.in_progress}</p>
          <p className="mt-1 text-sm text-muted-foreground">Records currently moving through lessons</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Average progress</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.average_progress_percent}%</p>
          <p className="mt-1 text-sm text-muted-foreground">Average completion across your course set</p>
        </div>
      </div>

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search progress"
            className="h-11 pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="h-11 px-4">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm px-6">
            <SheetHeader className="px-0">
              <SheetTitle>Filter progress</SheetTitle>
              <SheetDescription>Refine by course, status, or sort order.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {courseOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option>All Statuses</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Not Started</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option>Recently Updated</option>
                <option>Highest Progress</option>
                <option>Student A-Z</option>
              </select>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden gap-3 md:grid lg:grid-cols-[minmax(0,1fr)_240px_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search student, course, category, or lesson"
            className="h-11 pl-10"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {courseOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>All Statuses</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Not Started</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>Recently Updated</option>
          <option>Highest Progress</option>
          <option>Student A-Z</option>
        </select>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="overflow-hidden rounded-[30px] border border-border bg-background shadow-sm">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-4">Student</TableHead>
                  <TableHead className="px-4 py-4">Course</TableHead>
                  <TableHead className="px-4 py-4">Progress</TableHead>
                  <TableHead className="px-4 py-4">Lessons</TableHead>
                  <TableHead className="px-4 py-4">Exams</TableHead>
                  <TableHead className="px-6 py-4">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.learning_record_id}>
                    <TableCell className="px-6 py-4 align-top whitespace-normal">
                      <div className="space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">{record.student_name}</p>
                        <p className="text-sm text-muted-foreground">{record.student_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{record.course_title}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {formatLabel(record.course_category)}
                          </Badge>
                          <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(record.course_status))}>
                            {formatLabel(record.course_status)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(record.learning_status))}>
                            {formatLabel(record.learning_status)}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">{record.progress_percent}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full transition-all', progressBarClassName(record.progress_percent))}
                            style={{ width: `${Math.min(Math.max(record.progress_percent, 0), 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{record.current_lesson_title ? `Current: ${record.current_lesson_title}` : 'No lesson started yet'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{record.completed_lessons}/{record.total_lessons} completed</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            <BookOpen className="h-3.5 w-3.5" />
                            {record.in_progress_lessons} active
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            <Users className="h-3.5 w-3.5" />
                            {record.lesson_exam_passed_count} lesson exams passed
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="rounded-full">
                          <FileBadge2 className="h-3.5 w-3.5" />
                          {finalExamLabel(record.final_exam)}
                        </Badge>
                        {record.final_exam ? (
                          <p className="text-xs text-muted-foreground">{record.final_exam.attempt_count} final exam attempts</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-top text-muted-foreground">{formatDateLabel(record.last_activity_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y md:hidden">
            {filteredRecords.map((record) => (
              <div key={record.learning_record_id} className="space-y-3 px-5 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{record.student_name}</p>
                  <p className="text-sm text-muted-foreground">{record.student_email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(record.learning_status))}>
                    {formatLabel(record.learning_status)}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {record.progress_percent}%
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {record.completed_lessons}/{record.total_lessons} lessons
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{record.course_title}</p>
                  <p>{record.current_lesson_title ? `Current: ${record.current_lesson_title}` : 'No lesson started yet'}</p>
                  <p>{finalExamLabel(record.final_exam)}</p>
                  <p>Updated {formatDateLabel(record.last_activity_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="rounded-[28px] border border-dashed border-border/80 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">No progress records found</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Adjust the current search or filters, or wait until learners start progressing through your courses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
