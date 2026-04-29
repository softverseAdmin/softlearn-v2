import { Link } from 'react-router-dom'

import type { StudentDashboardResponse } from './types'

type NextActionProps = {
  action: StudentDashboardResponse['next_action']
}

function actionBadge(actionType: StudentDashboardResponse['next_action']['action_type']) {
  if (actionType === 'take_exam') {
    return 'Assessment gate'
  }

  if (actionType === 'complete_topic') {
    return 'Topic in progress'
  }

  return 'Recommended next step'
}

export function NextAction({ action }: NextActionProps) {
  return (
    <section className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-soft)] p-5 shadow-[0_8px_24px_rgba(17,24,39,0.03)] sm:p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="inline-flex rounded-full border border-[var(--sl-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--sl-text)]">
            {actionBadge(action.action_type)}
          </span>
          <div>
            <h2 className="text-xl font-semibold text-[var(--sl-text)]">{action.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--sl-muted)]">{action.description}</p>
          </div>
        </div>
        {action.requirement ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {action.requirement}
          </div>
        ) : null}
        <Link
          className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--sl-border)] bg-white px-5 text-sm font-semibold text-[var(--sl-text)] transition hover:border-[var(--sl-primary)] hover:text-[var(--sl-primary)]"
          to={action.cta_href}
        >
          {action.cta_label}
        </Link>
      </div>
    </section>
  )
}
