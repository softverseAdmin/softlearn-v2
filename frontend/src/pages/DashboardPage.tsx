import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { AdminDashboardResponse, CompanyDashboardResponse, StudentDashboardResponse } from '../features/dashboard/types'
import { useAuth } from '../auth/useAuth'
import { ApiError, apiRequest } from '../lib/api'

const contentByRole = {
  student: {
    title: 'Student dashboard',
    description: 'Review learning, exams, interviews, privacy, and notification signals in one protected view.',
    links: [
      { title: 'Notifications', href: '/student/notifications' },
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
      { title: 'Course and exam admin', href: '/admin/operations' },
      { title: 'Operational review', href: '/admin/operations' },
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

  function renderStudentDashboard(studentData: StudentDashboardResponse) {
    return (
      <>
        <div className="card-grid">
          <article className="card info-card">
            <h2>Profile readiness</h2>
            <p className="metric">{studentData.metrics.profile_complete ? 'Ready' : 'In progress'}</p>
            <p className="muted">{studentData.metrics.skill_count} skills added</p>
          </article>
          <article className="card info-card">
            <h2>Learning progress</h2>
            <p className="metric">{studentData.metrics.completed_courses}/{studentData.metrics.total_courses}</p>
            <p className="muted">Courses completed</p>
          </article>
          <article className="card info-card">
            <h2>Exam results</h2>
            <p className="metric">{studentData.metrics.passed_results}/{studentData.metrics.total_results}</p>
            <p className="muted">Results passed</p>
          </article>
          <article className="card info-card">
            <h2>Interviews</h2>
            <p className="metric">{studentData.metrics.active_interviews}</p>
            <p className="muted">Active interviews</p>
          </article>
          <article className="card info-card">
            <h2>Notifications</h2>
            <p className="metric">{studentData.metrics.unread_notifications}</p>
            <p className="muted">Unread updates</p>
          </article>
        </div>
        <div className="page-split">
          <div className="card stack-card">
            <h2>Highlights</h2>
            <p className="muted">Average score: {studentData.highlights.average_score ?? 'No results yet'}</p>
            <p className="muted">
              Next interview: {studentData.highlights.next_interview_at ? new Date(studentData.highlights.next_interview_at).toLocaleString() : 'No confirmed interview yet'}
            </p>
            <p className="muted">Exam visibility to companies: {studentData.highlights.share_exam_results ? 'Shared' : 'Private'}</p>
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
              {studentData.recent_interviews.map((interview) => (
                <article key={interview.id} className="skill-card">
                  <div className="skill-card-header">
                    <div>
                      <h3>{interview.purpose}</h3>
                      <p className="muted">{interview.status}</p>
                    </div>
                    <Link className="secondary-button inline-button" to={`/student/interviews/${interview.id}`}>
                      Open
                    </Link>
                  </div>
                </article>
              ))}
              {studentData.recent_interviews.length === 0 ? <p className="muted">No interviews yet.</p> : null}
            </div>
          </div>
          <div className="card stack-card">
            <h2>Recent notifications</h2>
            <div className="stack-list">
              {studentData.recent_notifications.map((notification) => (
                <article key={notification.id} className="skill-card">
                  <h3>{notification.title}</h3>
                  <p className="muted">{notification.message}</p>
                </article>
              ))}
              {studentData.recent_notifications.length === 0 ? <p className="muted">No notifications yet.</p> : null}
            </div>
          </div>
        </div>
      </>
    )
  }

  function renderCompanyDashboard(companyData: CompanyDashboardResponse) {
    return (
      <>
        <div className="card-grid">
          <article className="card info-card">
            <h2>Company profile</h2>
            <p className="metric">{companyData.metrics.profile_complete ? 'Ready' : 'In progress'}</p>
            <p className="muted">{companyData.company_name}</p>
          </article>
          <article className="card info-card">
            <h2>Candidates</h2>
            <p className="metric">{companyData.metrics.candidate_count}</p>
            <p className="muted">Active review contexts</p>
          </article>
          <article className="card info-card">
            <h2>Shortlist</h2>
            <p className="metric">{companyData.metrics.shortlist_count}</p>
            <p className="muted">Shortlisted candidates</p>
          </article>
          <article className="card info-card">
            <h2>Vacancies</h2>
            <p className="metric">{companyData.metrics.vacancy_count}</p>
            <p className="muted">Draft and active roles</p>
          </article>
          <article className="card info-card">
            <h2>Interviews</h2>
            <p className="metric">{companyData.metrics.active_interviews}</p>
            <p className="muted">Active / {companyData.metrics.completed_interviews} completed</p>
          </article>
          <article className="card info-card">
            <h2>Notifications</h2>
            <p className="metric">{companyData.metrics.unread_notifications}</p>
            <p className="muted">Unread updates</p>
          </article>
        </div>
        <div className="page-split">
          <div className="card stack-card">
            <h2>Recent candidates</h2>
            <div className="stack-list">
              {companyData.recent_candidates.map((candidate) => (
                <article key={candidate.candidate_access_id} className="skill-card">
                  <div className="skill-card-header">
                    <div>
                      <h3>{candidate.display_name}</h3>
                      <p className="muted">{candidate.source}</p>
                    </div>
                    <Link className="secondary-button inline-button" to={`/company/candidates/${candidate.candidate_access_id}`}>
                      Open
                    </Link>
                  </div>
                </article>
              ))}
              {companyData.recent_candidates.length === 0 ? <p className="muted">No candidates yet.</p> : null}
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
              {companyData.recent_interviews.map((interview) => (
                <article key={interview.id} className="skill-card">
                  <div className="skill-card-header">
                    <div>
                      <h3>{interview.student_name}</h3>
                      <p className="muted">{interview.status}</p>
                    </div>
                    <Link className="secondary-button inline-button" to={`/company/interviews/${interview.id}`}>
                      Open
                    </Link>
                  </div>
                </article>
              ))}
              {companyData.recent_interviews.length === 0 ? <p className="muted">No interviews yet.</p> : null}
            </div>
          </div>
          <div className="card stack-card">
            <h2>Recent notifications</h2>
            <div className="stack-list">
              {companyData.recent_notifications.map((notification) => (
                <article key={notification.id} className="skill-card">
                  <h3>{notification.title}</h3>
                  <p className="muted">{notification.message}</p>
                </article>
              ))}
              {companyData.recent_notifications.length === 0 ? <p className="muted">No notifications yet.</p> : null}
            </div>
          </div>
        </div>
      </>
    )
  }

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

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{role} area</p>
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
      {!loading && !error && data && role === 'student' ? renderStudentDashboard(data as StudentDashboardResponse) : null}
      {!loading && !error && data && role === 'company' ? renderCompanyDashboard(data as CompanyDashboardResponse) : null}
      {!loading && !error && data && role === 'admin' ? renderAdminDashboard(data as AdminDashboardResponse) : null}
    </section>
  )
}
