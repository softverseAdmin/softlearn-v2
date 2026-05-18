import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { containerVariants, itemVariants } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { CompanyDashboardResponse } from '../types'
import {
  formatJobStatus,
  formatPostedDate,
  type ApplicationStatusDatum,
  type CompanyDashboardStatCard,
} from './shared'

type CompanyDashboardOverviewProps = {
  data: CompanyDashboardResponse
  statCards: CompanyDashboardStatCard[]
  applicationStatusData: ApplicationStatusDatum[]
  totalApplications: number
  topPerformingJobs: CompanyDashboardResponse['recent_job_postings']
}

export function CompanyDashboardOverview({
  data,
  statCards,
  applicationStatusData,
  totalApplications,
  topPerformingJobs,
}: CompanyDashboardOverviewProps) {
  return (
    <div className="space-y-4">
      <motion.div
        className="grid grid-cols-2 gap-4 xl:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Application status</CardTitle>
          <p className="text-sm text-muted-foreground">Donut chart powered by Recharts for your live application pipeline.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicationStatusData.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-[minmax(0,300px)_minmax(220px,1fr)] md:items-center">
              <div className="relative h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={104}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {applicationStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) {
                          return null
                        }

                        const item = payload[0]?.payload
                        if (
                          !item ||
                          typeof item !== 'object' ||
                          !('name' in item) ||
                          !('value' in item) ||
                          !('color' in item)
                        ) {
                          return null
                        }

                        const datum = item as ApplicationStatusDatum

                        return (
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: datum.color }} />
                              <span className="text-sm font-medium text-slate-900">{datum.name}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{datum.value} applications</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold tracking-tight">{totalApplications}</span>
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Applications</span>
                </div>
              </div>

              <div className="space-y-3">
                {applicationStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
              <div className="space-y-2">
                <p className="font-medium">No application status data yet</p>
                <p className="text-sm text-muted-foreground">
                  Once candidates start applying, the donut chart will show the live status breakdown here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Recent job postings</CardTitle>
            <p className="text-sm text-muted-foreground">Your latest vacancies with live status and application totals.</p>
          </CardHeader>
          <CardContent>
            {data.recent_job_postings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_job_postings.map((job) => (
                    <TableRow key={job.vacancy_id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {formatJobStatus(job.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{job.location}</TableCell>
                      <TableCell>{job.applications_count}</TableCell>
                      <TableCell className="text-muted-foreground">{formatPostedDate(job.posted_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link to={job.cta_href}>{job.cta_label}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                <div className="space-y-2">
                  <p className="font-medium">No job postings yet</p>
                  <p className="text-sm text-muted-foreground">Create your first vacancy and it will appear here as a recent posting.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Top performing jobs</CardTitle>
            <p className="text-sm text-muted-foreground">Ranked by application volume across your recent postings.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformingJobs.length > 0 ? (
              topPerformingJobs.map((job, index) => (
                <article key={job.vacancy_id} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <p className="font-semibold">{job.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {formatJobStatus(job.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Applications</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight">{job.applications_count}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={job.cta_href}>{job.cta_label}</Link>
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                <div className="space-y-2">
                  <p className="font-medium">No top performers yet</p>
                  <p className="text-sm text-muted-foreground">Jobs with the strongest application response will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
