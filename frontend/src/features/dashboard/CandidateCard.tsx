import { Link } from 'react-router-dom'

import type { CompanyDashboardResponse } from './types'

type CandidateCardProps = {
  candidate: CompanyDashboardResponse['candidates_to_review'][number]
}

function formatScore(scorePercent: number | null) {
  return scorePercent === null ? 'No score shared' : `${scorePercent.toFixed(1)}%`
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--sl-text)]">{candidate.source}</span>
            {candidate.is_shortlisted ? (
              <span className="inline-flex rounded-full bg-[var(--sl-soft)] px-3 py-1 text-xs font-semibold text-[var(--sl-primary)]">Shortlisted</span>
            ) : null}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--sl-text)]">{candidate.display_name}</h3>
            <p className="mt-1 text-sm text-[var(--sl-muted)]">Score: {formatScore(candidate.score_percent)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidate.top_skills.length > 0 ? (
              candidate.top_skills.map((skill) => (
                <span key={skill} className="inline-flex rounded-full border border-[var(--sl-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--sl-text)]">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--sl-muted)]">No skills shared yet.</span>
            )}
          </div>
        </div>
        <Link className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95" to={candidate.cta_href}>
          {candidate.cta_label}
        </Link>
      </div>
    </article>
  )
}
