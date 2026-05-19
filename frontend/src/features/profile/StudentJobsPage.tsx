import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  MoreVertical,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import { useAuth } from '../../auth/useAuth'
import { apiRequest } from '../../lib/api'
import type { StudentApplicationRecord, StudentJobsResponse, VacancyRecord } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { cn } from '@/lib/utils'

const emptyJobsResponse: StudentJobsResponse = {
  vacancies: [],
  query: '',
  filters: {
    skills: [],
    languages: [],
    locations: [],
    work_styles: [],
  },
  result_count: 0,
  bookmark_count: 0,
  available_skills: [],
  available_languages: [],
  available_locations: [],
  available_work_styles: [],
}

function formatSalary(minSalary: number | null, maxSalary: number | null) {
  if (minSalary === null && maxSalary === null) {
    return 'Salary shared after screening'
  }

  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  })

  if (minSalary !== null && maxSalary !== null) {
    return `${formatter.format(minSalary)} - ${formatter.format(maxSalary)} JPY`
  }

  if (minSalary !== null) {
    return `From ${formatter.format(minSalary)} JPY`
  }

  return `Up to ${formatter.format(maxSalary ?? 0)} JPY`
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getCompanyInitials(companyName: string) {
  return companyName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatRelativeDate(value: string) {
  const now = new Date()
  const date = new Date(value)
  const diffInHours = Math.max(1, Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60)))

  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.round(diffInHours / 24)
  return `${diffInDays}d ago`
}

function formatSkillsSummary(vacancy: VacancyRecord) {
  return vacancy.skill_requirements.map((requirement) => requirement.skill_name).join(', ')
}

export function StudentJobsPage() {
  return <StudentJobsWorkspace />
}

export function StudentSavedJobsPage() {
  return <StudentJobsWorkspace savedOnly />
}

