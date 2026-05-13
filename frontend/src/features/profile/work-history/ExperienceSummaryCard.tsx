import { BriefcaseBusiness, Clock3, Layers3 } from 'lucide-react'

import type { WorkHistorySummary } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ExperienceSummaryCardProps = {
  summary: WorkHistorySummary
  title?: string
  description?: string
}

export function ExperienceSummaryCard({
  summary,
  title = 'Experience Summary',
  description = 'A quick view of the experience extracted from your current documents.',
}: ExperienceSummaryCardProps) {
  const items = [
    {
      label: 'Total Experience',
      value: summary.totalExperience,
      icon: Clock3,
      tone: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Companies',
      value: String(summary.companies),
      icon: BriefcaseBusiness,
      tone: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Roles',
      value: String(summary.roles),
      icon: Layers3,
      tone: 'bg-violet-100 text-violet-700',
    },
  ]

  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className={`rounded-2xl p-3 ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            </div>
          )
        })}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Last updated: <span className="font-medium text-slate-900">{summary.lastUpdated}</span>
        </div>
      </CardContent>
    </Card>
  )
}
