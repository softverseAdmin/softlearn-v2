import type { StudentDashboardResponse } from './types'
import { ContinueLearning } from './ContinueLearning'
import { NextAction } from './NextAction'
import { RoadmapNode } from './RoadmapNode'

type StudentDashboardRedesignProps = {
  userName: string
  loading: boolean
  error: string | null
  data: StudentDashboardResponse | null
}

function formatAverage(value: number | null) {
  return value === null ? 'No exams yet' : `${value.toFixed(1)}%`
}

export function StudentDashboardRedesign({ userName, loading, error, data }: StudentDashboardRedesignProps) {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--sl-muted)]">Student dashboard</p>
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--sl-text)] md:text-[32px]">Welcome back, {userName}</h1>
          <p className="max-w-2xl text-base text-[var(--sl-muted)]">
            {data?.header_message ?? 'Continue your roadmap and unlock your next skill.'}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[var(--sl-border)] bg-white p-6 text-sm text-[var(--sl-muted)] shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
          Loading your learning flow…
        </div>
      ) : null}

      {!loading && data ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
            <ContinueLearning summary={data.continue_learning} />
            <NextAction action={data.next_action} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Progress overview</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--sl-text)]">See how close you are to the next unlock</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Completed topics</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{data.progress_overview.completed_topics}</p>
                </div>
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Exam average</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{formatAverage(data.progress_overview.exam_average)}</p>
                </div>
                <div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] p-4">
                  <p className="text-sm text-[var(--sl-muted)]">Current level</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--sl-text)]">{data.progress_overview.current_level}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--sl-border)] bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">Roadmap preview</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--sl-text)]">Your learning to assessment path</h2>
              </div>
              <div className="space-y-4">
                {data.roadmap_preview.nodes.map((node, index) => (
                  <RoadmapNode key={node.id} node={node} isLast={index === data.roadmap_preview.nodes.length - 1} />
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  )
}
