import { useMemo } from 'react'
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  type LucideIcon,
} from 'lucide-react'

import { LoadingState } from '@/components/LoadingIndicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TeacherDashboardResponse } from './types'

type TeacherDashboardProps = {
  loading: boolean
  error: string | null
  data: TeacherDashboardResponse | null
}

const teacherCardIcons: Record<string, { icon: LucideIcon; className: string }> = {
  'related-students': { icon: GraduationCap, className: 'text-blue-600 dark:text-blue-400' },
  courses: { icon: BookOpen, className: 'text-emerald-600 dark:text-emerald-400' },
  exams: { icon: ClipboardCheck, className: 'text-amber-600 dark:text-amber-400' },
  lessons: { icon: Layers3, className: 'text-violet-600 dark:text-violet-400' },
}

export function TeacherDashboard({ loading, error, data }: TeacherDashboardProps) {
  const focusSummary = useMemo(() => {
    if (!data) {
      return []
    }

    return data.focus_items.map((item, index) => ({
      ...item,
      badge: index + 1,
    }))
  }, [data])

  return (
    <section className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="font-semibold text-red-900 dark:text-red-100">Unable to load dashboard</p>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <LoadingState title="Loading your teaching workspace" className="min-h-28" />
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && data ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:items-start">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {data.summary_cards.map((card) => {
                const iconConfig = teacherCardIcons[card.id] ?? {
                  icon: GraduationCap,
                  className: 'text-primary',
                }
                const Icon = iconConfig.icon

                return (
                  <Card key={card.id} className="h-full">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                      <Icon className={`h-5 w-5 ${iconConfig.className}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle>Teaching focus</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Priority areas arranged in the same workspace style as the company dashboard.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {focusSummary.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {item.badge}
                        </span>
                        <div className="space-y-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle>Teaching guidance</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A quick readout to keep the teacher workspace aligned with platform activity.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.summary_cards.map((card) => (
                    <div key={card.id} className="rounded-xl border border-border bg-muted/20 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{card.label}</span>
                        <span className="text-sm font-semibold">{card.value}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="w-full max-w-full space-y-4 sm:max-w-[380px] xl:justify-self-end">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Teacher playbook</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A compact sidebar panel matching the company dashboard’s supporting column pattern.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {focusSummary.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </section>
  )
}
