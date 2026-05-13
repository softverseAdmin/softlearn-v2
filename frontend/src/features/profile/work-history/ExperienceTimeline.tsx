import { BriefcaseBusiness, GraduationCap } from 'lucide-react'

import type { WorkHistoryTimelineItem } from './types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ExperienceTimelineProps = {
  items: WorkHistoryTimelineItem[]
  title?: string
  description?: string
}

export function ExperienceTimeline({
  items,
  title = 'Experience Timeline',
  description = 'A structured timeline built from your active work history document.',
}: ExperienceTimelineProps) {
  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6">
        {items.map((item, index) => {
          const Icon = item.kind === 'education' ? GraduationCap : BriefcaseBusiness

          return (
            <div key={item.id} className="relative pl-14">
              {index < items.length - 1 ? (
                <div className="absolute left-[19px] top-12 h-[calc(100%-0.5rem)] w-px bg-slate-200" />
              ) : null}
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      {item.isCurrent ? (
                        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                          Current
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-500">{item.subtitle}</p>
                  </div>
                  <span className="text-sm text-slate-500">{item.dateLabel}</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
