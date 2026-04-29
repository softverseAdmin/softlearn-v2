import { Link } from 'react-router-dom'

import type { CompanyDashboardResponse } from './types'
import { CandidateCard } from './CandidateCard'

type CompanyDashboardRedesignProps = {
  companyName: string
  loading: boolean
  error: string | null
  data: CompanyDashboardResponse | null
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

export function CompanyDashboardRedesign({ companyName, loading, error, data }: CompanyDashboardRedesignProps) {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--sl-muted)]">Company dashboard</p>
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--sl-text)] md:text-[32px]">Welcome, {data?.company_name ?? companyName}</h1>
          <p className="max-w-2xl text-base text-[var(--sl-muted)]">
            {data?.header_message ?? 'Review candidates, manage your jobs, and keep interviews moving.'}
          </p>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-2xl border border-[var(--sl-border)] bg-white p-6 text-sm text-[var(--sl-muted)] shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
          Loading your hiring workspace…
        </div>
      ) : null}

      {!loading && data ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Candidates to review</p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--sl-text)]">Move the right learners into your pipeline</h2>
                </div>
                <Link className="text-sm font-semibold text-[var(--sl-primary)]" to="/company/candidates">
                  View all candidates
                </Link>
              </div>
              <div className="space-y-4">
                {data.candidates_to_review.map((candidate) => (
                  <CandidateCard key={candidate.candidate_access_id} candidate={candidate} />
                ))}
                {data.candidates_to_review.length === 0 ? <p className="text-sm text-[var(--sl-muted)]">No review-ready candidates yet.</p> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Active jobs</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--sl-text)]">Keep your hiring roles current</h2>
                <p className="mt-2 text-sm text-[var(--sl-muted)]">{data.active_jobs.pipeline_summary}</p>
              </div>
              <div className="space-y-3">
                {data.active_jobs.jobs.map((job) => (
                  <article key={job.vacancy_id} className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                    <div className="flex flex-col gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--sl-text)]">{job.title}</h3>
                        <p className="mt-1 text-sm text-[var(--sl-muted)]">
                          {formatStatus(job.status)} · {job.location}
                        </p>
                      </div>
                      <Link className="inline-flex h-10 w-fit items-center justify-center rounded-[10px] border border-[var(--sl-border)] bg-white px-4 text-sm font-semibold text-[var(--sl-text)] transition hover:border-[var(--sl-primary)] hover:text-[var(--sl-primary)]" to={job.cta_href}>
                        {job.cta_label}
                      </Link>
                    </div>
                  </article>
                ))}
                {data.active_jobs.jobs.length === 0 ? <p className="text-sm text-[var(--sl-muted)]">No active jobs yet.</p> : null}
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="mb-5 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Interviews</p>
                <h2 className="text-xl font-semibold text-[var(--sl-text)]">Follow up on scheduling and outcomes</h2>
                <p className="text-sm text-[var(--sl-muted)]">
                  {data.interviews.active_count} active · {data.interviews.completed_count} completed
                </p>
              </div>
              <div className="space-y-3">
                {data.interviews.items.map((interview) => (
                  <article key={interview.id} className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--sl-text)]">{interview.student_name}</h3>
                        <p className="mt-1 text-sm text-[var(--sl-muted)]">{interview.purpose}</p>
                        <p className="mt-2 text-sm text-[var(--sl-muted)]">
                          {formatStatus(interview.status)} · {interview.timing_label}
                        </p>
                      </div>
                      <Link className="inline-flex h-10 w-fit items-center justify-center rounded-[10px] border border-[var(--sl-border)] bg-white px-4 text-sm font-semibold text-[var(--sl-text)] transition hover:border-[var(--sl-primary)] hover:text-[var(--sl-primary)]" to={interview.cta_href}>
                        {interview.cta_label}
                      </Link>
                    </div>
                  </article>
                ))}
                {data.interviews.items.length === 0 ? <p className="text-sm text-[var(--sl-muted)]">No interviews in motion right now.</p> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Small analytics</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--sl-text)]">See the current hiring picture at a glance</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Candidates to review</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{data.analytics.candidates_to_review}</p>
                </div>
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Shortlisted candidates</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{data.analytics.shortlisted_candidates}</p>
                </div>
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Active jobs</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{data.analytics.active_jobs}</p>
                </div>
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Unread updates</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{data.analytics.unread_updates}</p>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  )
}
