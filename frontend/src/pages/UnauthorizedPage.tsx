import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section className="page">
      <div className="card form-card">
        <p className="eyebrow">Access control</p>
        <h1>Access denied</h1>
        <p className="lead">Your account is signed in, but you do not have permission to open this page.</p>
        <Link className="primary-button" to="/">
          Go home
        </Link>
      </div>
    </section>
  )
}
