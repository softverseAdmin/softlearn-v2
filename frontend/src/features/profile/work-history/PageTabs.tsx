import { cn } from '@/lib/utils'
import type { WorkHistoryTab } from './types'

type PageTabsProps = {
  value: WorkHistoryTab
  onChange: (value: WorkHistoryTab) => void
  labels?: Partial<Record<WorkHistoryTab, string>>
}

const tabs: Array<{ value: WorkHistoryTab; label: string }> = [
  { value: 'upload-manage', label: 'Upload & Manage' },
  { value: 'experience-timeline', label: 'Experience Timeline' },
  { value: 'experience-summary', label: 'Experience Summary' },
]

export function PageTabs({ value, onChange, labels }: PageTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium transition',
            value === tab.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          {labels?.[tab.value] ?? tab.label}
        </button>
      ))}
    </div>
  )
}
