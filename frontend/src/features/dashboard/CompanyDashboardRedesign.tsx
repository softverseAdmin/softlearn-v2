import { useMemo } from 'react'
import { BriefcaseBusiness, CalendarDays, CheckCircle2, Search, UserRoundCheck } from 'lucide-react'

import { LoadingState } from '@/components/LoadingIndicator'
import { Card, CardContent } from '@/components/ui/card'

import type { CompanyDashboardResponse } from './types'
import { CompanyDashboardOverview } from './company-dashboard/CompanyDashboardOverview'
import { CompanyDashboardSidebar } from './company-dashboard/CompanyDashboardSidebar'
import {
  buildApplicationStatusData,
  getTotalApplications,
  type CompanyDashboardStatCard,
} from './company-dashboard/shared'

type CompanyDashboardRedesignProps = {
  loading: boolean
  error: string | null
  data: CompanyDashboardResponse | null
}

export function CompanyDashboardRedesign({ loading, error, data }: CompanyDashboardRedesignProps) {
  const statCards = useMemo<CompanyDashboardStatCard[]>(() => {
    if (!data) {
      return []
    }

    return [
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
  }, [data])

  const applicationStatusData = useMemo(() => {
    if (!data) {
      return []
    }

    return buildApplicationStatusData(data)
  }, [data])

  const totalApplications = useMemo(() => {
    if (!data) {
      return 0
    }

    return getTotalApplications(data)
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

  return (
    <section className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="font-semibold text-red-900 dark:text-red-100">Dashboard temporarily unavailable</p>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <LoadingState title="Loading your hiring workspace" className="min-h-28" />
          </CardContent>
        </Card>
      ) : null}

      {!loading && data ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-start">
          <CompanyDashboardOverview
            data={data}
            statCards={statCards}
            applicationStatusData={applicationStatusData}
            totalApplications={totalApplications}
            topPerformingJobs={topPerformingJobs}
          />
          <CompanyDashboardSidebar interviews={data.interviews.items} />
        </div>
      ) : null}
    </section>
  )
}
