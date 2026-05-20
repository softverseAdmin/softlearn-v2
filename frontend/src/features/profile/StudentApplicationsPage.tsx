import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Sparkles,
  TimerReset,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { StudentApplicationRecord, StudentApplicationsResponse } from './types'
import { LoadingState } from '@/components/LoadingIndicator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
const emptyApplicationsResponse: StudentApplicationsResponse = {
  student_id: 0,
  application_count: 0,
  applications: [],
}

function formatStatusLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getStatusClassName(status: string) {
  switch (status.toLowerCase()) {
    case 'shortlisted':
    case 'accepted':
      return 'border-transparent bg-green-100 text-green-800 hover:bg-green-100'
    case 'rejected':
      return 'border-transparent bg-red-100 text-red-800 hover:bg-red-100'
    case 'interviewed':
    case 'under_review':
      return 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100'
    default:
      return 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100'
  }
}

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTimeLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ApplicationCard({
  application,
  savingId,
  onWithdraw,
}: {
  application: StudentApplicationRecord
  savingId: number | null
  onWithdraw: (application: StudentApplicationRecord) => void
}) {
  return (
    <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <CardContent className="space-y-6 p-0">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_52%,#fdf4ff_100%)] px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-[22px] bg-slate-900 p-3 text-white shadow-sm sm:flex">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusClassName(application.status)}>{formatStatusLabel(application.status)}</Badge>
                  <Badge className="border-transparent bg-slate-100 text-slate-600 hover:bg-slate-100">
                    Application #{application.application_id}
                  </Badge>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">{application.vacancy_title}</h2>
                  <p className="mt-1 text-base font-medium text-slate-600">{application.company_name}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[280px]">
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Submitted</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateLabel(application.submitted_at)}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Last updated</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateLabel(application.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 pb-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Application timeline</p>
              <div className="mt-4 space-y-3">
                {application.history.length > 0 ? (
                  application.history.map((entry) => (
                    <div key={entry.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="mt-0.5 rounded-full bg-white p-2 text-blue-600 shadow-sm">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{formatStatusLabel(entry.to_status)}</p>
                          {entry.actor_name ? (
                            <span className="text-sm text-slate-500">by {entry.actor_name}</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{formatDateTimeLabel(entry.created_at)}</p>
                        {entry.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{entry.note}</p> : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No timeline updates yet. This application is waiting for the next recruiter action.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status summary</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Current stage</p>
                <p className="mt-1 text-sm text-slate-500">{formatStatusLabel(application.status)}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Company</p>
                <p className="mt-1 text-sm text-slate-500">{application.company_name}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Latest update</p>
                <p className="mt-1 text-sm text-slate-500">{formatDateTimeLabel(application.updated_at)}</p>
              </div>
            </div>

            {application.can_withdraw ? (
              <div className="mt-5">
                <Button
                  variant="destructive"
                  className="h-11 w-full rounded-2xl"
                  onClick={() => onWithdraw(application)}
                  disabled={savingId === application.application_id}
                >
                  {savingId === application.application_id ? 'Withdrawing…' : 'Withdraw application'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentApplicationsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentApplicationsResponse>(emptyApplicationsResponse)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadApplications() {
      try {
        const response = await apiRequest<StudentApplicationsResponse>('/student/applications')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load applications.')
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
    const response = await apiRequest<StudentApplicationsResponse>('/student/applications')
    setData(response)
  }

  async function handleWithdraw(application: StudentApplicationRecord) {
    setSavingId(application.application_id)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<StudentApplicationRecord>(`/student/applications/${application.application_id}/withdraw`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      await refreshApplications()
      setSuccess('Application withdrawn successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to withdraw application.')
    } finally {
      setSavingId(null)
    }
  }

  const statusSummary = useMemo(() => {
    const underReview = data.applications.filter((application) =>
      ['submitted', 'under_review'].includes(application.status.toLowerCase())
    ).length
    const shortlisted = data.applications.filter((application) =>
      ['shortlisted', 'interviewed', 'accepted'].includes(application.status.toLowerCase())
    ).length
    const closed = data.applications.filter((application) =>
      ['rejected', 'withdrawn'].includes(application.status.toLowerCase())
    ).length

    return { underReview, shortlisted, closed }
  }, [data.applications])

  const latestApplication = data.applications[0]

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState title="Loading applications" className="min-h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_52%,#fdf4ff_100%)] shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
              <Sparkles className="h-4 w-4" />
              Student applications
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Track every application from one workspace</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Follow recruiter updates, review your current stage, and manage withdrawals without breaking your existing protected workflow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[26px] border border-white bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{data.application_count}</p>
                <p className="mt-1 text-sm text-slate-500">Submitted roles</p>
              </div>
              <div className="rounded-[26px] border border-white bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">In review</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{statusSummary.underReview}</p>
                <p className="mt-1 text-sm text-slate-500">Waiting on recruiter action</p>
              </div>
              <div className="rounded-[26px] border border-white bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Progressing</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{statusSummary.shortlisted}</p>
                <p className="mt-1 text-sm text-slate-500">Shortlisted or interviewed</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white bg-white/95 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Latest activity</p>
            {latestApplication ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-950">{latestApplication.vacancy_title}</p>
                  <p className="mt-1 text-sm text-slate-500">{latestApplication.company_name}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Updated {formatDateTimeLabel(latestApplication.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <TimerReset className="h-4 w-4 text-violet-600" />
                    <span>{formatStatusLabel(latestApplication.status)}</span>
                  </div>
                </div>
                <Button variant="outline" className="h-11 w-full rounded-2xl border-slate-200" asChild>
                  <Link to="/student/jobs">
                    Browse more jobs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No application activity yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load applications</h3>
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

      {data.applications.length === 0 ? (
        <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">No applications yet</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Start from the jobs page and submit your first application to see status updates appear here.
            </p>
            <Button className="mt-6 h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800" asChild>
              <Link to="/student/jobs">
                Explore jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
          {data.applications.map((application) => (
            <motion.div key={application.application_id} variants={itemVariants}>
              <ApplicationCard application={application} savingId={savingId} onWithdraw={(item) => void handleWithdraw(item)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" className="rounded-2xl text-blue-700" asChild>
          <Link to="/student/jobs">
            Return to job discovery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
