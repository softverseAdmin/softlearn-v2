import type { LucideIcon } from 'lucide-react'

import type { CompanyDashboardResponse } from '../types'

export const APPLICATION_STATUS_COLORS = ['#2563eb', '#7c3aed', '#10b981', '#ef4444', '#94a3b8']

export type ApplicationStatusDatum = {
  name: string
  value: number
  color: string
}

export type CompanyDashboardStatCard = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  iconClassName: string
}

export function formatJobStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatPostedDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export function buildApplicationStatusData(data: CompanyDashboardResponse): ApplicationStatusDatum[] {
  return [
    { name: 'Submitted', value: data.application_status.submitted, color: APPLICATION_STATUS_COLORS[0] },
    { name: 'Under review', value: data.application_status.under_review, color: APPLICATION_STATUS_COLORS[1] },
    { name: 'Shortlisted', value: data.application_status.shortlisted, color: APPLICATION_STATUS_COLORS[2] },
    { name: 'Rejected', value: data.application_status.rejected, color: APPLICATION_STATUS_COLORS[3] },
    { name: 'Withdrawn', value: data.application_status.withdrawn, color: APPLICATION_STATUS_COLORS[4] },
  ].filter((item) => item.value > 0)
}

export function getTotalApplications(data: CompanyDashboardResponse) {
  return (
    data.application_status.submitted +
    data.application_status.under_review +
    data.application_status.shortlisted +
    data.application_status.rejected +
    data.application_status.withdrawn
  )
}
