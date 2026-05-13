import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BookText,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Filter,
  GraduationCap,
  Layers3,
  MonitorPlay,
  Palette,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { CourseCatalogRecord, CourseCatalogResponse } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const emptyCatalog: CourseCatalogResponse = {
  result_count: 0,
  courses: [],
}

const PAGE_SIZE = 8

const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'title', label: 'A-Z' },
  { value: 'duration-high', label: 'Duration: High to low' },
  { value: 'duration-low', label: 'Duration: Low to high' },
  { value: 'progress', label: 'Progress' },
] as const

type SortValue = (typeof sortOptions)[number]['value']
type AvailabilityValue = 'enrolled' | 'available'

type CourseTheme = {
  matchers: string[]
  icon: ComponentType<{ className?: string }>
  background: string
  accent: string
}

const courseThemes: CourseTheme[] = [
  {
    matchers: ['programming', 'development', 'software', 'react', 'node', 'python', 'code'],
    icon: Code2,
    background:
      'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 dark:from-violet-700 dark:via-indigo-700 dark:to-blue-600',
    accent: 'text-violet-100',
  },
  {
    matchers: ['data', 'analytics', 'excel', 'science'],
    icon: Layers3,
    background:
      'bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-700 dark:from-cyan-700 dark:via-sky-700 dark:to-indigo-800',
    accent: 'text-cyan-50',
  },
  {
    matchers: ['design', 'ui', 'ux'],
    icon: Palette,
    background:
      'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 dark:from-fuchsia-700 dark:via-pink-700 dark:to-rose-700',
    accent: 'text-pink-50',
  },
  {
    matchers: ['marketing', 'brand'],
    icon: Sparkles,
    background:
      'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 dark:from-orange-600 dark:via-amber-600 dark:to-yellow-500',
    accent: 'text-amber-950 dark:text-amber-50',
  },
  {
    matchers: ['business', 'management'],
    icon: BriefcaseBusiness,
    background:
      'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700',
    accent: 'text-emerald-50',
  },
]

const fallbackThemes: Omit<CourseTheme, 'matchers'>[] = [
  {
    icon: MonitorPlay,
    background:
      'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700',
    accent: 'text-slate-100',
  },
  {
    icon: BookText,
    background:
      'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 dark:from-emerald-700 dark:via-green-700 dark:to-teal-700',
    accent: 'text-emerald-50',
  },
  {
    icon: GraduationCap,
    background:
      'bg-gradient-to-br from-rose-400 via-pink-500 to-violet-500 dark:from-rose-600 dark:via-pink-700 dark:to-violet-700',
    accent: 'text-pink-50',
  },
]

function normalizeLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function normalizeDifficulty(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('beginner')) return 'Beginner'
  if (normalized.includes('advanced')) return 'Advanced'
  if (normalized.includes('intermediate')) return 'Intermediate'
  return value ? normalizeLabel(value) : 'General'
}

function getCourseTheme(course: CourseCatalogRecord, index: number) {
  const searchableValue = `${course.category} ${course.title}`.toLowerCase()
  const matchedTheme = courseThemes.find((theme) => theme.matchers.some((matcher) => searchableValue.includes(matcher)))
  if (matchedTheme) {
    return matchedTheme
  }
  return fallbackThemes[index % fallbackThemes.length]
}

function getCourseBadge(course: CourseCatalogRecord, index: number) {
  if (course.is_enrolled) {
    return {
      label: 'Enrolled',
      className:
        'border-transparent bg-white/20 text-white backdrop-blur-sm dark:bg-white/15 dark:text-white',
    }
  }
  if ((course.progress_percent ?? 0) > 0) {
    return {
      label: 'Continue',
      className:
        'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-100',
    }
  }
  if (index === 0) {
    return {
      label: 'Bestseller',
      className:
        'border-transparent bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100',
    }
  }
  if (course.readiness_cues.length >= 3) {
    return {
      label: 'Recommended',
      className:
        'border-transparent bg-sky-100 text-sky-900 dark:bg-sky-900/80 dark:text-sky-100',
    }
  }
  return null
}

