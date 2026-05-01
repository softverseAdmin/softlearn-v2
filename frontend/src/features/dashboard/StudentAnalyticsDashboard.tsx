import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { StudentAnalyticsDashboardData } from './types'

interface StudentAnalyticsDashboardProps {
  userName: string
}

export function StudentAnalyticsDashboard({ userName }: StudentAnalyticsDashboardProps) {
  const [data, setData] = useState<StudentAnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch('/api/v1/student/dashboard-data')
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  // Prepare data for pie chart - learning status
  const learningStatusData = [
    { name: 'Not Started', value: data.learning_status.not_started },
    { name: 'In Progress', value: data.learning_status.in_progress },
    { name: 'Completed', value: data.learning_status.completed },
  ].filter((item) => item.value > 0)

  // Prepare data for pie chart - applications
  const applicationStatusData = [
    { name: 'Submitted', value: data.application_status.submitted },
    { name: 'Under Review', value: data.application_status.under_review },
    { name: 'Shortlisted', value: data.application_status.shortlisted },
    { name: 'Rejected', value: data.application_status.rejected },
  ].filter((item) => item.value > 0)

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">Analytics Dashboard</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, {userName}</h1>
          <p className="max-w-2xl text-base text-gray-600">Your learning and career progress at a glance</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Courses In Progress" value={data.metrics.courses_in_progress} />
        <MetricCard label="Courses Completed" value={data.metrics.courses_completed} />
        <MetricCard label="Exams Attempted" value={data.metrics.exams_attempted} />
        <MetricCard
          label="Average Exam Score"
          value={data.metrics.average_exam_score.toFixed(1)}
          suffix="%"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Applications" value={data.metrics.applications_submitted} />
        <MetricCard label="Accepted" value={data.metrics.applications_accepted} />
        <MetricCard label="Interviews Scheduled" value={data.metrics.interviews_scheduled} />
        <MetricCard label="Total Skills" value={data.metrics.skills_total} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Exam Score History Chart */}
        {data.score_history.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Exam Score Trend</h2>
              <p className="text-sm text-gray-600">Your scores over time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.score_history}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Score']}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Learning Status Pie Chart */}
        {learningStatusData.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Course Status</h2>
              <p className="text-sm text-gray-600">Distribution of your courses</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={learningStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {learningStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Application Status Pie Chart */}
        {applicationStatusData.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
              <p className="text-sm text-gray-600">Breakdown of your applications</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Interview Progress Bar Chart */}
        {(data.metrics.interviews_scheduled > 0 || data.metrics.interviews_completed > 0) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Interview Progress</h2>
              <p className="text-sm text-gray-600">Scheduled vs completed interviews</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: 'Interviews',
                    Scheduled: data.metrics.interviews_scheduled,
                    Completed: data.metrics.interviews_completed,
                  },
                ]}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Scheduled" fill="#3b82f6" />
                <Bar dataKey="Completed" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Upcoming Interviews Section */}
      {data.upcoming_interviews.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
            <p className="text-sm text-gray-600">Your next scheduled interviews</p>
          </div>
          <div className="space-y-3">
            {data.upcoming_interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-start justify-between rounded-lg border border-gray-100 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{interview.company}</p>
                  <p className="text-sm text-gray-600">{interview.purpose}</p>
                  {interview.scheduled_start && (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(interview.scheduled_start).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {interview.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
