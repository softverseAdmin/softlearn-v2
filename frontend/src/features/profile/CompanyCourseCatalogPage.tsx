import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Archive, BookOpen, ChevronRight, Clock3, Heart, Search, SlidersHorizontal, Star } from 'lucide-react'

import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseRecord, AdminCoursesResponse } from '../admin/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getCourseMediaOverrideForCourse } from './courseMediaStorage'
import { companyCoursePreviewFavoritesStorageKey } from './companyCoursePreviewState'

const emptyCoursesResponse: AdminCoursesResponse = {
  courses: [],
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

function getCourseMockMeta(course: AdminCourseRecord) {
  const rating = (4.2 + ((course.course_id % 7) * 0.1)).toFixed(1)
  const background = thumbnailBackgrounds[course.course_id % thumbnailBackgrounds.length]
  const sourceName = course.company_name?.trim() || course.created_by_name?.trim() || 'SoftLearn team'
  const sourceLabel = course.company_name?.trim() ? 'Course provider' : 'Course author'

  return {
    sourceName,
    sourceLabel,
    rating,
    background,
    initials: sourceName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2),
  }
}

function getCourseScore(course: AdminCourseRecord, favoriteCourseIds: number[]) {
  return course.lesson_count * 10 + course.estimated_hours + course.learning_record_count * 3 + (favoriteCourseIds.includes(course.course_id) ? 100 : 0)
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

type CompanyCourseCatalogPageProps = {
  favoritesOnly?: boolean
  retiredOnly?: boolean
}

function CompanyCourseCatalogPageContent({ favoritesOnly = false, retiredOnly = false }: CompanyCourseCatalogPageProps) {
  const navigate = useNavigate()
  const [data, setData] = useState<AdminCoursesResponse>(emptyCoursesResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [level, setLevel] = useState('All Levels')
  const [sortBy, setSortBy] = useState('Recommended')
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<number[]>([])

  useEffect(() => {
    const storedFavorites = localStorage.getItem(companyCoursePreviewFavoritesStorageKey)
    if (!storedFavorites) {
      return
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites) as number[]
      setFavoriteCourseIds(Array.isArray(parsedFavorites) ? parsedFavorites : [])
    } catch {
      setFavoriteCourseIds([])
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<AdminCoursesResponse>('/company/courses')
        if (active) {
          setData(response)
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load courses.')
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

  const visibleCourses = useMemo(
    () => data.courses.filter((course) => (retiredOnly ? course.status === 'inactive' : course.status !== 'inactive')),
    [data.courses, retiredOnly],
  )

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
      const matchesFavorites = !favoritesOnly || favoriteCourseIds.includes(course.course_id)
      const matchesQuery =
        !normalizedQuery ||
        [course.title, course.description, course.category, course.status]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesCategory = category === 'All Categories' || course.category === category
      const matchesLevel = level === 'All Levels' || formatDifficultyLabel(course.difficulty_level) === level

      return matchesFavorites && matchesQuery && matchesCategory && matchesLevel
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

      return getCourseScore(right, favoriteCourseIds) - getCourseScore(left, favoriteCourseIds)
    })
  }, [category, favoriteCourseIds, favoritesOnly, level, searchQuery, sortBy, visibleCourses])

  function toggleFavorite(courseId: number) {
    setFavoriteCourseIds((currentFavorites) => {
      const nextFavorites = currentFavorites.includes(courseId)
        ? currentFavorites.filter((currentId) => currentId !== courseId)
        : [...currentFavorites, courseId]

      localStorage.setItem(companyCoursePreviewFavoritesStorageKey, JSON.stringify(nextFavorites))
      return nextFavorites
    })
  }

  const pageTitle = retiredOnly ? 'Retired Courses' : favoritesOnly ? 'Saved Courses' : 'All Courses'
  const pageDescription = retiredOnly
    ? 'Review courses your company has retired. Retired courses stay out of the main course list but remain accessible here for reference and management.'
    : favoritesOnly
      ? 'Review the courses your team saved while exploring the learning experience and jump back into the ones you want to showcase.'
      : 'Review the full shared course catalog, then jump into dedicated pages to create courses, preview the learning flow, edit course details, and manage lessons.'
  const emptyStateTitle = retiredOnly ? 'No retired courses yet' : favoritesOnly ? 'No saved courses yet' : 'No courses found'
  const emptyStateDescription = retiredOnly
    ? 'Retired company courses will appear here.'
    : favoritesOnly
      ? 'Save courses with the heart button and they will appear here.'
      : 'Try changing your search or filters to see more courses.'
  const shortcutButtons = retiredOnly
    ? [{ label: 'Browse All Courses', href: '/company/courses', icon: BookOpen }, { label: 'Saved Courses', href: '/company/courses/saved', icon: Heart }]
    : favoritesOnly
      ? [{ label: 'Browse All Courses', href: '/company/courses', icon: BookOpen }, { label: 'Retired Courses', href: '/company/courses/retired', icon: Archive }]
      : [{ label: 'Saved Courses', href: '/company/courses/saved', icon: Heart }, { label: 'Retired Courses', href: '/company/courses/retired', icon: Archive }]

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/company/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        {favoritesOnly || retiredOnly ? (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{retiredOnly ? 'Retired' : 'Saved'}</span>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{pageTitle}</h1>
          <p className="text-base text-muted-foreground">{pageDescription}</p>
        </div>
        <Button
          type="button"
          className="rounded-none !text-white hover:!text-white [&_*]:!text-white"
          onClick={() => navigate('/company/courses/new')}
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

        {shortcutButtons.map((button) => {
          const Icon = button.icon
          const isSavedButton = button.href === '/company/courses/saved'

          return (
            <Button
              key={button.href}
              type="button"
              variant="outline"
              className="h-11 w-11 rounded-none px-0"
              onClick={() => navigate(button.href)}
              aria-label={button.label}
            >
              <Icon className={cn('h-4 w-4', isSavedButton && favoritesOnly && 'fill-current text-emerald-500')} />
            </Button>
          )
        })}
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

        {shortcutButtons.map((button) => {
          const Icon = button.icon
          const isSavedButton = button.href === '/company/courses/saved'

          return (
            <Button key={button.href} type="button" variant="outline" className="h-11 rounded-none px-4" onClick={() => navigate(button.href)}>
              <Icon className={cn('mr-2 h-4 w-4', isSavedButton && favoritesOnly && 'fill-current text-emerald-500')} />
              {button.label}
            </Button>
          )
        })}
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

      {loading ? (
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
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredCourses.map((course) => {
            const meta = getCourseMockMeta(course)
            const mediaOverride = getCourseMediaOverrideForCourse(course.course_id, course.title)
            const courseThumbnail = course.thumbnail_image || mediaOverride?.thumbnailImage || mediaOverride?.previewImage || ''
            const isFavorite = favoriteCourseIds.includes(course.course_id)

            return (
              <article key={course.course_id} className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-muted/20">
                <div className={cn('relative h-48 bg-gradient-to-br p-4 text-white', meta.background)}>
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
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="w-fit rounded-full bg-white/15 text-white hover:bg-white/15">
                        {formatCategoryLabel(course.category)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(course.course_id)}
                          aria-label={isFavorite ? 'Remove from saved courses' : 'Save course'}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
                        >
                          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current text-emerald-300')} />
                        </button>
                        <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(course.status))}>
                          {formatCategoryLabel(course.status)}
                        </Badge>
                      </div>
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
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {meta.rating}
                    </Badge>
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
                    {!course.can_edit ? (
                      <p className="w-full text-xs text-muted-foreground">
                        Shared courses stay previewable, but only courses created by your company can be edited.
                      </p>
                    ) : null}
                    <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/company/courses/${course.course_id}/preview`)}>
                      Preview
                    </Button>
                    {course.can_edit ? (
                      <>
                        <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/company/courses/${course.course_id}/edit`)}>
                          Edit
                        </Button>
                        <Button type="button" size="sm" onClick={() => navigate(`/company/courses/${course.course_id}/lessons`)}>
                          Lessons
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">{emptyStateTitle}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{emptyStateDescription}</p>
            {favoritesOnly ? (
              <Button type="button" className="mt-6" onClick={() => navigate('/company/courses')}>
                Browse all courses
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function CompanyCourseCatalogPage() {
  return <CompanyCourseCatalogPageContent />
}

export function CompanySavedCoursesPage() {
  return <CompanyCourseCatalogPageContent favoritesOnly />
}

export function CompanyRetiredCoursesPage() {
  return <CompanyCourseCatalogPageContent retiredOnly />
}
