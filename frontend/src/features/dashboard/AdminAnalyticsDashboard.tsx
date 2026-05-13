import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AdminAnalyticsDashboardData } from './types'

export function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AdminAnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch('/api/v1/admin/dashboard-data')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const result = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="text-sm text-gray-500">Loading platform analytics...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error || 'No data available'}</div>
      </div>
    )
  }

  // Reverse user growth data for chronological order
  const userGrowthData = [...data.user_growth].reverse()

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">Platform Analytics</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="max-w-2xl text-base text-gray-600">Platform-wide metrics and system health</p>
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Total Students"
          value={data.platform_overview.total_students}
          variant="primary"
        />
        <MetricCard
          label="Total Companies"
          value={data.platform_overview.total_companies}
          variant="success"
        />
        <MetricCard
          label="Total Admins"
          value={data.platform_overview.total_admins}
          variant="warning"
        />
        <MetricCard
          label="Active Users (30d)"
          value={data.platform_overview.active_users_30d}
          variant="info"
        />
        <MetricCard
          label="New Signups (MTD)"
          value={data.platform_overview.new_signups_this_month}
          variant="secondary"
        />
      </div>

      {/* Activity Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActivityMetricCard
          label="Applications (30d)"
          value={data.platform_activity.applications_created_30d}
        />
        <ActivityMetricCard
          label="Interviews Completed (30d)"
          value={data.platform_activity.interviews_completed_30d}
        />
        <ActivityMetricCard
          label="Exams Taken (30d)"
          value={data.platform_activity.exams_taken_30d}
        />
        <ActivityMetricCard
          label="Courses Started (30d)"
          value={data.platform_activity.courses_started_30d}
        />
      </div>

      {/* Content Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <ContentMetricCard
          label="Total Courses"
          value={data.content_metrics.total_courses}
          icon="📚"
        />
        <ContentMetricCard
          label="Total Exams"
          value={data.content_metrics.total_exams}
          icon="✅"
        />
        <ContentMetricCard
          label="Total Vacancies"
          value={data.content_metrics.total_vacancies}
          icon="💼"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        {userGrowthData.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
              <p className="text-sm text-gray-600">New users per month (last 12 months)</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={userGrowthData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [value, 'Users']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Platform Activity Comparison */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Platform Activity (30d)</h2>
            <p className="text-sm text-gray-600">Key activities on the platform</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  activity: 'Applications',
                  count: data.platform_activity.applications_created_30d,
                },
                {
                  activity: 'Interviews',
                  count: data.platform_activity.interviews_completed_30d,
                },
                {
                  activity: 'Exams',
                  count: data.platform_activity.exams_taken_30d,
                },
                {
                  activity: 'Courses',
                  count: data.platform_activity.courses_started_30d,
                },
              ]}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="activity"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Platform Summary</h2>
          <p className="text-sm text-gray-600">Key statistics and insights</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryItem
            label="Avg Users/Month"
            value={Math.round(
              userGrowthData.reduce((sum, item) => sum + item.users, 0) / userGrowthData.length
            )}
          />
          <SummaryItem
            label="Avg Daily Apps"
            value={Math.round(data.platform_activity.applications_created_30d / 30)}
          />
          <SummaryItem
            label="Avg Daily Interviews"
            value={Math.round(data.platform_activity.interviews_completed_30d / 30)}
          />
          <SummaryItem
            label="Avg Daily Exams"
            value={Math.round(data.platform_activity.exams_taken_30d / 30)}
          />
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {new Date(data.last_updated).toLocaleString()}
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  variant = 'default',
}: {
  label: string
  value: number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'secondary'
}) {
  const bgColors = {
    default: 'bg-white',
    primary: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-amber-50',
    info: 'bg-cyan-50',
    secondary: 'bg-purple-50',
  }

  const textColors = {
    default: 'text-gray-900',
    primary: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-amber-900',
    info: 'text-cyan-900',
    secondary: 'text-purple-900',
  }

  const labelColors = {
    default: 'text-gray-600',
    primary: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-amber-700',
    info: 'text-cyan-700',
    secondary: 'text-purple-700',
  }

  return (
    <div className={`rounded-2xl border border-gray-200 p-6 shadow-sm ${bgColors[variant]}`}>
      <p className={`text-sm ${labelColors[variant]}`}>{label}</p>
      <p className={`mt-2 text-2xl font-bold ${textColors[variant]}`}>{value}</p>
    </div>
  )
}

function ActivityMetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ContentMetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-100 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
