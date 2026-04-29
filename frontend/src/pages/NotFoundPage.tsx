import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page">
      <div className="card form-card">
        <p className="eyebrow">Routing fallback</p>
        <h1>Page not found</h1>
        <p className="lead">The route you requested does not exist in the current frontend foundation.</p>
        <Link className="primary-button" to="/">
          Back to the landing page
        </Link>
      </div>
    </section>
  )
}
