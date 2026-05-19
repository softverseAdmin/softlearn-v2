import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  ChevronRight,
  Clock3,
  Globe2,
  MapPin,
} from 'lucide-react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import { studentJobDetailQueryOptions, studentJobQueryKeys } from './jobs/queries'
import type { StudentApplicationRecord, StudentJobDetailResponse, VacancyRecord } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

export function StudentJobDetailPage() {
  const { csrfToken } = useAuth()
  const params = useParams<{ vacancyId: string }>()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'job' | 'company'>('job')
  const vacancyId = params.vacancyId ?? ''
  const vacancyQuery = useQuery({
    ...studentJobDetailQueryOptions(vacancyId),
    enabled: Boolean(params.vacancyId),
  })
  const vacancy = vacancyQuery.data ?? null
  const loadError =
    !params.vacancyId
      ? 'Job detail context is missing.'
      : vacancyQuery.error instanceof ApiError
        ? vacancyQuery.error.message
        : vacancyQuery.isError
          ? 'Unable to load job detail.'
          : null

  function updateVacancyCache(updater: (currentVacancy: VacancyRecord) => VacancyRecord) {
    if (!params.vacancyId) {
      return
    }

    queryClient.setQueryData<StudentJobDetailResponse>(
      studentJobQueryKeys.detail(params.vacancyId),
      (currentVacancy) => (currentVacancy ? updater(currentVacancy) : currentVacancy),
    )
  }

  const jobRows = useMemo(
    () =>
      vacancy
        ? [
            ['Role', vacancy.title],
            ['Employment type', vacancy.employment_type || 'Not shared'],
            ['Experience level', formatLabel(vacancy.experience_level)],
            ['Location', vacancy.location || 'Not shared'],
            ['Work style', vacancy.work_style_label || formatLabel(vacancy.work_style)],
            ['Salary', formatSalary(vacancy.min_salary, vacancy.max_salary)],
            ['Required skills', vacancy.skill_requirements.map((skill) => skill.skill_name).join(', ') || 'Not specified'],
            [
              'Language requirements',
              vacancy.language_requirements.map((language) => `${language.language_label} ${language.minimum_level_label}`).join(', ') || 'Not specified',
            ],
            ['Job summary', vacancy.description || 'No summary available.'],
          ]
        : [],
    [vacancy]
  )

  const companyRows = useMemo(
    () =>
      vacancy
        ? [
            ['Company', vacancy.company_name],
            ['Hiring contact', vacancy.created_by_name || 'Hiring team'],
            ['Status', formatLabel(vacancy.status)],
            ['Relocation support', vacancy.relocation_support ? 'Available' : 'Not listed'],
            ['Published', new Date(vacancy.created_at).toLocaleDateString()],
            ['Last updated', new Date(vacancy.updated_at).toLocaleString()],
          ]
        : [],
    [vacancy]
  )

  async function handleBookmarkToggle() {
    if (!vacancy) {
      return
    }

    setSaving(true)
    setActionError(null)

    try {
      await apiRequest(`/student/jobs/${vacancy.vacancy_id}/bookmark`, {
        method: vacancy.is_bookmarked ? 'DELETE' : 'POST',
        csrfToken,
      })

      updateVacancyCache((currentVacancy) => ({
        ...currentVacancy,
        is_bookmarked: !currentVacancy.is_bookmarked,
      }))
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to update the bookmark right now.')
    } finally {
      setSaving(false)
    }
  }

  async function handleApply() {
    if (!vacancy) {
      return
    }

    setApplying(true)
    setActionError(null)

    try {
      await apiRequest<StudentApplicationRecord>('/student/applications', {
        method: 'POST',
        body: { vacancy_id: vacancy.vacancy_id },
        csrfToken,
      })
      updateVacancyCache((currentVacancy) => ({
        ...currentVacancy,
        has_active_application: true,
        can_apply: false,
      }))
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to submit the application right now.')
    } finally {
      setApplying(false)
    }
  }

  if (vacancyQuery.isLoading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-28 animate-pulse rounded-[28px] border border-border bg-muted/20" />
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/student" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/student/jobs" className="transition-colors hover:text-foreground">
            Jobs
          </Link>
        </div>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-6 text-sm text-red-800 dark:text-red-200">
            {loadError ?? actionError ?? 'This job could not be found.'}
          </CardContent>
        </Card>
      </div>
    )
  }

  const detailRows = activeTab === 'job' ? jobRows : companyRows

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/student/jobs" className="transition-colors hover:text-foreground">
          Jobs
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{vacancy.title}</span>
      </div>

      {actionError ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-4 text-sm text-red-800 dark:text-red-200">{actionError}</CardContent>
        </Card>
      ) : null}
      <Card className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <CardContent className="space-y-6 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 gap-4">
              <Avatar size="lg" className="border border-slate-200 bg-white shadow-sm">
                <AvatarImage src={vacancy.company_profile_image ?? undefined} alt={vacancy.company_name} />
                <AvatarFallback className="bg-white font-semibold text-slate-700">
                  {getCompanyInitials(vacancy.company_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{vacancy.company_name}</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{vacancy.title}</h1>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {vacancy.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {vacancy.employment_type}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Globe2 className="h-4 w-4" />
                    {vacancy.work_style_label || formatLabel(vacancy.work_style)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {formatLabel(vacancy.experience_level)}
                  </span>
                </div>

                <p className="max-w-3xl text-sm text-slate-500">
                  Applied jobs move into your student applications workspace once submitted.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" className="rounded-xl" disabled={applying || !vacancy.can_apply} onClick={() => void handleApply()}>
                {applying ? 'Applying...' : vacancy.has_active_application ? 'Applied' : 'Apply'}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" disabled={saving} onClick={() => void handleBookmarkToggle()}>
                {vacancy.is_bookmarked ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                {vacancy.is_bookmarked ? 'Saved' : 'Save'}
              </Button>
              <Link to="/student/jobs" className={cn(buttonLinkClasses, 'rounded-xl')}>
                Back to jobs
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('job')}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-medium transition',
                  activeTab === 'job'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                Job information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-medium transition',
                  activeTab === 'company'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                Company information
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">Easy Apply</Badge>
              {vacancy.relocation_support ? (
                <Badge variant="outline" className="bg-white">
                  Relocation support
                </Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <CardContent className="overflow-hidden px-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {detailRows.map(([label, value]) => (
                  <tr key={label} className="border-t border-slate-200 first:border-t-0">
                    <td className="w-44 bg-slate-50 px-5 py-4 align-top text-sm font-semibold text-slate-700 md:w-56">
                      {label}
                    </td>
                    <td className="px-5 py-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Review the final employment conditions with the employer before accepting any offer.
      </p>
    </div>
  )
}

const buttonLinkClasses =
  'inline-flex h-10 items-center justify-center border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
