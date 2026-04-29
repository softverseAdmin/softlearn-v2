import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page">
      <div className="card form-card">
        <p className="eyebrow">Navigation</p>
        <h1>Page not found</h1>
        <p className="lead">The page you requested does not exist or is no longer available.</p>
        <Link className="primary-button" to="/">
          Back to the landing page
        </Link>
      </div>
    </section>
  )
}