function getCourseHighlightLabel(course: CourseCatalogRecord) {
  if (course.progress_percent !== null && course.progress_percent > 0) {
    return `${course.progress_percent}% complete`
  }
  if (course.readiness_cues.length > 0) {
    return `${course.readiness_cues.length} cues`
  }
  return course.status ? normalizeLabel(course.status) : 'Ready to start'
}

function getCoursePopularity(course: CourseCatalogRecord) {
  return course.readiness_cues.length * 3 + (course.progress_percent ?? 0) + (course.is_enrolled ? 30 : 0)
}

export function StudentCourseCatalogPage() {
  const [data, setData] = useState<CourseCatalogResponse>(emptyCatalog)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityValue[]>([])
  const [activeCategoryPill, setActiveCategoryPill] = useState('All Courses')
  const [sortBy, setSortBy] = useState<SortValue>('popular')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)

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

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data.courses.forEach((course) => {
      counts.set(course.category, (counts.get(course.category) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
  }, [data.courses])

  const levelCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data.courses.forEach((course) => {
      const level = normalizeDifficulty(course.difficulty_level)
      counts.set(level, (counts.get(level) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
  }, [data.courses])

  const durationLimit = useMemo(() => {
    const maximumHours = data.courses.reduce((currentMaximum, course) => {
      return Math.max(currentMaximum, course.estimated_hours || 0)
    }, 0)
    const roundedMaximum = Math.ceil(Math.max(maximumHours, 20) / 10) * 10
    return roundedMaximum
  }, [data.courses])

  const [maxDuration, setMaxDuration] = useState(60)

  useEffect(() => {
    setMaxDuration(durationLimit)
  }, [durationLimit])

  const enrolledCount = useMemo(() => data.courses.filter((course) => course.is_enrolled).length, [data.courses])

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = data.courses.filter((course) => {
      const matchesQuery =
        !query ||
        [course.title, course.description, course.category, ...course.readiness_cues]
          .join(' ')
          .toLowerCase()
          .includes(query)

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(course.category)

      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(normalizeDifficulty(course.difficulty_level))

      const availability: AvailabilityValue = course.is_enrolled ? 'enrolled' : 'available'
      const matchesAvailability =
        selectedAvailability.length === 0 || selectedAvailability.includes(availability)

      const hours = course.estimated_hours || 0
      const matchesDuration = hours <= maxDuration

      return matchesQuery && matchesCategory && matchesLevel && matchesAvailability && matchesDuration
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'title') {
        return left.title.localeCompare(right.title)
      }
      if (sortBy === 'duration-high') {
        return (right.estimated_hours || 0) - (left.estimated_hours || 0)
      }
      if (sortBy === 'duration-low') {
        return (left.estimated_hours || 0) - (right.estimated_hours || 0)
      }
      if (sortBy === 'progress') {
        return (right.progress_percent ?? 0) - (left.progress_percent ?? 0)
      }
      return getCoursePopularity(right) - getCoursePopularity(left)
    })
  }, [data.courses, maxDuration, searchQuery, selectedAvailability, selectedCategories, selectedLevels, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredCourses.length, maxDuration, searchQuery, selectedAvailability, selectedCategories, selectedLevels, sortBy])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredCourses.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, filteredCourses])

  const visibleCategoryFilters = showAllCategories ? categoryCounts : categoryCounts.slice(0, 5)

  function toggleCategory(category: string) {
    setSelectedCategories((currentValues) => {
      const nextValues = currentValues.includes(category)
        ? currentValues.filter((value) => value !== category)
        : [...currentValues, category]

      if (nextValues.length === 1) {
        setActiveCategoryPill(nextValues[0])
      } else if (nextValues.length === 0) {
        setActiveCategoryPill('All Courses')
      } else {
        setActiveCategoryPill('All Courses')
      }

      return nextValues
    })
  }

  function toggleLevel(level: string) {
    setSelectedLevels((currentValues) =>
      currentValues.includes(level)
        ? currentValues.filter((value) => value !== level)
        : [...currentValues, level]
    )
  }

  function toggleAvailability(value: AvailabilityValue) {
    setSelectedAvailability((currentValues) =>
      currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value]
    )
  }

  function clearAllFilters() {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedLevels([])
    setSelectedAvailability([])
    setActiveCategoryPill('All Courses')
    setSortBy('popular')
    setMaxDuration(durationLimit)
  }

  function handleCategoryPillClick(category: string) {
    setActiveCategoryPill(category)
    if (category === 'All Courses') {
      setSelectedCategories([])
      return
    }
    setSelectedCategories([category])
  }

  const categoryPills = ['All Courses', ...categoryCounts.slice(0, 7).map(([category]) => category)]
  const pageStart = filteredCourses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredCourses.length)
  const activeFiltersCount =
    selectedCategories.length +
    selectedLevels.length +
    selectedAvailability.length +
    (searchQuery.trim() ? 1 : 0)
  const featuredCategory = categoryCounts[0]?.[0] ?? 'All topics'

  return (
    <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Courses</span>
      </div>

      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#f5f3ff_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <Sparkles className="h-4 w-4" />
              Course discovery
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Course Catalog</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Explore roadmap-style learning paths and premium lesson flows in a catalog that is closer to the uploaded course screens.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search courses..."
                  className="h-11 rounded-2xl border-border bg-white pl-10 pr-4 shadow-sm"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-2xl border-primary/15 bg-white text-primary hover:bg-primary/5 lg:hidden"
                onClick={() => setShowFilters((currentValue) => !currentValue)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>

              <label className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
                <span className="text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortValue)}
                  className="bg-transparent font-medium text-foreground outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Courses</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{data.result_count}</p>
              <p className="mt-1 text-sm text-slate-500">Available in the catalog</p>
            </div>
            <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Enrolled</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{enrolledCount}</p>
              <p className="mt-1 text-sm text-slate-500">Active courses in your workspace</p>
            </div>
            <div className="rounded-[28px] border border-white bg-white/95 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Featured topic</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{featuredCategory}</p>
              <p className="mt-1 text-sm text-slate-500">{activeFiltersCount} active filters</p>
            </div>
          </div>
        </div>
      </section>

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

      <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
        {categoryPills.map((category) => {
          const isActive = activeCategoryPill === category
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryPillClick(category)}
              className={cn(
                'rounded-2xl border px-5 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'border-primary bg-primary/8 text-primary shadow-sm'
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'
              )}
            >
              {category}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit rounded-3xl border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="h-10 animate-pulse rounded-2xl bg-muted" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <Card key={index} className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
                <div className="h-34 animate-pulse bg-muted" />
                <CardContent className="space-y-4 p-5">
                  <div className="h-5 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
                  <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                  <div className="h-10 animate-pulse rounded-2xl bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card
            className={cn(
              'h-fit rounded-3xl border-border/70 bg-card/80 shadow-sm lg:sticky lg:top-24',
              !showFilters && 'hidden lg:block'
            )}
          >
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">Filters</h2>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Category</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {visibleCategoryFilters.map(([category, count]) => (
                    <label key={category} className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="h-4 w-4 rounded border-border text-primary accent-primary"
                        />
                        <span className="text-sm text-foreground">{category}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </label>
                  ))}

                  {categoryCounts.length > 5 ? (
                    <button
                      type="button"
                      onClick={() => setShowAllCategories((currentValue) => !currentValue)}
                      className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {showAllCategories ? 'Show less' : 'Show more'}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 border-t border-border/70 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Level</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {levelCounts.map(([level, count]) => (
                    <label key={level} className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={() => toggleLevel(level)}
                          className="h-4 w-4 rounded border-border text-primary accent-primary"
                        />
                        <span className="text-sm text-foreground">{level}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-border/70 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Availability</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes('available')}
                        onChange={() => toggleAvailability('available')}
                        className="h-4 w-4 rounded border-border text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground">Available</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{data.result_count - enrolledCount}</span>
                  </label>
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes('enrolled')}
                        onChange={() => toggleAvailability('enrolled')}
                        className="h-4 w-4 rounded border-border text-primary accent-primary"
                      />
                      <span className="text-sm text-foreground">Enrolled</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{enrolledCount}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/70 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Duration</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={durationLimit}
                    value={maxDuration}
                    onChange={(event) => setMaxDuration(Number(event.target.value))}
                    className="h-2 w-full cursor-pointer accent-primary"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0 hrs</span>
                    <span>{durationLimit}+ hrs</span>
                  </div>
                  <p className="text-sm text-foreground">Up to {maxDuration} hrs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {filteredCourses.length === 0 ? (
              <Card className="rounded-3xl border-border/70 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">No courses match your filters</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Try widening your search or clearing one of the catalog filters to see more courses.
                  </p>
                  <Button type="button" variant="outline" className="mt-6 rounded-2xl" onClick={clearAllFilters}>
                    Reset filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <motion.div
                  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {paginatedCourses.map((course, index) => {
                    const theme = getCourseTheme(course, index)
                    const badge = getCourseBadge(course, index)
                    const Icon = theme.icon

                    return (
                      <motion.div key={course.course_id} variants={itemVariants}>
                        <Card className="group h-full overflow-hidden rounded-3xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                          <div className={cn('relative h-34 overflow-hidden px-4 py-4', theme.background)}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_35%)]" />
                            <div className="relative flex items-start justify-between gap-4">
                              {badge ? <Badge className={badge.className}>{badge.label}</Badge> : <span />}
                              <div className="rounded-2xl border border-white/30 bg-white/10 p-2 text-white backdrop-blur-sm">
                                <BookOpen className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="relative mt-6 flex h-full items-center justify-center pb-3">
                              <Icon className={cn('h-16 w-16 drop-shadow-sm', theme.accent)} />
                            </div>
                          </div>

                          <CardContent className="flex flex-1 flex-col p-5">
                            <div className="space-y-2">
                              <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{course.title}</h3>
                              <p className="text-sm text-muted-foreground">{course.category}</p>
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {course.description || 'Build practical skills with guided lessons and trackable progress.'}
                              </p>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="rounded-full px-2.5">
                                {normalizeDifficulty(course.difficulty_level)}
                              </Badge>
                              {course.lesson_count > 0 ? (
                                <Badge variant="outline" className="rounded-full px-2.5">
                                  {course.lesson_count} lessons
                                </Badge>
                              ) : null}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4" />
                                <span>{course.estimated_hours || 0} hrs</span>
                              </div>
                              <div className="flex min-w-0 items-center gap-1.5">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="truncate">{getCourseHighlightLabel(course)}</span>
                              </div>
                            </div>

                            {course.progress_percent !== null && course.progress_percent > 0 ? (
                              <div className="mt-5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                  <span>Progress</span>
                                  <span>{course.progress_percent}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400"
                                    style={{ width: `${course.progress_percent}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="mt-5 flex min-h-10 flex-wrap items-start gap-2">
                                {course.readiness_cues.slice(0, 2).map((cue) => (
                                  <Badge
                                    key={cue}
                                    variant="secondary"
                                    className="h-auto max-w-full rounded-full px-2.5 py-1 text-[11px] leading-4"
                                  >
                                    <span className="line-clamp-2">{cue}</span>
                                  </Badge>
                                ))}
                                {course.readiness_cues.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Start this course when you are ready.</p>
                                ) : null}
                              </div>
                            )}

                            <div className="mt-auto border-t border-border/70 pt-5">
                              <div className="flex flex-col gap-3">
                                <div className="min-w-0">
                                  <p
                                    className={cn(
                                      'text-lg font-semibold',
                                      course.is_enrolled ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400'
                                    )}
                                  >
                                    {course.is_enrolled ? 'Continue learning' : 'Open details'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {course.next_step_label || 'View course'}
                                  </p>
                                </div>
                                <Button asChild className="w-full rounded-2xl px-4 shadow-sm">
                                  <Link to={course.next_step_href}>
                                    <span className="truncate">{course.next_step_label}</span>
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>

                <div className="flex flex-col gap-4 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }).map((_, pageIndex) => {
                      const pageNumber = pageIndex + 1
                      const isActive = pageNumber === currentPage
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={cn(
                            'h-10 min-w-10 rounded-xl border px-3 text-sm font-medium transition-colors',
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'
                          )}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Showing {pageStart} to {pageEnd} of {filteredCourses.length} courses
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
