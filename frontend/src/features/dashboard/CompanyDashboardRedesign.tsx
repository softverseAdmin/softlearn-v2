import { useMemo, useRef, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, ExternalLink, Search, UserRoundCheck, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { containerVariants, itemVariants } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  formatInterviewDate,
  formatInterviewStatus,
  formatInterviewTime,
  toCalendarDate,
  toDayKey,
  toInterviewDayKey,
} from './interviewCalendar'
import type { CompanyDashboardResponse } from './types'

type CompanyDashboardRedesignProps = {
  loading: boolean
  error: string | null
  data: CompanyDashboardResponse | null
}

const APPLICATION_STATUS_COLORS = ['#2563eb', '#7c3aed', '#10b981', '#ef4444', '#94a3b8']

type ApplicationStatusDatum = {
  name: string
  value: number
  color: string
}

function formatJobStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatPostedDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export function CompanyDashboardRedesign({ loading, error, data }: CompanyDashboardRedesignProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isInterviewPopoverOpen, setIsInterviewPopoverOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number
    left: number
    width: number
    arrowLeft: number
    placement: 'top' | 'bottom'
  } | null>(null)
  const calendarContainerRef = useRef<HTMLDivElement | null>(null)

  const statCards = data
    ? [
        {
          label: 'Candidates to review',
          value: data.analytics.candidates_to_review.toString(),
          helper:
            data.candidates_to_review.length > 0
              ? `${data.candidates_to_review.length} review-ready profiles shown below`
              : 'No review-ready candidates yet',
          icon: Search,
          iconClassName: 'text-blue-600 dark:text-blue-400',
        },
        {
          label: 'Shortlisted candidates',
          value: data.analytics.shortlisted_candidates.toString(),
          helper: 'Students already moved into your shortlist',
          icon: UserRoundCheck,
          iconClassName: 'text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Active jobs',
          value: data.analytics.active_jobs.toString(),
          helper: data.active_jobs.pipeline_summary,
          icon: BriefcaseBusiness,
          iconClassName: 'text-violet-600 dark:text-violet-400',
        },
        {
          label: 'Interviews in motion',
          value: data.interviews.active_count.toString(),
          helper: `${data.interviews.completed_count} completed interviews on record`,
          icon: CalendarDays,
          iconClassName: 'text-amber-600 dark:text-amber-400',
        },
        {
          label: 'Hires',
          value: data.analytics.hires.toString(),
          helper: 'Completed interview outcomes on record',
          icon: CheckCircle2,
          iconClassName: 'text-primary',
        },
      ]
    : []

  const interviewDates = useMemo(
    () =>
      data?.interviews.items
        .filter((interview) => Boolean(interview.scheduled_start))
        .map((interview) => toCalendarDate(interview.scheduled_start as string))
        .filter((date): date is Date => Boolean(date)) ?? [],
    [data]
  )

  const selectedInterviews = useMemo(() => {
    if (!data || !selectedDate) {
      return []
    }

    const selectedKey = toDayKey(selectedDate)
    return data.interviews.items.filter((interview) => toInterviewDayKey(interview.scheduled_start) === selectedKey)
  }, [data, selectedDate])

  const applicationStatusData = useMemo(() => {
    if (!data) {
      return []
    }

    return [
      { name: 'Submitted', value: data.application_status.submitted, color: APPLICATION_STATUS_COLORS[0] },
      { name: 'Under review', value: data.application_status.under_review, color: APPLICATION_STATUS_COLORS[1] },
      { name: 'Shortlisted', value: data.application_status.shortlisted, color: APPLICATION_STATUS_COLORS[2] },
      { name: 'Rejected', value: data.application_status.rejected, color: APPLICATION_STATUS_COLORS[3] },
      { name: 'Withdrawn', value: data.application_status.withdrawn, color: APPLICATION_STATUS_COLORS[4] },
    ].filter((item) => item.value > 0)
  }, [data])

  const totalApplications = useMemo(() => {
    if (!data) {
      return 0
    }

    return (
      data.application_status.submitted +
      data.application_status.under_review +
      data.application_status.shortlisted +
      data.application_status.rejected +
      data.application_status.withdrawn
    )
  }, [data])

  const topPerformingJobs = useMemo(() => {
    if (!data) {
      return []
    }

    return [...data.recent_job_postings]
      .sort((left, right) => {
        if (right.applications_count !== left.applications_count) {
          return right.applications_count - left.applications_count
        }

        return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
      })
      .slice(0, 4)
  }, [data])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !data) {
      setSelectedDate(undefined)
      setIsInterviewPopoverOpen(false)
      setTooltipPosition(null)
      return
    }

    setSelectedDate(date)
    setIsInterviewPopoverOpen(true)
  }

  const updateTooltipPosition = (triggerRect: DOMRect) => {
    const containerRect = calendarContainerRef.current?.getBoundingClientRect()
    if (!containerRect) {
      return
    }

    const tooltipWidth = containerRect.width
    const estimatedTooltipHeight = 320
    const left = containerRect.left
    const arrowLeft = Math.min(
      Math.max(triggerRect.left + triggerRect.width / 2 - left, 24),
      tooltipWidth - 24
    )

    let placement: 'top' | 'bottom' = 'bottom'
    let top = triggerRect.bottom + 12

    if (
      top + estimatedTooltipHeight > window.innerHeight - 8 &&
      triggerRect.top - estimatedTooltipHeight - 12 > 8
    ) {
      placement = 'top'
      top = triggerRect.top - estimatedTooltipHeight - 12
    }

    setTooltipPosition({
      top,
      left,
      width: tooltipWidth,
      arrowLeft,
      placement,
    })
  }

  return (
    <section className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="font-semibold text-red-900 dark:text-red-100">Unable to load dashboard</p>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Loading your hiring workspace…</CardContent>
        </Card>
      ) : null}

      {!loading && data ? (
        <>
          <motion.div
            className="grid grid-cols-2 gap-4 xl:grid-cols-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <motion.div key={card.label} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                      <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-start">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Application status</CardTitle>
                <p className="text-sm text-muted-foreground">Donut chart powered by Recharts for your live application pipeline.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicationStatusData.length > 0 ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-[minmax(0,300px)_minmax(220px,1fr)] md:items-center">
                      <div className="relative h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={applicationStatusData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={72}
                              outerRadius={104}
                              paddingAngle={3}
                              strokeWidth={0}
                            >
                              {applicationStatusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.length) {
                                  return null
                                }

                                const item = payload[0]?.payload
                                if (
                                  !item ||
                                  typeof item !== 'object' ||
                                  !('name' in item) ||
                                  !('value' in item) ||
                                  !('color' in item)
                                ) {
                                  return null
                                }

                                const datum = item as ApplicationStatusDatum

                                return (
                                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: datum.color }} />
                                      <span className="text-sm font-medium text-slate-900">{datum.name}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">{datum.value} applications</p>
                                  </div>
                                )
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-3xl font-bold tracking-tight">{totalApplications}</span>
                          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Applications</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {applicationStatusData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No application status data yet</p>
                      <p className="text-sm text-muted-foreground">Once candidates start applying, the donut chart will show the live status breakdown here.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="w-full max-w-full space-y-4 sm:max-w-[380px] xl:justify-self-end">
            <Card>
              <CardHeader className="mb-4 justify-center">
                <CardTitle>Events calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={calendarContainerRef} className="relative flex w-full justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    onDayClick={(day, _modifiers, event) => {
                      handleDateSelect(day)
                      updateTooltipPosition(event.currentTarget.getBoundingClientRect())
                    }}
                    showOutsideDays
                    weekStartsOn={1}
                    modifiers={{ interview: interviewDates }}
                    modifiersStyles={{
                      interview: {
                        backgroundColor: 'color-mix(in oklab, var(--primary) 16%, white)',
                        color: 'var(--foreground)',
                        fontWeight: 700,
                      },
                    }}
                    navLayout="after"
                    className="w-full rounded-2xl"
                    classNames={{
                      root: 'w-full',
                      months: 'flex w-full flex-col',
                      month: 'relative',
                      month_caption: 'flex h-[30px] items-center justify-center',
                      caption_label: 'flex h-full items-center text-sm font-semibold leading-none',
                      nav: 'pointer-events-none absolute inset-x-0 top-0 flex h-[30px] items-center justify-between',
                      button_previous:
                        'pointer-events-auto inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md border border-border bg-background p-0 text-foreground hover:bg-muted',
                      button_next:
                        'pointer-events-auto inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md border border-border bg-background p-0 text-foreground hover:bg-muted',
                      chevron: 'h-3 w-3',
                      month_grid: 'mt-3 w-full border-collapse',
                      weekdays: 'grid grid-cols-7',
                      weekday: 'text-muted-foreground text-[11px] font-medium',
                      week: 'mt-2 grid grid-cols-7',
                      day: 'text-center text-sm',
                      day_button:
                        'mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm transition-colors hover:bg-muted [&[aria-selected=true]]:bg-transparent [&[aria-selected=true]]:text-primary [&[aria-selected=true]]:ring-1 [&[aria-selected=true]]:ring-primary/30 [&[aria-selected=true]:hover]:bg-transparent [&[aria-selected=true]:hover]:text-primary',
                      today: 'text-primary',
                      selected: 'bg-transparent text-primary',
                      outside: 'text-muted-foreground/40',
                      disabled: 'text-muted-foreground/30',
                      hidden: 'invisible',
                    }}
                  />

                  {isInterviewPopoverOpen && tooltipPosition ? (
                    <div
                      className="fixed z-30 min-h-[18rem] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10"
                      style={{
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        width: tooltipPosition.width,
                      }}
                    >
                      <div
                        className="absolute h-3 w-3 border-border bg-popover"
                        style={{
                          left: tooltipPosition.arrowLeft,
                          transform: 'translateX(0%) rotate(45deg)',
                          ...(tooltipPosition.placement === 'bottom'
                            ? {
                                top: -6,
                                borderLeftWidth: '1px',
                                borderTopWidth: '1px',
                              }
                            : {
                                bottom: -6,
                                borderRightWidth: '1px',
                                borderBottomWidth: '1px',
                              }),
                        }}
                      />
                      <div className="flex h-full flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {selectedDate ? selectedDate.toLocaleDateString() : 'Interview events'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedInterviews.length > 0
                                ? 'Your scheduled interviews for the selected day.'
                                : 'There is no event for the selected day.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsInterviewPopoverOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Close interview preview"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {selectedInterviews.length > 0 ? (
                          selectedInterviews.map((interview) => (
                            <article key={interview.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-base font-semibold">{interview.student_name}</p>
                                    <p className="text-sm text-muted-foreground">{interview.purpose}</p>
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="h-4 w-4" />
                                      <span>{formatInterviewDate(interview.scheduled_start)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock3 className="h-4 w-4" />
                                      <span>{formatInterviewTime(interview.scheduled_start)}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                  {formatInterviewStatus(interview.status)}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-3">
                                <Button asChild variant="outline" size="sm">
                                  <Link to={interview.cta_href}>View details</Link>
                                </Button>
                                {interview.meeting_url ? (
                                  <Button asChild size="sm">
                                    <a href={interview.meeting_url} target="_blank" rel="noreferrer">
                                      Join meeting
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                ) : null}
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                            There is no event for this date.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Recent job postings</CardTitle>
                <p className="text-sm text-muted-foreground">Your latest vacancies with live status and application totals.</p>
              </CardHeader>
              <CardContent>
                {data.recent_job_postings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recent_job_postings.map((job) => (
                        <TableRow key={job.vacancy_id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              {formatJobStatus(job.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{job.location}</TableCell>
                          <TableCell>{job.applications_count}</TableCell>
                          <TableCell className="text-muted-foreground">{formatPostedDate(job.posted_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link to={job.cta_href}>{job.cta_label}</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No job postings yet</p>
                      <p className="text-sm text-muted-foreground">Create your first vacancy and it will appear here as a recent posting.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Top performing jobs</CardTitle>
                <p className="text-sm text-muted-foreground">Ranked by application volume across your recent postings.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformingJobs.length > 0 ? (
                  topPerformingJobs.map((job, index) => (
                    <article key={job.vacancy_id} className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                            <p className="font-semibold">{job.title}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {formatJobStatus(job.status)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Applications</p>
                          <p className="mt-1 text-2xl font-bold tracking-tight">{job.applications_count}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to={job.cta_href}>{job.cta_label}</Link>
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No top performers yet</p>
                      <p className="text-sm text-muted-foreground">Jobs with the strongest application response will appear here.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  )
}
