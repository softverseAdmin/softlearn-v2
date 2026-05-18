import { useMemo, useRef, useState } from 'react'
import { CalendarDays, Clock3, ExternalLink, X } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  formatInterviewDate,
  formatInterviewStatus,
  formatInterviewTime,
  toCalendarDate,
  toDayKey,
  toInterviewDayKey,
} from '../interviewCalendar'
import type { CompanyDashboardResponse } from '../types'

type TooltipPosition = {
  top: number
  left: number
  width: number
  arrowLeft: number
  placement: 'top' | 'bottom'
}

type CompanyDashboardSidebarProps = {
  interviews: CompanyDashboardResponse['interviews']['items']
}

export function CompanyDashboardSidebar({ interviews }: CompanyDashboardSidebarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isInterviewPopoverOpen, setIsInterviewPopoverOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null)
  const calendarContainerRef = useRef<HTMLDivElement | null>(null)

  const interviewDates = useMemo(
    () =>
      interviews
        .filter((interview) => Boolean(interview.scheduled_start))
        .map((interview) => toCalendarDate(interview.scheduled_start as string))
        .filter((date): date is Date => Boolean(date)),
    [interviews]
  )

  const selectedInterviews = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    const selectedKey = toDayKey(selectedDate)
    return interviews.filter((interview) => toInterviewDayKey(interview.scheduled_start) === selectedKey)
  }, [interviews, selectedDate])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
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
                      <p className="font-medium">{selectedDate ? selectedDate.toLocaleDateString() : 'Interview events'}</p>
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
  )
}
