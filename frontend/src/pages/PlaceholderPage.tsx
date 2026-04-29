type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Coming next</p>
          <h1>{title}</h1>
          <p className="lead">{description}</p>
        </div>
      </div>
      <div className="card info-card">
        <h2>Protected route reserved</h2>
        <p className="muted">This route is intentionally held for a later implementation slice.</p>
      </div>
    </section>
  )
}
