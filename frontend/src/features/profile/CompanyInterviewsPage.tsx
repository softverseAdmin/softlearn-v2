import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Clock3, Search, SlidersHorizontal, Video, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { InterviewListResponse } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'

const emptyResponse: InterviewListResponse = {
  interviews: [],
}

function formatStatusLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getStatusBadgeClassName(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return 'border-transparent bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-200'
    case 'completed':
      return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200'
    case 'cancelled':
      return 'border-transparent bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-200'
    case 'requested':
    case 'pending':
    case 'rescheduled':
      return 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200'
    default:
      return 'border-border bg-muted text-muted-foreground hover:bg-muted'
  }
}

function formatDateTimeRange(start: string | null, end: string | null) {
  if (!start || !end) {
    return null
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null
  }

  return {
    date: startDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: `${startDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${endDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`,
  }
}

export function CompanyInterviewsPage() {
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [status, setStatus] = useState('All Statuses')
  const [sortBy, setSortBy] = useState('Upcoming')
  const [page, setPage] = useState(1)

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: '12',
      sort:
        sortBy === 'Candidate A-Z'
          ? 'candidate_az'
          : sortBy === 'Status'
            ? 'status'
            : sortBy === 'Recently Updated'
              ? 'recently_updated'
              : 'upcoming',
    })
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (status !== 'All Statuses') params.set('status', status)
    return params.toString()
  }, [page, searchQuery, sortBy, status])

  const interviewsQuery = useQuery({
    queryKey: ['company-interviews', queryParams],
    queryFn: () => apiRequest<InterviewListResponse>(`/company/interviews?${queryParams}`),
  })
  const data = interviewsQuery.data ?? emptyResponse
  const loading = interviewsQuery.isLoading
  const error =
    interviewsQuery.error instanceof Error
      ? interviewsQuery.error.message
      : interviewsQuery.isError
        ? 'Unable to load company interviews.'
        : null

  useEffect(() => {
    setPage(1)
  }, [searchQuery, status, sortBy])

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(data.interviews.map((interview) => interview.status))).sort((left, right) =>
      formatStatusLabel(left).localeCompare(formatStatusLabel(right))
    )

    return ['All Statuses', ...values]
  }, [data.interviews])

  const summary = useMemo(() => {
    return {
      total: data.summary?.total ?? 0,
      upcoming: data.summary?.upcoming ?? 0,
      awaitingDecision: data.summary?.awaiting_decision ?? 0,
      completed: data.summary?.completed ?? 0,
      cancelled: data.summary?.cancelled ?? 0,
    }
  }, [data.summary])

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 w-40 flex-none animate-pulse rounded-[26px] border border-border bg-muted/20 md:w-auto"
            />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-[28px] border border-border bg-muted/20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Interviews</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Interview workflow</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Track requested interviews, confirm final schedules, and keep each hiring conversation aligned with the
          cleaner company workspace pattern.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load interviews</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4">
        <div className="w-40 flex-none rounded-[26px] border border-border bg-background px-4 py-3 md:w-auto md:px-5 md:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.total}</p>
          <p className="mt-1 text-sm text-muted-foreground">Interview threads across your hiring workflow</p>
        </div>
        <div className="w-40 flex-none rounded-[26px] border border-border bg-background px-4 py-3 md:w-auto md:px-5 md:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Upcoming</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.upcoming}</p>
          <p className="mt-1 text-sm text-muted-foreground">Confirmed or scheduled interviews ahead</p>
        </div>
        <div className="w-40 flex-none rounded-[26px] border border-border bg-background px-4 py-3 md:w-auto md:px-5 md:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Awaiting action</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.awaitingDecision}</p>
          <p className="mt-1 text-sm text-muted-foreground">Requests still waiting for schedule decisions</p>
        </div>
        <div className="w-40 flex-none rounded-[26px] border border-border bg-background px-4 py-3 md:w-auto md:px-5 md:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Completed</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.completed}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finished interviews with {summary.cancelled} cancelled conversations recorded separately
          </p>
        </div>
      </div>

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search interviews"
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
              <SheetTitle>Filter interviews</SheetTitle>
              <SheetDescription>Refine by status or change the card ordering.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Statuses' ? option : formatStatusLabel(option)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Upcoming</option>
                  <option>Recently Updated</option>
                  <option>Candidate A-Z</option>
                  <option>Status</option>
                </select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden gap-3 md:grid lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search candidate, purpose, or role context"
            className="h-11 pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Statuses' ? option : formatStatusLabel(option)}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>Upcoming</option>
          <option>Recently Updated</option>
          <option>Candidate A-Z</option>
          <option>Status</option>
        </select>
      </div>

      {!error && data.interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">
              {summary.total === 0 ? 'No interviews yet' : 'No interviews match these filters'}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {summary.total === 0
                ? 'Create the first interview request from a candidate detail page.'
                : 'Try a different search term or clear the status filter to see more conversations.'}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {data.interviews.length > 0 ? (
        <motion.div
          className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.interviews.map((interview) => {
            const schedule = formatDateTimeRange(interview.scheduled_start, interview.scheduled_end)

            return (
              <motion.div key={interview.id} variants={itemVariants}>
                <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
                  <CardHeader className="space-y-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{interview.student_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{interview.purpose}</p>
                      </div>
                      <Badge className={getStatusBadgeClassName(interview.status)}>{formatStatusLabel(interview.status)}</Badge>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Role context</p>
                      <p className="mt-2 text-sm text-foreground">{interview.role_context || 'General interview context'}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                    <div className="space-y-3">
                      {schedule ? (
                        <>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span>{schedule.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Clock3 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span>{schedule.time}</span>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                          Waiting for a final schedule confirmation.
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-border pt-4 text-sm">
                      {interview.completed_at ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          <span>Completed {new Date(interview.completed_at).toLocaleDateString()}</span>
                        </div>
                      ) : null}

                      {interview.cancelled_at ? (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                          <XCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Cancelled {new Date(interview.cancelled_at).toLocaleDateString()}</span>
                        </div>
                      ) : null}

                      {interview.meeting_provider ? (
                        <p className="text-muted-foreground">Meeting provider: {formatStatusLabel(interview.meeting_provider)}</p>
                      ) : (
                        <p className="text-muted-foreground">Meeting link not assigned yet.</p>
                      )}
                    </div>

                    <div className="mt-auto pt-2">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to={`/company/interviews/${interview.id}`}>Open interview</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : null}

      {data.pagination && data.pagination.total_pages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={!data.pagination.has_previous}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.total_pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => current + 1)}
            disabled={!data.pagination.has_next}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
