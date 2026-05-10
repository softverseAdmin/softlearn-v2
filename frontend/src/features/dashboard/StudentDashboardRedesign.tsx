import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

import type { StudentDashboardResponse } from './types'
import { ContinueLearning } from './ContinueLearning'
import { NextAction } from './NextAction'
import { RoadmapNode } from './RoadmapNode'
import { Card, CardContent } from '@/components/ui/card'
import { containerVariants, itemVariants } from '@/lib/animations'

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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome back, {userName}</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          {data?.header_message ?? 'Continue your roadmap and unlock your next skill.'}
        </p>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load dashboard</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading your learning flow…</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Dashboard Content */}
      {!loading && data ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Continue Learning + Next Action */}
          <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-[1fr_350px]">
            <ContinueLearning summary={data.continue_learning} />
            <NextAction action={data.next_action} />
          </motion.div>

          {/* Progress Overview + Roadmap */}
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
            {/* Progress Overview */}
            <Card>
              <div className="space-y-4 border-b border-border p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Progress</p>
                  <h2 className="mt-2 text-xl font-semibold">See how close you are to the next unlock</h2>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm text-muted-foreground">Completed topics</p>
                    <p className="mt-2 text-2xl font-bold">{data.progress_overview.completed_topics}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm text-muted-foreground">Exam average</p>
                    <p className="mt-2 text-2xl font-bold">{formatAverage(data.progress_overview.exam_average)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm text-muted-foreground">Current level</p>
                    <p className="mt-2 text-2xl font-bold">{data.progress_overview.current_level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roadmap Preview */}
            <Card>
              <div className="space-y-4 border-b border-border p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Roadmap</p>
                  <h2 className="mt-2 text-xl font-semibold">Your learning to assessment path</h2>
                </div>
              </div>
              <CardContent className="space-y-4 pt-6">
                {data.roadmap_preview.nodes.map((node, index) => (
                  <RoadmapNode
                    key={node.id}
                    node={node}
                    isLast={index === data.roadmap_preview.nodes.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  )
}
