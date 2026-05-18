import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Link2,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { InterviewDetail } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const emptyInterview: InterviewDetail = {
  id: 0,
  candidate_access_id: 0,
  student_id: 0,
  student_name: '',
  company_id: 0,
  purpose: '',
  role_context: '',
  status: 'requested',
  scheduled_start: null,
  scheduled_end: null,
  confirmed_at: null,
  cancelled_at: null,
  completed_at: null,
  meeting_provider: null,
  meeting_url: null,
  created_at: '',
  updated_at: '',
  availabilities: [],
  history: [],
}

function toInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
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

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function formatDateRange(start: string | null, end: string | null) {
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
    full: `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`,
  }
}

type InterviewFormErrors = Partial<
  Record<
    | 'selectedAvailabilityId'
    | 'startAt'
    | 'endAt'
    | 'meetingUrl'
    | 'rescheduleReason'
    | 'cancelReason'
    | 'completionSummary',
    string
  >
>

export function CompanyInterviewDetailPage() {
  const { csrfToken } = useAuth()
  const params = useParams<{ interviewId: string }>()
  const [interview, setInterview] = useState<InterviewDetail>(emptyInterview)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState('')
  const [startAt, setStartAt] = useState(toInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
  const [endAt, setEndAt] = useState(toInputValue(new Date(Date.now() + 25 * 60 * 60 * 1000)))
  const [note, setNote] = useState('')
  const [meetingProvider, setMeetingProvider] = useState('custom')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [completionSummary, setCompletionSummary] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<InterviewFormErrors>({})

  function clearFormError(...keys: Array<keyof InterviewFormErrors>) {
    setFormErrors((current) => {
      const next = { ...current }
      for (const key of keys) {
        delete next[key]
      }
      return next
    })
  }

  function validateAvailabilityForm() {
    const nextErrors: InterviewFormErrors = {}
    const startDate = new Date(startAt)
    const endDate = new Date(endAt)

    if (Number.isNaN(startDate.getTime())) {
      nextErrors.startAt = 'Choose a valid availability start date and time.'
    }
    if (Number.isNaN(endDate.getTime())) {
      nextErrors.endAt = 'Choose a valid availability end date and time.'
    }
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate <= startDate) {
      nextErrors.endAt = 'Availability end must be later than the start time.'
    }

    return nextErrors
  }

  function validateConfirmForm() {
    const nextErrors: InterviewFormErrors = {}
    if (!selectedAvailabilityId) {
      nextErrors.selectedAvailabilityId = 'Select an availability slot to confirm.'
    }
    return nextErrors
  }

  function validateMeetingLinkForm() {
    const nextErrors: InterviewFormErrors = {}
    const trimmedMeetingUrl = meetingUrl.trim()
    if (!trimmedMeetingUrl) {
      nextErrors.meetingUrl = 'Meeting URL is required.'
      return nextErrors
    }

    try {
      const parsed = new URL(trimmedMeetingUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        nextErrors.meetingUrl = 'Meeting URL must start with http:// or https://.'
      }
    } catch {
      nextErrors.meetingUrl = 'Enter a valid meeting URL.'
    }

    return nextErrors
  }

  function validateReason(value: string, key: 'rescheduleReason' | 'cancelReason') {
    const nextErrors: InterviewFormErrors = {}
    if (!value.trim()) {
      nextErrors[key] = 'This reason is required.'
    }
    return nextErrors
  }

  function validateCompletionForm() {
    const nextErrors: InterviewFormErrors = {}
    if (!completionSummary.trim()) {
      nextErrors.completionSummary = 'Completion summary is required.'
    }
    return nextErrors
  }

  useEffect(() => {
    let active = true

    async function loadInterview() {
      if (!params.interviewId) {
        setError('Interview context is missing.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}`)
        if (active) {
          setInterview(response)
          setMeetingProvider(response.meeting_provider ?? 'custom')
          setMeetingUrl(response.meeting_url ?? '')
          setSelectedAvailabilityId(response.availabilities.length > 0 ? String(response.availabilities[0].id) : '')
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load interview.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInterview()
    return () => {
      active = false
    }
  }, [params.interviewId])

  async function handleSubmitAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    const nextErrors = validateAvailabilityForm()
    setFormErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) {
      setError('Fix the highlighted availability fields and try again.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
        const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/availability`, {
          method: 'POST',
          body: {
            start_at: new Date(startAt).toISOString(),
            end_at: new Date(endAt).toISOString(),
            note: note.trim(),
          },
          csrfToken,
        })
      setInterview(response)
      setNote('')
      setSelectedAvailabilityId(response.availabilities.length > 0 ? String(response.availabilities[0].id) : '')
      setSuccess('Availability submitted successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit availability.')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    const nextErrors = validateConfirmForm()
    setFormErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) {
      setError('Select an availability slot before confirming the interview.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/company/interviews/${params.interviewId}/confirm`, {
        method: 'POST',
        body: {
          availability_id: Number(selectedAvailabilityId),
        },
        csrfToken,
      })
      setInterview(response)
      setSuccess('Interview confirmed successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to confirm interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    const nextErrors = validateReason(rescheduleReason, 'rescheduleReason')
    setFormErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) {
      setError('Provide a reschedule reason before submitting.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
        const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/reschedule`, {
          method: 'POST',
          body: { reason: rescheduleReason.trim() },
          csrfToken,
        })
      setInterview(response)
      setRescheduleReason('')
      setSuccess('Interview moved to rescheduled state.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to reschedule interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    const nextErrors = validateReason(cancelReason, 'cancelReason')
    setFormErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) {
      setError('Provide a cancellation reason before submitting.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
        const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/cancel`, {
          method: 'POST',
          body: { reason: cancelReason.trim() },
          csrfToken,
        })
      setInterview(response)
      setCancelReason('')
      setSuccess('Interview cancelled successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to cancel interview.')
    } finally {
      setSaving(false)
    }
  }

  async function handleMeetingLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    const nextErrors = validateMeetingLinkForm()
    setFormErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) {
      setError('Fix the meeting link fields and try again.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/meeting-link`, {
        method: 'PUT',
        body: {
          meeting_provider: meetingProvider,
          meeting_url: meetingUrl.trim(),
        },
        csrfToken,
      })
      setInterview(response)
      setSuccess('Meeting link updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update meeting link.')
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!params.interviewId) {
      return
    }

    const nextErrors = validateCompletionForm()
    setFormErrors((current) => ({ ...current, ...nextErrors }))
    if (Object.keys(nextErrors).length > 0) {
      setError('Add a completion summary before submitting.')
      setSuccess(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiRequest<InterviewDetail>(`/interviews/${params.interviewId}/complete`, {
        method: 'POST',
        body: { summary: completionSummary.trim() },
        csrfToken,
      })
      setInterview(response)
      setCompletionSummary('')
      setSuccess('Interview marked as completed.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to complete interview.')
    } finally {
      setSaving(false)
    }
  }

  const schedule = useMemo(
    () => formatDateRange(interview.scheduled_start, interview.scheduled_end),
    [interview.scheduled_end, interview.scheduled_start]
  )
  const canConfirm = interview.availabilities.length > 0 && ['requested', 'rescheduled'].includes(interview.status)
  const canShareMeetingLink = ['confirmed', 'rescheduled'].includes(interview.status)
  const canEditWorkflow = !['cancelled', 'completed'].includes(interview.status)
  const canComplete = interview.status === 'confirmed'

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-10 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[26px] border border-border bg-muted/20" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-[28px] border border-border bg-muted/20" />
            <div className="h-72 animate-pulse rounded-[28px] border border-border bg-muted/20" />
          </div>
          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-[28px] border border-border bg-muted/20" />
            <div className="h-64 animate-pulse rounded-[28px] border border-border bg-muted/20" />
          </div>
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
        <Link to="/company/interviews" className="transition-colors hover:text-foreground">
          Interviews
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{interview.student_name || 'Interview detail'}</span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company interviews</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{interview.student_name || 'Interview detail'}</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            {interview.purpose || 'Review availability, confirm a final slot, and keep the interview workflow on track.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge className={getStatusBadgeClassName(interview.status)}>{formatStatusLabel(interview.status)}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/company/interviews">Back to interviews</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6" role="alert">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to update interview workflow</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {success ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-start gap-3 pt-6" role="status">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Interview updated</h3>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatStatusLabel(interview.status)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Current interview workflow stage</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Schedule</p>
          <p className="mt-2 text-lg font-bold text-foreground">{schedule ? schedule.date : 'Pending'}</p>
          <p className="mt-1 text-sm text-muted-foreground">{schedule ? schedule.time : 'No confirmed slot yet'}</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Availability</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{interview.availabilities.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Submitted slots ready to review</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">History</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{interview.history.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Recorded workflow events and updates</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <Card className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-4 border-b pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Interview overview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Review the current candidate context, schedule state, and meeting access in one place.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Candidate</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{interview.student_name || 'Unknown candidate'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Purpose</p>
                  <p className="mt-3 text-sm leading-6 text-foreground">{interview.purpose || 'No purpose recorded yet.'}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Role context</p>
                  <p className="mt-3 text-sm leading-6 text-foreground">{interview.role_context || 'General interview context'}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4">
                  <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Confirmed schedule</p>
                    <p className="text-sm text-muted-foreground">{schedule ? schedule.full : 'No confirmed schedule yet.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4">
                  <Link2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Meeting access</p>
                    {interview.meeting_url ? (
                      <a
                        href={interview.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        {interview.meeting_provider ? formatStatusLabel(interview.meeting_provider) : 'Open meeting link'}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Meeting link has not been assigned yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Created</p>
                    <p className="text-sm text-muted-foreground">{formatTimestamp(interview.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <RotateCcw className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Updated</p>
                    <p className="text-sm text-muted-foreground">{formatTimestamp(interview.updated_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <UserRound className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Candidate access</p>
                    <p className="text-sm text-muted-foreground">
                      {interview.candidate_access_id ? `Preview #${interview.candidate_access_id}` : 'Not linked'}
                    </p>
                  </div>
                </div>
              </div>

              {(interview.completed_at || interview.cancelled_at || interview.confirmed_at) ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {interview.confirmed_at ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950">
                      <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">Confirmed</p>
                      <p className="mt-1 text-sm text-sky-800 dark:text-sky-200">{formatTimestamp(interview.confirmed_at)}</p>
                    </div>
                  ) : null}
                  {interview.completed_at ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100">Completed</p>
                      <p className="mt-1 text-sm text-green-800 dark:text-green-200">{formatTimestamp(interview.completed_at)}</p>
                    </div>
                  ) : null}
                  {interview.cancelled_at ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100">Cancelled</p>
                      <p className="mt-1 text-sm text-red-800 dark:text-red-200">{formatTimestamp(interview.cancelled_at)}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-2 border-b pb-4">
              <CardTitle className="text-xl">Availability timeline</CardTitle>
              <p className="text-sm text-muted-foreground">Compare submitted time slots before confirming one final schedule.</p>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {interview.availabilities.length > 0 ? (
                interview.availabilities.map((availability) => {
                  const availabilityRange = formatDateRange(availability.start_at, availability.end_at)
                  const isSelected = selectedAvailabilityId === String(availability.id)

                  return (
                    <div
                      key={availability.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        isSelected
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/70 bg-background'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{availability.submitted_by_name}</p>
                          <p className="text-sm text-muted-foreground">{formatStatusLabel(availability.submitted_by_role)}</p>
                        </div>
                        <Badge variant="outline">{formatTimestamp(availability.created_at)}</Badge>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{availabilityRange ? availabilityRange.date : 'Date unavailable'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Clock3 className="h-4 w-4 text-muted-foreground" />
                            <span>{availabilityRange ? availabilityRange.time : formatTimestamp(availability.start_at)}</span>
                          </div>
                        </div>

                        {canConfirm ? (
                          <Button
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedAvailabilityId(String(availability.id))}
                          >
                            {isSelected ? 'Selected slot' : 'Select slot'}
                          </Button>
                        ) : null}
                      </div>

                      {availability.note ? (
                        <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                          {availability.note}
                        </div>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
                  <ShieldCheck className="mx-auto h-6 w-6 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No availability entries yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Company or candidate availability will appear here once someone proposes slots.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-2 border-b pb-4">
              <CardTitle className="text-xl">History</CardTitle>
              <p className="text-sm text-muted-foreground">Track changes, system events, and manual workflow actions for this interview.</p>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {interview.history.length > 0 ? (
                interview.history.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{formatStatusLabel(event.event_type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.actor_name ? `${event.actor_name} · ${event.actor_role}` : 'System'}
                        </p>
                      </div>
                      <Badge variant="outline">{formatTimestamp(event.created_at)}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{event.description}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
                  <Video className="mx-auto h-6 w-6 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No history yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Workflow events will appear here as the interview progresses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-2 border-b pb-4">
              <CardTitle className="text-xl">Confirm schedule</CardTitle>
              <p className="text-sm text-muted-foreground">Choose one submitted slot and lock in the final interview time.</p>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <form className="space-y-4" onSubmit={handleConfirm} noValidate>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="company-interview-confirm-slot">
                    Availability to confirm
                  </label>
                  <select
                    id="company-interview-confirm-slot"
                    value={selectedAvailabilityId}
                    onChange={(event) => {
                      setSelectedAvailabilityId(event.target.value)
                      clearFormError('selectedAvailabilityId')
                      setError(null)
                    }}
                    className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
                    aria-invalid={formErrors.selectedAvailabilityId ? 'true' : undefined}
                    aria-describedby={formErrors.selectedAvailabilityId ? 'company-interview-confirm-slot-error' : undefined}
                  >
                    <option value="">Select a slot</option>
                    {interview.availabilities.map((availability) => (
                      <option key={availability.id} value={availability.id}>
                        {availability.submitted_by_name}: {formatDateRange(availability.start_at, availability.end_at)?.full ?? formatTimestamp(availability.start_at)}
                      </option>
                    ))}
                  </select>
                  {formErrors.selectedAvailabilityId ? (
                    <p id="company-interview-confirm-slot-error" className="text-sm text-red-600" role="alert">
                      {formErrors.selectedAvailabilityId}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full" disabled={saving || !canConfirm || !selectedAvailabilityId}>
                  {saving ? 'Saving…' : 'Confirm schedule'}
                </Button>
              </form>

              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                {canConfirm
                  ? 'You can confirm any currently submitted availability slot.'
                  : 'Schedule confirmation is available only while the interview is requested or rescheduled.'}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-2 border-b pb-4">
              <CardTitle className="text-xl">Meeting and workflow actions</CardTitle>
              <p className="text-sm text-muted-foreground">Share meeting access, request a reschedule, cancel the interview, or mark it complete.</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <form className="space-y-4" onSubmit={handleMeetingLink} noValidate>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="company-interview-meeting-provider">
                    Meeting provider
                  </label>
                  <select
                    id="company-interview-meeting-provider"
                    value={meetingProvider}
                    onChange={(event) => {
                      setMeetingProvider(event.target.value)
                      setError(null)
                    }}
                    className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="company-interview-meeting-url">
                    Meeting URL
                  </label>
                  <Input
                    id="company-interview-meeting-url"
                    value={meetingUrl}
                    onChange={(event) => {
                      setMeetingUrl(event.target.value)
                      clearFormError('meetingUrl')
                      setError(null)
                    }}
                    placeholder="https://..."
                    aria-invalid={formErrors.meetingUrl ? 'true' : undefined}
                    aria-describedby={formErrors.meetingUrl ? 'company-interview-meeting-url-error' : undefined}
                  />
                  {formErrors.meetingUrl ? (
                    <p id="company-interview-meeting-url-error" className="text-sm text-red-600" role="alert">
                      {formErrors.meetingUrl}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" variant="outline" className="w-full" disabled={saving || !canShareMeetingLink}>
                  {saving ? 'Saving…' : 'Save meeting link'}
                </Button>
              </form>

              <div className="space-y-4 border-t border-border pt-6">
                <form className="space-y-4" onSubmit={handleReschedule} noValidate>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="company-interview-reschedule-reason">
                      Reschedule reason
                    </label>
                    <Textarea
                      id="company-interview-reschedule-reason"
                      value={rescheduleReason}
                      onChange={(event) => {
                        setRescheduleReason(event.target.value)
                        clearFormError('rescheduleReason')
                        setError(null)
                      }}
                      rows={3}
                      placeholder="Explain why the interview needs a new time."
                      aria-invalid={formErrors.rescheduleReason ? 'true' : undefined}
                      aria-describedby={formErrors.rescheduleReason ? 'company-interview-reschedule-reason-error' : undefined}
                    />
                    {formErrors.rescheduleReason ? (
                      <p id="company-interview-reschedule-reason-error" className="text-sm text-red-600" role="alert">
                        {formErrors.rescheduleReason}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" variant="outline" className="w-full" disabled={saving || !canEditWorkflow}>
                    {saving ? 'Saving…' : 'Request reschedule'}
                  </Button>
                </form>

                <form className="space-y-4 border-t border-border pt-6" onSubmit={handleCancel} noValidate>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="company-interview-cancel-reason">
                      Cancellation reason
                    </label>
                    <Textarea
                      id="company-interview-cancel-reason"
                      value={cancelReason}
                      onChange={(event) => {
                        setCancelReason(event.target.value)
                        clearFormError('cancelReason')
                        setError(null)
                      }}
                      rows={3}
                      placeholder="Explain why this interview is being cancelled."
                      aria-invalid={formErrors.cancelReason ? 'true' : undefined}
                      aria-describedby={formErrors.cancelReason ? 'company-interview-cancel-reason-error' : undefined}
                    />
                    {formErrors.cancelReason ? (
                      <p id="company-interview-cancel-reason-error" className="text-sm text-red-600" role="alert">
                        {formErrors.cancelReason}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" variant="destructive" className="w-full" disabled={saving || !canEditWorkflow}>
                    {saving ? 'Saving…' : 'Cancel interview'}
                  </Button>
                </form>

                <form className="space-y-4 border-t border-border pt-6" onSubmit={handleComplete} noValidate>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="company-interview-completion-summary">
                      Completion summary
                    </label>
                    <Textarea
                      id="company-interview-completion-summary"
                      value={completionSummary}
                      onChange={(event) => {
                        setCompletionSummary(event.target.value)
                        clearFormError('completionSummary')
                        setError(null)
                      }}
                      rows={3}
                      placeholder="Capture the outcome of the interview."
                      aria-invalid={formErrors.completionSummary ? 'true' : undefined}
                      aria-describedby={formErrors.completionSummary ? 'company-interview-completion-summary-error' : undefined}
                    />
                    {formErrors.completionSummary ? (
                      <p id="company-interview-completion-summary-error" className="text-sm text-red-600" role="alert">
                        {formErrors.completionSummary}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" className="w-full" disabled={saving || !canComplete}>
                    {saving ? 'Saving…' : 'Mark interview complete'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-2 border-b pb-4">
              <CardTitle className="text-xl">Add company availability</CardTitle>
              <p className="text-sm text-muted-foreground">Propose one more time slot when you need to push the conversation forward.</p>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmitAvailability} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="company-interview-availability-start">
                      Availability start
                    </label>
                    <Input
                      id="company-interview-availability-start"
                      type="datetime-local"
                      value={startAt}
                      onChange={(event) => {
                        setStartAt(event.target.value)
                        clearFormError('startAt', 'endAt')
                        setError(null)
                      }}
                      aria-invalid={formErrors.startAt ? 'true' : undefined}
                      aria-describedby={formErrors.startAt ? 'company-interview-availability-start-error' : undefined}
                    />
                    {formErrors.startAt ? (
                      <p id="company-interview-availability-start-error" className="text-sm text-red-600" role="alert">
                        {formErrors.startAt}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="company-interview-availability-end">
                      Availability end
                    </label>
                    <Input
                      id="company-interview-availability-end"
                      type="datetime-local"
                      value={endAt}
                      onChange={(event) => {
                        setEndAt(event.target.value)
                        clearFormError('endAt')
                        setError(null)
                      }}
                      aria-invalid={formErrors.endAt ? 'true' : undefined}
                      aria-describedby={formErrors.endAt ? 'company-interview-availability-end-error' : undefined}
                    />
                    {formErrors.endAt ? (
                      <p id="company-interview-availability-end-error" className="text-sm text-red-600" role="alert">
                        {formErrors.endAt}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="company-interview-availability-note">
                    Note
                  </label>
                  <Textarea
                    id="company-interview-availability-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Optional scheduling context."
                  />
                </div>

                <Button type="submit" variant="outline" className="w-full" disabled={saving || !canConfirm}>
                  {saving ? 'Saving…' : 'Submit company availability'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
