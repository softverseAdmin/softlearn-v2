import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <section className="page page-split">
      <div className="card hero-card">
        <p className="eyebrow">AI-DLC implementation foundation</p>
        <h1>Role-aware learning and hiring workflows in one web app.</h1>
        <p className="lead">
          This frontend uses React + Vite with Django session auth, `/api/v1/`, and a single role-aware shell for students, companies, and admins.
        </p>
        <div className="actions">
          <Link className="primary-button" to="/login">
            Login
          </Link>
          <Link className="secondary-button" to="/signup">
            Create account
          </Link>
        </div>
      </div>
      <div className="card stack-card">
        <h2>Foundation goals</h2>
        <ul className="feature-list">
          <li>Session restore on app load</li>
          <li>Role-aware route guards</li>
          <li>Shared public and authenticated layouts</li>
          <li>CSRF-aware writes against the Django backend</li>
        </ul>
      </div>
    </section>
  )
}
