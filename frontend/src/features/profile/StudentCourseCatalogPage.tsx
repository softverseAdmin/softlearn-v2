import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, ChevronRight, Clock3, Heart, Search, SlidersHorizontal, Star, Users } from 'lucide-react'

import { ApiError, apiRequest } from '../../lib/api'
import type { CourseCatalogRecord, CourseCatalogResponse } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { cn } from '@/lib/utils'
import { getCourseMediaOverrideForCourse } from './courseMediaStorage'

const emptyCatalog: CourseCatalogResponse = {
  result_count: 0,
  courses: [],
}

const favoriteStorageKey = 'student-course-favorites'
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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function getCourseCardMeta(course: CourseCatalogRecord) {
  const companyName = course.company_name?.trim()
  const creatorName = course.created_by_name?.trim()
  const sourceName = companyName || creatorName || 'SoftLearn team'
  const background = thumbnailBackgrounds[course.course_id % thumbnailBackgrounds.length]

  return {
    sourceName,
    background,
    sourceLabel:
      companyName && creatorName
        ? `Created by ${creatorName}`
        : companyName
          ? 'Course provider'
          : creatorName
            ? 'Course author'
            : 'Published by SoftLearn',
    sourceImage: course.company_profile_image?.trim() || null,
    learnerCount: course.learning_record_count ?? 0,
    initials: sourceName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2),
  }
}

function getCourseRecommendationScore(course: CourseCatalogRecord, favoriteCourseIds: number[]) {
  return (
    (favoriteCourseIds.includes(course.course_id) ? 100 : 0) +
    (course.enrollment_status === 'completed' ? 80 : 0) +
    (course.enrollment_status === 'in_progress' ? 40 : 0) +
    (course.progress_percent ?? 0) +
    course.readiness_cues.length * 5 +
    (course.is_enrolled ? 20 : 0)
  )
}

type StudentCourseCatalogPageProps = {
  favoritesOnly?: boolean
  completedOnly?: boolean
}

