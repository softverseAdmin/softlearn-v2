import { Link } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'

const contentByRole = {
  student: {
    title: 'Student dashboard',
    description: 'This area will host profile, learning, exams, jobs, applications, interviews, and privacy workflows.',
    cards: [
      { title: 'Profile and resume', href: '/student/profile' },
      { title: 'Skills profile', href: '/student/skills' },
      { title: 'Learning progress', href: '/student/learning' },
      { title: 'Exam history', href: '/student/exams' },
      { title: 'Privacy controls', href: '/student/privacy' },
    ],
  },
  company: {
    title: 'Company dashboard',
    description: 'This area will host company profile, vacancies, candidate review, interviews, and notifications.',
    cards: [
      { title: 'Company profile', href: '/company/profile' },
      { title: 'Vacancy management', href: '/company/vacancies' },
      { title: 'Candidate review', href: '/company/candidates' },
      { title: 'Shortlisted candidates', href: '/company/shortlist' },
    ],
  },
  admin: {
    title: 'Admin dashboard',
    description: 'This area will host protected operational oversight, user management, and platform administration.',
    cards: [
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

export function DashboardPage({ role }: DashboardPageProps) {
  const { user } = useAuth()
  const content = contentByRole[role]

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
      <div className="card-grid">
        {content.cards.map((item) => (
          <article key={item.title} className="card info-card">
            <h2>{item.title}</h2>
            <p>Placeholder route group ready for the next feature implementation slice.</p>
            <Link className="secondary-button inline-button" to={item.href}>
              Open
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
