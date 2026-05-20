import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Clock3, Search, SlidersHorizontal } from 'lucide-react'

import type { AdminCourseRecord } from '@/features/admin/types'
import type { TeacherCoursesResponse } from '@/features/teacher/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

const emptyCoursesResponse: TeacherCoursesResponse = {
  courses: [],
  summary: {
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
  },
}

const thumbnailBackgrounds = [
  'from-violet-600 via-indigo-600 to-blue-500',
  'from-cyan-500 via-sky-600 to-indigo-700',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-orange-400 via-amber-500 to-yellow-400',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-slate-700 via-slate-800 to-slate-900',
]

function formatCategoryLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatDifficultyLabel(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('beginner')) return 'Beginner'
  if (normalized.includes('intermediate')) return 'Intermediate'
  if (normalized.includes('advanced')) return 'Advanced'
  return value ? formatCategoryLabel(value) : 'General'
}

function getCourseDisplayMeta(course: AdminCourseRecord) {
  const background = thumbnailBackgrounds[course.course_id % thumbnailBackgrounds.length]
  const sourceName = course.company_name?.trim() || course.created_by_name?.trim() || 'SoftLearn team'
  const sourceLabel = course.company_name?.trim() ? 'Course provider' : 'Course author'

  return {
    sourceName,
    sourceLabel,
    background,
    initials: sourceName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2),
  }
}

function getCourseScore(course: AdminCourseRecord) {
  return course.lesson_count * 10 + course.estimated_hours + course.learning_record_count * 3
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case 'active':
      return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200'
    case 'inactive':
      return 'border-transparent bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
    default:
      return 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200'
  }
}

export function TeacherCoursesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [category, setCategory] = useState('All Categories')
  const [level, setLevel] = useState('All Levels')
  const [sortBy, setSortBy] = useState('Recommended')

  const coursesQuery = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => apiRequest<TeacherCoursesResponse>('/teacher/courses'),
  })

  const data = coursesQuery.data ?? emptyCoursesResponse
  const error =
    coursesQuery.error instanceof Error ? coursesQuery.error.message : coursesQuery.isError ? 'Unable to load courses.' : null

  const visibleCourses = useMemo(() => data.courses, [data.courses])

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        visibleCourses
          .map((course) => course.category.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort((left, right) => formatCategoryLabel(left).localeCompare(formatCategoryLabel(right)))

    return ['All Categories', ...categories]
  }, [visibleCourses])

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = visibleCourses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        [course.title, course.description, course.category, course.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesCategory = category === 'All Categories' || course.category === category
      const matchesLevel = level === 'All Levels' || formatDifficultyLabel(course.difficulty_level) === level

      return matchesQuery && matchesCategory && matchesLevel
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'A-Z') {
        return left.title.localeCompare(right.title)
      }

      if (sortBy === 'Newest') {
        return right.course_id - left.course_id
      }

      if (sortBy === 'Popular') {
        return right.lesson_count - left.lesson_count || right.learning_record_count - left.learning_record_count
      }

      return getCourseScore(right) - getCourseScore(left)
    })
  }, [category, level, searchQuery, sortBy, visibleCourses])

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teacher" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/teacher/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Courses</h1>
          <p className="text-base text-muted-foreground">Review and manage the courses created in your teacher workspace.</p>
        </div>
        <Button
          type="button"
          className="rounded-none !text-white hover:!text-white [&_*]:!text-white"
          onClick={() => navigate('/teacher/courses/new')}
        >
          Add course
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-4 text-sm text-red-800 dark:text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search course"
            className="h-11 rounded-none pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="h-11 rounded-none px-4">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm rounded-none px-6">
            <SheetHeader className="px-0">
              <SheetTitle>Filter courses</SheetTitle>
              <SheetDescription>Refine by category, level, or sorting.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Categories' ? option : formatCategoryLabel(option)}
                  </option>
                ))}
              </select>

              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Recommended</option>
                  <option>Newest</option>
                  <option>Popular</option>
                  <option>A-Z</option>
                </select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden flex-wrap gap-4 md:flex md:items-center">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search course"
            className="h-11 rounded-none pl-10"
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 min-w-[220px] rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Categories' ? option : formatCategoryLabel(option)}
            </option>
          ))}
        </select>

        <select
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          className="h-11 min-w-[180px] rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>All Levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <div className="flex h-11 min-w-[220px] items-center gap-2 rounded-none border border-input bg-background px-4">
          <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
          >
            <option>Recommended</option>
            <option>Newest</option>
            <option>Popular</option>
            <option>A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryOptions.map((option) => {
          const isActive = category === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                'flex-none whitespace-nowrap border px-4 py-2 text-center text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary',
              )}
            >
              {option === 'All Categories' ? option : formatCategoryLabel(option)}
            </button>
          )
        })}
      </div>

      {coursesQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-muted/20">
              <div className="h-48 animate-pulse bg-muted" />
              <div className="space-y-4 p-4">
                <div className="h-4 w-2/3 animate-pulse bg-muted" />
                <div className="h-[4.5rem] animate-pulse bg-muted" />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-24 animate-pulse bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredCourses.map((course) => {
              const meta = getCourseDisplayMeta(course)
              const courseThumbnail = course.thumbnail_image || ''

              return (
                <article key={course.course_id} className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-muted/20">
                  <div className={cn('relative h-48 bg-gradient-to-br p-4 text-white', meta.background)}>
                    {courseThumbnail ? (
                      <>
                        <img
                          src={courseThumbnail}
                          alt={course.thumbnail_alt_text || `${course.title} thumbnail`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                      </>
                    ) : null}
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="w-fit rounded-full bg-white/15 text-white hover:bg-white/15">
                          {formatCategoryLabel(course.category)}
                        </Badge>
                        <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(course.status))}>
                          {formatCategoryLabel(course.status)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-white/80">{course.lesson_count} lessons</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="block text-sm font-semibold text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{formatCategoryLabel(course.category)}</p>
                      </div>
                    </div>

                    <p
                      className="mt-3 h-[4.5rem] overflow-hidden text-sm leading-6 text-muted-foreground"
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                      }}
                    >
                      {course.description || 'Build practical skills with guided lessons and structured student progress.'}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarFallback>{meta.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{meta.sourceName}</p>
                        <p className="text-xs text-muted-foreground">{meta.sourceLabel}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto">
                      <Badge variant="secondary" className="flex-none rounded-full whitespace-nowrap">
                        <Clock3 className="h-3.5 w-3.5" />
                        {course.estimated_hours || 0} hrs
                      </Badge>
                      <Badge variant="secondary" className="flex-none rounded-full whitespace-nowrap">
                        {formatDifficultyLabel(course.difficulty_level)}
                      </Badge>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">{course.learning_record_count} student learning records</div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/teacher/courses/${course.course_id}/edit`)}>
                        Edit
                      </Button>
                      <Button type="button" size="sm" onClick={() => navigate(`/teacher/courses/${course.course_id}/lessons`)}>
                        Lessons
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/teacher/courses/${course.course_id}/preview`)}>
                        Preview
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">No courses found</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Create your first teacher course to start building lessons.</p>
            <Button type="button" className="mt-6" onClick={() => navigate('/teacher/courses/new')}>
              Add course
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
