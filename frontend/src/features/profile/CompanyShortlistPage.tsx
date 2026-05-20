import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { LoadingState } from '@/components/LoadingIndicator'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyShortlistResponse } from './types'

const emptyResponse: CompanyShortlistResponse = {
  company_id: 0,
  shortlist_count: 0,
  shortlists: [],
}

export function CompanyShortlistPage() {
  const [data, setData] = useState<CompanyShortlistResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true

    async function loadShortlist() {
      try {
        const response = await apiRequest<CompanyShortlistResponse>(`/company/shortlist?page=${page}&page_size=20`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load shortlist.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadShortlist()
    return () => {
      active = false
    }
  }, [page])

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading shortlist" className="min-h-40" />
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company shortlist</p>
          <h1>Shortlisted candidates</h1>
          <p className="lead">Review the candidates your company has already shortlisted without leaving the protected company boundary.</p>
        </div>
        <div className="card compact-card">
          <strong>Shortlisted</strong>
          <p className="muted">{data.shortlist_count}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      {data.shortlists.length === 0 ? (
        <div className="card info-card">
          <h2>No shortlisted candidates yet</h2>
          <p className="muted">Shortlisted candidates will appear here after your team marks them during candidate review.</p>
        </div>
      ) : null}

      <div className="card-grid">
        {data.shortlists.map((entry) => (
          <article key={entry.candidate_access_id} className="card info-card">
            <p className="eyebrow">{entry.source}</p>
            <h2>{entry.display_name}</h2>
            <p className="muted">Shortlisted by {entry.created_by_name}</p>
            <p className="muted">Added {new Date(entry.created_at).toLocaleString()}</p>
            <Link className="secondary-button inline-button" to={`/company/candidates/${entry.candidate_access_id}`}>
              Open candidate
            </Link>
          </article>
        ))}
      </div>

      {data.pagination ? (
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="muted">
              Page {data.pagination.page} of {Math.max(1, data.pagination.total_pages)}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="secondary-button inline-button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!data.pagination.has_previous}
              >
                Previous
              </button>
              <button
                type="button"
                className="secondary-button inline-button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!data.pagination.has_next}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
