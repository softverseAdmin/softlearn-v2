import { Home, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { WorkHistoryPageData } from './types'
import type { WorkHistoryWorkspaceConfig } from './shared'
import { ExperienceSummaryCard } from './ExperienceSummaryCard'
import { ExperienceTimeline } from './ExperienceTimeline'

type WorkHistorySidebarProps = {
  data: WorkHistoryPageData
  config: WorkHistoryWorkspaceConfig
}

export function WorkHistorySidebar({ data, config }: WorkHistorySidebarProps) {
  return (
    <div className="space-y-6">
      <div id="experience-summary-section">
        <ExperienceSummaryCard
          summary={data.summary}
          title={config.summaryTitle}
          description={config.summaryDescription}
        />
      </div>
      <div id="experience-timeline-section">
        <ExperienceTimeline
          items={data.timeline}
          title={config.timelineTitle}
          description={config.timelineDescription}
        />
      </div>

      <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold text-slate-900">{config.nextTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{config.nextDescription}</p>
        </div>
        <CardContent className="space-y-3 px-6 pb-6 pt-4">
          {data.nextSteps.map((step, index) => (
            <Link
              key={step.id}
              to={step.href}
              className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-primary/20 hover:bg-blue-50"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                </div>
              </div>
            </Link>
          ))}
          <Button asChild variant="outline" className="mt-2 h-11 w-full rounded-xl border-slate-200 bg-white text-slate-700">
            <Link to="/student">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 shadow-sm">
        <CardContent className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-violet-600 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">AI-ready document workspace</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                This page uses clean frontend service boundaries so AWS-compatible AI extraction can be connected later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
