import { BrainCircuit, Sparkles } from 'lucide-react'

import type { WorkHistoryInsightMetric } from './types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type AIExtractedInsightsProps = {
  metrics: WorkHistoryInsightMetric[]
  title?: string
  description?: string
  actionLabel?: string
}

export function AIExtractedInsights({
  metrics,
  title = 'AI Extracted Insights',
  description = 'Mock extracted signals from your uploaded document, ready for later backend integration.',
  actionLabel = 'View Insights',
}: AIExtractedInsightsProps) {
  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-600">
            <BrainCircuit className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex flex-wrap gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              {metric.value} {metric.label}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50">
          <Sparkles className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
