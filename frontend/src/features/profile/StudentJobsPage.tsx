import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Filter,
  Globe2,
  MapPin,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { StudentApplicationRecord, StudentJobsResponse, VacancyRecord } from './types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    return `${formatter.format(minSalary)} - ${formatter.format(maxSalary)}`
  }

  if (minSalary !== null) {
    return `From ${formatter.format(minSalary)}`
  }

  return `Up to ${formatter.format(maxSalary ?? 0)}`
}

function formatStatusLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Recently updated'
  }

  return `Updated ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
}

function FilterSection({
  title,
  items,
  selectedValues,
  onToggle,
  emptyMessage,
}: {
  title: string
  items: Array<{ value: string; label: string }>
  selectedValues: string[]
  onToggle: (value: string) => void
  emptyMessage: string
}) {
  return (
    <div className="space-y-3 border-t border-slate-200/80 pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const checked = selectedValues.includes(item.value)

            return (
              <label
                key={item.value}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition',
                  checked
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.value)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function VacancyCard({
  vacancy,
  applyingVacancyId,
  bookmarkingVacancyId,
  onApply,
  onBookmarkToggle,
}: {
  vacancy: VacancyRecord
  applyingVacancyId: number | null
  bookmarkingVacancyId: number | null
  onApply: (vacancyId: number) => void
  onBookmarkToggle: (vacancyId: number, isBookmarked: boolean) => void
}) {
  const metaItems = [
    { icon: Briefcase, label: vacancy.employment_type || 'Flexible role' },
    { icon: MapPin, label: vacancy.location || 'Location shared later' },
    { icon: Globe2, label: vacancy.work_style_label || vacancy.work_style || 'Work style not set' },
    { icon: Wallet, label: formatSalary(vacancy.min_salary, vacancy.max_salary) },
  ]

  return (
    <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <CardContent className="space-y-6 p-0">
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">Active role</Badge>
                <Badge className="border-transparent bg-violet-100 text-violet-700 hover:bg-violet-100">
                  {formatStatusLabel(vacancy.experience_level || 'Open')}
                </Badge>
                {vacancy.relocation_support ? (
                  <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Relocation support
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-start gap-4">
                <div className="hidden rounded-[22px] bg-slate-900 p-3 text-white shadow-sm sm:flex">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">{vacancy.title}</h2>
                  <p className="mt-1 text-base font-medium text-slate-600">{vacancy.company_name}</p>
                  <p className="mt-2 text-sm text-slate-500">{formatRelativeDate(vacancy.updated_at)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[270px] lg:max-w-[320px]">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Compensation</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatSalary(vacancy.min_salary, vacancy.max_salary)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Work mode</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{vacancy.work_style_label || 'Shared during review'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 pb-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metaItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Details</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{item.label}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Role overview</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{vacancy.description}</p>
              </div>

              {vacancy.skill_requirements.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Skills needed</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vacancy.skill_requirements.map((requirement) => (
                      <Badge
                        key={requirement.id}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                      >
                        {requirement.skill_name} · {formatStatusLabel(requirement.requirement_type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Hiring signals</p>
              <div className="mt-4 space-y-3">
                {vacancy.language_requirements.length > 0 ? (
                  vacancy.language_requirements.map((requirement) => (
                    <div key={requirement.id} className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">{requirement.language_label}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {requirement.minimum_level_label} · {formatStatusLabel(requirement.requirement_type)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                    No language requirements were attached to this vacancy.
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button
                  className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => onApply(vacancy.vacancy_id)}
                  disabled={applyingVacancyId === vacancy.vacancy_id}
                >
                  {applyingVacancyId === vacancy.vacancy_id ? 'Applying…' : 'Apply now'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200 bg-white"
                  onClick={() => onBookmarkToggle(vacancy.vacancy_id, vacancy.is_bookmarked)}
                  disabled={bookmarkingVacancyId === vacancy.vacancy_id}
                >
                  {bookmarkingVacancyId === vacancy.vacancy_id ? (
                    'Saving…'
                  ) : vacancy.is_bookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Saved to shortlist
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Save for later
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentJobsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentJobsResponse>(emptyJobsResponse)
  const [loading, setLoading] = useState(true)
  const [applyingVacancyId, setApplyingVacancyId] = useState<number | null>(null)
  const [bookmarkingVacancyId, setBookmarkingVacancyId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function buildQueryString(filters: {
    query: string
    skills: string[]
    languages: string[]
    locations: string[]
    work_styles: string[]
  }) {
    const params = new URLSearchParams()
    if (filters.query) {
      params.set('q', filters.query)
    }
    if (filters.skills.length) {
      params.set('skills', filters.skills.join(','))
    }
    if (filters.languages.length) {
      params.set('languages', filters.languages.join(','))
    }
    if (filters.locations.length) {
      params.set('locations', filters.locations.join(','))
    }
    if (filters.work_styles.length) {
      params.set('work_styles', filters.work_styles.join(','))
    }
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  async function loadJobs(filters: {
    query: string
    skills: string[]
    languages: string[]
    locations: string[]
    work_styles: string[]
  }) {
    const response = await apiRequest<StudentJobsResponse>(`/student/jobs${buildQueryString(filters)}`)
    setData(response)
    setQuery(response.query)
    setSelectedSkills(response.filters.skills)
    setSelectedLanguages(response.filters.languages)
    setSelectedLocations(response.filters.locations)
    setSelectedWorkStyles(response.filters.work_styles)
  }

  useEffect(() => {
    let active = true

    async function initializeJobs() {
      try {
        const response = await apiRequest<StudentJobsResponse>('/student/jobs')
        if (active) {
          setData(response)
          setQuery(response.query)
          setSelectedSkills(response.filters.skills)
          setSelectedLanguages(response.filters.languages)
          setSelectedLocations(response.filters.locations)
          setSelectedWorkStyles(response.filters.work_styles)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load jobs.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void initializeJobs()
    return () => {
      active = false
    }
  }, [])

  function toggleValue(value: string, currentValues: string[], setValues: (values: string[]) => void) {
    setValues(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value])
  }

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await loadJobs({
        query,
        skills: selectedSkills,
        languages: selectedLanguages,
        locations: selectedLocations,
        work_styles: selectedWorkStyles,
      })
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : 'Unable to filter jobs.')
    }
  }

  async function handleClearFilters() {
    setError(null)
    setSuccess(null)

    try {
      await loadJobs({
        query: '',
        skills: [],
        languages: [],
        locations: [],
        work_styles: [],
      })
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : 'Unable to clear filters.')
    }
  }

  async function handleBookmarkToggle(vacancyId: number, isBookmarked: boolean) {
    setBookmarkingVacancyId(vacancyId)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest(`/student/jobs/${vacancyId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        csrfToken,
      })
      await loadJobs({
        query,
        skills: selectedSkills,
        languages: selectedLanguages,
        locations: selectedLocations,
        work_styles: selectedWorkStyles,
      })
      setSuccess(isBookmarked ? 'Bookmark removed.' : 'Job saved for later.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update bookmark.')
    } finally {
      setBookmarkingVacancyId(null)
    }
  }

  async function handleApply(vacancyId: number) {
    setApplyingVacancyId(vacancyId)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<StudentApplicationRecord>('/student/applications', {
        method: 'POST',
        body: { vacancy_id: vacancyId },
        csrfToken,
      })
      setSuccess('Application submitted successfully. Track it in your applications page.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit application.')
    } finally {
      setApplyingVacancyId(null)
    }
  }

  const activeFilterCount = useMemo(
    () =>
      selectedSkills.length +
      selectedLanguages.length +
      selectedLocations.length +
      selectedWorkStyles.length +
      (query.trim() ? 1 : 0),
    [query, selectedLanguages.length, selectedLocations.length, selectedSkills.length, selectedWorkStyles.length],
  )

  const featuredLocations = useMemo(() => data.available_locations.slice(0, 4), [data.available_locations])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading job opportunities…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_50%,#f5f3ff_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <Sparkles className="h-4 w-4" />
              Student jobs
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Discover roles that match your learning path</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Browse active openings, apply with your current profile, and keep saved roles organized without leaving the student workspace.
              </p>
            </div>

            <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]" onSubmit={handleFilterSubmit}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, company, description, or location"
                  className="h-12 rounded-2xl border-slate-200 bg-white pl-11 text-sm shadow-sm"
                />
              </div>
              <Button type="submit" className="h-12 rounded-2xl bg-blue-600 px-5 text-white hover:bg-blue-700">
                Apply filters
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-slate-200 bg-white px-5"
                onClick={() => void handleClearFilters()}
              >
                Reset
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {featuredLocations.map((locationOption) => (
                <button
                  key={locationOption}
                  type="button"
                  onClick={() => toggleValue(locationOption, selectedLocations, setSelectedLocations)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition',
                    selectedLocations.includes(locationOption)
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  {locationOption}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Open roles</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{data.result_count}</p>
              <p className="mt-1 text-sm text-slate-500">Currently visible opportunities</p>
            </div>
            <div className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Saved jobs</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{data.bookmark_count}</p>
              <p className="mt-1 text-sm text-slate-500">Shortlisted for later review</p>
            </div>
            <div className="rounded-[28px] border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Active filters</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{activeFilterCount}</p>
              <p className="mt-1 text-sm text-slate-500">Search, skills, language, and location signals</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load jobs</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

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

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Filter panel</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">Refine matches</h2>
                </div>
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
                  <Filter className="h-4 w-4" />
                </div>
              </div>

              <FilterSection
                title="Skills"
                items={data.available_skills.map((skill) => ({ value: skill.slug, label: skill.name }))}
                selectedValues={selectedSkills}
                onToggle={(value) => toggleValue(value, selectedSkills, setSelectedSkills)}
                emptyMessage="No skill-tagged jobs available yet."
              />
              <FilterSection
                title="Languages"
                items={data.available_languages.map((language) => ({ value: language.value, label: language.label }))}
                selectedValues={selectedLanguages}
                onToggle={(value) => toggleValue(value, selectedLanguages, setSelectedLanguages)}
                emptyMessage="No language filters are available yet."
              />
              <FilterSection
                title="Locations"
                items={data.available_locations.map((locationOption) => ({ value: locationOption, label: locationOption }))}
                selectedValues={selectedLocations}
                onToggle={(value) => toggleValue(value, selectedLocations, setSelectedLocations)}
                emptyMessage="No location filters are available yet."
              />
              <FilterSection
                title="Work style"
                items={data.available_work_styles.map((workStyle) => ({ value: workStyle.value, label: workStyle.label }))}
                selectedValues={selectedWorkStyles}
                onToggle={(value) => toggleValue(value, selectedWorkStyles, setSelectedWorkStyles)}
                emptyMessage="No work-style filters are available yet."
              />

              <div className="border-t border-slate-200 pt-5">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-2xl border-slate-200 bg-slate-50"
                  onClick={() => void handleClearFilters()}
                >
                  Clear all filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Opportunity feed</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Available opportunities</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              {data.vacancies.length} role{data.vacancies.length === 1 ? '' : 's'} found
            </div>
          </div>

          {data.vacancies.length === 0 ? (
            <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">No opportunities match your search</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Adjust the filter panel or clear your query to see more roles from the current job feed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
              {data.vacancies.map((vacancy) => (
                <motion.div key={vacancy.vacancy_id} variants={itemVariants}>
                  <VacancyCard
                    vacancy={vacancy}
                    applyingVacancyId={applyingVacancyId}
                    bookmarkingVacancyId={bookmarkingVacancyId}
                    onApply={(vacancyId) => void handleApply(vacancyId)}
                    onBookmarkToggle={(vacancyId, isBookmarked) => void handleBookmarkToggle(vacancyId, isBookmarked)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" className="rounded-2xl text-blue-700" asChild>
              <Link to="/student/applications">
                Review submitted applications
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
