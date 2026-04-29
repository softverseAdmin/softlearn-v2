import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section className="page">
      <div className="card form-card">
        <p className="eyebrow">Access control</p>
        <h1>Forbidden</h1>
        <p className="lead">Your session is valid, but this route is not allowed for your current role.</p>
        <Link className="primary-button" to="/">
          Go home
        </Link>
      </div>
    </section>
  )
}
