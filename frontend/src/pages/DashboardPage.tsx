import { useAuth } from '../auth/useAuth'

const contentByRole = {
  student: {
    title: 'Student dashboard',
    description: 'This area will host profile, learning, exams, jobs, applications, interviews, and privacy workflows.',
    cards: ['Profile and resume', 'Learning progress', 'Exam history', 'Job matches'],
  },
  company: {
    title: 'Company dashboard',
    description: 'This area will host company profile, vacancies, candidate review, interviews, and notifications.',
    cards: ['Company profile', 'Vacancy management', 'Candidate review', 'Interview workflow'],
  },
  admin: {
    title: 'Admin dashboard',
    description: 'This area will host protected operational oversight, user management, and platform administration.',
    cards: ['User management', 'Company management', 'Course and exam admin', 'Operational review'],
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
          <article key={item} className="card info-card">
            <h2>{item}</h2>
            <p>Placeholder route group ready for the next feature implementation slice.</p>
          </article>
        ))}
      </div>
    </section>
  )
}
