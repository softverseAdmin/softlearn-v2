import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { CompanyAnalyticsDashboardData } from './types'

interface CompanyAnalyticsDashboardProps {
  companyName: string
}

export function CompanyAnalyticsDashboard({ companyName }: CompanyAnalyticsDashboardProps) {
  const [data, setData] = useState<CompanyAnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch('/api/v1/company/dashboard-data')
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
        <div className="text-sm text-gray-500">Loading analytics dashboard...</div>
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

  const FUNNEL_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']

  // Prepare daily activity data
  const dailyActivityData = Object.entries(data.daily_activity)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, activity]) => ({
      date,
      Applications: activity.applications,
      Interviews: activity.interviews,
    }))

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">Hiring Analytics</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{companyName} Dashboard</h1>
          <p className="max-w-2xl text-base text-gray-600">Monitor your hiring pipeline and candidate progress</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Open Vacancies" value={data.metrics.open_vacancies} />
        <MetricCard label="Total Applications" value={data.metrics.total_applications} />
        <MetricCard label="Interviews Scheduled" value={data.metrics.interviews_scheduled} />
        <MetricCard label="Offers Made" value={data.metrics.offers_made} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="New Apps (7d)" value={data.metrics.new_applications_7days} />
        <MetricCard
          label="Conversion Rate"
          value={data.metrics.interview_conversion_rate.toFixed(1)}
          suffix="%"
        />
        <MetricCard label="Avg Time to Hire" value={data.metrics.average_time_to_hire_days} suffix=" days" />
        <MetricCard label="Shortlist Ratio" value={data.metrics.shortlist_ratio.toFixed(1)} suffix="%" />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Funnel Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Hiring Funnel</h2>
            <p className="text-sm text-gray-600">Candidates through the pipeline</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart
              margin={{ top: 20, right: 160, bottom: 20, left: 0 }}
            >
              <Tooltip />
              <Funnel
                dataKey="count"
                data={data.funnel_data}
                fill="#3b82f6"
              >
                {data.funnel_data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.funnel_data.map((stage, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stage.stage}</span>
                <span className="font-semibold text-gray-900">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vacancy Performance Chart */}
        {data.vacancy_performance.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Vacancies</h2>
              <p className="text-sm text-gray-600">Applications by position</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.vacancy_performance.slice(0, 8)}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Daily Activity Chart */}
      {dailyActivityData.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Daily Activity</h2>
            <p className="text-sm text-gray-600">Applications and interviews over the past week</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dailyActivityData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Applications"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Interviews"
                stroke="#10b981"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <ActivityCard
          title="Interviews Completed"
          value={data.metrics.recent_interviews_completed}
          description="In the last 7 days"
        />
        <ActivityCard
          title="Candidates Shortlisted"
          value={data.metrics.recent_candidates_shortlisted}
          description="In the last 7 days"
        />
        <ActivityCard
          title="Notes Added"
          value={data.metrics.recent_notes_added}
          description="In the last 7 days"
        />
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
  suffix = '',
}: {
  label: string
  value: string | number
  suffix?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
        {suffix}
      </p>
    </div>
  )
}

function ActivityCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  )
}
