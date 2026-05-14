import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin, MoreVertical, Search, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyApplicationRecord, CompanyApplicationsResponse } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const emptyApplicationsResponse: CompanyApplicationsResponse = {
  company_id: 0,
  application_count: 0,
  applications: [],
}

function formatStatusLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getStatusBadgeClassName(status: string) {
  switch (status.toLowerCase()) {
    case 'shortlisted':
    case 'accepted':
      return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
    case 'rejected':
    case 'withdrawn':
      return 'border-transparent bg-rose-100 text-rose-800 hover:bg-rose-100'
    case 'interviewed':
    case 'under_review':
      return 'border-transparent bg-sky-100 text-sky-800 hover:bg-sky-100'
    default:
      return 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'
  }
}

function getApplicationScore(application: CompanyApplicationRecord) {
  const actionableWeight = Number(application.can_shortlist) * 20 + Number(application.can_reject) * 15
  return actionableWeight + application.history.length * 5 + new Date(application.updated_at).getTime()
}

export function CompanyApplicationsPage() {
  const { csrfToken } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<CompanyApplicationsResponse>(emptyApplicationsResponse)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [sortBy, setSortBy] = useState('Newest')

  useEffect(() => {
    let active = true

    async function loadApplications() {
      try {
        const response = await apiRequest<CompanyApplicationsResponse>('/company/applications')
        if (active) {
          setData(response)
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load company applications.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadApplications()
    return () => {
      active = false
    }
  }, [])

  async function refreshApplications() {
    const response = await apiRequest<CompanyApplicationsResponse>('/company/applications')
    setData(response)
  }

  async function runAction(application: CompanyApplicationRecord, action: 'shortlist' | 'reject') {
    setSavingId(application.application_id)

    try {
      await apiRequest<CompanyApplicationRecord>(`/company/applications/${application.application_id}/${action}`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await refreshApplications()
      toast.success(action === 'shortlist' ? 'Application shortlisted successfully.' : 'Application rejected successfully.')
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to update application status.'
      toast.error(message)
    } finally {
      setSavingId(null)
    }
  }

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(data.applications.map((application) => application.status))).sort((left, right) =>
      formatStatusLabel(left).localeCompare(formatStatusLabel(right))
    )

    return ['All Statuses', ...values]
  }, [data.applications])

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = data.applications.filter((application) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          application.display_name,
          application.vacancy_title,
          application.desired_job_type,
          application.desired_work_location,
          formatStatusLabel(application.status),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesStatus = status === 'All Statuses' || application.status === status

      return matchesQuery && matchesStatus
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'Oldest') {
        return new Date(left.submitted_at).getTime() - new Date(right.submitted_at).getTime()
      }

      if (sortBy === 'Candidate A-Z') {
        return left.display_name.localeCompare(right.display_name)
      }

      if (sortBy === 'Status') {
        return formatStatusLabel(left.status).localeCompare(formatStatusLabel(right.status))
      }

      if (sortBy === 'Recommended') {
        return getApplicationScore(right) - getApplicationScore(left)
      }

      return new Date(right.submitted_at).getTime() - new Date(left.submitted_at).getTime()
    })
  }, [data.applications, searchQuery, sortBy, status])

  const statusSummary = useMemo(() => {
    return {
      submitted: data.applications.filter((application) => application.status.toLowerCase() === 'submitted').length,
      underReview: data.applications.filter((application) => application.status.toLowerCase() === 'under_review').length,
      shortlisted: data.applications.filter((application) => application.status.toLowerCase() === 'shortlisted').length,
      rejected: data.applications.filter((application) => application.status.toLowerCase() === 'rejected').length,
    }
  }, [data.applications])

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Applications</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Applications</h1>
      <p className="text-base text-muted-foreground">
        Review candidate submissions in a cleaner table workspace with fast scanning, filtering, and actions.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.application_count}</p>
          <p className="mt-1 text-sm text-muted-foreground">All submitted applications</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Submitted</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{statusSummary.submitted}</p>
          <p className="mt-1 text-sm text-muted-foreground">New applications to triage</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Under review</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{statusSummary.underReview}</p>
          <p className="mt-1 text-sm text-muted-foreground">Still moving through review</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shortlisted</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{statusSummary.shortlisted}</p>
          <p className="mt-1 text-sm text-muted-foreground">Promoted candidates</p>
        </div>
      </div>

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search application"
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
              <SheetTitle>Filter applications</SheetTitle>
              <SheetDescription>Refine by status or change the card ordering.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Statuses' ? option : formatStatusLabel(option)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Newest</option>
                  <option>Recommended</option>
                  <option>Oldest</option>
                  <option>Candidate A-Z</option>
                  <option>Status</option>
                </select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
        <div className="relative xl:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search application"
            className="h-11 rounded-none pl-10"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Statuses' ? option : formatStatusLabel(option)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
          <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
          >
            <option>Newest</option>
            <option>Recommended</option>
            <option>Oldest</option>
            <option>Candidate A-Z</option>
            <option>Status</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => {
          const isActive = status === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={cn(
                'flex-none whitespace-nowrap border px-4 py-2 text-center text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'
              )}
            >
              {option === 'All Statuses' ? option : formatStatusLabel(option)}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[28px] border border-border bg-background">
              <div className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1.4fr_1fr_1fr_1.2fr]">
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">Unable to load applications</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="overflow-hidden rounded-[30px] border border-border bg-background shadow-sm">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-4">Candidate</TableHead>
                  <TableHead className="px-4 py-4">Applied role</TableHead>
                  <TableHead className="px-4 py-4">Preferences</TableHead>
                  <TableHead className="px-4 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => {
                  return (
                    <TableRow key={application.application_id}>
                      <TableCell className="px-6 py-4 align-top whitespace-normal">
                        <p className="truncate text-sm font-semibold text-foreground">{application.display_name}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <p className="font-medium text-foreground">{application.vacancy_title}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {application.desired_job_type || 'Job type hidden'}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full">
                            <MapPin className="h-3.5 w-3.5" />
                            {application.desired_work_location || 'Location hidden'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-top whitespace-normal">
                        <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(application.status))}>
                          {formatStatusLabel(application.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 align-top">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                                aria-label={`More actions for ${application.display_name}`}
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  if (application.candidate_access_id) {
                                    navigate(`/company/candidates/${application.candidate_access_id}`)
                                  }
                                }}
                                disabled={!application.candidate_access_id}
                              >
                                Review candidate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => void runAction(application, 'shortlist')}
                                disabled={!application.can_shortlist || savingId === application.application_id}
                              >
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={() => void runAction(application, 'reject')}
                                disabled={!application.can_reject || savingId === application.application_id}
                              >
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filteredApplications.map((application) => {
              return (
                <div key={application.application_id} className="rounded-[24px] border border-border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{application.display_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn('rounded-full', getStatusBadgeClassName(application.status))}>
                        {formatStatusLabel(application.status)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                            aria-label={`More actions for ${application.display_name}`}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              if (application.candidate_access_id) {
                                navigate(`/company/candidates/${application.candidate_access_id}`)
                              }
                            }}
                            disabled={!application.candidate_access_id}
                          >
                            Review candidate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => void runAction(application, 'shortlist')}
                            disabled={!application.can_shortlist || savingId === application.application_id}
                          >
                            Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => void runAction(application, 'reject')}
                            disabled={!application.can_reject || savingId === application.application_id}
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="font-medium text-foreground">{application.vacancy_title}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {application.desired_job_type || 'Job type hidden'}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        <MapPin className="h-3.5 w-3.5" />
                        {application.desired_work_location || 'Location hidden'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="border border-border bg-background px-6 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">No applications found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try changing your search or filter to see more applications.</p>
        </div>
      )}
    </div>
  )
}
