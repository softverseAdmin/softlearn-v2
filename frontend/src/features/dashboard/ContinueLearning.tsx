import { Link } from 'react-router-dom'

import type { StudentDashboardResponse } from './types'

type ContinueLearningProps = {
  summary: StudentDashboardResponse['continue_learning']
}

export function ContinueLearning({ summary }: ContinueLearningProps) {
  return (
    <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Continue learning</p>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--sl-text)]">{summary.topic_title}</h2>
            <p className="text-sm text-[var(--sl-muted)]">{summary.roadmap_title}</p>
          </div>
          <div className="max-w-xl space-y-2">
            <div className="flex items-center justify-between text-sm text-[var(--sl-muted)]">
              <span>Progress</span>
              <span>{summary.progress_percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--sl-soft)]">
              <div
                className="h-full rounded-full bg-[var(--sl-primary)] transition-[width]"
                style={{ width: `${summary.progress_percent}%` }}
              />
            </div>
          </div>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          to={summary.cta_href}
        >
          {summary.cta_label}
        </Link>
      </div>
    </section>
  )
}
