import { useEffect, useState } from 'react'

import type { AdminDashboardResponse, StudentDashboardResponse } from '../features/dashboard/types'
import { StudentDashboard } from '../features/dashboard/StudentDashboard'
import { useAuth } from '../auth/useAuth'
import { ApiError, apiRequest } from '../lib/api'

const contentByRole = {
  student: {
    title: 'Student dashboard',
    description: 'Review learning, exams, interviews, privacy, and notification signals in one protected view.',
  },
  company: {
    title: 'Company dashboard',
    description: 'Review hiring activity, candidate flow, interviews, and notification signals for your company.',
  },
  admin: {
    title: 'Admin dashboard',
    description: 'Review protected platform activity and high-level operational counts without browsing raw data.',
  },
} as const

type DashboardPageProps = {
  role: keyof typeof contentByRole
}

function dashboardPathByRole(role: DashboardPageProps['role']) {
  return `/${role}/dashboard`
}

export function DashboardPage({ role }: DashboardPageProps) {
  const { user } = useAuth()
  const content = contentByRole[role]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StudentDashboardResponse | AdminDashboardResponse | null>(null)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        if (role === 'student' || role === 'company') {
          if (active) {
            setLoading(false)
          }
          return
        }

        const response = await apiRequest<AdminDashboardResponse>(dashboardPathByRole(role))
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load dashboard.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [role])

  function renderAdminDashboard(adminData: AdminDashboardResponse) {
    return (
      <>
        <div className="card-grid">
          <article className="card info-card">
            <h2>Users</h2>
            <p className="metric">{adminData.system_stats.total_users}</p>
            <p className="muted">{adminData.system_stats.active_students} active students</p>
          </article>
          <article className="card info-card">
            <h2>Companies</h2>
            <p className="metric">{adminData.system_stats.companies}</p>
            <p className="muted">Registered company contexts</p>
          </article>
          <article className="card info-card">
            <h2>Revenue</h2>
            <p className="metric">{adminData.system_stats.revenue_label}</p>
            <p className="muted">{adminData.system_stats.revenue_description}</p>
          </article>
        </div>
        <div className="page-split">
          <div className="card stack-card">
            <h2>Recent activity</h2>
            <div className="stack-list">
              {adminData.recent_activity.map((item) => (
                <article key={item.id} className="skill-card">
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                  <p className="muted">{new Date(item.timestamp).toLocaleString()}</p>
                </article>
              ))}
              {adminData.recent_activity.length === 0 ? <p className="muted">No recent activity.</p> : null}
            </div>
          </div>
        </div>
        <div className="card stack-card">
          <h2>System status</h2>
          <div className="stack-list">
            {adminData.system_status.map((item) => (
              <article key={item.id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{item.label}</h3>
                    <p className="muted">{item.description}</p>
                  </div>
                  <span className={`status-pill ${item.tone === 'warning' ? 'status-muted' : 'status-success'}`}>
                    {item.value}
                  </span>
                </div>
              </article>
            ))}
            {adminData.system_status.length === 0 ? <p className="muted">No system status items.</p> : null}
          </div>
        </div>
      </>
    )
  }

  if (role === 'student') {
    return <StudentDashboard userName={user?.name ?? 'Student'} />
  }

  if (role === 'company') {
    return null
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{role} workspace</p>
          <h1>{content.title}</h1>
          <p className="lead">{content.description}</p>
        </div>
        <div className="card compact-card">
          <strong>Session status</strong>
          <p className="muted">{user?.email}</p>
          <p className="muted">Role: {user?.role}</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {loading ? <div className="card">Loading dashboard…</div> : null}
      {!loading && !error && data && role === 'admin' ? renderAdminDashboard(data as AdminDashboardResponse) : null}
    </section>
  )
}