function StudentCourseCatalogPageContent({ favoritesOnly = false, completedOnly = false }: StudentCourseCatalogPageProps) {
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState<CourseCatalogResponse>(emptyCatalog)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [category, setCategory] = useState('All Categories')
  const [level, setLevel] = useState('All Levels')
  const [sortBy, setSortBy] = useState('Recommended')
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<number[]>([])

  useEffect(() => {
    const storedFavorites = localStorage.getItem(favoriteStorageKey)
    if (!storedFavorites) {
      return
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites) as unknown
      setFavoriteCourseIds(
        Array.isArray(parsedFavorites)
          ? parsedFavorites
              .map((value) => Number(value))
              .filter((value) => Number.isInteger(value) && value > 0)
          : []
      )
    } catch {
      setFavoriteCourseIds([])
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<CourseCatalogResponse>('/student/courses')
        if (active) {
          setCatalog(response)
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

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        catalog.courses
          .map((course) => course.category.trim())
          .filter((value) => value.length > 0)
      )
    ).sort((left, right) => formatCategoryLabel(left).localeCompare(formatCategoryLabel(right)))

    return ['All Categories', ...categories]
  }, [catalog.courses])

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = catalog.courses.filter((course) => {
      const matchesFavorites = !favoritesOnly || favoriteCourseIds.includes(course.course_id)
      const matchesCompleted = !completedOnly || course.enrollment_status === 'completed'
      const matchesQuery =
        !normalizedQuery ||
        [course.title, course.description, course.category]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesCategory = category === 'All Categories' || course.category === category
      const matchesLevel = level === 'All Levels' || formatDifficultyLabel(course.difficulty_level) === level

      return matchesFavorites && matchesCompleted && matchesQuery && matchesCategory && matchesLevel
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'A-Z') {
        return left.title.localeCompare(right.title)
      }

      if (sortBy === 'Newest') {
        return right.course_id - left.course_id
      }

      if (sortBy === 'Popular') {
        return (
          (right.learning_record_count ?? 0) - (left.learning_record_count ?? 0) ||
          right.lesson_count - left.lesson_count ||
          (right.estimated_hours || 0) - (left.estimated_hours || 0)
        )
      }

      return getCourseRecommendationScore(right, favoriteCourseIds) - getCourseRecommendationScore(left, favoriteCourseIds)
    })
  }, [catalog.courses, category, completedOnly, favoriteCourseIds, favoritesOnly, level, searchQuery, sortBy])

  function toggleFavorite(courseId: number) {
    setFavoriteCourseIds((currentFavorites) => {
      const nextFavorites = currentFavorites.includes(courseId)
        ? currentFavorites.filter((currentId) => currentId !== courseId)
        : [...currentFavorites, courseId]

      localStorage.setItem(favoriteStorageKey, JSON.stringify(nextFavorites))
      return nextFavorites
    })
  }

  const pageTitle = favoritesOnly ? 'Wishlisted Courses' : completedOnly ? 'Completed Courses' : 'All Courses'
  const pageDescription = favoritesOnly
    ? 'Review the courses you saved to your wishlist and jump back into the ones you want to learn next.'
    : completedOnly
      ? 'Browse the courses you have already finished and revisit the skills you completed.'
      : 'Explore and enroll in courses to learn new skills and advance your career'
  const emptyStateTitle = favoritesOnly ? 'No wishlisted courses yet' : completedOnly ? 'No completed courses yet' : 'No courses found'
  const emptyStateDescription = favoritesOnly
    ? 'Save courses with the heart button and they will appear here.'
    : completedOnly
      ? 'Complete a course to see it listed here.'
      : 'Try changing your search or filters to see more courses.'
  const wishlistButtonLabel = favoritesOnly ? 'Browse All Courses' : 'Wishlisted Courses'
  const wishlistButtonHref = favoritesOnly ? '/student/courses' : '/student/courses/wishlist'
  const completedButtonLabel = completedOnly ? 'Browse All Courses' : 'Completed Courses'
  const completedButtonHref = completedOnly ? '/student/courses' : '/student/courses/completed'

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/student/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        {favoritesOnly || completedOnly ? (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{favoritesOnly ? 'Wishlist' : 'Completed'}</span>
          </>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{pageTitle}</h1>
      <p className="text-base text-muted-foreground">{pageDescription}</p>

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

        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 rounded-none px-0"
          onClick={() => navigate(wishlistButtonHref)}
          aria-label={wishlistButtonLabel}
        >
          <Heart className={cn('h-4 w-4', favoritesOnly && 'fill-current text-emerald-500')} />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 rounded-none px-0"
          onClick={() => navigate(completedButtonHref)}
          aria-label={completedButtonLabel}
        >
          <CheckCircle2 className={cn('h-4 w-4', completedOnly && 'fill-current text-emerald-500')} />
        </Button>
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

        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-none px-4"
          onClick={() => navigate(wishlistButtonHref)}
        >
          <Heart className={cn('mr-2 h-4 w-4', favoritesOnly && 'fill-current text-emerald-500')} />
          {wishlistButtonLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-none px-4"
          onClick={() => navigate(completedButtonHref)}
        >
          <CheckCircle2 className={cn('mr-2 h-4 w-4', completedOnly && 'fill-current text-emerald-500')} />
          {completedButtonLabel}
        </Button>
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
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'
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
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">Unable to load courses</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredCourses.map((course) => {
            const meta = getCourseCardMeta(course)
            const isFavorite = favoriteCourseIds.includes(course.course_id)
            const mediaOverride = getCourseMediaOverrideForCourse(course.course_id, course.title)
            const courseThumbnail = course.thumbnail_image || mediaOverride?.thumbnailImage || mediaOverride?.previewImage || ''
            const isCompleted = course.enrollment_status === 'completed'
            const isInProgress = course.enrollment_status === 'in_progress'
            const progressLabel = isCompleted
              ? 'Completed'
              : typeof course.progress_percent === 'number' && course.progress_percent > 0
                ? `${course.progress_percent}% complete`
                : course.is_enrolled
                  ? 'Enrolled'
                  : 'Not started'

            return (
              <article
                key={course.course_id}
                className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-muted/20"
              >
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
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="w-fit rounded-full bg-white/15 text-white hover:bg-white/15">
                          {formatCategoryLabel(course.category)}
                        </Badge>
                        {isCompleted ? (
                          <Badge className="rounded-full border-transparent bg-emerald-500 text-white hover:bg-emerald-500">
                            Completed
                          </Badge>
                        ) : isInProgress ? (
                          <Badge className="rounded-full border-transparent bg-blue-600 text-white hover:bg-blue-600">
                            In progress
                          </Badge>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          toggleFavorite(course.course_id)
                        }}
                        className={cn(
                          'inline-flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-white/30 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/30',
                          isFavorite && 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        )}
                        aria-label={isFavorite ? 'Remove from favorite courses' : 'Add to favorite courses'}
                      >
                        <Heart className={cn('h-5 w-5', isFavorite && 'fill-current text-emerald-300')} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-white/80">
                        {course.lesson_count} lessons
                        {course.is_enrolled ? ` · ${progressLabel}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link to={course.next_step_href} className="block text-sm font-semibold text-foreground hover:text-primary">
                        {course.title}
                      </Link>
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
                    {course.description || 'Build practical skills with guided lessons and structured progress.'}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <Avatar size="default">
                      {meta.sourceImage ? <AvatarImage src={meta.sourceImage} alt={meta.sourceName} /> : null}
                      <AvatarFallback>{meta.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{meta.sourceName}</p>
                      <p className="text-xs text-muted-foreground">{meta.sourceLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto">
                    <Badge variant="secondary" className="flex-none rounded-full whitespace-nowrap">
                      <Star className={cn('h-3.5 w-3.5', course.rating_count > 0 && 'fill-amber-400 text-amber-400')} />
                      {course.average_rating !== null && course.rating_count > 0
                        ? `${course.average_rating.toFixed(1)} · ${formatCompactNumber(course.rating_count)} ratings`
                        : 'No ratings yet'}
                    </Badge>
                    <Badge variant="secondary" className="flex-none rounded-full whitespace-nowrap">
                      <Users className="h-3.5 w-3.5" />
                      {formatCompactNumber(meta.learnerCount)} {meta.learnerCount === 1 ? 'learner' : 'learners'}
                    </Badge>
                    <Badge variant="secondary" className="flex-none rounded-full whitespace-nowrap">
                      <Clock3 className="h-3.5 w-3.5" />
                      {course.estimated_hours || 0} hrs
                    </Badge>
                    <Badge variant="secondary" className="flex-none rounded-full whitespace-nowrap">
                      {formatDifficultyLabel(course.difficulty_level)}
                    </Badge>
                    {course.is_enrolled ? (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'flex-none rounded-full whitespace-nowrap',
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : isInProgress
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                              : ''
                        )}
                      >
                        {progressLabel}
                      </Badge>
                    ) : null}
                  </div>
                </div>

              </article>
            )
          })}
        </div>
      ) : (
        <div className="border border-border bg-background px-6 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">{emptyStateTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{emptyStateDescription}</p>
        </div>
      )}

    </div>
  )
}

export function StudentCourseCatalogPage() {
  return <StudentCourseCatalogPageContent />
}

export function StudentWishlistedCoursesPage() {
  return <StudentCourseCatalogPageContent favoritesOnly />
}

export function StudentCompletedCoursesPage() {
  return <StudentCourseCatalogPageContent completedOnly />
}
