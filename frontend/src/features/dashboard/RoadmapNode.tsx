import { Link } from 'react-router-dom'

import type { StudentDashboardResponse } from './types'

type RoadmapNodeProps = {
  node: StudentDashboardResponse['roadmap_preview']['nodes'][number]
  isLast: boolean
}

const stateStyles: Record<StudentDashboardResponse['roadmap_preview']['nodes'][number]['state'], string> = {
  not_started: 'border-[var(--sl-border)] bg-white text-[var(--sl-text)]',
  in_progress: 'border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-text)]',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  exam_required: 'border-amber-200 bg-amber-50 text-amber-900',
  locked: 'border-[var(--sl-border)] bg-slate-50 text-slate-400',
}

const stateLabels: Record<StudentDashboardResponse['roadmap_preview']['nodes'][number]['state'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  exam_required: 'Exam required',
  locked: 'Locked',
}

export function RoadmapNode({ node, isLast }: RoadmapNodeProps) {
  return (
    <div className="relative pl-8">
      {!isLast ? <div className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-[var(--sl-border)]" /> : null}
      <div
        className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-white text-xs font-bold ${stateStyles[node.state]} ${
          node.is_current ? 'ring-4 ring-[var(--sl-soft)]' : ''
        }`}
      >
        {node.state === 'completed' ? '✓' : node.state === 'exam_required' ? '!' : node.is_current ? '•' : '○'}
      </div>
      <div className={`rounded-2xl border p-4 shadow-[0_8px_24px_rgba(17,24,39,0.03)] ${stateStyles[node.state]}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{node.title}</h3>
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium">{stateLabels[node.state]}</span>
              {node.is_current ? (
                <span className="rounded-full bg-[var(--sl-primary)] px-2.5 py-1 text-[11px] font-medium text-white">Current</span>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-inherit/80">{node.subtitle}</p>
            {typeof node.progress_percent === 'number' ? <p className="text-xs font-medium text-inherit/80">{node.progress_percent}% complete</p> : null}
          </div>
          {node.cta_href ? (
            <Link className="text-sm font-semibold text-[var(--sl-primary)]" to={node.cta_href}>
              Open
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
