import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { AdminDashboardResponse, CompanyDashboardResponse, StudentDashboardResponse } from '../features/dashboard/types'
import { CompanyDashboardRedesign } from '../features/dashboard/CompanyDashboardRedesign'
import { StudentDashboardRedesign } from '../features/dashboard/StudentDashboardRedesign'
import { useAuth } from '../auth/useAuth'
import { ApiError, apiRequest } from '../lib/api'

const contentByRole = {
  student: {
    title: 'Student dashboard',
    description: 'Review learning, exams, interviews, privacy, and notification signals in one protected view.',
    links: [
      { title: 'Notifications', href: '/student/notifications' },
      { title: 'Jobs', href: '/student/jobs' },
      { title: 'Profile and resume', href: '/student/profile' },
      { title: 'Skills profile', href: '/student/skills' },
      { title: 'Learning progress', href: '/student/learning' },
      { title: 'Exam history', href: '/student/exams' },
      { title: 'Interview schedule', href: '/student/interviews' },
      { title: 'Privacy controls', href: '/student/privacy' },
    ],
  },
  company: {
    title: 'Company dashboard',
    description: 'Review hiring activity, candidate flow, interviews, and notification signals for your company.',
    links: [
      { title: 'Notifications', href: '/company/notifications' },
      { title: 'Company profile', href: '/company/profile' },
      { title: 'Vacancy management', href: '/company/vacancies' },
      { title: 'Candidate review', href: '/company/candidates' },
      { title: 'Interview workflow', href: '/company/interviews' },
      { title: 'Shortlisted candidates', href: '/company/shortlist' },
    ],
  },
  admin: {
    title: 'Admin dashboard',
    description: 'Review protected platform activity and high-level operational counts without browsing raw data.',
    links: [
      { title: 'Notifications', href: '/admin/notifications' },
      { title: 'User management', href: '/admin/users' },
      { title: 'Company management', href: '/admin/operations' },
      { title: 'Vacancy management', href: '/admin/vacancies' },
    ],
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
  const [data, setData] = useState<StudentDashboardResponse | CompanyDashboardResponse | AdminDashboardResponse | null>(null)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        if (role === 'student') {
          const response = await apiRequest<StudentDashboardResponse>(dashboardPathByRole(role))
          if (active) {
            setData(response)
          }
          return
        }

        if (role === 'company') {
          const response = await apiRequest<CompanyDashboardResponse>(dashboardPathByRole(role))
          if (active) {
            setData(response)
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
            <p className="metric">{adminData.metrics.total_users}</p>
            <p className="muted">{adminData.metrics.students} students / {adminData.metrics.company_users} company / {adminData.metrics.admins} admins</p>
          </article>
          <article className="card info-card">
            <h2>Companies</h2>
            <p className="metric">{adminData.metrics.companies}</p>
            <p className="muted">Registered company contexts</p>
          </article>
          <article className="card info-card">
            <h2>Vacancies</h2>
            <p className="metric">{adminData.metrics.active_vacancies}</p>
            <p className="muted">Active company roles</p>
          </article>
          <article className="card info-card">
            <h2>Interviews</h2>
            <p className="metric">{adminData.metrics.total_interviews}</p>
            <p className="muted">{adminData.metrics.active_interviews} active / {adminData.metrics.completed_interviews} completed</p>
          </article>
          <article className="card info-card">
            <h2>Cancelled interviews</h2>
            <p className="metric">{adminData.metrics.cancelled_interviews}</p>
            <p className="muted">Terminal cancellations</p>
          </article>
          <article className="card info-card">
            <h2>Notifications</h2>
            <p className="metric">{adminData.metrics.unread_notifications}</p>
            <p className="muted">Unread admin updates</p>
          </article>
        </div>
        <div className="page-split">
          <div className="card stack-card">
            <h2>Recent users</h2>
            <div className="stack-list">
              {adminData.recent_users.map((recentUser) => (
                <article key={recentUser.user_id} className="skill-card">
                  <h3>{recentUser.name}</h3>
                  <p className="muted">{recentUser.email} · {recentUser.role}</p>
                </article>
              ))}
              {adminData.recent_users.length === 0 ? <p className="muted">No recent users.</p> : null}
            </div>
          </div>
          <div className="card stack-card">
            <h2>Quick links</h2>
            {content.links.map((item) => (
              <Link key={item.href} className="secondary-button inline-button" to={item.href}>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="page-split">
          <div className="card stack-card">
            <h2>Recent interviews</h2>
            <div className="stack-list">
              {adminData.recent_interviews.map((interview) => (
                <article key={interview.id} className="skill-card">
                  <h3>{interview.company_name} - {interview.student_name}</h3>
                  <p className="muted">{interview.status}</p>
                </article>
              ))}
              {adminData.recent_interviews.length === 0 ? <p className="muted">No recent interviews.</p> : null}
            </div>
          </div>
          <div className="card stack-card">
            <h2>Recent notifications</h2>
            <div className="stack-list">
              {adminData.recent_notifications.map((notification) => (
                <article key={notification.id} className="skill-card">
                  <h3>{notification.title}</h3>
                  <p className="muted">{notification.message}</p>
                </article>
              ))}
              {adminData.recent_notifications.length === 0 ? <p className="muted">No notifications yet.</p> : null}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (role === 'student') {
    return (
      <StudentDashboardRedesign
        userName={user?.name ?? 'Student'}
        loading={loading}
        error={error}
        data={(data as StudentDashboardResponse | null) ?? null}
      />
    )
  }

  if (role === 'company') {
    return (
      <CompanyDashboardRedesign
        companyName={user?.name ?? 'Company'}
        loading={loading}
        error={error}
        data={(data as CompanyDashboardResponse | null) ?? null}
      />
    )
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