function StudentJobsWorkspace({ savedOnly = false }: { savedOnly?: boolean }) {
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const queryClient = useQueryClient()
  const togglePagePath = savedOnly ? '/student/jobs' : '/student/jobs/saved'
  const togglePageLabel = savedOnly ? 'All jobs' : 'Saved jobs'
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [skill, setSkill] = useState('All Skills')
  const [language, setLanguage] = useState('All Languages')
  const [location, setLocation] = useState('All Locations')
  const [workStyle, setWorkStyle] = useState('All Work Styles')
  const [sortBy, setSortBy] = useState('Newest')
  const [page, setPage] = useState(1)
  const [bookmarkingVacancyId, setBookmarkingVacancyId] = useState<number | null>(null)
  const [applyingVacancyId, setApplyingVacancyId] = useState<number | null>(null)

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: '5',
      sort:
        sortBy === 'Company A-Z'
          ? 'company_az'
          : sortBy === 'Title A-Z'
            ? 'title_az'
            : sortBy === 'Compensation'
              ? 'compensation'
              : 'newest',
    })
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (skill !== 'All Skills') params.set('skills', skill)
    if (language !== 'All Languages') params.set('languages', language)
    if (location !== 'All Locations') params.set('locations', location)
    if (workStyle !== 'All Work Styles') params.set('work_styles', workStyle)
    if (savedOnly) params.set('bookmarked', 'true')
    return params.toString()
  }, [language, location, page, savedOnly, searchQuery, skill, sortBy, workStyle])

  const jobsQuery = useQuery({
    queryKey: ['student-jobs', savedOnly, queryParams],
    queryFn: () => apiRequest<StudentJobsResponse>(`/student/jobs?${queryParams}`),
  })
  const jobs = jobsQuery.data ?? emptyJobsResponse
  const loading = jobsQuery.isLoading
  const error =
    jobsQuery.error instanceof Error ? jobsQuery.error.message : jobsQuery.isError ? 'Unable to load jobs.' : null

  useEffect(() => {
    setPage(1)
  }, [searchQuery, skill, language, location, workStyle, sortBy, savedOnly])

  const skillOptions = useMemo(() => {
    if (!savedOnly) {
      return ['All Skills', ...jobs.available_skills.map((option) => option.slug)]
    }

    const savedSkillSlugs = Array.from(
      new Set(
        jobs.vacancies
          .filter((vacancy) => vacancy.is_bookmarked)
          .flatMap((vacancy) => vacancy.skill_requirements.map((requirement) => requirement.skill_slug))
      )
    )

    return ['All Skills', ...savedSkillSlugs]
  }, [jobs.available_skills, jobs.vacancies, savedOnly])

  const quickSkillOptions = useMemo(() => ['All Skills', ...skillOptions.slice(1, 9)], [skillOptions])

  const languageOptions = useMemo(
    () => ['All Languages', ...jobs.available_languages.map((option) => option.value)],
    [jobs.available_languages]
  )

  const locationOptions = useMemo(() => ['All Locations', ...jobs.available_locations], [jobs.available_locations])

  const workStyleOptions = useMemo(
    () => ['All Work Styles', ...jobs.available_work_styles.map((option) => option.value)],
    [jobs.available_work_styles]
  )

  const languageLabels = useMemo(
    () => new Map(jobs.available_languages.map((option) => [option.value, option.label])),
    [jobs.available_languages]
  )

  const workStyleLabels = useMemo(
    () => new Map(jobs.available_work_styles.map((option) => [option.value, option.label])),
    [jobs.available_work_styles]
  )

  function resetFilters() {
    setSearchQuery('')
    setSkill('All Skills')
    setLanguage('All Languages')
    setLocation('All Locations')
    setWorkStyle('All Work Styles')
    setSortBy('Newest')
    setPage(1)
  }

  async function handleBookmarkToggle(vacancy: VacancyRecord) {
    setBookmarkingVacancyId(vacancy.vacancy_id)

    try {
      await apiRequest(`/student/jobs/${vacancy.vacancy_id}/bookmark`, {
        method: vacancy.is_bookmarked ? 'DELETE' : 'POST',
        csrfToken,
      })
      await queryClient.invalidateQueries({ queryKey: ['student-jobs'] })
    } finally {
      setBookmarkingVacancyId(null)
    }
  }

  async function handleApply(vacancyId: number) {
    setApplyingVacancyId(vacancyId)

    try {
      await apiRequest<StudentApplicationRecord>('/student/applications', {
        method: 'POST',
        body: { vacancy_id: vacancyId },
        csrfToken,
      })
      await queryClient.invalidateQueries({ queryKey: ['student-jobs'] })
    } finally {
      setApplyingVacancyId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[24px] border border-border bg-muted/20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        {savedOnly ? (
          <>
            <Link to="/student/jobs" className="transition-colors hover:text-foreground">
              Jobs
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Saved jobs</span>
          </>
        ) : (
          <span className="font-medium text-foreground">Jobs</span>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{savedOnly ? 'Saved Jobs' : 'Jobs'}</h1>
        <p className="text-base text-muted-foreground">
          {savedOnly
            ? 'Review the roles you saved for later, refine them with the same filters, and jump back into job details when you are ready.'
            : 'Browse open roles, review the key requirements quickly, and open a detailed job page when something fits.'}
        </p>
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
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search jobs"
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
              <SheetTitle>Filter jobs</SheetTitle>
              <SheetDescription>Refine by skill, language, location, work style, or sorting.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={skill}
                onChange={(event) => {
                  setSkill(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {skillOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Skills' ? option : formatLabel(option)}
                  </option>
                ))}
              </select>

              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Languages' ? option : languageLabels.get(option) ?? formatLabel(option)}
                  </option>
                ))}
              </select>

              <select
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={workStyle}
                onChange={(event) => {
                  setWorkStyle(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {workStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Work Styles' ? option : workStyleLabels.get(option) ?? formatLabel(option)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value)
                    setPage(1)
                  }}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Newest</option>
                  <option>Company A-Z</option>
                  <option>Title A-Z</option>
                  <option>Compensation</option>
                </select>
              </div>

              <Button type="button" variant="outline" className="h-11 w-full rounded-none" onClick={resetFilters}>
                Reset filters
              </Button>
              <Link
                to={togglePagePath}
                className="inline-flex h-11 w-full items-center justify-center rounded-none border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {togglePageLabel}
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-6">
        <div className="relative md:col-span-2 xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search jobs"
            className="h-11 rounded-none pl-10"
          />
        </div>

        <select
          value={skill}
          onChange={(event) => {
            setSkill(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {skillOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Skills' ? option : formatLabel(option)}
            </option>
          ))}
        </select>

        <select
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {languageOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Languages' ? option : languageLabels.get(option) ?? formatLabel(option)}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(event) => {
            setLocation(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {locationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={workStyle}
          onChange={(event) => {
            setWorkStyle(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {workStyleOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Work Styles' ? option : workStyleLabels.get(option) ?? formatLabel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
          <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value)
              setPage(1)
            }}
            className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
          >
            <option>Newest</option>
            <option>Company A-Z</option>
            <option>Title A-Z</option>
            <option>Compensation</option>
          </select>
        </div>

        <Button type="button" variant="outline" className="h-11 rounded-none px-5" onClick={resetFilters}>
          Reset filters
        </Button>
        <Link
          to={togglePagePath}
          className="inline-flex h-11 items-center justify-center rounded-none border border-input bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {togglePageLabel}
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {quickSkillOptions.map((option) => {
          const isActive = skill === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSkill(option)
                setPage(1)
              }}
              className={cn(
                'flex-none whitespace-nowrap border px-4 py-2 text-center text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'
              )}
            >
              {option === 'All Skills' ? option : formatLabel(option)}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {jobs.result_count} {savedOnly ? 'saved job' : 'job listing'}
          {jobs.result_count === 1 ? '' : 's'}
        </p>
      </div>

      {jobs.vacancies.length > 0 ? (
        <div className="space-y-4">
          {jobs.vacancies.map((vacancy) => {
            const isSaved = vacancy.is_bookmarked
            const hasActiveApplication = vacancy.has_active_application
            const canApply = vacancy.can_apply

            return (
              <Card
                key={vacancy.vacancy_id}
                className="cursor-pointer rounded-[24px] border border-slate-200/80 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                onClick={() => navigate(`/student/jobs/${vacancy.vacancy_id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/student/jobs/${vacancy.vacancy_id}`)
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3 sm:gap-4">
                      <Avatar size="lg" className="border border-slate-200 bg-white shadow-sm">
                        <AvatarImage src={vacancy.company_profile_image ?? undefined} alt={vacancy.company_name} />
                        <AvatarFallback className="bg-white font-semibold text-slate-700">
                          {getCompanyInitials(vacancy.company_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{vacancy.title}</h2>
                        <p className="text-sm font-medium text-slate-700 sm:text-base">
                          {vacancy.company_name} · {vacancy.location}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {formatLabel(vacancy.experience_level)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {formatSalary(vacancy.min_salary, vacancy.max_salary)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Globe2 className="h-4 w-4" />
                            {workStyleLabels.get(vacancy.work_style) ?? vacancy.work_style_label}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600">
                          Skills: <span className="text-slate-700">{formatSkillsSummary(vacancy)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:min-w-[140px] lg:flex-col lg:items-end">
                      <div className="text-sm font-medium text-emerald-700">{formatRelativeDate(vacancy.updated_at)}</div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleBookmarkToggle(vacancy)
                          }}
                          disabled={bookmarkingVacancyId === vacancy.vacancy_id}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary disabled:opacity-60"
                          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                        >
                          {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:text-slate-700"
                              aria-label="More actions"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => void handleApply(vacancy.vacancy_id)}
                              disabled={applyingVacancyId === vacancy.vacancy_id || !canApply}
                              className="cursor-pointer"
                            >
                              {applyingVacancyId === vacancy.vacancy_id ? 'Applying...' : hasActiveApplication ? 'Applied' : 'Easy Apply'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Badge
                          className={
                            hasActiveApplication
                              ? 'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100'
                          }
                        >
                          {hasActiveApplication ? 'Applied' : 'Easy Apply'}
                        </Badge>
                        {vacancy.relocation_support ? (
                          <Badge variant="outline" className="bg-white">
                            Relocation support
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-emerald-700">{formatRelativeDate(vacancy.updated_at)}</p>
                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleBookmarkToggle(vacancy)
                          }}
                          disabled={bookmarkingVacancyId === vacancy.vacancy_id}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary disabled:opacity-60"
                          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                        >
                          {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:text-slate-700"
                              aria-label="More actions"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => void handleApply(vacancy.vacancy_id)}
                              disabled={applyingVacancyId === vacancy.vacancy_id || !canApply}
                              className="cursor-pointer"
                            >
                              {applyingVacancyId === vacancy.vacancy_id ? 'Applying...' : hasActiveApplication ? 'Applied' : 'Easy Apply'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={
                          hasActiveApplication
                            ? 'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100'
                        }
                      >
                        {hasActiveApplication ? 'Applied' : 'Easy Apply'}
                      </Badge>
                      {vacancy.relocation_support ? (
                        <Badge variant="outline" className="bg-white">
                          Relocation support
                        </Badge>
                      ) : null}
                    </div>

                    <p className="text-sm text-slate-500">
                      {vacancy.created_by_name} is hiring · {formatLabel(vacancy.status)}
                    </p>
                  </div>

                  <p className="mt-4 hidden text-sm text-slate-500 sm:block">
                    {vacancy.created_by_name} is hiring · {formatLabel(vacancy.status)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="border border-border bg-muted/10 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">
            {savedOnly ? 'No saved jobs match your filters' : 'No jobs match your filters'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {savedOnly
              ? 'Try a different keyword, location, or work style, or save more roles from the jobs page.'
              : 'Try a different keyword, location, or work style to broaden the results.'}
          </p>
        </div>
      )}

      {jobs.pagination && jobs.pagination.total_pages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={!jobs.pagination.has_previous}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className={cn('inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium', 'border-slate-200 bg-white text-slate-700')}>
            {jobs.pagination.page} / {jobs.pagination.total_pages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setPage((current) => current + 1)}
            disabled={!jobs.pagination.has_next}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
