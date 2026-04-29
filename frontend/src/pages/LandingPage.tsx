import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <section className="page page-split">
      <div className="card hero-card">
        <p className="eyebrow">Learn, prepare, and get matched</p>
        <h1>One platform for student learning, exams, and hiring workflows.</h1>
        <p className="lead">
          Softlearn helps students build skills, track progress, and connect with companies through privacy-aware workflows for students, companies, and admins.
        </p>
        <div className="actions">
          <Link className="primary-button" to="/login">
            Log in
          </Link>
          <Link className="secondary-button" to="/signup">
            Create account
          </Link>
        </div>
      </div>
      <div className="card stack-card">
        <h2>What you can do</h2>
        <ul className="feature-list">
          <li>Maintain a student profile with skills and preferences</li>
          <li>Track learning progress and exam outcomes</li>
          <li>Review candidates with permission-aware company access</li>
          <li>Manage interviews and notifications in one place</li>
        </ul>
      </div>
    </section>
  )
}
