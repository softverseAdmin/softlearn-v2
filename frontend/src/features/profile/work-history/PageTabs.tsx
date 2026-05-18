import { cn } from '@/lib/utils'
import type { WorkHistoryTab } from './types'

type PageTabsProps = {
  value: WorkHistoryTab
  onChange: (value: WorkHistoryTab) => void
  labels?: Partial<Record<WorkHistoryTab, string>>
  sectionIds: Record<WorkHistoryTab, string>
  navigationLabel?: string
}

const tabs: Array<{ value: WorkHistoryTab; label: string }> = [
  { value: 'upload-manage', label: 'Upload & Manage' },
  { value: 'experience-timeline', label: 'Experience Timeline' },
  { value: 'experience-summary', label: 'Experience Summary' },
]

export function PageTabs({
  value,
  onChange,
  labels,
  sectionIds,
  navigationLabel = 'Jump to work history sections',
}: PageTabsProps) {
  return (
    <nav aria-label={navigationLabel}>
      <ul className="inline-flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = value === tab.value

          return (
            <li key={tab.value}>
              <a
                href={`#${sectionIds[tab.value]}`}
                onClick={(event) => {
                  event.preventDefault()
                  onChange(tab.value)
                }}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'inline-flex rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {labels?.[tab.value] ?? tab.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
